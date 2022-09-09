import { useState, useEffect } from "react"
import Image from "next/image"
import { useWeb3Contract, useMoralis } from "react-moralis"
import { ethers } from "ethers"
import { FaEthereum } from "react-icons/fa"

import { getChainName } from "../../helpers/getChainName"
import nftAbi from "../../constants/BasicNft/abi.json"
import Listing from "./Listing"
import nftTypes from "../../helpers/nftTypes"
import truncateStr from "../../helpers/truncateStr"

export default function NFT({
    price,
    nftAddress,
    tokenId,
    ownerAddress,
    paymentTokens,
    activePaymentTokens,
    type,
}) {
    const { isWeb3Enabled, account, chainId } = useMoralis()
    const [tokenURI, setTokenURI] = useState({})
    const [imageURI, setImageURI] = useState("")
    const [tokenName, setTokenName] = useState("")
    const [showModal, setShowModal] = useState(false)
    const unhideModal = () => setShowModal(true)
    const hideModal = () => setShowModal(false)

    const chainName = getChainName(chainId)

    const { runContractFunction: getTokenURI } = useWeb3Contract({
        abi: nftAbi,
        contractAddress: nftAddress,
        functionName: "tokenURI",
        params: {
            tokenId: tokenId,
        },
    })

    async function updateUI() {
        const tokenURIres = await getTokenURI()
        if (tokenURIres) {
            const requestURL = tokenURIres.replace("ipfs://", "https://ipfs.io/ipfs/")
            const tokenURIResponse = await (await fetch(requestURL)).json()
            const imageURI = tokenURIResponse.image
            const imageURIURL = imageURI.replace("ipfs://", "https://ipfs.io/ipfs/")
            setTokenURI({
                image: imageURIURL,
                name: tokenURIResponse.name,
                description: tokenURIResponse.description,
                attributes: tokenURIResponse.attributes,
            })
            setImageURI(imageURIURL)
            setTokenName(tokenURIResponse.name)
        }
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI()
        }
    }, [isWeb3Enabled])

    return (
        <div>
            <div>
                {imageURI ? (
                    <div>
                        <div>
                            {type == nftTypes.listed || type == nftTypes.notListed ? (
                                <Listing
                                    nftAddress={nftAddress}
                                    tokenId={tokenId}
                                    price={price}
                                    ownerAddress={ownerAddress}
                                    paymentTokens={paymentTokens}
                                    activePaymentTokens={activePaymentTokens}
                                    tokenURI={tokenURI}
                                    isVisible={showModal}
                                    onClose={hideModal}
                                    type={type}
                                />
                            ) : (
                                <div></div>
                            )}
                        </div>
                        <button onClick={unhideModal}>
                            <div className="bg-slate-100 rounded-2xl shadow-2xl">
                                <div className="p-0">
                                    <div className="flex flex-col gap-1">
                                        <div className="rounded-t-2xl overflow-hidden">
                                            <Image
                                                loader={() => imageURI}
                                                src={imageURI}
                                                layout="intrinsic"
                                                height="300"
                                                width="300"
                                            />
                                        </div>
                                        <div className="text-slate-800 px-4">
                                            <div className="text-sm text-left text-slate-700 font-bold font-mono">
                                                {tokenName}
                                            </div>
                                            <div className="italic text-sm text-left text-slate-600">
                                                <a
                                                    href={
                                                        chainName !== "ethereum"
                                                            ? "https://" +
                                                              chainName +
                                                              ".etherscan.io/address/" +
                                                              nftAddress
                                                            : "https://etherscan.io/address/" +
                                                              nftAddress
                                                    }
                                                    target="_blank"
                                                >
                                                    {truncateStr(nftAddress, 15)}
                                                </a>
                                            </div>
                                            <div className="italic text-sm text-left text-slate-600">
                                                #{tokenId}
                                            </div>
                                            {type == nftTypes.notListed ? (
                                                ""
                                            ) : (
                                                <div>
                                                    <div className="flex font-bold items-center mt-5">
                                                        Price
                                                    </div>
                                                    <div className="flex font-bold items-center">
                                                        <FaEthereum className="mr-2" />
                                                        {ethers.utils.formatUnits(
                                                            price,
                                                            "ether"
                                                        )}{" "}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="w-full flex flex-row justify-around mt-5">
                                            <div className="flex items-center text-slate-400 py-3 sm:py-4 text-sm sm:text-base">
                                                <div>
                                                    {type == nftTypes.listed
                                                        ? "Listed"
                                                        : type == nftTypes.purchased
                                                        ? "Purchased"
                                                        : type == nftTypes.sold
                                                        ? "Sold"
                                                        : "Not Listed"}
                                                </div>
                                            </div>
                                            <button onClick={unhideModal}>
                                                <div className="flex items-center py-3 sm:py-4 text-sm sm:text-base transition ease-in-out hover:scale-105 duration-300">
                                                    {account == ownerAddress ? (
                                                        type == nftTypes.listed ? (
                                                            <span className="text-rose-400">
                                                                Unlist
                                                            </span>
                                                        ) : type != nftTypes.purchased &&
                                                          type != nftTypes.sold ? (
                                                            <span className="text-cyan-600">
                                                                List NFT
                                                            </span>
                                                        ) : (
                                                            ""
                                                        )
                                                    ) : type != nftTypes.purchased &&
                                                      type != nftTypes.sold ? (
                                                        <span className="text-cyan-600">
                                                            Buy NFT
                                                        </span>
                                                    ) : (
                                                        ""
                                                    )}
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </button>
                    </div>
                ) : (
                    <div>Loading...</div>
                )}
            </div>
        </div>
    )
}
