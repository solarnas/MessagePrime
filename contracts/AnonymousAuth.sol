// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, eaddress, externalEaddress} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

interface IERC721 {
    function balanceOf(address owner) external view returns (uint256 balance);

    function ownerOf(uint256 tokenId) external view returns (address owner);
}

contract AnonymousAuth is SepoliaConfig {
    struct UserRegistration {
        eaddress encryptedAddress;
        bool isRegistered;
        uint256 registrationTime;
    }

    struct NFTVerificationRecord {
        address nftContract;
        bool hasNFT;
    }

    struct PendingVerification {
        address user;
        address nftContract;
        uint256 timestamp;
        bool complete;
    }

    mapping(address => UserRegistration) public userRegistrations;
    mapping(address => mapping(address => bool)) public nftVerifications;
    mapping(uint256 => PendingVerification) private pendingVerifications;

    address public owner;

    event UserRegistered(address indexed user, uint256 timestamp);
    event NFTVerificationRequested(address indexed user, address indexed nftContract, bytes32 verificationId);
    event NFTVerificationCompleted(bytes32 indexed verificationId, bool hasNFT, address verifiedAddress);
    event AirdropClaimed(address indexed user, address indexed nftContract, uint256 amount);

    error OnlyOwner();
    error UserAlreadyRegistered();
    error UserNotRegistered();
    error NFTContractNotAuthorized();
    error InvalidVerificationRequest();
    error NoAirdropAvailable();
    error AirdropAlreadyClaimed();

    modifier onlyOwner() {
        if (msg.sender != owner) revert OnlyOwner();
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function registerEncryptedAddress(externalEaddress encryptedAddress, bytes calldata addressProof) external {
        if (userRegistrations[msg.sender].isRegistered) revert UserAlreadyRegistered();

        eaddress encryptedAddr = FHE.fromExternal(encryptedAddress, addressProof);

        userRegistrations[msg.sender] = UserRegistration({
            encryptedAddress: encryptedAddr,
            isRegistered: true,
            registrationTime: block.timestamp
        });

        FHE.allowThis(encryptedAddr);
        FHE.allow(encryptedAddr, msg.sender);

        emit UserRegistered(msg.sender, block.timestamp);
    }

    function requestNFTVerification(address nftContract) external returns (uint256) {
        if (!userRegistrations[msg.sender].isRegistered) revert UserNotRegistered();
        // if (!authorizedNFTContracts[nftContract]) revert NFTContractNotAuthorized();

        // Convert encrypted address to handle and request decryption
        eaddress encryptedAddr = userRegistrations[msg.sender].encryptedAddress;
        bytes32[] memory handles = new bytes32[](1);
        handles[0] = FHE.toBytes32(encryptedAddr);

        uint256 requestId = FHE.requestDecryption(handles, this.completeNFTVerification.selector);

        // Store pending verification data
        pendingVerifications[requestId] = PendingVerification({
            user: msg.sender,
            nftContract: nftContract,
            timestamp: block.timestamp,
            complete: false
        });

        return requestId;
    }

    function completeNFTVerification(
        uint256 requestId,
        address decryptedAddress,
        bytes[] calldata signatures
    ) external {
        // Verify signatures to prevent fake results
        FHE.checkSignatures(requestId, signatures);

        PendingVerification storage pending = pendingVerifications[requestId];

        if (pending.user == address(0)) revert InvalidVerificationRequest();
        pending.complete = true;
        // Check if decrypted address owns the NFT
        IERC721 nft = IERC721(pending.nftContract);
        uint256 balance = nft.balanceOf(decryptedAddress);
        bool hasNFT = balance > 0;

        nftVerifications[pending.user][pending.nftContract] = hasNFT;

        // Clean up pending verification
    }

    function getUserRegistration(address user) external view returns (UserRegistration memory) {
        UserRegistration memory reg = userRegistrations[user];
        return reg;
    }

    // function getUserEncryptedAddress(address user) external view returns (bytes32) {
    //     if (!userRegistrations[user].isRegistered) revert UserNotRegistered();
    //     return FHE.toBytes32(userRegistrations[user].encryptedAddress);
    // }

    function getNFTVerification(address user, address nft) external view returns (bool) {
        return nftVerifications[user][nft];
    }

    function getpendingVerification(uint256 id) external view returns (PendingVerification memory) {
        return pendingVerifications[id];
    }
}
