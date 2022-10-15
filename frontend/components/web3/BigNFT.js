import Image from "next/image"
import { FaEthereum } from "react-icons/fa"
import { useCookies } from "react-cookie"
import { useMoralis } from "react-moralis"

import { getChainName } from "../../helpers/getChainName"
import nftTypes from "../../helpers/nftTypes"
import truncateStr from "../../helpers/truncateStr"
import { getFormattedInput } from "../../helpers/getFormattedInput"

import delistNft from "../../hooks/nftMarketplace/delistNft"
import approveNft from "../../hooks/nftMarketplace/approveNft"
import listNft from "../../hooks/nftMarketplace/listNft"

export default function BigNFT({
    nftAddress,
    tokenId,
    priceInput,
    paymentTokens,
    paymentTokensToBeAdded,
    ownerAddress,
    tokenURI,
    currentNftType,
    sendingTx,
    setSendingTx,
    handleTxPosted,
    handleTxSuccess,
    handleTxError,
}) {
    const [cookies, setCookie] = useCookies(["latestMessage"])
    const { account, chainId } = useMoralis()
    const chainName = getChainName(chainId)

    const sendApproveNft = approveNft(nftAddress, tokenId)
    const sendListNft = listNft(
        nftAddress,
        tokenId,
        getFormattedInput(priceInput),
        paymentTokensToBeAdded
    )
    const sendDelistNft = delistNft(nftAddress, tokenId)

    return (
        <div className="mx-auto lg:mx-0 mb-6 sm:mb-0">
            <div className="rounded-xl overflow-hidden shadow-2xl">
                <Image
                    loader={() => tokenURI.image}
                    src={tokenURI.image}
                    layout="intrinsic"
                    height="500"
                    width="500"
                />
                <div className="text-slate-800 px-4 pb-3">
                    <div className="text-xs sm:text-sm text-left text-slate-700 font-bold font-mono">
                        {tokenURI.name}
                    </div>
                    <div className="hidden md:block italic text-xs sm:text-sm text-left text-slate-600">
                        <a
                            href={
                                chainName !== "ethereum"
                                    ? "https://" + chainName + ".etherscan.io/address/" + nftAddress
                                    : "https://etherscan.io/address/" + nftAddress
                            }
                            target="_blank"
                            rel="noreferrer"
                        >
                            {nftAddress}
                        </a>
                    </div>
                    <div className="md:hidden italic text-xs sm:text-sm text-left text-slate-600">
                        <a
                            href={
                                chainName !== "ethereum"
                                    ? "https://" + chainName + ".etherscan.io/address/" + nftAddress
                                    : "https://etherscan.io/address/" + nftAddress
                            }
                            target="_blank"
                            rel="noreferrer"
                        >
                            {truncateStr(nftAddress, 15)}
                        </a>
                    </div>
                    <div className="italic text-xs sm:text-sm text-left text-slate-600">
                        #{tokenId}
                    </div>
                    {ownerAddress == account ? (
                        <div>
                            <div className="flex text-sm sm:text-base font-bold items-center mt-5">
                                Price
                            </div>
                            <div className="flex text-sm sm:text-base font-bold items-center">
                                <FaEthereum className="mr-2" />
                                {priceInput}
                            </div>
                            {currentNftType == nftTypes.notListed ? (
                                paymentTokensToBeAdded.length > 0 ? (
                                    <div className="mt-5">
                                        <div className="flex text-sm sm:text-base font-bold">
                                            Payment Tokens ({paymentTokensToBeAdded.length})
                                        </div>

                                        {paymentTokensToBeAdded.map((token, index) => (
                                            <div key={index}>
                                                <div className="hidden md:flex italic text-xs sm:text-sm text-left text-slate-600">
                                                    <a
                                                        href={
                                                            chainName !== "ethereum"
                                                                ? "https://" +
                                                                  chainName +
                                                                  ".etherscan.io/address/" +
                                                                  token
                                                                : "https://etherscan.io/address/" +
                                                                  token
                                                        }
                                                        target="_blank"
                                                        rel="noreferrer"
                                                    >
                                                        {token}
                                                    </a>
                                                </div>
                                                <div className="md:hidden flex italic text-xs sm:text-sm text-left text-slate-600">
                                                    <a
                                                        href={
                                                            chainName !== "ethereum"
                                                                ? "https://" +
                                                                  chainName +
                                                                  ".etherscan.io/address/" +
                                                                  token
                                                                : "https://etherscan.io/address/" +
                                                                  token
                                                        }
                                                        target="_blank"
                                                        rel="noreferrer"
                                                    >
                                                        {truncateStr(token, 15)}
                                                    </a>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="mt-5">
                                        <div className="flex italic text-sm sm:text-base text-slate-700">
                                            No Payment Tokens
                                        </div>
                                    </div>
                                )
                            ) : currentNftType == nftTypes.listed ? (
                                paymentTokens.length > 0 ? (
                                    <div className="mt-5">
                                        <div className="text-sm sm:text-base flex font-bold">
                                            Payment Tokens ({paymentTokens.length})
                                        </div>

                                        {paymentTokens.map((token, index) => (
                                            <div key={index}>
                                                <div className="hidden md:flex italic text-xs sm:text-sm text-left text-slate-600">
                                                    <a
                                                        href={
                                                            chainName !== "ethereum"
                                                                ? "https://" +
                                                                  chainName +
                                                                  ".etherscan.io/address/" +
                                                                  token.address
                                                                : "https://etherscan.io/address/" +
                                                                  token.address
                                                        }
                                                        target="_blank"
                                                        rel="noreferrer"
                                                    >
                                                        <span className="font-bold">
                                                            {token.label}
                                                        </span>{" "}
                                                        ({token.address})
                                                    </a>
                                                </div>
                                                <div className="md:hidden flex italic text-xs sm:text-sm text-left text-slate-600">
                                                    <a
                                                        href={
                                                            chainName !== "ethereum"
                                                                ? "https://" +
                                                                  chainName +
                                                                  ".etherscan.io/address/" +
                                                                  token.address
                                                                : "https://etherscan.io/address/" +
                                                                  token.address
                                                        }
                                                        target="_blank"
                                                        rel="noreferrer"
                                                    >
                                                        <span className="font-bold">
                                                            {token.label}
                                                        </span>{" "}
                                                        ({truncateStr(token.address, 15)})
                                                    </a>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    ""
                                )
                            ) : (
                                ""
                            )}
                        </div>
                    ) : (
                        ""
                    )}
                </div>
                <div className="p-0">
                    {currentNftType == nftTypes.listed && ownerAddress == account ? (
                        <button
                            className={`
                            rounded-b-xl w-full bg-rose-400 text-slate-100 font-bold text-sm sm:text-base py-2 px-3 sm:py-4
                            sm:px-5 transition ease-in-out delay-150 hover:bg-rose-500 hover:text-white 
                            duration-300 disabled:bg-rose-300 disabled:text-slate-200 
                            disabled:cursor-not-allowed`}
                            onClick={async () => {
                                setSendingTx(true)

                                await sendDelistNft({
                                    onComplete: () => {
                                        handleTxPosted()
                                    },
                                    onSuccess: async (tx) => {
                                        await handleTxSuccess(tx)
                                        setSendingTx(false)

                                        onClose()
                                        setCookie(
                                            "latestMessage",
                                            "NFT has been delisted successfully!"
                                        )
                                        window.location.reload(true)
                                    },
                                    onError: (e) => {
                                        console.log(e)
                                        handleTxError()
                                        setSendingTx(false)
                                    },
                                })
                            }}
                            disabled={sendingTx}
                        >
                            {sendingTx ? "Transaction in progress..." : "Unlist"}
                        </button>
                    ) : currentNftType != nftTypes.listed && ownerAddress == account ? (
                        <button
                            className={`rounded-b-xl w-full 
                            bg-cyan-700 text-slate-100 font-bold py-4 
                            px-5 transition ease-in-out delay-150 hover:bg-cyan-500 
                            hover:text-white duration-300 disabled:bg-cyan-600 
                            disabled:text-slate-300 disabled:cursor-not-allowed`}
                            onClick={async () => {
                                setSendingTx(true)
                                await sendApproveNft({
                                    onComplete: () => {
                                        handleTxPosted
                                    },
                                    onSuccess: async (tx) => {
                                        await handleTxSuccess(tx)
                                        setSendingTx(false)

                                        setSendingTx(true)
                                        await sendListNft({
                                            onComplete: () => {
                                                handleTxPosted()
                                            },
                                            onSuccess: async (tx) => {
                                                await handleTxSuccess(tx)
                                                setSendingTx(false)
                                                setCookie(
                                                    "latestMessage",
                                                    "NFT has been listed successfully!"
                                                )
                                                window.location.reload(true)
                                            },
                                            onError: (e) => {
                                                console.log(e)
                                                handleTxError()
                                                setSendingTx(false)
                                            },
                                        })
                                    },
                                    onError: (e) => {
                                        console.log(e)
                                        handleTxError()
                                        setSendingTx(false)
                                    },
                                })
                            }}
                            disabled={priceInput == 0 || sendingTx}
                        >
                            {sendingTx ? "Waiting for confirmation..." : "List NFT"}
                        </button>
                    ) : (
                        ""
                    )}
                </div>
            </div>
        </div>
    )
}
