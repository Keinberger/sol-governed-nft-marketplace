export default function WalletNotConnected() {
    return (
        <section name="WalletNotConnected">
            <div className="w-full h-full">
                <div className="mx-auto mt-32">
                    <div className="text-center space-y-3">
                        <h1 className="text-3xl text-slate-600 drop-shadow-xl">
                            Explore the thenominal world of{" "}
                            <span className="text-slate-800 py-1 px-2 border border-slate-800 rounded-xl">
                                NFTs
                            </span>{" "}
                        </h1>
                        <p className="text-xl text-slate-500 drop-shadow-lg">
                            Connect your wallet in the upper corner and start exploring
                        </p>
                    </div>
                </div>
                <div className="w-full h-full mx-auto">
                    <div
                        className={`absolute mx-auto left-[50%] ml-[-30%] bottom-0 h-[66%] w-[60%] bg-center bg-cover bg-no-repeat bg-[url("../public/faded_bg.png")]`}
                    ></div>
                </div>
            </div>
        </section>
    )
}
