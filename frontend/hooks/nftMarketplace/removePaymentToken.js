import { useWeb3Contract, useMoralis } from "react-moralis"
import { addresses } from "../../constants/NftMarketplace"
import { abi as nftMarketplaceAbi } from "../../constants/NftMarketplace"

export default function removePaymentToken(nftAddress, tokenId, index) {
    const { chainId } = useMoralis()
    const chainIdParsed = parseInt(chainId)
    const nftMarketplaceAddress = chainIdParsed in addresses ? addresses[chainIdParsed][0] : null

    const { runContractFunction: remove } = useWeb3Contract({
        abi: nftMarketplaceAbi,
        contractAddress: nftMarketplaceAddress,
        functionName: "removePaymentTokenAtListing",
        params: {
            nftAddr: nftAddress,
            tokenId: tokenId,
            index: index,
        },
    })

    return remove
}
