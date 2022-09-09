function getChainName(chainHex) {
    const chainIdParsed = parseInt(chainHex)

    switch (chainIdParsed) {
        case 1:
            return "ethereum"
            break
        case 5:
            return "goerli"
            break
        case 137:
            return "polygon"
            break
        case 31337 || 1337:
            return "hardhat"
            break
    }
}

module.exports = { getChainName }
