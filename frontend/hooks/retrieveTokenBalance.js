import { useEffect, useState } from "react"
import { useWeb3Contract } from "react-moralis"
import { abi as tokenAbi } from "../constants/FrontendToken"

export default function retrieveTokenBalance(account, contractAddress) {
    const [balance, setBalance] = useState("0")

    const { runContractFunction: retreiveBalance } = useWeb3Contract({
        abi: tokenAbi,
        contractAddress: contractAddress,
        functionName: "balanceOf",
        params: {
            account: account,
        },
    })

    const retrieve = async () => {
        setBalance(await retreiveBalance())
    }

    useEffect(() => {
        retrieve()
    }, [])

    return balance
}
