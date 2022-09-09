const { network, ethers } = require("hardhat")
const { constants, networkConfig } = require("../../helper-hardhat-config")

const main = async (nftAddr, tokenId) => {
    const chainId = network.config.chainId
    const nftMarketPlaceName = networkConfig[chainId].contracts.NftMarketplace.name
    const proxy = await ethers.getContract(nftMarketPlaceName + "_Proxy")
    const nftMarketplace = await ethers.getContractAt(nftMarketPlaceName, proxy.address)

    const tx = await nftMarketplace.cancelListing(nftAddr, tokenId)
    await tx.wait()
}

main(
    constants.scriptsConfig.nftMarketplace.cancelListing.nftAddr,
    constants.scriptsConfig.nftMarketplace.cancelListing.tokenId
)
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
