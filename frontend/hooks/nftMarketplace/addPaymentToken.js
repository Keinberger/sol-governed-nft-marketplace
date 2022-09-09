import { useWeb3Contract, useMoralis } from "react-moralis"
import { addresses } from "../../constants/NftMarketplace"
import { abi as nftMarketplaceAbi } from "../../constants/NftMarketplace"

export default function addPaymentToken(nftAddress, tokenId, paymentTokenAddress) {
    const { chainId } = useMoralis()
    const chainIdParsed = parseInt(chainId)
    const nftMarketplaceAddress = chainIdParsed in addresses ? addresses[chainIdParsed][0] : null

    const { runContractFunction: add } = useWeb3Contract({
        abi: nftMarketplaceAbi,
        contractAddress: nftMarketplaceAddress,
        functionName: "addPaymentTokenAtListing",
        params: {
            nftAddr: nftAddress,
            tokenId: tokenId,
            paymentTokenAddress: paymentTokenAddress,
        },
    })

    return add
}
