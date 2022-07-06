const { network, ethers } = require("hardhat")
const { constants, networkConfig } = require("../../helper-hardhat-config")
const { execute } = require("../../utils/governance/governance.js")
const fs = require("fs")

const main = async (functionToCall, args, description) => {
    const chainId = network.config.chainId
    const governorName = networkConfig[chainId].contracts.Governor.name
    const governor = await ethers.getContract(governorName)

    const nftMarketName = networkConfig[chainId].contracts.NftMarketplace.name
    const nftMarket = await ethers.getContract(nftMarketName)

    const encodedFunctionCall = nftMarket.interface.encodeFunctionData(functionToCall, args)

    await execute(governor, [nftMarket.address], [0], [encodedFunctionCall], description)

    let proposals = JSON.parse(
        fs.readFileSync(constants.scriptsConfig.governance.proposalsFile, "utf8")
    )
    proposals[chainId.toString()] = []
    fs.writeFileSync(constants.scriptsConfig.governance.proposalsFile, JSON.stringify(proposals))
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
