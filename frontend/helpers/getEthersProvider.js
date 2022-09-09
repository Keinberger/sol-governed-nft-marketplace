const { ethers } = require("ethers")

function getProvider(chainId) {
    if (chainId == process.env.NEXT_PUBLIC_LOCAL_CHAIN_ID) {
        return ethers.getDefaultProvider(process.env.NEXT_PUBLIC_LOCAL_NETWORK_URL)
    } else {
        return ethers.getDefaultProvider()
    }
}

module.exports = { getProvider }
