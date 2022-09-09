import { useEffect, useState } from "react"
import { useWeb3Contract, useMoralis } from "react-moralis"
import { abi as nftMarketplaceAbi, addresses } from "../constants/NftMarketplace"

export default function retrieveTokenAmount(amount, address) {
    const [tokenAmount, setTokenAmount] = useState("")

    const { chainId } = useMoralis()
    const chainIdParsed = parseInt(chainId)
    const nftMarketplaceAddress = chainIdParsed in addresses ? addresses[chainIdParsed][0] : null

    const { runContractFunction: retrieveTokenAmount } = useWeb3Contract({
        abi: nftMarketplaceAbi,
        contractAddress: nftMarketplaceAddress,
        functionName: "getTokenAmountFromEthAmount",
        params: {
            ethAmount: amount,
            tokenAddress: address,
        },
    })

    const retrieve = async () => {
        const tokenAmount = await retrieveTokenAmount()
        if (tokenAmount !== undefined) {
            setTokenAmount(tokenAmount.toString())
        }
    }

    useEffect(() => {
        retrieve()
    }, [])

    return tokenAmount
}
