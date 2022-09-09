# NftMarketplace

*Philipp Keinberger*

> NftMarketplace

This contract is an nft marketplace, where users can list (sell) and buy nfts using eth and erc20 tokens. Payment tokens (e.g. erc20-tokens, accepted by the marketplace as payment for nfts) can be added and removed through access- restricted functions, favourably controlled by a governor contract (e.g. dao) to allow for decentralized governance of the marketplace. The contract is designed to be upgradeable.

*This contract implements the IERC721 and IERC20 Openzeppelin interfaces for the ERC721 and ERC20 token standards. The Marketplace implements Chainlink price feeds to retrieve prices of listed erc20 payment tokens. This contract inherits from Openzeppelins OwnableUpgradeable contract in order to allow owner features, while still keeping upgradeablity functionality. The Marketplace is designed to be deployed through a proxy contract to allow for future upgrades of the contract.*

## Methods

### addPaymentToken

```solidity
function addPaymentToken(address tokenAddress, address priceFeedAddress, uint8 decimals) external nonpayable
```

Function for adding a payment token (erc20) as payment method for nft purchases using erc20 tokens

*This function reverts if the market is CLOSED or the caller is not the owner of the marketplace. Checking if the tokenAddress indeed implements the IERC20 interface is not provided since the function can only be called by the owner, while the owner should be trustworthy enough to check for that beforehand. Main reason for that is gas savings. This function emits the {PaymentTokenAdded} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenAddress | address | Is the address of the erc20 contract |
| priceFeedAddress | address | Is the address of the chainlink price feed for the erc20 |
| decimals | uint8 | Is the amount of decimals returned by the chainlink price feed |

### addPaymentTokenAtListing

```solidity
function addPaymentTokenAtListing(address nftAddr, uint256 tokenId, address paymentTokenAddress) external nonpayable
```

Function for adding a payment token to a listing

*This function reverts if the market is not OPEN, the caller is not the owner of `tokenId` at `nftAddr`, or the nft is not listed on the marketplace. This function emits the {NftPaymentTokenAdded} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| nftAddr | address | Is the address of the nft contract |
| tokenId | uint256 | Is the id of the nft |
| paymentTokenAddress | address | is the address of the payment token to be added |

### buyNftErc20

```solidity
function buyNftErc20(address nftAddr, uint256 tokenId, uint256 paymentTokenIndex) external nonpayable
```

Function for buying an nft on the marketplace with an erc20 (payment) token.

*This function reverts if the market is not OPEN, the nft is not listed on the marketplace or the marketplace, the marketplace is not approved to spend the nft or the approved token amount by buyer is smaller than the amount of tokens required to pay for the nft. The amount of tokens needed of paymentToken at index `paymentTokenIndex` is retrieved from the getTokenAmountFromEthAmount function, which converts the price (eth in wei) to the token amount (in wei) using Chainlink price feeds. This implementation will transfer the nft to the buyer directly, while also transferring the amount of tokens paid directly to the seller. If the transfer of the erc20 tokens fails, the function is reverted (nft will not be transferred to buyer). This function emits the {NftBought} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| nftAddr | address | Is the address of the nft contract |
| tokenId | uint256 | Is the id of the nft |
| paymentTokenIndex | uint256 | Is the index of the paymentToken in the Listing.paymentTokenAddresses array |

### buyNftEth

```solidity
function buyNftEth(address nftAddr, uint256 tokenId) external payable
```

Function for buying an nft on the marketplace with eth

*This function reverts if the market is not OPEN, the nft is not listed on the marketplace, the marketplace is not approved to transfer the nft or the amount of eth sent to the marketplace is smaller than the price of the nft. This implementation will transfer the nft to the buyer directly, while granting the seller address the right to withdraw the eth amount sent by the buyer to the marketplace by calling the withdrawFunds function. Checking the amount of eligible funds for withdrawal can be done by calling getEligibleFunds. This function emits the {NftBought} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| nftAddr | address | Is the address of the nft contract |
| tokenId | uint256 | Is the id of the nft |

### cancelListing

```solidity
function cancelListing(address nftAddr, uint256 tokenId) external nonpayable
```

Function for cancelling a listing on the marketplace

