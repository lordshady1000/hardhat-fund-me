//const helperconfig = require("../helper_hardhat-config.js");
//const networkConfig = helperconfig.netorkConfig
// this two lines is the sme as the one below

const { network } = require("hardhat");
const {
  networkConfig,
  developmentChains,
} = require("../helper-hardhat-config.js");

const { verify } = require("../utils/verify.js");
//async function deployFunc(hre){
// console.log("hii")
//}
//module.exports.default = deployFunc
// this is the same with the code below, you can now put your fuctions inside the deployfunc fuction

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  //if chain id is sepolias own use its address. all addresses have been declared in helper-hardhat-config.js
  //const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
  let ethUsdPriceFeedAddress;
  if (developmentChains.includes(network.name)) {
    const ethUsdAggregator = await deployments.get("MockV3Aggregator");
    ethUsdPriceFeedAddress = ethUsdAggregator.address;
  } else {
    ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
  }

  //if the contract does not exist,i.e not sepolia or we deploy mocks
  const args = [ethUsdPriceFeedAddress];
  const fundMe = await deploy("FundMe", {
    from: deployer,
    args: args, // put pricefeed address
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_APIKEY
  ) {
    await verify(fundMe.address, args);
  }

  log("-------------------------------------------------------");
};

module.exports.tags = ["all", "fundme"];
