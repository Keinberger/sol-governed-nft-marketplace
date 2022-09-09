import { useWeb3Contract, useMoralis } from "react-moralis"
import { abi as nftMarketplaceAbi, addresses } from "../../constants/NftMarketplace"

export default function listNft(nftAddress, tokenId, price, paymentTokens) {
    const { chainId } = useMoralis()
    const chainIdParsed = parseInt(chainId)
    const nftMarketplaceAddress = chainIdParsed in addresses ? addresses[chainIdParsed][0] : null

    const { runContractFunction: listNft } = useWeb3Contract({
        abi: nftMarketplaceAbi,
        contractAddress: nftMarketplaceAddress,
        functionName: "listNft",
        params: {
            nftAddr: nftAddress,
            tokenId: tokenId,
            nftPrice: price,
            allowedPaymentTokens: paymentTokens,
        },
    })

    return listNft
}
