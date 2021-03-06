const { ethers } = require("hardhat")

const constants = {
    ZERO_ADDRESS: "0x0000000000000000000000000000000000000000",
    developmentChains: ["hardhat", "localhost"],
    MIN_DELAY: 3600,
    VOTING_DELAY: 1,
    VOTING_PERIOD: 5,
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
                nftAddr: "",
                tokenId: 0,
                price: ethers.utils.parseEther("0"),
                paymentTokens: [""],
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
                nftAddr: "",
                tokenId: 0,
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
    4: {
        name: "rinkeby",
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