*This function reverts if the market is not OPEN, the caller is not the owner of `tokenId` at `nftAddr`, or the nft is not listed on the marketplace. This implementation only deletes the listing from the mapping. Sellers have to revoke approval rights for their nft on their own or through a frontend application. This function emits the {NftDelisted} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| nftAddr | address | Is the address of the nft contract |
| tokenId | uint256 | Is the id of the nft |

### getEligibleFunds

```solidity
function getEligibleFunds(address addr) external view returns (uint256)
```

Function for looking up the amount of eligible funds that can be withdrawn



#### Parameters

| Name | Type | Description |
|---|---|---|
| addr | address | Is the address to be looked up |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | Eligible funds of `addr` for withdrawal from marketplace |

### getListing

```solidity
function getListing(address nftAddr, uint256 tokenId) external view returns (struct NftMarketplace.Listing)
```

This function returns the current Listing of `tokenId` at `nftAddr` (if existing)



#### Parameters

| Name | Type | Description |
|---|---|---|
| nftAddr | address | Is the address of the nft contract |
| tokenId | uint256 | Is the id of the nft |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | NftMarketplace.Listing | Listing of `tokenId` at `nftAddr` |

### getPaymentToken

```solidity
function getPaymentToken(address addr) external view returns (struct NftMarketplace.PaymentToken)
```

Function for looking up payment token of marketplace



#### Parameters

| Name | Type | Description |
|---|---|---|
| addr | address | Is the contract address of the payment token |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | NftMarketplace.PaymentToken | PaymentToken of `addr` |

### getState

```solidity
function getState() external view returns (enum NftMarketplace.MarketState)
```

This function returns the current MarketState of the marketplace




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | enum NftMarketplace.MarketState | State of the marketplace |

### getTokenAmountFromEthAmount

```solidity
function getTokenAmountFromEthAmount(uint256 ethAmount, address tokenAddress) external view returns (uint256)
```

Function for converting `ethAmount` to amount of tokens using Chainlink price feeds

*This function reverts if the `tokenAddress` is not listed as a paymentToken. This implementation returns the token amount in wei (18 decimals).*

#### Parameters

| Name | Type | Description |
|---|---|---|
| ethAmount | uint256 | Amount of eth (in wei) to be converted |
| tokenAddress | address | Is the address of the erc20 token |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | Token amount (in wei) |

### getVersion

```solidity
function getVersion() external pure returns (uint8)
```

Function for retrieving version of marketplace




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint8 | Version |

### initialize

```solidity
function initialize() external nonpayable
```



*Initializer function which replaces constructor for upgradeability functionality. Sets the msg.sender as owner*


### listNft

```solidity
function listNft(address nftAddr, uint256 tokenId, uint256 nftPrice, address[] allowedPaymentTokens) external nonpayable
```

Function for listing an nft on the marketplace

*This function reverts if the market is not OPEN, the caller is not the owner of `tokenId` at `nftAddr`, or the marketplace is not approved to transfer the nft. The function also reverts if `allowedPaymentTokens` contains an erc20-token, which is not added as a paymentToken on the marketplace. If `allowedPaymentTokens` are not specified, the nft will only be able to be sold using the buyNftEth function. This implementation still lets sellers hold their nft until the item actually gets sold. The buyNft functions will check for allowance to spend the nft still being present when called. This function emits the {NftListed} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| nftAddr | address | Is the address of the nft contract |
| tokenId | uint256 | Is the token id of the nft |
| nftPrice | uint256 | Is the price set by msg.sender for the listing |
| allowedPaymentTokens | address[] | Are payment tokens allowed as payment methods for the nft (optional) |

### owner

```solidity
function owner() external view returns (address)
```



*Returns the address of the current owner.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### removePaymentToken

```solidity
function removePaymentToken(address tokenAddress) external nonpayable
```

Function for removing a payment token from the contract

*This function reverts if the market is CLOSED or the caller is not the owner of the marketplace. This function emits the {PaymentTokenRemoved} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenAddress | address | Is the address of the payment token (erc20) to be removed |

### removePaymentTokenAtListing

```solidity
function removePaymentTokenAtListing(address nftAddr, uint256 tokenId, uint256 index) external nonpayable
```

Function for removing a payment token to a listing

