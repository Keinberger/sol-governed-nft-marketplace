import { useWeb3Contract, useMoralis } from "react-moralis"
import { abi as nftMarketplaceAbi, addresses } from "../../constants/NftMarketplace"

export default function buyNftEth(nftAddress, tokenId, msgValue) {
    const { chainId } = useMoralis()
    const chainIdParsed = parseInt(chainId)
    const nftMarketplaceAddress = chainIdParsed in addresses ? addresses[chainIdParsed][0] : null

    const { runContractFunction: buyNft } = useWeb3Contract({
        abi: nftMarketplaceAbi,
        contractAddress: nftMarketplaceAddress,
        functionName: "buyNftEth",
        params: {
            nftAddr: nftAddress,
            tokenId: tokenId,
        },
        msgValue: msgValue,
    })

    return buyNft
}
