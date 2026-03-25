import crypto from "node:crypto";
import LedgerEvent from "../models/LedgerEvent.js";
import { getBlockchainMeta, getShareId, writeBlockchainEvent } from "./blockchain.js";

const hashValue = (value) =>
  crypto.createHash("sha256").update(value).digest("hex");

const simulateLedgerEvent = async ({
  userId,
  file,
  eventType,
  details = {},
  occurredAt = new Date()
}) => {
  const previousEvent = await LedgerEvent.findOne({ user: userId }).sort({
    blockHeight: -1
  });
  const previousHash = previousEvent?.blockHash ?? "GENESIS";
  const blockHeight = previousEvent ? previousEvent.blockHeight + 1 : 1;
  const fileId = String(file._id ?? file.id ?? "");
  const transactionHash = hashValue(
    JSON.stringify({
      seed: crypto.randomUUID(),
      userId: String(userId),
      fileId,
      eventType,
      occurredAt: occurredAt.toISOString()
    })
  );
  const blockHash = hashValue(
    JSON.stringify({
      previousHash,
      transactionHash,
      blockHeight,
      eventType,
      fileId,
      integrityHash: file.integrityHash ?? "",
      accessCode: file.accessCode ?? "",
      occurredAt: occurredAt.toISOString(),
      details
    })
  );

  return {
    mode: "simulated",
    shareId: getShareId(file),
    accessCodeHash: hashValue(String(file.accessCode ?? "")),
    blockHeight,
    previousHash,
    blockHash,
    transactionHash,
    contractAddress: null,
    relayerAddress: null,
    networkName: "Local simulated ledger",
    explorerTransactionUrl: null,
    explorerBlockUrl: null
  };
};

export const recordLedgerEvent = async ({
  userId,
  file,
  eventType,
  details = {},
  occurredAt = new Date()
}) => {
  const fileId = String(file._id ?? file.id ?? "");
  const onChainData = await writeBlockchainEvent({ file, eventType });
  const chainData =
    onChainData ??
    (await simulateLedgerEvent({
      userId,
      file,
      eventType,
      details,
      occurredAt
    }));
  const meta = await getBlockchainMeta();

  return LedgerEvent.create({
    user: userId,
    fileId,
    originalName: file.originalName,
    mimeType: file.mimeType,
    size: file.size,
    accessCode: file.accessCode,
    accessCodeHash: chainData.accessCodeHash,
    integrityHash: file.integrityHash,
    shareId: chainData.shareId,
    eventType,
    blockHeight: chainData.blockHeight,
    previousHash: chainData.previousHash,
    blockHash: chainData.blockHash,
    transactionHash: chainData.transactionHash,
    chainMode: chainData.mode,
    networkName: chainData.networkName ?? meta.networkName,
    contractAddress: chainData.contractAddress ?? meta.contractAddress,
    relayerAddress: chainData.relayerAddress ?? meta.relayerAddress,
    explorerTransactionUrl:
      chainData.explorerTransactionUrl ?? meta.explorerTransactionUrl ?? null,
    explorerBlockUrl: chainData.explorerBlockUrl ?? meta.explorerBlockUrl ?? null,
    details
  });
};
