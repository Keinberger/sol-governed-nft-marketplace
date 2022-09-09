import { useWeb3Contract, useMoralis } from "react-moralis"
import { abi as nftMarketplaceAbi, addresses } from "../../constants/NftMarketplace"

export default function updatePrice(nftAddress, tokenId, newPrice) {
    const { chainId } = useMoralis()
    const chainIdParsed = parseInt(chainId)
    const nftMarketplaceAddress = chainIdParsed in addresses ? addresses[chainIdParsed][0] : null

    const { runContractFunction: updateListingPrice } = useWeb3Contract({
        abi: nftMarketplaceAbi,
        contractAddress: nftMarketplaceAddress,
        functionName: "updateListingPrice",
        params: {
            nftAddr: nftAddress,
            tokenId: tokenId,
            newPrice: newPrice,
        },
    })

    return updateListingPrice
}
