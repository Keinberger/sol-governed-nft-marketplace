const { constants, networkConfig } = require("../helper-hardhat-config")
const { network } = require("hardhat")
const { verify } = require("../utils/deployment/verify")
require("dotenv").config()

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    const isDevelopmentChain = constants.developmentChains.includes(network.name)

    if (!isDevelopmentChain) return

    const contracts = networkConfig[chainId].forTests
    for (let i = 0; i < contracts.length; i++) {
        const contractConfig = contracts[i]
        log(`Deploying ${contractConfig.name} to ${network.name}`)
        const deployedContract = await deploy(contractConfig.name, {
            from: deployer,
            args: contractConfig.args,
            log: true,
            waitConfirmations: network.config.blockConfirmations || 1,
        })
        log(`${contractConfig.name} (${deployedContract.address}) deployed at (${network.name})`)

        if (!isDevelopmentChain && process.env.ETHERSCAN_API_KEY) {
            await verify(deployedContract.address, constructorArguments)
        }
    }

    log("------------------------------")
}

module.exports.tags = ["all", "forTests"]
