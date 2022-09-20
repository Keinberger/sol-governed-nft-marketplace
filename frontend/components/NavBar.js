import { useEffect, useState } from "react"
import { ShareIcon } from "@heroicons/react/outline"
import { ConnectButton } from "@web3uikit/web3"
import { useNotification } from "@web3uikit/core"

import { useCookies } from "react-cookie"

export default function NavBar(props) {
    const dispatch = useNotification()
    const [switcherClicked, setSwitcherClicked] = useState(false)
    const [cookies, setCookie] = useCookies(["currentSite", "latestMessage"])

    const latestMessage = cookies.latestMessage

    let lastMessage = ""
    useEffect(() => {
        if (
            latestMessage !== undefined &&
            // latestMessage.length > 0 &&
            latestMessage != lastMessage &&
            latestMessage != "undefined"
        ) {
            lastMessage = latestMessage
            dispatch({
                type: "success",
                message: latestMessage,
                title: "Markteplace",
                icon: undefined,
                position: "topR",
            })
        }
        setCookie("latestMessage", "undefined")
    }, [])

    return (
        <section>
            <nav className="container mx-auto py-6">
                <div className="flex items-center justify-between mx-auto pt-5">
                    {/* <div></div> */}

                    <div className="hidden lg:flex lg:scale-100 space-x-4 mx-auto text-base bg-gray-100 dark:bg-gray-700 py-1 px-1 rounded-xl border-gray-800 drop-shadow-xl">
                        {props.items.map((item, index) => (
                            <button
                                key={index}
                                className={`${
                                    index == props.activeItem ? "activeNav" : ""
                                } px-3 py-1 text-slate-500 hover:text-slate-800  rounded-xl transition ease-in-out duration-300`}
                                onClick={() => {
                                    props.contentFunc(index)
                                    setCookie("currentSite", index)
                                }}
                            >
                                {item}
                            </button>
                        ))}

                        <a
                            href={process.env.NEXT_PUBLIC_TALLY_URL}
                            target="_blank"
                            rel="noreferrer"
                        >
                            <button
                                className={`items-center flex px-4 py-1 text-slate-500 hover:text-slate-800  transition ease-in-out duration-300`}
                            >
                                Governance
                                <ShareIcon className="w-6 ml-1" />
                            </button>
                        </a>
                    </div>

                    <div className="block">
                        <ConnectButton
                            moralisAuth={false}
                            className="shadow-xl border rounded-xl"
                        />
                    </div>

                    <button
                        className={`${
                            switcherClicked ? "open" : ""
                        } hamburger px-5 mt-2 lg:hidden focus:outline-none`}
                        onClick={() => {
                            setSwitcherClicked(!switcherClicked)
                        }}
                    >
                        <span className="hamburger-top"></span>
                        <span className="hamburger-middle"></span>
                        <span className="hamburger-bottom"></span>
                    </button>
                </div>
                <div className="lg:hidden">
                    <div className={`${switcherClicked ? "active" : ""} dropdown`}>
                        {props.items.map((item, index) => (
                            <button
                                key={index}
                                className={`${
                                    index == props.activeItem ? "activeNav" : ""
                                } px-3 py-1 text-slate-500 hover:text-slate-800 rounded-xl transition ease-in-out duration-300`}
                                onClick={() => {
                                    props.contentFunc(index)
                                    setCookie("currentSite", index)
                                    setSwitcherClicked(!switcherClicked)
                                }}
                            >
                                {item}
                            </button>
                        ))}
                        <a
                            href={process.env.NEXT_PUBLIC_TALLY_URL}
                            target="_blank"
                            rel="noreferrer"
                        >
                            <button
                                className={`px-3 py-1 text-slate-500 hover:text-slate-800 rounded-xl transition ease-in-out duration-300`}
                            >
                                Governance
                            </button>
                        </a>
                    </div>
                </div>
            </nav>
        </section>
    )
}
