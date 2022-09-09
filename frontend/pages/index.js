import Head from "next/head"
import ContentManager from "../components/ContentManager"

export default function Home() {
    return (
        <div>
            <Head>
                <title>NFT Market</title>
                <meta name="description" content="" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <ContentManager />
        </div>
    )
}
