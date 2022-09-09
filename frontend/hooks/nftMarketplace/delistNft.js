import { useWeb3Contract, useMoralis } from "react-moralis"
import { abi as nftMarketplaceAbi, addresses } from "../../constants/NftMarketplace"

export default function delistNft(nftAddress, tokenId) {
    const { chainId } = useMoralis()
    const chainIdParsed = parseInt(chainId)
    const nftMarketplaceAddress = chainIdParsed in addresses ? addresses[chainIdParsed][0] : null

    const { runContractFunction: delistNft } = useWeb3Contract({
        abi: nftMarketplaceAbi,
        contractAddress: nftMarketplaceAddress,
        functionName: "cancelListing",
        params: {
            nftAddr: nftAddress,
            tokenId: tokenId,
        },
    })

    return delistNft
}
