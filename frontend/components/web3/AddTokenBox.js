import { useState } from "react"
import { useCookies } from "react-cookie"
import { useMoralis } from "react-moralis"
import { Select } from "@web3uikit/core"

import addPaymentToken from "../../hooks/nftMarketplace/addPaymentToken"
import nftTypes from "../../helpers/nftTypes"

export default function AddTokenBox({
    ownerAddress,
    nftAddress,
    tokenId,
    currentNftType,
    paymentTokenOptions,
    paymentTokensToBeAdded,
    setPaymentTokensToBeAdded,
    sendingTx,
    setSendingTx,
    handleTxPosted,
    handleTxSuccess,
    handleTxError,
}) {
    const [cookies, setCookie] = useCookies(["currentSite", "latestMessage"])
    const { account } = useMoralis()
    const [currentAddPaymentTokenIndex, setCurrentAddPaymentTokenIndex] = useState(0)

    const paymentTokenAlreadyAdded = () => {
        let alreadyAdded = false
        if (paymentTokenOptions[currentAddPaymentTokenIndex] == undefined) {
            return false
        }
        const currentAddress = paymentTokenOptions[currentAddPaymentTokenIndex].address
        for (let i = 0; i < paymentTokensToBeAdded.length; i++) {
            if (paymentTokensToBeAdded[i] == currentAddress) {
                alreadyAdded = true
            }
        }
        return alreadyAdded
    }

    const sendAddPaymentToken = addPaymentToken(
        nftAddress,
        tokenId,
        paymentTokenOptions[currentAddPaymentTokenIndex]
            ? paymentTokenOptions[currentAddPaymentTokenIndex].address
            : ""
    )

    return (
        <div className="space-y-5 border border-slate-200 rounded-xl lg:w-[250px] mlg:w-[300px] xl:w-[350px] shadow-lg">
            <div className="text-sm sm:text-xl font-bold flex text-slate-700 border-b border-slate-200 pt-2 pb-2 px-4 sm:pt-3 sm:pb-2 sm:px-5">
                Add Payment Token
                {currentNftType != nftTypes.listed && ownerAddress == account ? "s" : ""}
                {""}
                <span className="ml-2 italic font-normal text-base">(optional)</span>
            </div>

            <div
                className={`scale-75 sm:scale-100 ${
                    currentNftType == nftTypes.notListed
                        ? "flex w-full ml-5 items-center space-x-5"
                        : ""
                }`}
            >
                <Select
                    label="Token"
                    defaultOptionIndex={0}
                    onChange={(props) => {
                        setCurrentAddPaymentTokenIndex(props.id)
                    }}
                    options={paymentTokenOptions}
                    width="150px"
                />
                {currentNftType == nftTypes.notListed ? (
                    <button
                        className={`text-3xl rounded-full bg-cyan-700 text-slate-100 
                        pb-1 ${
                            paymentTokenAlreadyAdded() ? "px-4" : "px-3"
                        } transition ease-in-out delay-150 hover:bg-cyan-500 
                      hover:text-white duration-300 disabled:bg-cyan-600 disabled:text-slate-300 
                        disabled:cursor-not-allowed`}
                        disabled={sendingTx}
                        onClick={() => {
                            const currentAddress =
                                paymentTokenOptions[currentAddPaymentTokenIndex].address

                            if (!paymentTokenAlreadyAdded()) {
                                setPaymentTokensToBeAdded([
                                    ...paymentTokensToBeAdded,
                                    currentAddress,
                                ])
                            } else {
                                let index
                                for (let i = 0; i < paymentTokensToBeAdded; i++) {
                                    if (paymentTokensToBeAdded[i] == currentAddress) {
                                        index = i
                                        break
                                    }
                                }

                                const newArray = [
                                    ...paymentTokensToBeAdded.slice(0, index),
                                    ...paymentTokensToBeAdded.slice(
                                        index + 1,
                                        paymentTokensToBeAdded.length
                                    ),
                                ]

                                setPaymentTokensToBeAdded(newArray)
                            }
                        }}
                    >
                        {paymentTokenAlreadyAdded() ? "-" : "+"}
                    </button>
                ) : (
                    ""
                )}
            </div>

            <div>
                {currentNftType == nftTypes.listed ? (
                    <button
                        className={`rounded-b-xl w-full bg-cyan-700 text-slate-100 
                        font-bold text-xs sm:text-base py-2 px-3 sm:py-4 sm:px-5
                        transition ease-in-out delay-150 hover:bg-cyan-500
                        hover:text-white duration-300 disabled:bg-cyan-600 
                        disabled:text-slate-300 disabled:cursor-not-allowed`}
                        disabled={paymentTokenAlreadyAdded() || sendingTx}
                        onClick={async () => {
                            setSendingTx(true)
                            await sendAddPaymentToken({
                                onComplete: () => {
                                    handleTxPosted()
                                },
                                onSuccess: async (tx) => {
                                    await handleTxSuccess(tx)
                                    setSendingTx(false)

                                    setCookie("latestMessage", "Token has been added successfully!")
                                    window.location.reload(true)
                                },
                                onError: (e) => {
                                    console.log(e)
                                    handleTxError()
                                    setSendingTx(false)
                                },
                            })
                        }}
                    >
                        {sendingTx ? "Waiting..." : "Add Token"}
                    </button>
                ) : (
                    ""
                )}
            </div>
        </div>
    )
}
