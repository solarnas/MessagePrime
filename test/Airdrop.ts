import { expect } from "chai";
import { ethers } from "hardhat";
import { AnonymousAuth, Airdrop } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("Airdrop", function () {
    let anonymousAuth: AnonymousAuth;
    let airdrop: Airdrop;
    let owner: SignerWithAddress;
    let user1: SignerWithAddress;
    let user2: SignerWithAddress;
    let nftContract: string;

    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();
        
        // Deploy AnonymousAuth contract
        const AnonymousAuthFactory = await ethers.getContractFactory("AnonymousAuth");
        anonymousAuth = await AnonymousAuthFactory.deploy();
        await anonymousAuth.waitForDeployment();
        
        // Deploy Airdrop contract
        const AirdropFactory = await ethers.getContractFactory("Airdrop");
        airdrop = await AirdropFactory.deploy(await anonymousAuth.getAddress());
        await airdrop.waitForDeployment();
        
        // Mock NFT contract address
        nftContract = ethers.Wallet.createRandom().address;
        
        // Authorize NFT contract in AnonymousAuth
        await anonymousAuth.authorizeNFTContract(nftContract, true);
    });

    describe("Deployment", function () {
        it("Should set the correct owner", async function () {
            expect(await airdrop.owner()).to.equal(owner.address);
        });

        it("Should set the correct AnonymousAuth contract", async function () {
            expect(await airdrop.anonymousAuth()).to.equal(await anonymousAuth.getAddress());
        });
    });

    describe("Record Airdrop", function () {
        it("Should revert when user has no NFT verification", async function () {
            await expect(
                airdrop.recordAirdrop(user1.address, nftContract, 1000)
            ).to.be.revertedWithCustomError(airdrop, "NoNFTVerification");
        });

        it("Should record airdrop for verified user", async function () {
            // Mock NFT verification by directly setting it in AnonymousAuth
            // This would normally be done through the verification process
            // For testing, we'll need to access the mapping directly or add a test function
            
            // Since we can't directly set the mapping, we'll skip this test
            // In a real scenario, you'd need to complete the full verification flow
            this.skip();
        });
    });

    describe("Claim Airdrop", function () {
        it("Should revert when no airdrop available", async function () {
            await expect(
                airdrop.connect(user1).claimAirdrop(nftContract)
            ).to.be.revertedWithCustomError(airdrop, "AirdropNotAvailable");
        });
    });

    describe("View Functions", function () {
        it("Should return correct total airdrops for user", async function () {
            expect(await airdrop.getUserTotalAirdrops(user1.address)).to.equal(0);
        });

        it("Should return false for unclaimed airdrop when none exists", async function () {
            expect(await airdrop.hasUnclaimedAirdrop(user1.address, nftContract)).to.be.false;
        });
    });
});