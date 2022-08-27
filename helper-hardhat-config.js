const { ethers } = require("hardhat")

const constants = {
    FRONTEND_FILE_PATH: "../next-marketplace-frontend/constants/",
    ZERO_ADDRESS: "0x0000000000000000000000000000000000000000",
    developmentChains: ["hardhat", "localhost"],
    MIN_DELAY: 1, // in seconds / TODO: change to fit needs
    VOTING_DELAY: 1, // in blocks / TODO: change to fit needs
    VOTING_PERIOD: 13, // in blocks / TODO: change to fit needs
    MOCK_AGGREGATOR_DECIMALS: 18,
    MOCK_AGGREGATOR_PRICE: "1000",
    scriptsConfig: {
        governance: {
            proposalsFile: "./scripts/governance/proposals.json",
            proposalIndex: 0,
            functionToCall: "",
            args: [],
            description: "",
            voteWay: 1,
        },
        nftMarketplace: {
            listNft: {
                nftAddr: "0x9658d4bd23601265e14edc636eb6175af80a8382",
                tokenId: 6,
                price: ethers.utils.parseEther("0.11"),
                paymentTokens: ["0x2c79F5d36a6d63a3C5a967A35C6cE122F89ECAA5"],
            },
            buyNftEth: {
                nftAddr: "",
                tokenId: 0,
            },
            buyNftErc20: {
                nftAddr: "",
                tokenId: 0,
                tokenIndex: 0,
            },
            cancelListing: {
                nftAddr: "0x9658d4bd23601265e14edc636eb6175af80a8382",
                tokenId: 6,
            },
            updateListingPrice: {
                nftAddr: "",
                tokenId: 0,
                newPrice: ethers.utils.parseEther("0"),
            },
            updateListingPaymentToken: {
                nftAddr: "",
                tokenId: 0,
                indexToUpdate: 0,
                paymentTokenAddress: "",
            },
        },
    },
    proxyAdminName: "CommonProxyAdmin",
}

const contractsConfigs = {
    NftMarketplace: {
        // needs to be initialized
        name: "NftMarketplace",
        args: [],
    },
    GovernanceToken: {
        // needs to be initialzed
        name: "NftMarketplaceGovernanceToken",
        args: {
            name: "NftMarketplaceGovernanceToken",
            symbol: "NMGT",
            maxSupply: ethers.utils.parseEther("1000000"),
        },
    },
    Timelock: {
        // needs to be initialized
        name: "Timelock",
        args: {
            minDelay: constants.MIN_DELAY,
            proposers: [], // set by 05-setup.js script (proposer is governor contract only)
            executors: [], // set by 05-setup.js script (is null address => everyone can execute)
        },
    },
    Governor: {
        // needs to be initialized
        name: "NftMarketplaceGovernor",
        args: {
            Token: {},
            TimeLockController: {},
            name: "NftMarketplaceGovernor",
            votingDelay: constants.VOTING_DELAY,
            votingPeriod: constants.VOTING_PERIOD,
            quorumPercentage: 4,
        },
    },
}

const networkConfig = {
    5: {
        name: "goerli",
        contracts: contractsConfigs,
    },
    31337: {
        name: "hardhat",
        forTests: [
            {
                name: "BasicNft",
                args: [],
            },
            {
                name: "V2",
                args: [],
            },
            {
                name: "MockV3Aggregator",
                args: [
                    constants.MOCK_AGGREGATOR_DECIMALS,
                    ethers.utils.parseEther(constants.MOCK_AGGREGATOR_PRICE), // => add 18 decimals
                ],
            },
            {
                name: "BasicToken",
                args: [ethers.utils.parseEther("1000000")],
            },
            {
                // needs to be initialized
                name: "NftMarketplaceV2",
                args: [],
            },
        ],
        contracts: contractsConfigs,
    },
}

module.exports = {
    constants,
    networkConfig,
}
