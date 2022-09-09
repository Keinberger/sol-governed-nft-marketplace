import { useEffect, useState } from "react"
import { useWeb3Contract } from "react-moralis"
import { abi as tokenAbi } from "../constants/FrontendToken"

export default function retrieveTokenSymbol(address) {
    const [symbol, setSymbol] = useState("NONE")

    const { runContractFunction: retrieveSymbol } = useWeb3Contract({
        abi: tokenAbi,
        contractAddress: address,
        functionName: "symbol",
        params: {},
    })

    const retrieve = async () => {
        setSymbol(await retrieveSymbol())
    }

    useEffect(() => {
        retrieve()
    }, [])

    return symbol
}
