const { network, ethers } = require("hardhat")
const { constants, networkConfig } = require("../../helper-hardhat-config")

const main = async (nftAddr, tokenId) => {
    const chainId = network.config.chainId
    const nftMarketPlaceName = networkConfig[chainId].contracts.NftMarketplace.name
    const proxy = await ethers.getContract(nftMarketPlaceName + "_Proxy")
    const nftMarketplace = await ethers.getContractAt(nftMarketPlaceName, proxy.address)

    const listing = await nftMarketplace.getListing(nftAddr, tokenId)

    const tx = await nftMarketplace.buyNftEth(nftAddr, tokenId, { value: listing.nftPrice })
    await tx.wait()
}

main(
    constants.scriptsConfig.nftMarketplace.buyNftEth.nftAddr,
    constants.scriptsConfig.nftMarketplace.buyNftEth.tokenId
)
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
