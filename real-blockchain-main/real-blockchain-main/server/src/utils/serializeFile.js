import { formatAccessCode } from "./accessCode.js";

const getStatus = (file) => {
  if (file.accessCount > 0) {
    return "used";
  }

  if (file.expiresAt && new Date(file.expiresAt) <= new Date()) {
    return "expired";
  }

  return "unused";
};

export const serializeFile = (file) => ({
  id: file._id.toString(),
  originalName: file.originalName,
  mimeType: file.mimeType,
  size: file.size,
  integrityHash: file.integrityHash ?? null,
  chainMode: file.chainMode ?? "simulated",
  chainShareId: file.chainShareId ?? null,
  chainAccessCodeHash: file.chainAccessCodeHash ?? null,
  accessCode: file.accessCode,
  formattedAccessCode: formatAccessCode(file.accessCode),
  chainBlockHeight: file.chainBlockHeight ?? null,
  chainBlockHash: file.chainBlockHash ?? null,
  chainTransactionHash: file.chainTransactionHash ?? null,
  chainNetworkName: file.chainNetworkName ?? null,
  chainContractAddress: file.chainContractAddress ?? null,
  chainRelayerAddress: file.chainRelayerAddress ?? null,
  chainExplorerTransactionUrl: file.chainExplorerTransactionUrl ?? null,
  accessCount: file.accessCount,
  status: getStatus(file),
  createdAt: file.createdAt,
  updatedAt: file.updatedAt,
  expiresAt: file.expiresAt,
  lastAccessedAt: file.lastAccessedAt
});
