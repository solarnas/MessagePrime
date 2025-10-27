import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("Deploying AnonymousAuth with account:", deployer);

  const anonymousAuth = await deploy("AnonymousAuth", {
    from: deployer,
    log: true,
    args: [],
  });

  console.log("AnonymousAuth deployed to:", anonymousAuth.address);
};

func.tags = ["AnonymousAuth"];

export default func;