*This function reverts if the market is not OPEN, the caller is not the owner of `tokenId` at `nftAddr`, or the nft is not listed on the marketplace. This function emits the {NftPaymentTokenRemoved} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| nftAddr | address | Is the address of the nft contract |
| tokenId | uint256 | Is the id of the nft |
| index | uint256 | is the index of the payment token to be removed |

### renounceOwnership

```solidity
function renounceOwnership() external nonpayable
```



*Leaves the contract without owner. It will not be possible to call `onlyOwner` functions anymore. Can only be called by the current owner. NOTE: Renouncing ownership will leave the contract without an owner, thereby removing any functionality that is only available to the owner.*


### setState

```solidity
function setState(enum NftMarketplace.MarketState newState) external nonpayable
```

Function for setting the state of the marketplace

*This function can only be called by the owner*

#### Parameters

| Name | Type | Description |
|---|---|---|
| newState | enum NftMarketplace.MarketState | Is the new value for the state |

### transferOwnership

```solidity
function transferOwnership(address newOwner) external nonpayable
```



*Transfers ownership of the contract to a new account (`newOwner`). Can only be called by the current owner.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| newOwner | address | undefined |

### updateListingPrice

```solidity
function updateListingPrice(address nftAddr, uint256 tokenId, uint256 newPrice) external nonpayable
```

Function for updating the price of the listing on the marketplace

*This function reverts if the market is not OPEN, the caller is not the owner of `tokenId` at `nftAddr`, or the nft is not listed on the marketplace. This function emits the {NftPriceUpdated} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| nftAddr | address | Is the address of the nft contract |
| tokenId | uint256 | Is the id of the nft |
| newPrice | uint256 | Is the new price for the nft |

### withdrawFunds

```solidity
function withdrawFunds() external nonpayable
```

Function for withdrawing eth from the marketplace, if eligible funds is greater than zero (only after purchases with eth)

*This function reverts if the market is CLOSED or if there are no eligible funds of the caller to withdraw.*




## Events

### Initialized

```solidity
event Initialized(uint8 version)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| version  | uint8 | undefined |

### NftBought

```solidity
event NftBought(address nftAddr, uint256 tokenId, address indexed buyer, uint256 indexed price)
```

Event emitted when an nft is bought



#### Parameters

| Name | Type | Description |
|---|---|---|
| nftAddr  | address | undefined |
| tokenId  | uint256 | undefined |
| buyer `indexed` | address | undefined |
| price `indexed` | uint256 | undefined |

### NftDelisted

```solidity
event NftDelisted(address indexed nftAddr, uint256 indexed tokenId)
```

Event emitted when an nft is delisted by the seller



#### Parameters

| Name | Type | Description |
|---|---|---|
| nftAddr `indexed` | address | undefined |
| tokenId `indexed` | uint256 | undefined |

### NftListed

```solidity
event NftListed(address indexed seller, address indexed nftAddr, uint256 indexed tokenId, uint256 price, address[] tokensForPayment)
```

Event emitted when a new nft is listed on the market



#### Parameters

| Name | Type | Description |
|---|---|---|
| seller `indexed` | address | undefined |
| nftAddr `indexed` | address | undefined |
| tokenId `indexed` | uint256 | undefined |
| price  | uint256 | undefined |
| tokensForPayment  | address[] | undefined |

### NftPaymentTokenAdded

```solidity
event NftPaymentTokenAdded(address indexed nftAddr, uint256 indexed tokenId, address indexed paymentTokenAddress)
```

Event emitted when seller adds an erc20 token accepted as payment for the nft



#### Parameters

| Name | Type | Description |
|---|---|---|
| nftAddr `indexed` | address | undefined |
| tokenId `indexed` | uint256 | undefined |
| paymentTokenAddress `indexed` | address | undefined |

### NftPaymentTokenRemoved

```solidity
event NftPaymentTokenRemoved(address indexed nftAddr, uint256 indexed tokenId, address indexed paymentTokenAddress)
```

Event emitted when seller removes an erc20 token previously accepted as payment for the nft



#### Parameters

| Name | Type | Description |
|---|---|---|
| nftAddr `indexed` | address | undefined |
| tokenId `indexed` | uint256 | undefined |
| paymentTokenAddress `indexed` | address | undefined |

### NftPriceUpdated

```solidity
event NftPriceUpdated(address indexed nftAddr, uint256 indexed tokenId, uint256 indexed price)
```

Event emitted when seller updates the price of an nft



#### Parameters

| Name | Type | Description |
|---|---|---|
| nftAddr `indexed` | address | undefined |
| tokenId `indexed` | uint256 | undefined |
| price `indexed` | uint256 | undefined |

### OwnershipTransferred

```solidity
event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| previousOwner `indexed` | address | undefined |
| newOwner `indexed` | address | undefined |

