import { useEffect, useState } from "react"
import { useWeb3Contract, useMoralis } from "react-moralis"
import { abi as nftMarketplaceAbi, addresses } from "../../constants/NftMarketplace"

export default function retrieveEligibleFunds(address) {
    const [eligibleFunds, setEligibleFunds] = useState("")

    const { chainId } = useMoralis()
    const chainIdParsed = parseInt(chainId)
    const nftMarketplaceAddress = chainIdParsed in addresses ? addresses[chainIdParsed][0] : null

    const { runContractFunction: retrieveFunds } = useWeb3Contract({
        abi: nftMarketplaceAbi,
        contractAddress: nftMarketplaceAddress,
        functionName: "getEligibleFunds",
        params: {
            addr: address,
        },
    })

    const retrieve = async () => {
        const funds = await retrieveFunds()
        if (funds !== undefined) {
            setEligibleFunds(funds.toString())
        }
    }

    useEffect(() => {
        retrieve()
    }, [])

    return eligibleFunds
}
