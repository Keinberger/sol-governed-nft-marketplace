import { useEffect, useState } from "react"
import { Modal, useNotification, Select, Input } from "@web3uikit/core"
import Moralis from "moralis"
import { useMoralis } from "react-moralis"
import { useCookies } from "react-cookie"
import { ethers } from "ethers"

import { getChainName } from "../../helpers/getChainName"
import nftTypes from "../../helpers/nftTypes"
import truncateStr from "../../helpers/truncateStr"

import Image from "next/image"
import { FaEthereum } from "react-icons/fa"

import retrieveTokenSymbol from "../../hooks/retrieveTokenSymbol"
import retrieveTokenAmount from "../../hooks/retrieveTokenAmount"
import retrieveTokenBalance from "../../hooks/retrieveTokenBalance"
import delistNft from "../../hooks/nftMarketplace/deListNft"
import approveNft from "../../hooks/nftMarketplace/approveNft"
import listNft from "../../hooks/nftMarketplace/listNft"
import updatePrice from "../../hooks/nftMarketplace/updatePrice"
import addPaymentToken from "../../hooks/nftMarketplace/addPaymentToken"
import removePaymentToken from "../../hooks/nftMarketplace/removePaymentToken"
import buyNftEth from "../../hooks/nftMarketplace/buyNftEth"
import buyNftErc20 from "../../hooks/nftMarketplace/buyNftErc20"
import approveErc20 from "../../hooks/nftMarketplace/approveErc20"

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
}

