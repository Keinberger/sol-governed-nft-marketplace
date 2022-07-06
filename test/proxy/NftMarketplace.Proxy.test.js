const { expect } = require("chai")
const { network, ethers, getNamedAccounts } = require("hardhat")
const { constants, networkConfig } = require("../../helper-hardhat-config")
const { propose_vote_queue_execute } = require("../../utils/testing/propose_vote_queue_execute")

const chainId = network.config.chainId

const contracts = networkConfig[chainId].contracts
const contractConfig = contracts.NftMarketplace
const contractName = contractConfig.name

!constants.developmentChains.includes(network.name)
    ? describe.skip
    : describe(contractName + " (proxy)", () => {
          let contract, governor, deployer, proxy, newContractName

          beforeEach(async () => {
              deployer = await ethers.getSigner((await getNamedAccounts()).deployer)
              await deployments.fixture(["all"])
              proxy = await ethers.getContract(contractName + "_Proxy", deployer)
              contract = await ethers.getContractAt(contractName, proxy.address, deployer)

              const governorContractName = contracts.Governor.name
              const governorProxy = await ethers.getContract(
                  governorContractName + "_Proxy",
                  deployer
              )
              governor = await ethers.getContractAt(
                  governorContractName,
                  governorProxy.address,
                  deployer
              )
              newContractName = networkConfig[chainId].forTests[4].name
          })

          it("getVersion", async () => {
              const version = await contract.getVersion()
              expect(version.toString()).to.equal("1")
          })

          describe("upgrade", () => {
              let newContract
              beforeEach(async () => {
                  const stateFunctionCall = contract.interface.encodeFunctionData("setState", [1])
                  await propose_vote_queue_execute(
                      governor,
                      contract.address,
                      stateFunctionCall,
                      "Setting state to 1"
                  )

                  const proxyAdmin = await ethers.getContract(constants.proxyAdminName)
                  const v2NftMarketplace = await ethers.getContract(newContractName)
                  const upgradeFunctionCall = proxyAdmin.interface.encodeFunctionData("upgrade", [
                      proxy.address,
                      v2NftMarketplace.address,
                  ])

                  await propose_vote_queue_execute(
                      governor,
                      proxyAdmin.address,
                      upgradeFunctionCall,
                      "Testing updating the contract"
                  )

                  newContract = await ethers.getContractAt(newContractName, proxy.address, deployer)
              })
              it("retains vars", async () => {
                  const state = await newContract.getState()
                  expect(state.toString()).to.equal("1")
              })
              it("allows for new state vars", async () => {})
              it("allows for new funcs", async () => {})
          })
      })
