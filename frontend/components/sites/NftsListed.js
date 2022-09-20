import NFT from "../web3/NFT"
import nftTypes from "../../helpers/nftTypes"

export default function NftsListed(props) {
    const type = nftTypes.listed

    return (
        <section name="NftsListed">
            <div className="w-full">
                <div className="mx-auto max-w-[250px] sm:max-w-[400px] md:max-w-[600px] lg:max-w-[970px] xl:max-w-[1200px] space-y-10 lg:my-20 my-32">
                    <div>
                        <h1 className="text-3xl sm:text-5xl md:text-4xl font-bold text-center text-slate-900 md:text-left">
                            Explore{" "}
                            <span className="text-xl sm:text-4xl md:text-3xl text-slate-600 ">
                                NFTs
                            </span>
                        </h1>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 relative gap-x-8 gap-y-8 sm:gap-y-16 items-center mx-auto">
                        {props.nfts !== undefined && props.nfts.length > 0
                            ? props.nfts.map((nft, index) => (
                                  <div className="mx-auto md:mx-0" key={index}>
                                      <NFT
                                          price={nft.price}
                                          nftAddress={nft.nftAddress}
                                          tokenId={nft.tokenId}
                                          marketplaceAddress={props.nftMarketplaceAddress}
                                          ownerAddress={nft.seller}
                                          paymentTokens={nft.paymentTokens}
                                          activePaymentTokens={props.activePaymentTokens}
                                          requireReload={props.requireReload}
                                          type={type}
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
