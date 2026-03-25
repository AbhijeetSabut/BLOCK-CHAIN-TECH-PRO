import fs from "node:fs/promises";
import { Router } from "express";
import SharedFile from "../models/SharedFile.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { normalizeAccessCode } from "../utils/accessCode.js";
import { recordLedgerEvent } from "../utils/ledger.js";
import { removeStoredFile } from "../utils/removeStoredFile.js";
import {
  getStoredFilePath,
  setStoredFileHeaders
} from "../utils/sendStoredFile.js";

const router = Router();

router.post(
  "/file",
  asyncHandler(async (request, response) => {
    const accessCode = normalizeAccessCode(request.body.code);

    if (accessCode.length !== 16) {
      response.status(400).json({ message: "Enter a valid 16-digit access code." });
      return;
    }

    const currentFile = await SharedFile.findOne({ accessCode });

    if (!currentFile) {
      response.status(404).json({ message: "No file found for that access code." });
      return;
    }

    const now = new Date();

    if (currentFile.accessCount > 0) {
      response.status(410).json({
        message: "This file has already been accessed. Code expired."
      });
      return;
    }

    if (currentFile.expiresAt && currentFile.expiresAt <= now) {
      response.status(410).json({
        message: "This access code has expired."
      });
      return;
    }

    await fs.access(getStoredFilePath(currentFile));

    const fileBuffer = await fs.readFile(getStoredFilePath(currentFile));

    await recordLedgerEvent({
      userId: currentFile.user,
      file: currentFile,
      eventType: "claimed",
      details: {
        accessedAt: now.toISOString()
      }
    });

    const claimedFile = await SharedFile.findOneAndDelete(
      {
        _id: currentFile._id,
        accessCount: 0,
        $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }]
      },
      {
        sort: { createdAt: -1 }
      }
    );

    if (!claimedFile) {
      response.status(410).json({
        message: "This file has already been accessed. Code expired."
      });
      return;
    }

    setStoredFileHeaders(response, claimedFile);
    response.end(fileBuffer);
    await removeStoredFile(claimedFile);
  })
);

export default router;
