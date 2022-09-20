import NFT from "../web3/NFT"
import { useMoralis } from "react-moralis"
import { ethers } from "ethers"
import { useNotification } from "@web3uikit/core"
import { useState } from "react"
import { FaEthereum } from "react-icons/fa"

import nftTypes from "../../helpers/nftTypes"
import retrieveEligibleFunds from "../../hooks/nftMarketplace/retrieveEligibleFunds"
import withdrawFunds from "../../hooks/nftMarketplace/withdrawFunds"

export default function MyNftSales(props) {
    const dispatch = useNotification()
    const [sendingTx, setSendingTx] = useState(false)
    const { account } = useMoralis()
    const earnings = retrieveEligibleFunds(account)

    const sendWithdrawFunds = withdrawFunds()

    const handleNewNotification = (message, title, type) => {
        dispatch({
            type: type,
            message: message,
            title: title,
            icon: undefined,
            position: "topR",
        })
    }

    const handleTxPosted = () => {
        handleNewNotification("Transaction has been posted", "Tx Notification", "info")
    }

    const handleTxSuccess = async (tx) => {
        await tx.wait(4)
        handleNewNotification(`Transaction (${tx.hash}) complete!`, "Tx Notification", "success")
    }

    const handleTxError = () => {
        handleNewNotification("Transaction failed", "Tx Notification", "error")
    }

    return (
        <section name="NftSales">
            <div className="w-full">
                <div className="mx-auto max-w-[250px] sm:max-w-[400px] md:max-w-[600px] lg:max-w-[970px] xl:max-w-[1200px] lg:my-20 my-32">
                    <div className="space-y-6 flex flex-col md:flex-row md:justify-between md:space-y-0">
                        <div>
                            <h1 className="text-3xl sm:text-5xl md:text-4xl font-bold text-center text-slate-900 md:text-left">
                                My{" "}
                                <span className="text-xl sm:text-4xl md:text-3xl text-slate-600 ">
                                    Sales
                                </span>
                            </h1>
                        </div>
                        <div>
                            <div className="text-base text-slate-500 text-center drop-shadow-md">
                                Your funds from sales
                            </div>
                            <div className="flex flex-row justify-center">
                                <div></div>
                                <div className="flex flex-row items-center text-base bg-gray-100 py-1 pl-5 pr-1 rounded-xl border-gray-800 drop-shadow-xl space-x-5">
                                    <div className="text-slate-500 flex items-center">
                                        <div>
                                            {earnings
                                                ? ethers.utils.formatUnits(earnings, "ether")
                                                : "0"}{" "}
                                        </div>

                                        <div>
                                            <FaEthereum />
                                        </div>
                                    </div>

                                    <button
                                        className={`hover:text-slate-800 text-slate-500 bg-gray-200 
                                    px-3 py-1 rounded-xl transition ease-in-out duration-300 disabled:cursor-not-allowed disabled:hover:text-slate-500`}
                                        disabled={earnings ? earnings == 0 : true}
                                        onClick={async () => {
                                            setSendingTx(true)
                                            await sendWithdrawFunds({
                                                onComplete: () => {
                                                    handleTxPosted()
                                                    setSendingTx(false)
                                                },
                                                onSuccess: async (tx) => {
                                                    await handleTxSuccess(tx)
                                                    setSendingTx(false)
                                                },
                                                onError: (e) => {
                                                    console.log(e)
                                                    handleTxError()
                                                    setSendingTx(false)
                                                },
                                            })
                                        }}
                                    >
                                        {sendingTx ? "Waiting..." : "Withdraw"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {props.nfts !== undefined && props.nfts.length > 0 ? (
                        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 relative gap-x-8 gap-y-8 sm:gap-y-16 items-center mx-auto">
                            {props.nfts.map((nft, index) => (
                                <div className="mx-auto md:mx-0" key={index}>
                                    <NFT
                                        price={nft.price}
                                        nftAddress={nft.nftAddress}
                                        tokenId={nft.tokenId}
                                        marketplaceAddress={props.nftMarketplaceAddress}
                                        ownerAddress={nft.seller}
                                        type={nftTypes.sold}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="mx-auto text-center mt-20 space-y-3">
                            <h1 className="text-3xl text-slate-600 drop-shadow-xl">
                                You haven&apos;t sold any{" "}
                                <span className="text-slate-800 py-1 px-2 border border-slate-800 rounded-xl">
                                    NFTs
                                </span>{" "}
                                yet...
                            </h1>
                            <p className="text-xl text-slate-500 drop-shadow-lg">
                                Sell your first NFT on the marketplace
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}
