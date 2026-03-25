import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ContractFactory, JsonRpcProvider, Wallet } from "ethers";
import solc from "solc";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const contractPath = path.resolve(
  __dirname,
  "../../contracts/OneTimeShareLedger.sol"
);
const source = fs.readFileSync(contractPath, "utf8");

const input = {
  language: "Solidity",
  sources: {
    "OneTimeShareLedger.sol": {
      content: source
    }
  },
  settings: {
    outputSelection: {
      "*": {
        "*": ["abi", "evm.bytecode"]
      }
    }
  }
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));
const contractOutput =
  output.contracts?.["OneTimeShareLedger.sol"]?.OneTimeShareLedger;

if (!contractOutput) {
  throw new Error("Failed to compile OneTimeShareLedger.sol");
}

if (!process.env.BLOCKCHAIN_RPC_URL || !process.env.BLOCKCHAIN_PRIVATE_KEY) {
  throw new Error(
    "Set BLOCKCHAIN_RPC_URL and BLOCKCHAIN_PRIVATE_KEY in server/.env before deploying."
  );
}

const provider = new JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);
const wallet = new Wallet(process.env.BLOCKCHAIN_PRIVATE_KEY, provider);
const factory = new ContractFactory(
  contractOutput.abi,
  contractOutput.evm.bytecode.object,
  wallet
);

console.log("Deploying contract from", wallet.address);

const contract = await factory.deploy();
await contract.waitForDeployment();

const network = await provider.getNetwork();

console.log(
  JSON.stringify(
    {
      contractAddress: contract.target,
      chainId: Number(network.chainId),
      abi: contractOutput.abi
    },
    null,
    2
  )
);
