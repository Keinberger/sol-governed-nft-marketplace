import { useWeb3Contract, useMoralis } from "react-moralis"
import { addresses } from "../../constants/NftMarketplace"
import { abi as tokenAbi } from "../../constants/FrontendToken"

export default function approveErc20(tokenAddress, amount) {
    const { chainId } = useMoralis()
    const chainIdParsed = parseInt(chainId)
    const nftMarketplaceAddress = chainIdParsed in addresses ? addresses[chainIdParsed][0] : null

    const { runContractFunction: approve } = useWeb3Contract({
        abi: tokenAbi,
        contractAddress: tokenAddress,
        functionName: "approve",
        params: {
            spender: nftMarketplaceAddress,
            amount: amount,
        },
    })

    return approve
}
