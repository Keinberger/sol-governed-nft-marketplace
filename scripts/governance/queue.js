const { network, ethers } = require("hardhat")
const { constants, networkConfig } = require("../../helper-hardhat-config")
const { moveTime } = require("../../utils/testing/moveTime")
const { moveBlocks } = require("../../utils/testing/moveBlocks")
const { queue } = require("../../utils/governance/governance")

const main = async (functionToCall, args, description) => {
    const chainId = network.config.chainId
    const isDevelopmentChain = constants.developmentChains.includes(network.name)
    const governorName = networkConfig[chainId].contracts.Governor.name
    const governor = await ethers.getContract(governorName)

    const nftMarketName = networkConfig[chainId].contracts.NftMarketplace.name
    const nftMarket = await ethers.getContract(nftMarketName)

    const encodedFunctionCall = nftMarket.interface.encodeFunctionData(functionToCall, args)

    await queue(governor, [nftMarket.address], [0], [encodedFunctionCall], description)

    if (isDevelopmentChain) {
        await moveTime(constants.MIN_DELAY + 1)
        await moveBlocks(1)
    }

    console.log(`Proposal has been queued up!`)
}

main(
    constants.scriptsConfig.governance.functionToCall,
    constants.scriptsConfig.governance.args,
    constants.scriptsConfig.governance.description
)
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
