const { network, ethers } = require("hardhat")
const { constants, networkConfig } = require("../../helper-hardhat-config")

const main = async (nftAddr, tokenId, index) => {
    const chainId = network.config.chainId
    const nftMarketPlaceName = networkConfig[chainId].contracts.NftMarketplace.name
    const proxy = await ethers.getContract(nftMarketPlaceName + "_Proxy")
    const nftMarketplace = await ethers.getContractAt(nftMarketPlaceName, proxy.address)

    const tx = await nftMarketplace.removePaymentTokenAtListing(nftAddr, tokenId, index)
    await tx.wait()
}

main(
    constants.scriptsConfig.nftMarketplace.removePaymentTokenAtListing.nftAddr,
    constants.scriptsConfig.nftMarketplace.removePaymentTokenAtListing.tokenId,
    constants.scriptsConfig.nftMarketplace.removePaymentTokenAtListing.index
)
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
