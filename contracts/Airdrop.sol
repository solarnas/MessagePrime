// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./AnonymousAuth.sol";

contract Airdrop {
    AnonymousAuth public anonymousAuth;

    struct AirdropRecord {
        address nftContract;
        uint256 amount;
        bool claimed;
        uint256 timestamp;
    }

    mapping(address => mapping(address => AirdropRecord)) public airdropRecords;
    mapping(address => uint256) public totalAirdrops;

    address public owner;

    uint256 public AMOUNT = 1000 * 10 ** 18;

    event AirdropRecorded(address indexed user, address indexed nftContract, uint256 amount);
    event AirdropClaimed(address indexed user, address indexed nftContract, uint256 amount);

    error OnlyOwner();
    error NoNFTVerification();
    error AirdropAlreadyRecorded();
    error AirdropNotAvailable();
    error AirdropAlreadyClaimed();

    modifier onlyOwner() {
        if (msg.sender != owner) revert OnlyOwner();
        _;
    }

    constructor(address _anonymousAuthContract) {
        anonymousAuth = AnonymousAuth(_anonymousAuthContract);
        owner = msg.sender;
    }

    function recordAirdrop(address nftContract) external {
        // Check if user has NFT verification from AnonymousAuth
        address user = msg.sender;
        bool hasNFT = anonymousAuth.getNFTVerification(user, nftContract);
        if (!hasNFT) revert NoNFTVerification();

        // Check if airdrop already recorded
        if (airdropRecords[user][nftContract].amount > 0) revert AirdropAlreadyRecorded();

        // Record the airdrop
        airdropRecords[user][nftContract] = AirdropRecord({
            nftContract: nftContract,
            amount: AMOUNT,
            claimed: false,
            timestamp: block.timestamp
        });

        totalAirdrops[user] += AMOUNT;

        emit AirdropRecorded(user, nftContract, AMOUNT);
    }

    function getAirdropRecord(address user, address nftContract) external view returns (AirdropRecord memory) {
        return airdropRecords[user][nftContract];
    }

    function getUserTotalAirdrops(address user) external view returns (uint256) {
        return totalAirdrops[user];
    }

    function hasUnclaimedAirdrop(address user, address nftContract) external view returns (bool) {
        AirdropRecord memory record = airdropRecords[user][nftContract];
        return record.amount > 0 && !record.claimed;
    }
}
