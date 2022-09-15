const { network, ethers } = require("hardhat")
const { constants, networkConfig } = require("../../helper-hardhat-config")

const main = async (nftAddr, tokenId, paymentTokenAddress) => {
    const chainId = network.config.chainId
    const nftMarketPlaceName = networkConfig[chainId].contracts.NftMarketplace.name
    const proxy = await ethers.getContract(nftMarketPlaceName + "_Proxy")
    const nftMarketplace = await ethers.getContractAt(nftMarketPlaceName, proxy.address)

    const tx = await nftMarketplace.addPaymentTokenAtListing(nftAddr, tokenId, paymentTokenAddress)
    await tx.wait()
}

main(
    constants.scriptsConfig.nftMarketplace.addPaymentTokenAtListing.nftAddr,
    constants.scriptsConfig.nftMarketplace.addPaymentTokenAtListing.tokenId,
    constants.scriptsConfig.nftMarketplace.addPaymentTokenAtListing.paymentTokenAddress
)
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
