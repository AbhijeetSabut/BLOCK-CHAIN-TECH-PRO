import mongoose from "mongoose";

const sharedFileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    storedName: {
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
    integrityHash: {
      type: String,
      default: null
    },
    chainMode: {
      type: String,
      default: "simulated"
    },
    chainShareId: {
      type: String,
      default: null
    },
    chainAccessCodeHash: {
      type: String,
      default: null
    },
    accessCode: {
      type: String,
      required: true,
      unique: true,
      minlength: 16,
      maxlength: 16
    },
    chainBlockHeight: {
      type: Number,
      default: null
    },
    chainBlockHash: {
      type: String,
      default: null
    },
    chainTransactionHash: {
      type: String,
      default: null
    },
    chainNetworkName: {
      type: String,
      default: null
    },
    chainContractAddress: {
      type: String,
      default: null
    },
    chainRelayerAddress: {
      type: String,
      default: null
    },
    chainExplorerTransactionUrl: {
      type: String,
      default: null
    },
    accessCount: {
      type: Number,
      default: 0
    },
    expiresAt: {
      type: Date,
      default: null
    },
    lastAccessedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

const SharedFile = mongoose.model("SharedFile", sharedFileSchema);

export default SharedFile;
