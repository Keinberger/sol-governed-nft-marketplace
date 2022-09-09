import { useWeb3Contract, useMoralis } from "react-moralis"
import { addresses } from "../../constants/NftMarketplace"
import { abi as basicNftAbi } from "../../constants/BasicNft"

export default function approveNft(nftAddress, tokenId) {
    const { chainId } = useMoralis()
    const chainIdParsed = parseInt(chainId)
    const nftMarketplaceAddress = chainIdParsed in addresses ? addresses[chainIdParsed][0] : null

    const { runContractFunction: approve } = useWeb3Contract({
        abi: basicNftAbi,
        contractAddress: nftAddress,
        functionName: "approve",
        params: {
            to: nftMarketplaceAddress,
            tokenId: tokenId,
        },
    })

    return approve
}
