const { expect } = require("chai")
const { network, deployments, ethers, getNamedAccounts } = require("hardhat")
const { constants, networkConfig } = require("../../helper-hardhat-config")

const chainId = network.config.chainId
const contracts = networkConfig[chainId].contracts
const contractConfig = contracts.NftMarketplace
const contractName = contractConfig.name

!constants.developmentChains.includes(network.name)
    ? describe.skip
    : describe(contractName, () => {
          let contract,
              nftContract,
              deployer,
              defaultPrice,
              nullAddress,
              user,
              userContract,
              mockAggregator,
              basicToken,
              governanceToken

          beforeEach(async () => {
              const nftContractName = networkConfig[chainId].forTests[0].name
              const mockAggregatorName = networkConfig[chainId].forTests[2].name
              const basicTokenName = networkConfig[chainId].forTests[3].name
              const governanceTokenName = networkConfig[chainId].contracts.GovernanceToken.name
              deployer = await ethers.getSigner((await getNamedAccounts()).deployer)
              await deployments.fixture(["forTests", "NftMarketplace", "GovernanceToken"])
              contract = await ethers.getContract(contractName, deployer.address)
              nftContract = await ethers.getContract(nftContractName, deployer.address)
              defaultPrice = ethers.utils.parseEther("0.0002")
              nullAddress = constants.ZERO_ADDRESS
              user = await ethers.getSigner((await getNamedAccounts()).user)
              userContract = contract.connect(user)
              mockAggregator = await ethers.getContract(mockAggregatorName, deployer.address)
              basicTokenDeployer = await ethers.getContract(basicTokenName, deployer.address)
              basicToken = await ethers.getContract(basicTokenName, user.address)
              governanceToken = await ethers.getContract(governanceTokenName, deployer.address)

              await nftContract.mint()

              const amount = await basicToken.totalSupply()
              await basicTokenDeployer.transfer(user.address, amount.toString())
          })

          describe("addPaymentToken", () => {
              let decimals
              beforeEach(async () => {
                  await contract.setState(1)
                  decimals = await basicToken.decimals()
              })
              it("reverts if market is closed", async () => {
                  await contract.setState(0)
                  await expect(
                      contract.addPaymentToken(basicToken.address, mockAggregator.address, decimals)
                  ).to.be.revertedWith(`NftMarketplace__StateIs(0)`)
              })
              it("reverts if not owner", async () => {
                  await expect(
                      userContract.addPaymentToken(
                          basicToken.address,
                          mockAggregator.address,
                          decimals
                      )
                  ).to.be.revertedWith("Ownable: caller is not the owner")
              })
              it("adds payment token", async () => {
                  await contract.addPaymentToken(
                      basicToken.address,
                      mockAggregator.address,
                      decimals
                  )
                  const paymentToken = await contract.getPaymentToken(basicToken.address)

                  expect(paymentToken.priceFeedAddress).to.equal(mockAggregator.address)
                  expect(paymentToken.decimals).to.equal(decimals)
              })
              it("emits event correctly", async () => {
                  await expect(
                      contract.addPaymentToken(basicToken.address, mockAggregator.address, decimals)
                  )
                      .to.emit(contract, "PaymentTokenAdded")
                      .withArgs(basicToken.address)
              })
          })
          describe("removePaymentToken", () => {
              beforeEach(async () => {
                  await contract.setState(1)
                  const decimals = await basicToken.decimals()
                  await contract.addPaymentToken(
                      basicToken.address,
                      mockAggregator.address,
                      decimals
                  )
              })
              it("removes payment token", async () => {
                  await contract.removePaymentToken(basicToken.address)
                  const paymentToken = await contract.getPaymentToken(basicToken.address)
                  expect(paymentToken.priceFeedAddress).to.equal(constants.ZERO_ADDRESS)
                  expect(paymentToken.decimals.toString()).to.equal("0")
              })
              it("emits event correctly", async () => {
                  await expect(contract.removePaymentToken(basicToken.address))
                      .to.emit(contract, "PaymentTokenRemoved")
                      .withArgs(basicToken.address)
              })
          })
          describe("listNft", () => {
              beforeEach(async () => {
                  await contract.setState(2)
              })
              it("reverts if contractState is not OPEN (2)", async () => {
                  await contract.setState(1)
                  await expect(
                      contract.listNft(nftContract.address, "0", defaultPrice, [])
                  ).to.be.revertedWith(`NftMarketplace__StateIsNot(2)`)
              })
              it("reverts if caller is not nft owner", async () => {
                  await expect(
                      userContract.listNft(nftContract.address, "0", defaultPrice, [])
                  ).to.be.revertedWith(`NftMarketplace__NotOwnerOfNft("${nftContract.address}", 0)`)
              })
              it("reverts if contract is not approved", async () => {
                  await expect(
                      contract.listNft(nftContract.address, "0", defaultPrice, [])
                  ).to.be.revertedWith(
                      `NftMarketplace__NotApprovedForNft("${nftContract.address}", 0)`
                  )
              })
              it("reverts if already listed", async () => {
                  await nftContract.approve(contract.address, "0")
                  await contract.listNft(nftContract.address, "0", defaultPrice, [])
                  await expect(
                      contract.listNft(nftContract.address, "0", defaultPrice, [])
                  ).to.be.revertedWith(`NftMarketplace__AlreadyListed("${nftContract.address}", 0)`)
              })
              it("reverts if price is not greater than zero", async () => {
                  await nftContract.approve(contract.address, "0")
                  const zeroPrice = ethers.BigNumber.from("0")
                  await expect(
                      contract.listNft(nftContract.address, "0", zeroPrice, [])
                  ).to.be.revertedWith(`NftMarketplace__PriceMustBeAboveZero()`)
              })
              it("reverts if one of payment tokens is not listed", async () => {
                  await nftContract.approve(contract.address, "0")
                  await expect(
                      contract.listNft(nftContract.address, "0", defaultPrice, [contract.address])
                  ).to.be.revertedWith(`NftMarketplace__TokenNotListed("${contract.address}")`)
              })
              it("lists nft", async () => {
                  await nftContract.approve(contract.address, "0")
                  await contract.listNft(nftContract.address, "0", defaultPrice, [])
                  const listing = await contract.getListing(nftContract.address, "0")

                  expect(listing.seller).to.equal(deployer.address)
                  expect(listing.nftPrice.toString()).to.equal(defaultPrice.toString())
              })
              it("emits event correctly", async () => {
                  await nftContract.approve(contract.address, "0")
                  await expect(contract.listNft(nftContract.address, "0", defaultPrice, []))
                      .to.emit(contract, "NftListed")
                      .withArgs(
                          deployer.address,
                          nftContract.address,
                          "0",
                          defaultPrice.toString(),
                          []
                      )
              })
          })
          describe("cancelListing", () => {
              beforeEach(async () => {
                  await contract.setState(2)
                  await nftContract.approve(contract.address, "0")
              })
              it("reverts if nft not listed", async () => {
                  await expect(contract.cancelListing(nftContract.address, "0")).to.be.revertedWith(
                      `NftMarketplace__NftNotListed("${nftContract.address}", 0)`
                  )
              })
              it("delists nft", async () => {
                  await contract.listNft(nftContract.address, "0", defaultPrice, [])
                  await contract.cancelListing(nftContract.address, "0")

                  const listing = await contract.getListing(nftContract.address, "0")

                  expect(listing.seller).to.equal(nullAddress)
                  expect(listing.nftPrice.toString()).to.equal("0")
              })
              it("emits event correctly", async () => {
                  await contract.listNft(nftContract.address, "0", defaultPrice, [])
                  await expect(contract.cancelListing(nftContract.address, "0"))
                      .to.emit(contract, "NftDelisted")
                      .withArgs(nftContract.address, "0")
              })
          })
          describe("updateListingPrice", () => {
              let newPrice
              beforeEach(async () => {
                  await contract.setState(2)
                  await nftContract.approve(contract.address, "0")
                  await contract.listNft(nftContract.address, "0", defaultPrice, [])
                  newPrice = defaultPrice.add("1")
              })
              it("updates listing", async () => {
                  const listingBefore = await contract.getListing(nftContract.address, "0")
                  await contract.updateListingPrice(nftContract.address, "0", newPrice)
                  const listingNow = await contract.getListing(nftContract.address, "0")

                  expect(newPrice.sub(listingBefore.nftPrice).toString()).to.equal(
                      listingNow.nftPrice.sub(listingBefore.nftPrice).toString()
                  )
                  expect(listingNow.nftPrice.toString()).to.equal(newPrice.toString())
              })
              it("emits event correctly", async () => {
                  await expect(contract.updateListingPrice(nftContract.address, "0", newPrice))
                      .to.emit(contract, "NftPriceUpdated")
                      .withArgs(nftContract.address, "0", newPrice.toString())
              })
          })
          describe("addPaymentTokenAtListing", () => {
              let decimals
              beforeEach(async () => {
                  await contract.setState(2)
                  await nftContract.approve(contract.address, "0")
                  decimals = await basicToken.decimals()
                  await contract.addPaymentToken(
                      basicToken.address,
                      mockAggregator.address,
                      decimals
                  )
                  await contract.listNft(nftContract.address, "0", defaultPrice, [
                      basicToken.address,
                  ])
              })
              it("reverts if market not open", async () => {
                  await contract.setState(1)
                  await expect(
                      contract.addPaymentTokenAtListing(
                          nftContract.address,
                          "0",
                          governanceToken.address
                      )
                  ).to.be.revertedWith("NftMarketplace__StateIsNot(2)")
              })
              it("reverts if caller is not nft owner", async () => {
                  await expect(
                      userContract.addPaymentTokenAtListing(
                          nftContract.address,
                          "0",
                          governanceToken.address
                      )
                  ).to.be.revertedWith(
                      `NftMarketplace__NotOwnerOfNft("${nftContract.address}", ${"0"})`
                  )
              })
              it("reverts if nft not listed", async () => {
                  await nftContract.mint()

                  await expect(
                      contract.addPaymentTokenAtListing(
                          nftContract.address,
                          "1",
                          governanceToken.address
                      )
                  ).to.be.revertedWith(
                      `NftMarketplace__NftNotListed("${nftContract.address}", ${"1"})`
                  )
              })
              it("reverts if payment token not listed", async () => {
                  await expect(
                      contract.addPaymentTokenAtListing(
                          nftContract.address,
                          "0",
                          governanceToken.address
                      )
                  ).to.be.revertedWith(
                      `NftMarketplace__TokenNotListed("${governanceToken.address}")`
                  )
              })
              it("adds payment token to listing", async () => {
                  await contract.addPaymentToken(
                      governanceToken.address,
                      mockAggregator.address,
                      decimals
                  )

                  await contract.addPaymentTokenAtListing(
                      nftContract.address,
                      "0",
                      governanceToken.address
                  )

                  const listing = await contract.getListing(nftContract.address, "0")
                  expect(
                      listing.paymentTokenAddresses[listing.paymentTokenAddresses.length - 1]
                  ).to.equal(governanceToken.address)
              })
              it("emits event correctly", async () => {
                  await contract.addPaymentToken(
                      governanceToken.address,
                      mockAggregator.address,
                      decimals
                  )

                  await expect(
                      contract.addPaymentTokenAtListing(
                          nftContract.address,
                          "0",
                          governanceToken.address
                      )
                  )
                      .to.emit(contract, "NftPaymentTokenAdded")
                      .withArgs(nftContract.address, "0", governanceToken.address)
              })
          })
          describe("removePaymentTokenAtListing", () => {
              beforeEach(async () => {
                  await contract.setState(2)
                  await nftContract.approve(contract.address, "0")
                  const decimals = await basicToken.decimals()
                  await contract.addPaymentToken(
                      basicToken.address,
                      mockAggregator.address,
                      decimals
                  )
                  await contract.addPaymentToken(
                      governanceToken.address,
                      mockAggregator.address,
                      decimals
                  )
                  await contract.listNft(nftContract.address, "0", defaultPrice, [
                      basicToken.address,
                      governanceToken.address,
                  ])
              })
              it("reverts if market not open", async () => {
                  await contract.setState(1)
              })
              it("reverts if caller is not nft owner", async () => {})
              it("reverts if nft not listed", async () => {})
              it("reverts if payment token not listed", async () => {})
              it("adds payment token to listing", async () => {})
              it("emits event correctly", async () => {})
          })
          describe("buyNftEth", () => {
              beforeEach(async () => {
                  await contract.setState(2)
                  await nftContract.approve(contract.address, "0")
                  await contract.listNft(nftContract.address, "0", defaultPrice, [])
              })
              it("reverts if not approved", async () => {
                  // resets approval
                  await nftContract.transferFrom(deployer.address, deployer.address, "0")

                  await expect(
                      userContract.buyNftEth(nftContract.address, "0", { value: defaultPrice })
                  ).to.be.revertedWith(
                      `NftMarketplace__NotApprovedForNft("${nftContract.address}", 0)`
                  )
              })
              it("reverts if not paid enough", async () => {
                  await expect(
                      userContract.buyNftEth(nftContract.address, "0", {
                          value: defaultPrice.sub(1),
                      })
                  ).to.be.revertedWith(`NftMarketplace__NotEnoughFunds()`)
              })
              it("deletes listing", async () => {
                  await userContract.buyNftEth(nftContract.address, "0", { value: defaultPrice })
                  const listing = await contract.getListing(nftContract.address, "0")

                  expect(listing.seller).to.equal(nullAddress)
                  expect(listing.nftPrice.toString()).to.equal("0")
              })
              it("transfers nft to user", async () => {
                  await userContract.buyNftEth(nftContract.address, "0", { value: defaultPrice })

                  const ownerNow = await nftContract.ownerOf("0")
                  expect(ownerNow).to.equal(user.address)
              })
              it("adds to eligible funds", async () => {
                  await userContract.buyNftEth(nftContract.address, "0", { value: defaultPrice })
                  const eligibleFunds = await contract.getEligibleFunds(deployer.address)

                  expect(eligibleFunds.toString()).to.equal(defaultPrice.toString())
              })
              it("emits event correctly", async () => {
                  const price = (await contract.getListing(nftContract.address, "0")).nftPrice
                  await expect(
                      userContract.buyNftEth(nftContract.address, "0", { value: defaultPrice })
                  )
                      .to.emit(contract, "NftBought")
                      .withArgs(nftContract.address, "0", user.address, price.toString())
              })
          })
          describe("getTokenAmountFromEthAmount", () => {
              let price
              beforeEach(async () => {
                  await contract.setState(2)
                  const decimals = await basicToken.decimals()
                  await contract.addPaymentToken(
                      basicToken.address,
                      mockAggregator.address,
                      decimals
                  )
                  price = ethers.utils.parseEther("0.004")
              })
              it("reverts if tokenAddress is not listed", async () => {
                  await expect(contract.getTokenAmountFromEthAmount(price, governanceToken.address))
                      .to.be.reverted
              })
              it("converts nftPrice (in wei) to token amount (in wei)", async () => {
                  const tokensRequired = await contract.getTokenAmountFromEthAmount(
                      price,
                      basicToken.address
                  )

                  expect(tokensRequired.toString()).to.equal(
                      price
                          .mul(ethers.utils.parseEther(constants.MOCK_AGGREGATOR_PRICE))
                          .div(ethers.utils.parseEther("1"))
                          .toString()
                  )
              })
          })
          describe("buyNftErc20", () => {
              let tokenAmount
              beforeEach(async () => {
                  await contract.setState(2)
                  const decimals = await basicToken.decimals()
                  await contract.addPaymentToken(
                      basicToken.address,
                      mockAggregator.address,
                      decimals
                  )
                  await nftContract.approve(contract.address, "0")
                  await contract.listNft(nftContract.address, "0", defaultPrice, [
                      basicToken.address,
                  ])
                  const price = (await contract.getListing(nftContract.address, "0")).nftPrice
                  tokenAmount = await contract.getTokenAmountFromEthAmount(
                      price.toString(),
                      basicToken.address
                  )
              })
              it("reverts if not approved", async () => {
                  // resets approval
                  await nftContract.transferFrom(deployer.address, deployer.address, "0")

                  await expect(
                      userContract.buyNftErc20(nftContract.address, "0", "0")
                  ).to.be.revertedWith(
                      `NftMarketplace__NotApprovedForNft("${nftContract.address}", 0)`
                  )
              })
              it("reverts if paymentTokenIndex is out of bounds", async () => {
                  await expect(userContract.buyNftErc20(nftContract.address, "0", "1")).to.be
                      .reverted
              })
              it("reverts if allowance is too low", async () => {
                  await expect(
                      userContract.buyNftErc20(nftContract.address, "0", "0")
                  ).to.be.revertedWith(`NftMarketplace__NotEnoughAllowance()`)
              })
              it("deletes listing", async () => {
                  await basicToken.approve(userContract.address, tokenAmount.toString())

                  await userContract.buyNftErc20(nftContract.address, "0", "0")

                  const price = (await contract.getListing(nftContract.address, "0")).nftPrice
                  expect(price.toString()).to.equal("0")
              })
              it("transfers erc20 tokens to seller", async () => {
                  await basicToken.approve(userContract.address, tokenAmount.toString())
                  await userContract.buyNftErc20(nftContract.address, "0", "0")

                  const balance = await basicToken.balanceOf(deployer.address)

                  expect(balance.toString()).to.equal(tokenAmount.toString())
              })
              it("transfers nft to buyer", async () => {
                  await basicToken.approve(userContract.address, tokenAmount.toString())
                  await userContract.buyNftErc20(nftContract.address, "0", "0")

                  const ownerNow = await nftContract.ownerOf("0")
                  expect(ownerNow).to.equal(user.address)
              })
              it("emits event correctly", async () => {
                  await basicToken.approve(userContract.address, tokenAmount.toString())

                  const price = (await contract.getListing(nftContract.address, "0")).nftPrice
                  await expect(userContract.buyNftErc20(nftContract.address, "0", "0"))
                      .to.emit(contract, "NftBought")
                      .withArgs(nftContract.address, "0", user.address, price.toString())
              })
          })
          describe("withdrawFunds", () => {
              beforeEach(async () => {
                  await contract.setState(2)
                  await nftContract.approve(contract.address, "0")
                  await contract.listNft(nftContract.address, "0", defaultPrice, [])
                  await userContract.buyNftEth(nftContract.address, "0", { value: defaultPrice })
              })
              it("reverts if no funds to withdraw", async () => {
                  await expect(userContract.withdrawFunds()).to.be.revertedWith(
                      "NftMarketplace__NoEligibleFunds()"
                  )
              })
              it("lets seller withdraw fudns", async () => {
                  await expect(await contract.withdrawFunds()).to.changeEtherBalances(
                      [contract, deployer],
                      [-defaultPrice.toString(), defaultPrice.toString()]
                  )
              })
          })
      })
