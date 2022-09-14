import { useEffect, useState } from "react"
import { Modal, useNotification } from "@web3uikit/core"
import { useMoralis } from "react-moralis"
import { ethers } from "ethers"
import { FaEthereum } from "react-icons/fa"

import retrieveTokenSymbol from "../../hooks/retrieveTokenSymbol"
import retrieveTokenAmount from "../../hooks/retrieveTokenAmount"
import retrieveTokenBalance from "../../hooks/retrieveTokenBalance"

import BigNFT from "./BigNFT"
import PriceBox from "./PriceBox"
import RemoveTokenBox from "./RemoveTokenBox"
import AddTokenBox from "./AddTokenBox"

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
    const [paymentTokensToBeAdded, setPaymentTokensToBeAdded] = useState([])
    const [priceInput, setPriceInput] = useState("0")
    const [sendingTx, setSendingTx] = useState(false)
    const { account } = useMoralis()

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
    }, [])

    return (
        <Modal
            hasCancel={false}
            hasFooter={false}
            isVisible={isVisible}
            onCancel={onClose}
            onCloseButtonPressed={onClose}
            onOk={onClose}
        >
            <div className="h-full">
                <div className="flex flex-col lg:flex-row mx-auto justify-around text-center gap-10 max-w-[1400px]">
                    <BigNFT
                        nftAddress={nftAddress}
                        tokenId={tokenId}
                        priceInput={priceInput}
                        paymentTokens={tokens}
                        paymentTokensToBeAdded={paymentTokensToBeAdded}
                        ownerAddress={ownerAddress}
                        tokenURI={tokenURI}
                        currentNftType={currentNftType}
                        sendingTx={sendingTx}
                        setSendingTx={setSendingTx}
                        handleTxPosted={handleTxPosted}
                        handleTxSuccess={handleTxSuccess}
                        handleTxError={handleTxError}
                    />
                    <div className="mb-5 space-y-8 mx-auto w-full sm:w-auto sm:max-w-[500px] lg:mx-0">
                        <div className="text-center sm:text-left">
                            <h2 className="text-slate-700 text-xl sm:text-4xl font-bold drop-shadow-xl">
                                {ownerAddress == account ? "Settings" : "Menu"}
                            </h2>
                        </div>

                        <PriceBox
                            nftAddress={nftAddress}
                            tokenId={tokenId}
                            price={price}
                            priceInput={priceInput}
                            setPriceInput={setPriceInput}
                            ownerAddress={ownerAddress}
                            currentNftType={currentNftType}
                            formattedOptions={formattedOptions}
                            sendingTx={sendingTx}
                            setSendingTx={setSendingTx}
                            paymentMethod={paymentMethod}
                            setPaymentMethod={setPaymentMethod}
                            formattedPrice={formattedPrice}
                            setFormattedPrice={setFormattedPrice}
                            handleTxPosted={handleTxPosted}
                            handleTxSuccess={handleTxSuccess}
                            handleTxError={handleTxError}
                        />
                        {ownerAddress == account && tokens.length > 0 ? (
                            <RemoveTokenBox
                                nftAddress={nftAddress}
                                tokenId={tokenId}
                                paymentTokens={tokens}
                                sendingTx={sendingTx}
                                setSendingTx={setSendingTx}
                                handleTxPosted={handleTxPosted}
                                handleTxSuccess={handleTxSuccess}
                                handleTxError={handleTxError}
                            />
                        ) : (
                            ""
                        )}
                        {ownerAddress == account && activePaymentTokenOptions.length > 0 ? (
                            <AddTokenBox
                                ownerAddress={ownerAddress}
                                nftAddress={nftAddress}
                                tokenId={tokenId}
                                currentNftType={currentNftType}
                                paymentTokenOptions={activePaymentTokenOptions}
                                paymentTokensToBeAdded={paymentTokensToBeAdded}
                                setPaymentTokensToBeAdded={setPaymentTokensToBeAdded}
                                sendingTx={sendingTx}
                                setSendingTx={setSendingTx}
                                handleTxPosted={handleTxPosted}
                                handleTxSuccess={handleTxSuccess}
                                handleTxError={handleTxError}
                            />
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
                                {tokenURI.attributes.map((attr, index) => (
                                    <div
                                        key={index}
                                        className="text-xs sm:text-sm p-2 rounded-xl border border-cyan-700 bg-cyan-100 text-center"
                                    >
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
