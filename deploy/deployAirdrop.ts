import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts, ethers } = hre;
    const { deploy } = deployments;

    const { deployer } = await getNamedAccounts();

    console.log("Deploying Airdrop contract with account:", deployer);

    // Get the deployed AnonymousAuth contract address
    const anonymousAuthDeployment = await deployments.get("AnonymousAuth");
    const anonymousAuthAddress = anonymousAuthDeployment.address;

    console.log("Using AnonymousAuth contract at:", anonymousAuthAddress);

    // Deploy Airdrop contract
    const airdropDeployment = await deploy("Airdrop", {
        from: deployer,
        args: [anonymousAuthAddress],
        log: true,
        waitConfirmations: 1,
    });

    console.log("Airdrop contract deployed to:", airdropDeployment.address);

    // Verify contract on Etherscan if not on localhost
    if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
        try {
            await hre.run("verify:verify", {
                address: airdropDeployment.address,
                constructorArguments: [anonymousAuthAddress],
            });
            console.log("Airdrop contract verified on Etherscan");
        } catch (error) {
            console.log("Error verifying contract:", error);
        }
    }
};

func.tags = ["Airdrop"];
func.dependencies = ["AnonymousAuth"];

export default func;