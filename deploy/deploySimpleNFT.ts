import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;

    const { deployer } = await getNamedAccounts();

    console.log("Deploying SimpleNFT contract with account:", deployer);

    // Deploy SimpleNFT contract
    const simpleNFTDeployment = await deploy("SimpleNFT", {
        from: deployer,
        args: [], // No constructor arguments needed
        log: true,
        waitConfirmations: 1,
    });

    console.log("SimpleNFT contract deployed to:", simpleNFTDeployment.address);

};

func.tags = ["SimpleNFT"];

export default func;