import { expect } from "chai";
import { ethers } from "hardhat";
import type { AnonymousAuth } from "../types";
import { Signer } from "ethers";

describe("AnonymousAuth - Sepolia Tests", function () {
  let anonymousAuth: AnonymousAuth;
  let owner: Signer;
  let user1: Signer;

  before(async function () {
    // 确保在 Sepolia 网络上运行
    const network = await ethers.provider.getNetwork();
    if (network.chainId !== 11155111n) {
      this.skip();
    }

    [owner, user1] = await ethers.getSigners();
    
    // 部署合约
    const AnonymousAuthFactory = await ethers.getContractFactory("AnonymousAuth");
    anonymousAuth = await AnonymousAuthFactory.deploy();
    await anonymousAuth.waitForDeployment();

    console.log("AnonymousAuth deployed to:", await anonymousAuth.getAddress());
  });

  it.skip("Should allow user to register encrypted address", async function () {
    // 这个测试需要实际的 FHE 加密数据和证明
    // 在实际的测试环境中，需要使用 fhevm-js 库来生成加密数据
    console.log("This test requires actual FHE encrypted data generation");
  });

  it("Should allow owner to manage contract settings", async function () {
    const mockNFTContract = "0x1234567890123456789012345678901234567890";
    const mockTokenContract = "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd";

    // 测试 NFT 合约授权
    await anonymousAuth.connect(owner).authorizeNFTContract(mockNFTContract, true);
    expect(await anonymousAuth.authorizedNFTContracts(mockNFTContract)).to.equal(true);

    // 测试代币合约授权  
    await anonymousAuth.connect(owner).authorizeTokenContract(mockTokenContract, true);
    expect(await anonymousAuth.authorizedTokenContracts(mockTokenContract)).to.equal(true);
  });

  it.skip("Should perform NFT verification with real encrypted data", async function () {
    // 这个测试需要：
    // 1. 用户先注册加密地址
    // 2. 部署一个 mock NFT 合约
    // 3. 请求 NFT 验证
    // 4. 等待 oracle 回调完成验证
    console.log("This test requires full FHE integration with oracle");
  });

  it("Should handle view functions correctly", async function () {
    const userAddress = await user1.getAddress();
    
    // 测试用户注册查询
    const [isRegistered, registrationTime] = await anonymousAuth.getUserRegistration(userAddress);
    expect(isRegistered).to.equal(false);
    expect(registrationTime).to.equal(0);

    // 测试空投资格查询
    const mockTokenContract = "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd";
    const [hasAirdrop, amount, claimed] = await anonymousAuth.checkAirdropEligibility(userAddress, mockTokenContract);
    expect(hasAirdrop).to.equal(false);
    expect(amount).to.equal(0);
    expect(claimed).to.equal(false);
  });
});