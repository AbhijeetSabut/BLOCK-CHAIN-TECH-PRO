import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const asNumber = (value, fallback) => {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : fallback;
};

const expandLoopbackOrigins = (value) => {
  try {
    const url = new URL(value);
    const origins = [url.origin];

    if (url.hostname === "localhost") {
      url.hostname = "127.0.0.1";
      origins.push(url.origin);
    } else if (url.hostname === "127.0.0.1") {
      url.hostname = "localhost";
      origins.push(url.origin);
    }

    return origins;
  } catch (_error) {
    return [value];
  }
};

const clientUrlSource =
  process.env.CLIENT_URLS ?? process.env.CLIENT_URL ?? "http://localhost:5173";

export const config = {
  port: asNumber(process.env.PORT, 4000),
  mongoUri: process.env.MONGO_URI ?? "",
  jwtSecret: process.env.JWT_SECRET ?? "development-secret",
  clientUrls: Array.from(
    new Set(
      clientUrlSource
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean)
        .flatMap(expandLoopbackOrigins)
    )
  ),
  maxFileSizeMb: asNumber(process.env.MAX_FILE_SIZE_MB, 50),
  codeExpiryHours: asNumber(process.env.CODE_EXPIRY_HOURS, 168),
  blockchainRpcUrl: process.env.BLOCKCHAIN_RPC_URL ?? "",
  blockchainPrivateKey: process.env.BLOCKCHAIN_PRIVATE_KEY ?? "",
  blockchainContractAddress: process.env.BLOCKCHAIN_CONTRACT_ADDRESS ?? "",
  blockchainChainId: asNumber(process.env.BLOCKCHAIN_CHAIN_ID, 0),
  blockchainNetworkName:
    process.env.BLOCKCHAIN_NETWORK_NAME ?? "Configured EVM network",
  blockchainExplorerBaseUrl: (
    process.env.BLOCKCHAIN_EXPLORER_BASE_URL ?? ""
  ).replace(/\/$/, ""),
  blockchainEnabled: Boolean(
    process.env.BLOCKCHAIN_RPC_URL &&
      process.env.BLOCKCHAIN_PRIVATE_KEY &&
      process.env.BLOCKCHAIN_CONTRACT_ADDRESS
  ),
  uploadDir: path.resolve(
    __dirname,
    process.env.UPLOAD_DIR ?? "../uploads"
  )
};
