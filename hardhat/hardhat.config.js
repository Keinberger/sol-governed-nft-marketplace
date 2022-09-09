require("dotenv").config()

require("@nomiclabs/hardhat-etherscan")
require("@nomiclabs/hardhat-waffle")
require("hardhat-gas-reporter")
require("hardhat-contract-sizer")
require("solidity-coverage")
require("hardhat-deploy")
require("@primitivefi/hardhat-dodoc")

const GOERLI_RPC_URL =
    process.env.RPC_URL !== undefined ? process.env.RPC_URL.replace("network", "goerli") : ""
const GOERLI_PRIVATE_KEY =
    process.env.GOERLI_PRIVATE_KEY !== undefined ? process.env.GOERLI_PRIVATE_KEY : ""
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY
const REPORT_GAS = process.env.REPORT_GAS

module.exports = {
    solidity: {
        compilers: [
            {
                version: "0.8.7",
                defaultNetwork: "hardhat",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                },
            },
            {
                version: "0.7.6",
                defaultNetwork: "hardhat",
            },
        ],
    },
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 31337,
            blockConfirmations: 1,
        },
        localhost: {
            chainId: 31337,
            blockConfirmations: 1,
        },
        goerli: {
            chainId: 5,
            blockConfirmations: 6,
            url: GOERLI_RPC_URL,
            accounts: [GOERLI_PRIVATE_KEY],
        },
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
        user: {
            default: 1,
        },
    },
    gasReporter: {
        enabled: REPORT_GAS,
        outputFile: "gas-report.txt",
        noColors: true,
        currency: "EUR",
        coinmarketcap: COINMARKETCAP_API_KEY,
        // token: "MATIC",
        excludeContracts: ["BasicNft", "BasicToken", "MockV3Aggregator", "NftMarketplaceV2", "V2"],
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
    dodoc: {
        runOnCompile: false,
        exclude: [
            "test",
            "governance",
            "proxy",
            "frontend",
            "openzeppelin/contracts",
            "openzeppelin/contracts-upgradeable",
            "@chainlink/contracts",
        ],
    },
    mocha: {
        timeout: 300000,
    },
}
