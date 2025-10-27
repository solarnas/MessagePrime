import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

/**
 * AnonymousAuth Tasks
 * ===================
 *
 * Tutorial: Deploy and Interact Locally (--network localhost)
 * ===========================================================
 *
 * 1. From a separate terminal window:
 *
 *   npx hardhat node
 *
 * 2. Deploy the AnonymousAuth contract
 *
 *   npx hardhat --network localhost deploy:AnonymousAuth
 *
 * 3. Register an encrypted address
 *
 *   npx hardhat --network localhost anonymous-auth:register:encrypted-address --address 0x1234567890123456789012345678901234567890
 *
 * 5. Request NFT verification
 *
 *   npx hardhat --network localhost anonymous-auth:request-verification --nft-contract 0x1234567890123456789012345678901234567890
 *
 * 6. Check registration status
 *
 *   npx hardhat --network localhost anonymous-auth:get-registration --user 0x1234567890123456789012345678901234567890
 *
 */

/**
 * Example:
 *   - npx hardhat --network localhost anonymous-auth:address
 *   - npx hardhat --network sepolia anonymous-auth:address
 */
task("anonymous-auth:address", "Prints the AnonymousAuth contract address").setAction(async function (_taskArguments: TaskArguments, hre) {
  const { deployments } = hre;

  const anonymousAuth = await deployments.get("AnonymousAuth");

  console.log("AnonymousAuth address is " + anonymousAuth.address);
});

/**
 * Example:
 *   - npx hardhat --network localhost anonymous-auth:register:encrypted-address --address 0x1234567890123456789012345678901234567890
 *   - npx hardhat --network sepolia anonymous-auth:register:encrypted-address --address 0x1234567890123456789012345678901234567890
 */
task("anonymous-auth:register:encrypted-address", "Register an encrypted address for anonymous operations")
  .addOptionalParam("contract", "Optionally specify the AnonymousAuth contract address")
  .addParam("address", "The address to encrypt and register")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;

    const addressToRegister = taskArguments.address;
    if (!ethers.isAddress(addressToRegister)) {
      throw new Error(`Invalid address: ${addressToRegister}`);
    }

    await fhevm.initializeCLIApi();

    const AnonymousAuthDeployment = taskArguments.contract
      ? { address: taskArguments.contract }
      : await deployments.get("AnonymousAuth");
    console.log(`AnonymousAuth: ${AnonymousAuthDeployment.address}`);

    const signers = await ethers.getSigners();

    const anonymousAuthContract = await ethers.getContractAt("AnonymousAuth", AnonymousAuthDeployment.address);

    // Encrypt the address
    const encryptedInput = await fhevm
      .createEncryptedInput(AnonymousAuthDeployment.address, signers[0].address)
      .addAddress(addressToRegister)
      .encrypt();

    const tx = await anonymousAuthContract
      .connect(signers[0])
      .registerEncryptedAddress(encryptedInput.handles[0], encryptedInput.inputProof);
    console.log(`Wait for tx: ${tx.hash}...`);

    const receipt = await tx.wait();
    console.log(`tx: ${tx.hash} status=${receipt?.status}`);

    console.log(`Successfully registered encrypted address for ${signers[0].address}`);
  });

/**
 * Example:
 *   - npx hardhat --network localhost anonymous-auth:request-verification --nft-contract 0x1234567890123456789012345678901234567890
 *   - npx hardhat --network sepolia anonymous-auth:request-verification --nft-contract 0x1234567890123456789012345678901234567890
 */
task("anonymous-auth:request-verification", "Request NFT verification for registered user")
  .addOptionalParam("contract", "Optionally specify the AnonymousAuth contract address")
  .addParam("nftContract", "The NFT contract address to verify", undefined, undefined, true)
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments } = hre;

    const nftContract = taskArguments.nftContract;
    if (!ethers.isAddress(nftContract)) {
      throw new Error(`Invalid NFT contract address: ${nftContract}`);
    }

    const AnonymousAuthDeployment = taskArguments.contract
      ? { address: taskArguments.contract }
      : await deployments.get("AnonymousAuth");
    console.log(`AnonymousAuth: ${AnonymousAuthDeployment.address}`);

    const signers = await ethers.getSigners();

    const anonymousAuthContract = await ethers.getContractAt("AnonymousAuth", AnonymousAuthDeployment.address);

    const tx = await anonymousAuthContract
      .connect(signers[0])
      .requestNFTVerification(nftContract);
    console.log(`Wait for tx: ${tx.hash}...`);

    const receipt = await tx.wait();
    console.log(`tx: ${tx.hash} status=${receipt?.status}`);

    // Extract request ID from events
    const events = receipt?.logs || [];
    for (const event of events) {
      try {
        const parsedEvent = anonymousAuthContract.interface.parseLog(event);
        if (parsedEvent?.name === "NFTVerificationRequested") {
          console.log(`Verification request ID: ${parsedEvent.args.verificationId}`);
        }
      } catch (e) {
        // Ignore parsing errors for non-matching events
      }
    }

    console.log(`Successfully requested NFT verification for contract: ${nftContract}`);
  });

