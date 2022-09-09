const { network, ethers } = require("hardhat")
const { constants, networkConfig } = require("../../helper-hardhat-config")

const main = async (nftAddr, tokenId, newPrice) => {
    const chainId = network.config.chainId
    const nftMarketPlaceName = networkConfig[chainId].contracts.NftMarketplace.name
    const proxy = await ethers.getContract(nftMarketPlaceName + "_Proxy")
    const nftMarketplace = await ethers.getContractAt(nftMarketPlaceName, proxy.address)

    const tx = await nftMarketplace.updateListingPrice(nftAddr, tokenId, newPrice)
    await tx.wait()
}

main(
    constants.scriptsConfig.nftMarketplace.updateListingPrice.nftAddr,
    constants.scriptsConfig.nftMarketplace.updateListingPrice.tokenId,
    constants.scriptsConfig.nftMarketplace.updateListingPrice.newPrice
)
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