### PaymentTokenAdded

```solidity
event PaymentTokenAdded(address tokenAddress)
```

Event emitted when a new payment token gets added to the market



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenAddress  | address | undefined |

### PaymentTokenRemoved

```solidity
event PaymentTokenRemoved(address tokenAddress)
```

Event emitted when a payment token is removed from the market



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenAddress  | address | undefined |



## Errors

### NftMarketplace__AlreadyListed

```solidity
error NftMarketplace__AlreadyListed(address nftAddress, uint256 tokenId)
```

Thrown when `tokenId` of `nftAddress` is already listed on market



#### Parameters

| Name | Type | Description |
|---|---|---|
| nftAddress | address | undefined |
| tokenId | uint256 | undefined |

### NftMarketplace__EthTransferFailed

```solidity
error NftMarketplace__EthTransferFailed()
```

Thrown when eth transfer failed




### NftMarketplace__IndexOutOfBounds

```solidity
error NftMarketplace__IndexOutOfBounds()
```

Thrown when index does not exist in an array




### NftMarketplace__NftNotListed

```solidity
error NftMarketplace__NftNotListed(address nftAddress, uint256 tokenId)
```

Thrown when `tokenId` of `nftAddress` is not listed on market



#### Parameters

| Name | Type | Description |
|---|---|---|
| nftAddress | address | undefined |
| tokenId | uint256 | undefined |

### NftMarketplace__NoEligibleFunds

```solidity
error NftMarketplace__NoEligibleFunds()
```

Thrown when caller has no eligible funds for withdrawal




### NftMarketplace__NotApprovedForNft

```solidity
error NftMarketplace__NotApprovedForNft(address nftAddress, uint256 tokenId)
```

Thrown when market is not approved to transfer `tokenId` of `nftAddress`



#### Parameters

| Name | Type | Description |
|---|---|---|
| nftAddress | address | undefined |
| tokenId | uint256 | undefined |

### NftMarketplace__NotEnoughAllowance

```solidity
error NftMarketplace__NotEnoughAllowance()
```

Thrown when allowance of market is less than required




### NftMarketplace__NotEnoughFunds

```solidity
error NftMarketplace__NotEnoughFunds()
```

Thrown when caller does not send enough eth to market




### NftMarketplace__NotOwnerOfNft

```solidity
error NftMarketplace__NotOwnerOfNft(address nftAddress, uint256 tokenId)
```

Thrown when caller is not owner of `tokenId` at `nftAddress`



#### Parameters

| Name | Type | Description |
|---|---|---|
| nftAddress | address | undefined |
| tokenId | uint256 | undefined |

### NftMarketplace__PriceMustBeAboveZero

```solidity
error NftMarketplace__PriceMustBeAboveZero()
```

Thrown when price is below or equal to zero




### NftMarketplace__StateIs

```solidity
error NftMarketplace__StateIs(uint256 state)
```

Thrown when state of contract is not equal to the one specified



#### Parameters

| Name | Type | Description |
|---|---|---|
| state | uint256 | undefined |

### NftMarketplace__StateIsNot

```solidity
error NftMarketplace__StateIsNot(uint256 state)
```

Thrown when state of contract is equal to the one specified



#### Parameters

| Name | Type | Description |
|---|---|---|
| state | uint256 | undefined |

### NftMarketplace__TokenNotListed

```solidity
error NftMarketplace__TokenNotListed(address tokenAddress)
```

Thrown when the token (erc20) is not listed as payment token



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenAddress | address | undefined |

### NftMarketplace__TokenTransferFailed

```solidity
error NftMarketplace__TokenTransferFailed(address tokenAddress)
```

Thrown when erc20 token transfer failed



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenAddress | address | undefined |


