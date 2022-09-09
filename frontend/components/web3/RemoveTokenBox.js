import { useState } from "react"
import { useCookies } from "react-cookie"
import { useMoralis } from "react-moralis"
import { Select } from "@web3uikit/core"

import removePaymentToken from "../../hooks/nftMarketplace/removePaymentToken"

export default function RemoveTokenBox({
    nftAddress,
    tokenId,
    paymentTokens,
    sendingTx,
    setSendingTx,
    handleTxPosted,
    handleTxSuccess,
    handleTxError,
}) {
    const [cookies, setCookie] = useCookies(["currentSite", "latestMessage"])
    const { account } = useMoralis()
    const [index, setIndex] = useState(0)

    const sendRemovePaymentToken = removePaymentToken(nftAddress, tokenId, index)

    return (
        <div className="space-y-5 border border-slate-200 rounded-xl lg:w-[250px] mlg:w-[300px] xl:w-[350px] shadow-lg">
            <div className="text-sm sm:text-xl font-bold flex text-slate-700 border-b border-slate-200 pt-2 pb-2 px-4 sm:pt-3 sm:pb-2 sm:px-5">
                Remove Payment Token
            </div>
            <div className="md:py-3 scale-75 sm:scale-100">
                <Select
                    label="Token"
                    defaultOptionIndex={0}
                    onChange={(props) => {
                        setIndex(props.id)
                    }}
                    options={paymentTokens}
                    width="150px"
                />
            </div>
            <div>
                <button
                    className={`rounded-b-xl w-full bg-cyan-700 text-slate-100 
                    font-bold text-xs sm:text-base py-2 px-3 sm:py-4 sm:px-5
                    transition ease-in-out delay-150 hover:bg-cyan-500
                    hover:text-white duration-300 disabled:bg-cyan-600 
                    disabled:text-slate-300 disabled:cursor-not-allowed`}
                    disabled={sendingTx}
                    onClick={async () => {
                        setSendingTx(true)
                        await sendRemovePaymentToken({
                            onComplete: () => {
                                handleTxPosted()
                            },
                            onSuccess: async (tx) => {
                                await handleTxSuccess(tx)
                                setSendingTx(false)

                                setCookie("latestMessage", "Token has been removed successfully!")
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
                    {sendingTx ? "Waiting..." : "Remove Token"}
                </button>
            </div>
        </div>
    )
}
