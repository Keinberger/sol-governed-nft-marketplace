const { network, ethers } = require("hardhat")
const { constants, networkConfig } = require("../../helper-hardhat-config")

const main = async (nftAddr, tokenId, indexToUpdate, paymentTokenAddress) => {
    const chainId = network.config.chainId
    const nftMarketPlaceName = networkConfig[chainId].contracts.NftMarketplace.name
    const proxy = await ethers.getContract(nftMarketPlaceName + "_Proxy")
    const nftMarketplace = await ethers.getContractAt(nftMarketPlaceName, proxy.address)

    const tx = await nftMarketplace.updateListingPaymentToken(
        nftAddr,
        tokenId,
        indexToUpdate,
        paymentTokenAddress
    )
    await tx.wait()
}

main(
    constants.scriptsConfig.nftMarketplace.updateListingPaymentToken.nftAddr,
    constants.scriptsConfig.nftMarketplace.updateListingPaymentToken.tokenId,
    constants.scriptsConfig.nftMarketplace.updateListingPaymentToken.indexToUpdate,
    constants.scriptsConfig.nftMarketplace.updateListingPaymentToken.paymentTokenAddress
)
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
