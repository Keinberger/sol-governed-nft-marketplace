import Moralis from "moralis"
import { EvmChain } from "@moralisweb3/evm-utils"
import { useMoralis } from "react-moralis"

import { useEffect, useState } from "react"

import NFT from "../web3/NFT"
import nftTypes from "../../helpers/nftTypes"

export default function MyNfts(props) {
    const { chainId, account, isWeb3Enabled } = useMoralis()
    const [accountNfts, setAccountNfts] = useState()

    const MORALIS_API_KEY = process.env.NEXT_PUBLIC_MORALIS_API_KEY

    const getNftsOf = async (address, chain) => {
        await Moralis.start({ apiKey: MORALIS_API_KEY })

        const response = await Moralis.EvmApi.account.getNFTs({
            address: address,
            chain: chain,
        })

        let nfts = []
        for (let i = 0; i < response._data.result.length; i++) {
            let isListed = false
            let index
            for (let j = 0; j < props.listedNfts.length; j++) {
                if (
                    props.listedNfts[j].tokenId == response._data.result[i].token_id &&
                    props.listedNfts[j].nftAddress == response._data.result[i].token_address
                ) {
                    isListed = true
                    index = j
                }
            }

            if (isListed) {
                nfts.push({
                    ...props.listedNfts[index],
                    type: nftTypes.listed,
                })
            } else {
                nfts.push({
                    nftAddress: response._data.result[i].token_address,
                    tokenId: response._data.result[i].token_id,
                    type: nftTypes.notListed,
                })
            }
        }

        setAccountNfts(nfts)
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            getNftsOf(account, chainId)
        }
    }, [isWeb3Enabled])

    return (
        <section name="Nfts">
            <div className="w-full">
                <div className="mx-auto max-w-[250px] sm:max-w-[400px] md:max-w-[600px] lg:max-w-[970px] xl:max-w-[1200px] mt-20">
                    <div>
                        <h1 className="text-3xl sm:text-5xl md:text-4xl font-bold text-center text-slate-900 md:text-left">
                            My{" "}
                            <span className="text-xl sm:text-4xl md:text-3xl text-slate-600 ">
                                NFTs
                            </span>
                        </h1>
                    </div>
                    {accountNfts !== undefined && accountNfts.length > 0 ? (
                        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 relative gap-x-8 sm:gap-y-16 items-center mx-auto">
                            {accountNfts.map((nft) => (
                                <div className="mx-auto md:mx-0">
                                    <NFT
                                        price={nft.price}
                                        nftAddress={nft.nftAddress}
                                        tokenId={nft.tokenId}
                                        ownerAddress={account}
                                        paymentTokens={nft.paymentTokens}
                                        activePaymentTokens={props.activePaymentTokens}
                                        type={nft.type}
                                        requireReload={props.requireReload}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="mx-auto text-center mt-28 space-y-3">
                            <h1 className="text-3xl text-slate-600 drop-shadow-xl">
                                You don't have any{" "}
                                <span className="text-slate-800 py-1 px-2 border border-slate-800 rounded-xl">
                                    NFTs
                                </span>{" "}
                                yet...
                            </h1>
                            <p className="text-xl text-slate-500 drop-shadow-lg">
                                Explore NFTs on the marketplace
                            </p>
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 relative gap-x-8 sm:gap-y-16 items-center mx-auto">
                        {accountNfts !== undefined && accountNfts.length > 0
                            ? accountNfts.map((nft) => (
                                  <div className="mx-auto md:mx-0">
                                      <NFT
                                          price={nft.price}
                                          nftAddress={nft.nftAddress}
                                          tokenId={nft.tokenId}
                                          ownerAddress={account}
                                          paymentTokens={nft.paymentTokens}
                                          activePaymentTokens={props.activePaymentTokens}
                                          type={nft.type}
                                          requireReload={props.requireReload}
                                      />
                                  </div>
                              ))
                            : ""}
                    </div>
                </div>
            </div>
        </section>
    )
}
