import NFT from "../web3/NFT"
import nftTypes from "../../helpers/nftTypes"

export default function MyNftPurchases(props) {
    return (
        <section name="NftPurchases">
            <div className="w-full">
                <div className="mx-auto max-w-[250px] sm:max-w-[400px] md:max-w-[600px] lg:max-w-[970px] xl:max-w-[1200px] lg:my-20 my-32">
                    <div>
                        <h1 className="text-3xl sm:text-5xl md:text-4xl font-bold text-center text-slate-900 md:text-left">
                            My{" "}
                            <span className="text-xl sm:text-4xl md:text-3xl text-slate-600 ">
                                Purchases
                            </span>
                        </h1>
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
                                        type={nftTypes.purchased}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="mx-auto text-center mt-28 space-y-3">
                            <h1 className="text-3xl text-slate-600 drop-shadow-xl">
                                You haven&apos;t purchased any{" "}
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
                </div>
            </div>
        </section>
    )
}
