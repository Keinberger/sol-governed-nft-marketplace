const { network, ethers } = require("hardhat")
const { constants, networkConfig } = require("../../helper-hardhat-config")

const main = async (nftAddr, tokenId, nftPrice, paymentTokens) => {
    const chainId = network.config.chainId
    const nftMarketPlaceName = networkConfig[chainId].contracts.NftMarketplace.name
    const proxy = await ethers.getContract(nftMarketPlaceName + "_Proxy")
    const nftMarketplace = await ethers.getContractAt(nftMarketPlaceName, proxy.address)

    const tx = await nftMarketplace.listNft(nftAddr, tokenId, nftPrice, paymentTokens)
    await tx.wait()
}

main(
    constants.scriptsConfig.nftMarketplace.listNft.nftAddr,
    constants.scriptsConfig.nftMarketplace.listNft.tokenId,
    constants.scriptsConfig.nftMarketplace.listNft.price,
    constants.scriptsConfig.nftMarketplace.listNft.paymentTokens
)
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