/**
 * Example:
 *   - npx hardhat --network localhost anonymous-auth:get-registration --user 0x1234567890123456789012345678901234567890
 *   - npx hardhat --network sepolia anonymous-auth:get-registration --user 0x1234567890123456789012345678901234567890
 */
task("anonymous-auth:get-registration", "Get user registration status")
  .addOptionalParam("contract", "Optionally specify the AnonymousAuth contract address")
  .addOptionalParam("user", "The user address to check (defaults to first signer)")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments } = hre;

    const AnonymousAuthDeployment = taskArguments.contract
      ? { address: taskArguments.contract }
      : await deployments.get("AnonymousAuth");
    console.log(`AnonymousAuth: ${AnonymousAuthDeployment.address}`);

    const signers = await ethers.getSigners();
    const userAddress = taskArguments.user || signers[0].address;

    if (!ethers.isAddress(userAddress)) {
      throw new Error(`Invalid user address: ${userAddress}`);
    }

    const anonymousAuthContract = await ethers.getContractAt("AnonymousAuth", AnonymousAuthDeployment.address);

    const [isRegistered, registrationTime] = await anonymousAuthContract.getUserRegistration(userAddress);

    console.log(`User: ${userAddress}`);
    console.log(`Is Registered: ${isRegistered}`);
    if (isRegistered) {
      const date = new Date(Number(registrationTime) * 1000);
      console.log(`Registration Time: ${date.toISOString()}`);
    }
  });

/**
 * Example:
 *   - npx hardhat --network localhost anonymous-auth:get-verification --user 0x1234567890123456789012345678901234567890 --nft-contract 0x1234567890123456789012345678901234567890
 *   - npx hardhat --network sepolia anonymous-auth:get-verification --user 0x1234567890123456789012345678901234567890 --nft-contract 0x1234567890123456789012345678901234567890
 */
task("anonymous-auth:get-verification", "Get NFT verification status for a user")
  .addOptionalParam("contract", "Optionally specify the AnonymousAuth contract address")
  .addOptionalParam("user", "The user address to check (defaults to first signer)")
  .addParam("nftContract", "The NFT contract address to check", undefined, undefined, true)
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments } = hre;

    const nftContract = taskArguments.nftContract;
    if (!ethers.isAddress(nftContract)) {
      throw new Error(`Invalid NFT contract address: ${nftContract}`);
    }

    const AnonymousAuthDeployment = taskArguments.contract
      ? { address: taskArguments.contract }
      : await deployments.get("AnonymousAuth");
    console.log(`AnonymousAuth: ${AnonymousAuthDeployment.address}`);

    const signers = await ethers.getSigners();
    const userAddress = taskArguments.user || signers[0].address;

    if (!ethers.isAddress(userAddress)) {
      throw new Error(`Invalid user address: ${userAddress}`);
    }

    const anonymousAuthContract = await ethers.getContractAt("AnonymousAuth", AnonymousAuthDeployment.address);

    const hasNFT = await anonymousAuthContract.getNFTVerification(userAddress, nftContract);

    console.log(`User: ${userAddress}`);
    console.log(`NFT Contract: ${nftContract}`);
    console.log(`Has NFT: ${hasNFT}`);
  });

/**
 * Example:
 *   - npx hardhat --network localhost anonymous-auth:get-pending-verification --request-id 12345
 *   - npx hardhat --network sepolia anonymous-auth:get-pending-verification --request-id 12345
 */
task("anonymous-auth:get-pending-verification", "Get pending verification details by request ID")
  .addOptionalParam("contract", "Optionally specify the AnonymousAuth contract address")
  .addParam("requestId", "The verification request ID")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments } = hre;

    const requestId = parseInt(taskArguments.requestId);
    if (!Number.isInteger(requestId)) {
      throw new Error(`Invalid request ID: ${taskArguments.requestId}`);
    }

    const AnonymousAuthDeployment = taskArguments.contract
      ? { address: taskArguments.contract }
      : await deployments.get("AnonymousAuth");
    console.log(`AnonymousAuth: ${AnonymousAuthDeployment.address}`);

    const anonymousAuthContract = await ethers.getContractAt("AnonymousAuth", AnonymousAuthDeployment.address);

    const pending = await anonymousAuthContract.getpendingVerification(requestId);

    console.log(`Request ID: ${requestId}`);
    console.log(`User: ${pending.user}`);
    console.log(`NFT Contract: ${pending.nftContract}`);
    console.log(`Timestamp: ${new Date(Number(pending.timestamp) * 1000).toISOString()}`);
    console.log(`Complete: ${pending.complete}`);
  });