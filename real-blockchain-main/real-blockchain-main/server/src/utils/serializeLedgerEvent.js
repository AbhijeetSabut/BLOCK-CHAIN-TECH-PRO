import { formatAccessCode } from "./accessCode.js";

const eventLabels = {
  minted: "Share anchored",
  claimed: "Receiver claimed",
  deleted: "Owner removed"
};

export const serializeLedgerEvent = (event) => ({
  id: event._id.toString(),
  fileId: event.fileId,
  originalName: event.originalName,
  mimeType: event.mimeType,
  size: event.size,
  accessCode: event.accessCode,
  formattedAccessCode: formatAccessCode(event.accessCode),
  accessCodeHash: event.accessCodeHash,
  integrityHash: event.integrityHash,
  shareId: event.shareId,
  eventType: event.eventType,
  eventLabel: eventLabels[event.eventType] ?? event.eventType,
  blockHeight: event.blockHeight,
  previousHash: event.previousHash,
  blockHash: event.blockHash,
  transactionHash: event.transactionHash,
  chainMode: event.chainMode ?? "simulated",
  networkName: event.networkName ?? null,
  contractAddress: event.contractAddress ?? null,
  relayerAddress: event.relayerAddress ?? null,
  explorerTransactionUrl: event.explorerTransactionUrl ?? null,
  explorerBlockUrl: event.explorerBlockUrl ?? null,
  details: event.details ?? {},
  createdAt: event.createdAt
});
