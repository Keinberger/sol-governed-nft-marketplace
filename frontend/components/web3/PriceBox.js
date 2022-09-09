import { useEffect, useState } from "react"
import Moralis from "moralis"
import { useMoralis } from "react-moralis"
import { FaEthereum } from "react-icons/fa"
import { useCookies } from "react-cookie"
import { ethers } from "ethers"
import { Select, Input } from "@web3uikit/core"

import nftTypes from "../../helpers/nftTypes"
import { getFormattedInput } from "../../helpers/getFormattedInput"

import updatePrice from "../../hooks/nftMarketplace/updatePrice"
import buyNftEth from "../../hooks/nftMarketplace/buyNftEth"
import buyNftErc20 from "../../hooks/nftMarketplace/buyNftErc20"
import approveErc20 from "../../hooks/nftMarketplace/approveErc20"

export default function PriceBox({
    nftAddress,
    tokenId,
    price,
    priceInput,
    setPriceInput,
    ownerAddress,
    currentNftType,
    formattedOptions,
    sendingTx,
    setSendingTx,
    paymentMethod,
    setPaymentMethod,
    formattedPrice,
    setFormattedPrice,
    handleTxPosted,
    handleTxSuccess,
    handleTxError,
}) {
    const [cookies, setCookie] = useCookies(["currentSite", "latestMessage"])
    const { account, chainId } = useMoralis()
    const [accountBalance, setAccountBalance] = useState("0")

    const getAccountBalance = async () => {
        const MORALIS_API_KEY = process.env.NEXT_PUBLIC_MORALIS_API_KEY
        await Moralis.start({ apiKey: MORALIS_API_KEY })

        const response = await Moralis.EvmApi.account.getNativeBalance({
            address: account,
            chain: chainId,
        })

        return response._data.balance
    }

    const sendUpdatePrice = updatePrice(nftAddress, tokenId, getFormattedInput(priceInput))
    const sendBuyNftEth = buyNftEth(nftAddress, tokenId, price)
    const sendApproveErc20 = approveErc20(formattedOptions[paymentMethod].address, formattedPrice)
    const sendBuyNftErc20 = buyNftErc20(nftAddress, tokenId, paymentMethod - 1)

    useEffect(() => {
        const setBalance = async () => {
            setAccountBalance(await getAccountBalance())
        }
        setBalance()
    }, [])

    return (
        <div className="space-y-2 sm:space-y-5 border border-slate-200 rounded-xl shadow-lg lg:w-[250px] mlg:w-[300px] xl:w-[350px]">
            <div className="text-sm sm:text-xl font-bold flex text-slate-700 border-b border-slate-200 pt-2 pb-2 px-4 sm:pt-3 sm:pb-2 sm:px-5">
                {ownerAddress == account && currentNftType == nftTypes.listed
                    ? "Update Price"
                    : ownerAddress == account && currentNftType == nftTypes.notListed
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
                                prefixIcon={<FaEthereum className="text-cyan-800" />}
                                value={currentNftType == nftTypes.listed ? priceInput : "0"}
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
                            {ethers.utils.formatUnits(formattedPrice, "ether").split(".")[1]
                                .length > 5
                                ? Number(ethers.utils.formatUnits(formattedPrice, "ether")).toFixed(
                                      5
                                  )
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
                                              !ethers.BigNumber.from(accountBalance).gt(
                                                  ethers.BigNumber.from(price)
                                              )
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
                                                  formattedOptions[paymentMethod].balance.toString()
                                              ).gt(ethers.BigNumber.from(formattedPrice))
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
                                                          window.location.reload(true)
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
                        disabled={sendingTx || price == getFormattedInput(priceInput)}
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
    )
}
