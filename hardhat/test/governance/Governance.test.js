const { expect } = require("chai")
const { network, ethers, getNamedAccounts } = require("hardhat")
const { constants, networkConfig } = require("../../helper-hardhat-config")
const { propose_vote_queue_execute } = require("../../utils/testing/propose_vote_queue_execute")

const chainId = network.config.chainId

const contracts = networkConfig[chainId].contracts
const contractConfig = contracts.Governor
const contractName = contractConfig.name

!constants.developmentChains.includes(network.name)
    ? describe.skip
    : describe(contractName + " (governance)", () => {
          let contract, deployer, v2Name, proxyAdmin

          beforeEach(async () => {
              deployer = await ethers.getSigner((await getNamedAccounts()).deployer)
              await deployments.fixture(["all"])
              const governorProxy = await ethers.getContract(contractName + "_Proxy", deployer)
              contract = await ethers.getContractAt(contractName, governorProxy.address, deployer)
              v2Name = networkConfig[chainId].forTests[1].name
              proxyAdmin = await ethers.getContract(constants.proxyAdminName)
          })

          describe("upgrade", () => {
              it("nftMarket", async () => {
                  const proxy = await ethers.getContract(contracts.NftMarketplace.name + "_Proxy")

                  const v2 = await ethers.getContract(v2Name)
                  const encodedFunctionCall = proxyAdmin.interface.encodeFunctionData("upgrade", [
                      proxy.address,
                      v2.address,
                  ])

                  await propose_vote_queue_execute(
                      contract,
                      proxyAdmin.address,
                      encodedFunctionCall,
                      "Change contract address"
                  )

                  const newNftMarket = await ethers.getContractAt(v2Name, proxy.address, deployer)
                  const version = await newNftMarket.getVersion()
                  expect(version.toString()).to.equal("2")
              })
              it("governor", async () => {
                  const proxy = await ethers.getContract(contracts.Governor.name + "_Proxy")

                  const v2 = await ethers.getContract(v2Name)
                  const encodedFunctionCall = proxyAdmin.interface.encodeFunctionData("upgrade", [
                      proxy.address,
                      v2.address,
                  ])

                  await propose_vote_queue_execute(
                      contract,
                      proxyAdmin.address,
                      encodedFunctionCall,
                      "Change contract address"
                  )

                  const newGovernor = await ethers.getContractAt("V2", proxy.address, deployer)
                  const version = await newGovernor.getVersion()
                  expect(version.toString()).to.equal("2")
              })
              it("governanceToken", async () => {
                  const proxy = await ethers.getContract(contracts.GovernanceToken.name + "_Proxy")

                  const v2 = await ethers.getContract(v2Name)
                  const encodedFunctionCall = proxyAdmin.interface.encodeFunctionData("upgrade", [
                      proxy.address,
                      v2.address,
                  ])

                  await propose_vote_queue_execute(
                      contract,
                      proxyAdmin.address,
                      encodedFunctionCall,
                      "Change contract address"
                  )

                  const newToken = await ethers.getContractAt(v2Name, proxy.address, deployer)
                  const version = await newToken.getVersion()
                  expect(version.toString()).to.equal("2")
              })
          })
          describe("nftMarket", () => {
              it("can call onlyOwner funcs (through proposal)", async () => {
                  const proxy = await ethers.getContract(contracts.NftMarketplace.name + "_Proxy")
                  const nftMarket = await ethers.getContractAt(
                      contracts.NftMarketplace.name,
                      proxy.address
                  )

                  const encodedFunctionCall = nftMarket.interface.encodeFunctionData("setState", [
                      2,
                  ])

                  await propose_vote_queue_execute(
                      contract,
                      nftMarket.address,
                      encodedFunctionCall,
                      "Change state of contract"
                  )

                  const newState = await nftMarket.getState()

                  expect(newState.toString()).to.equal("2")
              })
          })
      })
