import { Contract, JsonRpcProvider, Wallet, id } from "ethers";
import { config } from "../config.js";
import shareLedgerAbi from "../blockchain/shareLedgerAbi.js";

let cachedRuntime = null;
let cachedMeta = null;

const asBytes32 = (value) => {
  if (!value) {
    return `0x${"0".repeat(64)}`;
  }

  if (value.startsWith("0x") && value.length === 66) {
    return value;
  }

  return `0x${value.replace(/^0x/, "").padStart(64, "0")}`;
};

const buildExplorerUrl = (kind, value) => {
  if (!config.blockchainExplorerBaseUrl || value == null) {
    return null;
  }

  return `${config.blockchainExplorerBaseUrl}/${kind}/${value}`;
};

const getRuntime = () => {
  if (!config.blockchainEnabled) {
    return null;
  }

  if (!cachedRuntime) {
    const provider = new JsonRpcProvider(
      config.blockchainRpcUrl,
      config.blockchainChainId || undefined
    );
    const wallet = new Wallet(config.blockchainPrivateKey, provider);
    const contract = new Contract(
      config.blockchainContractAddress,
      shareLedgerAbi,
      wallet
    );

    cachedRuntime = {
      provider,
      wallet,
      contract
    };
  }

  return cachedRuntime;
};

export const getShareId = (file) => file.chainShareId || id(String(file._id ?? file.id));

const getAccessCodeHash = (file) => file.chainAccessCodeHash || id(String(file.accessCode));

const getExpiryTimestamp = (value) => {
  if (!value) {
    return 0;
  }

  return Math.floor(new Date(value).getTime() / 1000);
};

export const getBlockchainMeta = async () => {
  if (!config.blockchainEnabled) {
    return {
      enabled: false,
      mode: "simulated",
      networkName: "Local simulated ledger",
      chainId: null,
      contractAddress: null,
      relayerAddress: null,
      explorerBaseUrl: null
    };
  }

  if (cachedMeta) {
    return cachedMeta;
  }

  const runtime = getRuntime();
  const network = await runtime.provider.getNetwork();

  cachedMeta = {
    enabled: true,
    mode: "onchain",
    networkName: config.blockchainNetworkName || network.name,
    chainId: Number(network.chainId),
    contractAddress: config.blockchainContractAddress,
    relayerAddress: runtime.wallet.address,
    explorerBaseUrl: config.blockchainExplorerBaseUrl || null
  };

  return cachedMeta;
};

export const writeBlockchainEvent = async ({ file, eventType }) => {
  if (!config.blockchainEnabled) {
    return null;
  }

  const runtime = getRuntime();
  const shareId = getShareId(file);
  const accessCodeHash = getAccessCodeHash(file);
  const fileHash = asBytes32(file.integrityHash);

  let transaction;

  if (eventType === "minted") {
    transaction = await runtime.contract.anchorShare(
      shareId,
      fileHash,
      accessCodeHash,
      getExpiryTimestamp(file.expiresAt)
    );
  } else if (eventType === "claimed") {
    transaction = await runtime.contract.claimShare(shareId);
  } else if (eventType === "deleted") {
    transaction = await runtime.contract.deleteShare(shareId);
  } else {
    throw new Error(`Unsupported blockchain event type: ${eventType}`);
  }

  const receipt = await transaction.wait();
  const block = await runtime.provider.getBlock(receipt.blockNumber);
  const meta = await getBlockchainMeta();

  return {
    mode: "onchain",
    shareId,
    accessCodeHash,
    blockHeight: receipt.blockNumber,
    blockHash: receipt.blockHash,
    previousHash: block?.parentHash ?? "GENESIS",
    transactionHash: transaction.hash,
    contractAddress: meta.contractAddress,
    relayerAddress: meta.relayerAddress,
    networkName: meta.networkName,
    explorerTransactionUrl: buildExplorerUrl("tx", transaction.hash),
    explorerBlockUrl: buildExplorerUrl("block", receipt.blockNumber)
  };
};
