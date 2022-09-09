import { useWeb3Contract, useMoralis } from "react-moralis"
import { abi as nftMarketplaceAbi, addresses } from "../../constants/NftMarketplace"

export default function buyNftErc20(nftAddress, tokenId, paymentTokenIndex) {
    const { chainId } = useMoralis()
    const chainIdParsed = parseInt(chainId)
    const nftMarketplaceAddress = chainIdParsed in addresses ? addresses[chainIdParsed][0] : null

    const { runContractFunction: buyNft } = useWeb3Contract({
        abi: nftMarketplaceAbi,
        contractAddress: nftMarketplaceAddress,
        functionName: "buyNftErc20",
        params: {
            nftAddr: nftAddress,
            tokenId: tokenId,
            paymentTokenIndex: paymentTokenIndex,
        },
    })

    return buyNft
}
