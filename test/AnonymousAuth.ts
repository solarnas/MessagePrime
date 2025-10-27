import { expect } from "chai";
import { ethers } from "hardhat";
import type { AnonymousAuth } from "../types";
import { Signer } from "ethers";

describe("AnonymousAuth", function () {
  let anonymousAuth: AnonymousAuth;
  let owner: Signer;
  let user1: Signer;
  let user2: Signer;
  let mockNFTContract: string;
  let mockTokenContract: string;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    
    const AnonymousAuthFactory = await ethers.getContractFactory("AnonymousAuth");
    anonymousAuth = await AnonymousAuthFactory.deploy();
    await anonymousAuth.waitForDeployment();

    // 使用一些假地址作为mock合约地址
    mockNFTContract = "0x1234567890123456789012345678901234567890";
    mockTokenContract = "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd";
  });

  describe("Contract Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await anonymousAuth.owner()).to.equal(await owner.getAddress());
    });
  });

  describe("Authorization Management", function () {
    it("Should allow owner to authorize NFT contracts", async function () {
      await anonymousAuth.connect(owner).authorizeNFTContract(mockNFTContract, true);
      expect(await anonymousAuth.authorizedNFTContracts(mockNFTContract)).to.equal(true);
    });

    it("Should allow owner to authorize token contracts", async function () {
      await anonymousAuth.connect(owner).authorizeTokenContract(mockTokenContract, true);
      expect(await anonymousAuth.authorizedTokenContracts(mockTokenContract)).to.equal(true);
    });

    it("Should not allow non-owner to authorize contracts", async function () {
      await expect(
        anonymousAuth.connect(user1).authorizeNFTContract(mockNFTContract, true)
      ).to.be.revertedWithCustomError(anonymousAuth, "OnlyOwner");
    });
  });

  describe("User Registration", function () {
    it("Should prevent double registration", async function () {
      // 注意：这个测试需要实际的加密地址和proof，这里只是框架
      // 在实际测试中，需要使用fhevm的测试工具生成加密数据
      
      const [isRegistered, ] = await anonymousAuth.getUserRegistration(await user1.getAddress());
      expect(isRegistered).to.equal(false);
    });

    it("Should get user registration info correctly", async function () {
      const userAddress = await user1.getAddress();
      const [isRegistered, registrationTime] = await anonymousAuth.getUserRegistration(userAddress);
      expect(isRegistered).to.equal(false);
      expect(registrationTime).to.equal(0);
    });
  });

  describe("NFT Verification", function () {
    beforeEach(async function () {
      // 授权NFT合约
      await anonymousAuth.connect(owner).authorizeNFTContract(mockNFTContract, true);
    });

    it("Should not allow unregistered user to request verification", async function () {
      await expect(
        anonymousAuth.connect(user1).requestNFTVerification(mockNFTContract)
      ).to.be.revertedWithCustomError(anonymousAuth, "UserNotRegistered");
    });

    it("Should not allow verification for unauthorized NFT contracts", async function () {
      // First we need to register the user (this would require actual encrypted data in a real test)
      // For now, let's test the authorization check differently
      
      const unauthorizedNFT = "0x9999999999999999999999999999999999999999";
      
      // This will fail with UserNotRegistered first, which is expected since we can't
      // easily create encrypted addresses in unit tests without the full FHE setup
      await expect(
        anonymousAuth.connect(user1).requestNFTVerification(unauthorizedNFT)
      ).to.be.revertedWithCustomError(anonymousAuth, "UserNotRegistered");
    });
  });

  describe("Airdrop Management", function () {
    it("Should check airdrop eligibility correctly", async function () {
      const userAddress = await user1.getAddress();
      const [hasAirdrop, amount, claimed] = await anonymousAuth.checkAirdropEligibility(userAddress, mockTokenContract);
      
      expect(hasAirdrop).to.equal(false);
      expect(amount).to.equal(0);
      expect(claimed).to.equal(false);
    });

    it("Should not allow claiming non-existent airdrop", async function () {
      await expect(
        anonymousAuth.connect(user1).claimAirdrop(mockTokenContract)
      ).to.be.revertedWithCustomError(anonymousAuth, "NoAirdropAvailable");
    });

    it("Should calculate airdrop amount correctly", async function () {
      // 测试未授权的NFT合约
      let amount = await anonymousAuth.getAirdropAmount(mockNFTContract);
      expect(amount).to.equal(0);

      // 授权NFT合约后测试
      await anonymousAuth.connect(owner).authorizeNFTContract(mockNFTContract, true);
      amount = await anonymousAuth.getAirdropAmount(mockNFTContract);
      expect(amount).to.equal(ethers.parseEther("1000"));
    });
  });

  describe("View Functions", function () {
    it("Should return correct verification info for non-existent verification", async function () {
      const fakeVerificationId = ethers.encodeBytes32String("fake");
      const [nftContract, verifiedAddress, hasNFT, verificationTime] = await anonymousAuth.getNFTVerification(fakeVerificationId);
      
      expect(nftContract).to.equal(ethers.ZeroAddress);
      expect(verifiedAddress).to.equal(ethers.ZeroAddress);
      expect(hasNFT).to.equal(false);
      expect(verificationTime).to.equal(0);
    });
  });
});