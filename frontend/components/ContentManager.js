import { useMoralis } from "react-moralis"
import { useEffect, useState } from "react"
import { useQuery, gql } from "@apollo/client"
import { useCookies } from "react-cookie"

import NavBar from "./NavBar"
import NftsListed from "./sites/NftsListed"
import MyNfts from "./sites/MyNfts"
import MyNftSales from "./sites/MyNftSales"
import MyNftPurchases from "./sites/MyNftPurchases"
import WalletNotConnected from "./sites/WalletNotConnected"

const deadAddress = "0x000000000000000000000000000000000000dEaD"

export default function ContentManager() {
    const [cookies, setCookie] = useCookies(["currentSite", "latestMessage"])
    const [content, setContent] = useState(0)
    const items = ["Explore NFTs", "MyNFTs", "My Sales", "My Purchases"]

    const { isWeb3Enabled, account } = useMoralis()

    const GET_LISTED_NFTS = gql`
        {
            activeNfts(
                where: {
                    buyer: null
                    seller_not_contains: "${deadAddress}"
                }
            ) {
                buyer
                seller
                nftAddress
                tokenId
                price
                paymentTokens
            }
        }
    `

    const GET_SOLD_NFTS = gql`
        {
            activeNfts(
                where: {
                    buyer_contains: "0x"
                    seller: "${account}"
                }
            ) {
                buyer
                seller
                nftAddress
                tokenId
                price
                paymentTokens
            }
        }
    `

    const GET_PURCHASED_NFTS = gql`
        {
            activeNfts(where: { buyer: "${account}" }) {
                buyer
                seller
                nftAddress
                tokenId
                price
                paymentTokens
            }
        }
        `

    const GET_ACTIVE_PAYMENT_TOKENS = gql`
        {
            activePaymentTokens(where: {tokenAddress_not_contains: "${deadAddress}"}) {
                tokenAddress
            }
        }
    `

    const {
        loading: loadingListedNfts,
        error: listedNftsError,
        data: listedNfts,
    } = useQuery(GET_LISTED_NFTS)
    const {
        loading: loadingSoldNfts,
        error: soldNftsError,
        data: soldNfts,
    } = useQuery(GET_SOLD_NFTS)
    const {
        loading: loadingPurchasedNfts,
        error: purchasedNftsError,
        data: purchasedNfts,
    } = useQuery(GET_PURCHASED_NFTS)
    const {
        loading: activePaymentTokensNfts,
        error: activePaymentTokensError,
        data: activePaymentTokens,
    } = useQuery(GET_ACTIVE_PAYMENT_TOKENS)

    useEffect(() => {
        if (cookies.currentSite == undefined) {
            setCookie("currentSite", "0")
        } else if (cookies.latestMessage == undefined) {
            setCookie("latestMessage", "Connect your wallet")
        }
    }, [])

    return (
        <section>
            <NavBar items={items} contentFunc={setContent} activeItem={content} />

            {isWeb3Enabled ? (
                content == 0 ? (
                    <NftsListed
                        nfts={listedNfts !== undefined ? listedNfts.activeNfts : ""}
                        activePaymentTokens={
                            activePaymentTokens !== undefined
                                ? activePaymentTokens.activePaymentTokens
                                : ""
                        }
                    />
                ) : content == 1 ? (
                    <MyNfts
                        listedNfts={listedNfts !== undefined ? listedNfts.activeNfts : ""}
                        activePaymentTokens={
                            activePaymentTokens !== undefined
                                ? activePaymentTokens.activePaymentTokens
                                : ""
                        }
                    />
                ) : content == 2 ? (
                    <MyNftSales nfts={soldNfts !== undefined ? soldNfts.activeNfts : ""} />
                ) : content == 3 ? (
                    <MyNftPurchases
                        nfts={purchasedNfts !== undefined ? purchasedNfts.activeNfts : ""}
                    />
                ) : (
                    ""
                )
            ) : (
                <WalletNotConnected />
            )}
        </section>
    )
}
