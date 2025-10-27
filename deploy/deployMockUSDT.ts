import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("Deploying MockUSDT with account:", deployer);

  const mockUSDT = await deploy("MockUSDT", {
    from: deployer,
    log: true,
    args: [],
  });

  console.log("MockUSDT deployed to:", mockUSDT.address);
  console.log("MockUSDT name: Mock USDT");
  console.log("MockUSDT symbol: mUSDT");
  console.log("MockUSDT decimals: 6");
  console.log("Note: Anyone can mint tokens using the mint() function");
};

func.tags = ["MockUSDT"];

export default func;