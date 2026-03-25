const shareLedgerAbi = [
  {
    inputs: [
      { internalType: "bytes32", name: "shareId", type: "bytes32" },
      { internalType: "bytes32", name: "fileHash", type: "bytes32" },
      { internalType: "bytes32", name: "accessCodeHash", type: "bytes32" },
      { internalType: "uint64", name: "expiresAt", type: "uint64" }
    ],
    name: "anchorShare",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "bytes32", name: "shareId", type: "bytes32" }],
    name: "claimShare",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "bytes32", name: "shareId", type: "bytes32" }],
    name: "deleteShare",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "bytes32", name: "shareId", type: "bytes32" },
      { indexed: true, internalType: "address", name: "owner", type: "address" },
      { indexed: false, internalType: "bytes32", name: "fileHash", type: "bytes32" },
      {
        indexed: false,
        internalType: "bytes32",
        name: "accessCodeHash",
        type: "bytes32"
      },
      { indexed: false, internalType: "uint64", name: "expiresAt", type: "uint64" }
    ],
    name: "ShareAnchored",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "bytes32", name: "shareId", type: "bytes32" },
      { indexed: true, internalType: "address", name: "owner", type: "address" },
      { indexed: false, internalType: "bytes32", name: "fileHash", type: "bytes32" }
    ],
    name: "ShareClaimed",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "bytes32", name: "shareId", type: "bytes32" },
      { indexed: true, internalType: "address", name: "owner", type: "address" }
    ],
    name: "ShareDeleted",
    type: "event"
  }
];

export default shareLedgerAbi;
