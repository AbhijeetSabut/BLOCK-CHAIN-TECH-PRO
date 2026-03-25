import mongoose from "mongoose";

const ledgerEventSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    fileId: {
      type: String,
      required: true,
      index: true
    },
    originalName: {
      type: String,
      required: true
    },
    mimeType: {
      type: String,
      default: "application/octet-stream"
    },
    size: {
      type: Number,
      required: true
    },
    accessCode: {
      type: String,
      required: true,
      minlength: 16,
      maxlength: 16
    },
    accessCodeHash: {
      type: String,
      required: true
    },
    integrityHash: {
      type: String,
      required: true,
      minlength: 64,
      maxlength: 64
    },
    shareId: {
      type: String,
      required: true,
      index: true
    },
    eventType: {
      type: String,
      enum: ["minted", "claimed", "deleted"],
      required: true
    },
    blockHeight: {
      type: Number,
      required: true
    },
    previousHash: {
      type: String,
      required: true
    },
    blockHash: {
      type: String,
      required: true
    },
    transactionHash: {
      type: String,
      required: true,
      unique: true
    },
    chainMode: {
      type: String,
      enum: ["simulated", "onchain"],
      default: "simulated"
    },
    networkName: {
      type: String,
      default: null
    },
    contractAddress: {
      type: String,
      default: null
    },
    relayerAddress: {
      type: String,
      default: null
    },
    explorerTransactionUrl: {
      type: String,
      default: null
    },
    explorerBlockUrl: {
      type: String,
      default: null
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

ledgerEventSchema.index({ user: 1, blockHeight: -1 });

const LedgerEvent = mongoose.model("LedgerEvent", ledgerEventSchema);

export default LedgerEvent;
