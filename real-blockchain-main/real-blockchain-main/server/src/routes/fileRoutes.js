import fs from "node:fs/promises";
import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import LedgerEvent from "../models/LedgerEvent.js";
import SharedFile from "../models/SharedFile.js";
import { generateAccessCode } from "../utils/accessCode.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { config } from "../config.js";
import { getBlockchainMeta } from "../utils/blockchain.js";
import { hashStoredFile } from "../utils/hashStoredFile.js";
import { recordLedgerEvent } from "../utils/ledger.js";
import { removeStoredFile } from "../utils/removeStoredFile.js";
import {
  getStoredFilePath,
  sendStoredFile
} from "../utils/sendStoredFile.js";
import { serializeFile } from "../utils/serializeFile.js";
import { serializeLedgerEvent } from "../utils/serializeLedgerEvent.js";

const router = Router();

const createUniqueAccessCode = async () => {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const code = generateAccessCode();
    const existing = await SharedFile.exists({ accessCode: code });

    if (!existing) {
      return code;
    }
  }

  throw new Error("Unable to generate a unique access code. Try again.");
};

router.get(
  "/",
  requireAuth,
  asyncHandler(async (request, response) => {
    const consumedFiles = await SharedFile.find({
      user: request.user._id,
      accessCount: { $gt: 0 }
    });

    if (consumedFiles.length > 0) {
      await SharedFile.deleteMany({
        _id: { $in: consumedFiles.map((file) => file._id) }
      });
      await Promise.all(consumedFiles.map((file) => removeStoredFile(file)));
    }

    const files = await SharedFile.find({ user: request.user._id }).sort({
      createdAt: -1
    });

    response.json({
      files: files.map((file) => serializeFile(file))
    });
  })
);

router.get(
  "/ledger",
  requireAuth,
  asyncHandler(async (request, response) => {
    const meta = await getBlockchainMeta();
    const events = await LedgerEvent.find({ user: request.user._id })
      .sort({ blockHeight: -1 })
      .limit(24);

    response.json({
      meta,
      events: events.map((event) => serializeLedgerEvent(event))
    });
  })
);

router.post(
  "/upload",
  requireAuth,
  upload.single("file"),
  asyncHandler(async (request, response) => {
    if (!request.file) {
      response.status(400).json({ message: "Choose a file to upload." });
      return;
    }

    const accessCode = await createUniqueAccessCode();
    const expiresAt =
      config.codeExpiryHours > 0
        ? new Date(Date.now() + config.codeExpiryHours * 60 * 60 * 1000)
        : null;
    const integrityHash = await hashStoredFile({
      storedName: request.file.filename
    });

    const file = await SharedFile.create({
      user: request.user._id,
      originalName: request.file.originalname,
      storedName: request.file.filename,
      mimeType: request.file.mimetype,
      size: request.file.size,
      integrityHash,
      accessCode,
      expiresAt
    });

    let event;

    try {
      event = await recordLedgerEvent({
        userId: request.user._id,
        file,
        eventType: "minted",
        details: {
          expiresAt: expiresAt ? expiresAt.toISOString() : null
        }
      });
    } catch (error) {
      await SharedFile.deleteOne({ _id: file._id }).catch(() => {});
      await removeStoredFile(file).catch(() => {});
      throw error;
    }

    file.chainMode = event.chainMode;
    file.chainShareId = event.shareId;
    file.chainAccessCodeHash = event.accessCodeHash;
    file.chainBlockHeight = event.blockHeight;
    file.chainBlockHash = event.blockHash;
    file.chainTransactionHash = event.transactionHash;
    file.chainNetworkName = event.networkName;
    file.chainContractAddress = event.contractAddress;
    file.chainRelayerAddress = event.relayerAddress;
    file.chainExplorerTransactionUrl = event.explorerTransactionUrl;
    await file.save();

    response.status(201).json({
      file: serializeFile(file)
    });
  })
);

router.get(
  "/:id/download",
  requireAuth,
  asyncHandler(async (request, response) => {
    const file = await SharedFile.findOne({
      _id: request.params.id,
      user: request.user._id
    });

    if (!file) {
      response.status(404).json({ message: "File not found." });
      return;
    }

    await fs.access(getStoredFilePath(file));
    sendStoredFile(response, file);
  })
);

router.delete(
  "/:id",
  requireAuth,
  asyncHandler(async (request, response) => {
    const file = await SharedFile.findOne({
      _id: request.params.id,
      user: request.user._id
    });

    if (!file) {
      response.status(404).json({ message: "File not found." });
      return;
    }

    await recordLedgerEvent({
      userId: request.user._id,
      file,
      eventType: "deleted",
      details: {
        removedBy: "owner"
      }
    });
    await SharedFile.deleteOne({ _id: file._id });
    await removeStoredFile(file);

    response.json({ message: "File deleted successfully." });
  })
);

export default router;
