// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract OneTimeShareLedger {
    enum ShareStatus {
        None,
        Active,
        Claimed,
        Deleted
    }

    struct ShareAnchor {
        address owner;
        bytes32 fileHash;
        bytes32 accessCodeHash;
        uint64 createdAt;
        uint64 expiresAt;
        ShareStatus status;
    }

    mapping(bytes32 => ShareAnchor) public shares;

    event ShareAnchored(
        bytes32 indexed shareId,
        address indexed owner,
        bytes32 fileHash,
        bytes32 accessCodeHash,
        uint64 expiresAt
    );

    event ShareClaimed(
        bytes32 indexed shareId,
        address indexed owner,
        bytes32 fileHash
    );

    event ShareDeleted(bytes32 indexed shareId, address indexed owner);

    function anchorShare(
        bytes32 shareId,
        bytes32 fileHash,
        bytes32 accessCodeHash,
        uint64 expiresAt
    ) external {
        require(shares[shareId].owner == address(0), "Share already exists.");

        shares[shareId] = ShareAnchor({
            owner: msg.sender,
            fileHash: fileHash,
            accessCodeHash: accessCodeHash,
            createdAt: uint64(block.timestamp),
            expiresAt: expiresAt,
            status: ShareStatus.Active
        });

        emit ShareAnchored(
            shareId,
            msg.sender,
            fileHash,
            accessCodeHash,
            expiresAt
        );
    }

    function claimShare(bytes32 shareId) external {
        ShareAnchor storage share = shares[shareId];

        require(share.owner != address(0), "Share does not exist.");
        require(share.status == ShareStatus.Active, "Share is not active.");

        share.status = ShareStatus.Claimed;

        emit ShareClaimed(shareId, share.owner, share.fileHash);
    }

    function deleteShare(bytes32 shareId) external {
        ShareAnchor storage share = shares[shareId];

        require(share.owner != address(0), "Share does not exist.");
        require(share.status == ShareStatus.Active, "Share is not active.");

        share.status = ShareStatus.Deleted;

        emit ShareDeleted(shareId, share.owner);
    }
}
