const { network, ethers } = require("hardhat")
const { networkConfig, constants } = require("../../helper-hardhat-config")
const { moveBlocks } = require("../../utils/testing/moveBlocks")
const { propose } = require("../../utils/governance/governance")
const fs = require("fs")

const main = async (functionToCall, args, description) => {
    const chainId = network.config.chainId
    const isDevelopmentChain = constants.developmentChains.includes(network.name)
    const governorName = networkConfig[chainId].contracts.Governor.name
    const governor = await ethers.getContract(governorName)

    const nftMarketName = networkConfig[chainId].contracts.NftMarketplace.name
    const nftMarket = await ethers.getContract(nftMarketName)

    const encodedFunctionCall = nftMarket.interface.encodeFunctionData(functionToCall, args)

    const proposalId = await propose(
        governor,
        [nftMarket.address],
        [0],
        [encodedFunctionCall],
        description
    )

    if (isDevelopmentChain) {
        await moveBlocks(constants.VOTING_DELAY + 1)
    }

    let proposals = JSON.parse(
        fs.readFileSync(constants.scriptsConfig.governance.proposalsFile, "utf8")
    )

    if (proposals[chainId.toString()] === undefined) {
        proposals[chainId.toString()] = []
    }

    proposals[chainId.toString()].push(proposalId.toString())
    fs.writeFileSync(constants.scriptsConfig.governance.proposalsFile, JSON.stringify(proposals))

    console.log(
        `Created new proposal (id: ${proposalId})\nData: ${encodedFunctionCall}\nDescription: ${description}`
    )

    console.log(
        `Appended proposal (${proposalId}) to local JSON file ${constants.scriptsConfig.governance.proposalsFile}`
    )
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