export default function Listing({
    nftAddress,
    tokenId,
    price,
    paymentTokens,
    activePaymentTokens,
    ownerAddress,
    tokenURI,
    isVisible,
    onClose,
    type,
}) {
    const dispatch = useNotification()
    const [currentNftType, setNftType] = useState(0)
    const [formattedPrice, setFormattedPrice] = useState(price || 0)
    const [paymentMethod, setPaymentMethod] = useState(0)
    const [currentAddPaymentTokenIndex, setCurrentAddPaymentTokenIndex] = useState(0)
    const [currentRemovePaymentTokenIndex, setCurrentRemovePaymentTokenIndex] = useState(0)
    const [paymentTokensToBeAdded, setPaymentTokensToBeAdded] = useState([])
    const [priceInput, setPriceInput] = useState("0")
    const [sendingTx, setSendingTx] = useState(false)
    const [accountBalance, setAccountBalance] = useState("0")
    const { account, chainId } = useMoralis()
    const [cookies, setCookie] = useCookies(["currentSite", "latestMessage"])
    const chainName = getChainName(chainId)

    const getAccountBalance = async () => {
        const MORALIS_API_KEY = process.env.NEXT_PUBLIC_MORALIS_API_KEY
        await Moralis.start({ apiKey: MORALIS_API_KEY })

        const response = await Moralis.EvmApi.account.getNativeBalance({
            address: account,
            chain: chainId,
        })

        return response._data.balance
    }

    let formattedOptions = [
        {
            id: 0,
            label: "ETH",
            prefix: <FaEthereum className="mr-2 text-cyan-800" />,
            amount: price,
            address: ethers.constants.AddressZero,
        },
    ]
    let tokens = []
    if (paymentTokens !== undefined) {
        for (let i = 0; i < paymentTokens.length; i++) {
            const symbol = retrieveTokenSymbol(paymentTokens[i])
            const tokenAmount = retrieveTokenAmount(price, paymentTokens[i])
            const tokenBalance = retrieveTokenBalance(account, paymentTokens[i])

            const token = {
                id: i + 1,
                label: symbol,
                prefix: <FaEthereum className="mr-2 text-cyan-800" />,
                amount: tokenAmount,
                address: paymentTokens[i],
                balance: tokenBalance,
            }

            formattedOptions.push(token)
            tokens.push(token)
        }
    }

    let activePaymentTokenOptions = []
    for (let i = 0; i < activePaymentTokens.length; i++) {
        let isInListing = false
        for (let i = 0; i < tokens.length; i++) {
            if (activePaymentTokens[i].tokenAddress == tokens[i].address) {
                isInListing = true
                break
            }
        }

        if (isInListing) {
            continue
        }

        const symbol = retrieveTokenSymbol(activePaymentTokens[i].tokenAddress)
        const token = {
            id: i,
            label: symbol,
            prefix: <FaEthereum className="mr-2 text-cyan-800" />,
            address: activePaymentTokens[i].tokenAddress,
        }

        activePaymentTokenOptions.push(token)
    }

    const paymentTokenAlreadyAdded = () => {
        let alreadyAdded = false
        if (activePaymentTokenOptions[currentAddPaymentTokenIndex] == undefined) {
            return false
        }
        const currentAddress = activePaymentTokenOptions[currentAddPaymentTokenIndex].address
        for (let i = 0; i < paymentTokensToBeAdded.length; i++) {
            if (paymentTokensToBeAdded[i] == currentAddress) {
                alreadyAdded = true
            }
        }
        return alreadyAdded
    }

    const getFormattedPriceInput = () => {
        return priceInput != 0 ? ethers.utils.parseUnits(priceInput, "ether").toString() : ""
    }

    const sendApproveNft = approveNft(nftAddress, tokenId)
    const sendListNft = listNft(
        nftAddress,
        tokenId,
        getFormattedPriceInput(),
        paymentTokensToBeAdded
    )
    const sendDelistNft = delistNft(nftAddress, tokenId)
    const sendUpdatePrice = updatePrice(nftAddress, tokenId, getFormattedPriceInput())
    const sendAddPaymentToken = addPaymentToken(
        nftAddress,
        tokenId,
        activePaymentTokenOptions[currentAddPaymentTokenIndex]
            ? activePaymentTokenOptions[currentAddPaymentTokenIndex].address
            : ""
    )
    const sendRemovePaymentToken = removePaymentToken(
        nftAddress,
        tokenId,
        currentRemovePaymentTokenIndex
    )
    const sendBuyNftEth = buyNftEth(nftAddress, tokenId, price)
    const sendApproveErc20 = approveErc20(formattedOptions[paymentMethod].address, formattedPrice)
    const sendBuyNftErc20 = buyNftErc20(nftAddress, tokenId, paymentMethod - 1)

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

    useEffect(() => {
        setNftType(type)
        if (account == ownerAddress) {
            setPriceInput(ethers.utils.formatUnits(formattedPrice, "ether").toString())
        }
        const setBalance = async () => {
            setAccountBalance(await getAccountBalance())
        }
        setBalance()
    }, [])

    return (
        <Modal
            // isCentered
            hasCancel={false}
            hasFooter={false}
            isVisible={isVisible}
            onCancel={onClose}
            onCloseButtonPressed={onClose}
            onOk={onClose}
        >
            <div className="h-full">
                <div className="flex flex-col lg:flex-row mx-auto justify-around text-center gap-10 max-w-[1400px]">
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
                                                ? "https://" +
                                                  chainName +
                                                  ".etherscan.io/address/" +
                                                  nftAddress
                                                : "https://etherscan.io/address/" + nftAddress
                                        }
                                        target="_blank"
                                    >
                                        {nftAddress}
                                    </a>
                                </div>
                                <div className="md:hidden italic text-xs sm:text-sm text-left text-slate-600">
                                    <a
                                        href={
                                            chainName !== "ethereum"
                                                ? "https://" +
                                                  chainName +
                                                  ".etherscan.io/address/" +
                                                  nftAddress
                                                : "https://etherscan.io/address/" + nftAddress
                                        }
                                        target="_blank"
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
                                                        Payment Tokens (
                                                        {paymentTokensToBeAdded.length})
                                                    </div>

                                                    {paymentTokensToBeAdded.map((token) => (
                                                        <div>
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
                                            tokens.length > 0 ? (
                                                <div className="mt-5">
                                                    <div className="text-sm sm:text-base flex font-bold">
                                                        Payment Tokens ({tokens.length})
                                                    </div>

                                                    {tokens.map((token) => (
                                                        <div>
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
                                                                >
                                                                    <span className="font-bold">
                                                                        {token.label}
                                                                    </span>{" "}
                                                                    (
                                                                    {truncateStr(token.address, 15)}
                                                                    )
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
                                                            // onClose()
                                                            setNftType(nftTypes.listed)
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
                    <div className="mb-5 space-y-8 mx-auto w-full sm:w-auto sm:max-w-[500px] lg:mx-0">
                        <div className="text-center sm:text-left">
                            <h2 className="text-slate-700 text-xl sm:text-4xl font-bold drop-shadow-xl">
                                {ownerAddress == account ? "Settings" : "Menu"}
                            </h2>
                        </div>

                        <div className="space-y-2 sm:space-y-5 border border-slate-200 rounded-xl shadow-lg lg:w-[250px] mlg:w-[300px] xl:w-[350px]">
                            <div className="text-sm sm:text-xl font-bold flex text-slate-700 border-b border-slate-200 pt-2 pb-2 px-4 sm:pt-3 sm:pb-2 sm:px-5">
                                {ownerAddress == account && currentNftType == nftTypes.listed
                                    ? "Update Price"
                                    : ownerAddress == account &&
                                      currentNftType == nftTypes.notListed
                                    ? "Set Price"
                                    : "Current Price"}
                            </div>
                            <div className="items-center flex space-x-6 font-mono px-3.5 py-3">
                                {ownerAddress == account ? (
                                    ""
                                ) : (
                                    <div>
                                        <Select
                                            label="Pay Using"
                                            defaultOptionIndex={0}
                                            onChange={(props) => {
                                                setFormattedPrice(props.amount)
                                                setPaymentMethod(props.id)
                                            }}
                                            options={formattedOptions}
                                            width="150px"
                                        />
                                    </div>
                                )}
                                <div className="text-base flex items-center sm:text-2xl font-mono font-bold">
                                    {ownerAddress == account ? (
                                        <div className="-ml-5 sm:ml-0 md:ml-5 scale-75 sm:scale-100 w-[200px] sm:w-[240px] md:w-[400px] lg:w-[180px] mlg:w-[230px] xl:w-[280px]">
                                            <Input
                                                prefixIcon={
                                                    <FaEthereum className="text-cyan-800" />
                                                }
                                                value={
                                                    currentNftType == nftTypes.listed
                                                        ? priceInput
                                                        : "0"
                                                }
                                                type="number"
                                                onChange={(event) => {
                                                    setPriceInput(event.nativeEvent.target.value)
                                                }}
                                                validation={{
                                                    numberMin: 0.000000000000000001,
                                                    numberMax: 100000000000000000,
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <span>
                                            {ethers.utils
                                                .formatUnits(formattedPrice, "ether")
                                                .split(".")[1].length > 5
                                                ? Number(
                                                      ethers.utils.formatUnits(
                                                          formattedPrice,
                                                          "ether"
                                                      )
                                                  ).toFixed(5)
                                                : ethers.utils.formatUnits(formattedPrice, "ether")}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div>
                                {currentNftType == nftTypes.listed ? (
                                    <button
                                        className={`rounded-b-xl w-full bg-cyan-700 text-slate-100 
                                            font-bold text-xs sm:text-base py-2 px-3 sm:py-4 sm:px-5
                                            transition ease-in-out delay-150 hover:bg-cyan-500
                                            hover:text-white duration-300 disabled:bg-cyan-600 
                                            disabled:text-slate-300 disabled:cursor-not-allowed`}
                                        onClick={
                                            ownerAddress == account
                                                ? async () => {
                                                      setSendingTx(true)
                                                      await sendUpdatePrice({
                                                          onComplete: () => {
                                                              handleTxPosted()
                                                          },
                                                          onSuccess: async (tx) => {
                                                              await handleTxSuccess(tx)
                                                              setSendingTx(false)

                                                              setCookie(
                                                                  "latestMessage",
                                                                  "NFT price has been succesfully updated!"
                                                              )
                                                              window.location.reload(true)
                                                          },
                                                          onError: (e) => {
                                                              console.log(e)
                                                              handleTxError()
                                                              setSendingTx(false)
                                                          },
                                                      })
                                                  }
                                                : async () => {
                                                      if (paymentMethod == 0) {
                                                          // check if balance is enough
                                                          if (
                                                              !ethers.BigNumber.from(
                                                                  accountBalance
                                                              ).gt(ethers.BigNumber.from(price))
                                                          ) {
                                                              handleNewNotification(
                                                                  `Sorry, you do not have enough ${formattedOptions[paymentMethod].label} to buy the NFT`,
                                                                  "Marketplace",
                                                                  "error"
                                                              )
                                                              return
                                                          }

                                                          await sendBuyNftEth({
                                                              onComplete: () => {
                                                                  handleTxPosted()
                                                              },
                                                              onSuccess: async (tx) => {
                                                                  await handleTxSuccess(tx)
                                                                  setSendingTx(false)

                                                                  onClose()
                                                                  setCookie(
                                                                      "latestMessage",
                                                                      "NFT has been bought successfully!"
                                                                  )
                                                                  window.location.reload(true)
                                                              },
                                                              onError: (e) => {
                                                                  console.log(e)
                                                                  handleTxError()
                                                                  setSendingTx(false)
                                                              },
                                                          })
                                                      } else {
                                                          if (
                                                              !ethers.BigNumber.from(
                                                                  formattedOptions[
                                                                      paymentMethod
                                                                  ].balance.toString()
                                                              ).gt(
                                                                  ethers.BigNumber.from(
                                                                      formattedPrice
                                                                  )
                                                              )
                                                          ) {
                                                              handleNewNotification(
                                                                  `Sorry, you do not have enough ${formattedOptions[paymentMethod].label} to buy the NFT`,
                                                                  "Marketplace",
                                                                  "error"
                                                              )
                                                              return
                                                          }

                                                          setSendingTx(true)
                                                          await sendApproveErc20({
                                                              onComplete: () => {
                                                                  handleTxPosted()
                                                              },
                                                              onSuccess: async (tx) => {
                                                                  await handleTxSuccess(tx)
                                                                  setSendingTx(false)

                                                                  setSendingTx(true)
                                                                  await sendBuyNftErc20({
                                                                      onComplete: () => {
                                                                          handleTxPosted()
                                                                      },
                                                                      onSuccess: async (tx) => {
                                                                          await handleTxSuccess(tx)
                                                                          setSendingTx(false)

                                                                          onClose()
                                                                          setCookie(
                                                                              "latestMessage",
                                                                              "NFT has been bought successfully!"
                                                                          )
                                                                          window.location.reload(
                                                                              true
                                                                          )
                                                                      },
                                                                      onError: (e) => {
                                                                          console.log(e)
                                                                          handleTxError()
                                                                      },
                                                                  })
                                                              },
                                                              onError: (e) => {
                                                                  console.log(e)
                                                                  handleTxError()
                                                              },
                                                          })
                                                      }
                                                  }
                                        }
                                        disabled={sendingTx || price == getFormattedPriceInput()}
                                    >
                                        {sendingTx
                                            ? "Waiting..."
                                            : ownerAddress == account
                                            ? "Update Price"
                                            : "Buy NFT"}
                                    </button>
                                ) : (
                                    ""
                                )}
                            </div>
                        </div>
                        {ownerAddress == account && tokens.length > 0 ? (
                            <div className="space-y-5 border border-slate-200 rounded-xl lg:w-[250px] mlg:w-[300px] xl:w-[350px] shadow-lg">
                                <div className="text-sm sm:text-xl font-bold flex text-slate-700 border-b border-slate-200 pt-2 pb-2 px-4 sm:pt-3 sm:pb-2 sm:px-5">
                                    Remove Payment Token
                                </div>
                                <div className="md:py-3 scale-75 sm:scale-100">
                                    <Select
                                        label="Token"
                                        defaultOptionIndex={0}
                                        onChange={(props) => {
                                            setCurrentRemovePaymentTokenIndex(props.id)
                                        }}
                                        options={tokens}
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

                                                    setCookie(
                                                        "latestMessage",
                                                        "Token has been removed successfully!"
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
                                    >
                                        {sendingTx ? "Waiting..." : "Remove Token"}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            ""
                        )}
                        {ownerAddress == account && activePaymentTokenOptions.length > 0 ? (
                            <div className="space-y-5 border border-slate-200 rounded-xl lg:w-[250px] mlg:w-[300px] xl:w-[350px] shadow-lg">
                                <div className="text-sm sm:text-xl font-bold flex text-slate-700 border-b border-slate-200 pt-2 pb-2 px-4 sm:pt-3 sm:pb-2 sm:px-5">
                                    Add Payment Token
                                    {currentNftType != nftTypes.listed && ownerAddress == account
                                        ? "s"
                                        : ""}
                                    {""}
                                    <span className="ml-2 italic font-normal text-base">
                                        (optional)
                                    </span>
                                </div>

                                {
                                    <div
                                        className={`scale-75 sm:scale-100 ${
                                            type == nftTypes.notListed
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
                                            options={activePaymentTokenOptions}
                                            width="150px"
                                        />
                                        {type == nftTypes.notListed ? (
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
                                                        activePaymentTokenOptions[
                                                            currentAddPaymentTokenIndex
                                                        ].address

                                                    if (!paymentTokenAlreadyAdded()) {
                                                        setPaymentTokensToBeAdded([
                                                            ...paymentTokensToBeAdded,
                                                            currentAddress,
                                                        ])
                                                    } else {
                                                        let index
                                                        for (
                                                            let i = 0;
                                                            i < paymentTokensToBeAdded;
                                                            i++
                                                        ) {
                                                            if (
                                                                paymentTokensToBeAdded[i] ==
                                                                currentAddress
                                                            ) {
                                                                index = i
                                                                break
                                                            }
                                                        }

                                                        const newArray = [
                                                            ...paymentTokensToBeAdded.slice(
                                                                0,
                                                                index
                                                            ),
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
                                }

                                <div>
                                    {type == nftTypes.listed ? (
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

                                                        setCookie(
                                                            "latestMessage",
                                                            "Token has been added successfully!"
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
                                        >
                                            {sendingTx ? "Waiting..." : "Add Token"}
                                        </button>
                                    ) : (
                                        ""
                                    )}
                                </div>
                            </div>
                        ) : (
                            ""
                        )}
                    </div>
                </div>
                <div className="my-16 md:my-32 max-w-[500px] lg:max-w-[600px] space-y-10 items-center mx-auto">
                    <div className="mb-10">
                        <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-slate-700 text-center drop-shadow-xl">
                            About <i>this</i> NFT
                        </h1>
                    </div>
                    <div className="border border-slate-200 rounded-xl shadow-xl">
                        <h2 className="text-base md:text-2xl lg:text-3xl font-bold text-slate-700 border-b border-slate-200 py-2 px-4 sm:px-5">
                            Description
                        </h2>
                        <p className="text-xs md:text-sm lg:text-base p-5">
                            {tokenURI.description}
                        </p>
                    </div>
                    <div className="border border-slate-200 rounded-xl shadow-xl">
                        <h2 className="text-base md:text-2xl lg:text-3xl font-bold text-slate-700 border-b border-slate-200 py-2 px-4 sm:px-5">
                            Attributes
                        </h2>
                        <div className="w-full p-5">
                            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                                {tokenURI.attributes.map((attr) => (
                                    <div className="text-xs sm:text-sm p-2 rounded-xl border border-cyan-700 bg-cyan-100 text-center">
                                        <h3 className="text-cyan-700">
                                            {capitalizeFirstLetter(attr.trait_type)}
                                        </h3>
                                        <p className="font-bold text-slate-800">
                                            {capitalizeFirstLetter(attr.value)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    )
}
