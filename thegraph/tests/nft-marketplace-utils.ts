import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  Initialized,
  NftBought,
  NftDelisted,
  NftListed,
  NftPaymentTokenAdded,
  NftPaymentTokenRemoved,
  NftPriceUpdated,
  OwnershipTransferred,
  PaymentTokenAdded,
  PaymentTokenRemoved
} from "../generated/NftMarketplace/NftMarketplace"

export function createInitializedEvent(version: i32): Initialized {
  let initializedEvent = changetype<Initialized>(newMockEvent())

  initializedEvent.parameters = new Array()

  initializedEvent.parameters.push(
    new ethereum.EventParam(
      "version",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(version))
    )
  )

  return initializedEvent
}

export function createNftBoughtEvent(
  nftAddr: Address,
  tokenId: BigInt,
  buyer: Address,
  price: BigInt
): NftBought {
  let nftBoughtEvent = changetype<NftBought>(newMockEvent())

  nftBoughtEvent.parameters = new Array()

  nftBoughtEvent.parameters.push(
    new ethereum.EventParam("nftAddr", ethereum.Value.fromAddress(nftAddr))
  )
  nftBoughtEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )
  nftBoughtEvent.parameters.push(
    new ethereum.EventParam("buyer", ethereum.Value.fromAddress(buyer))
  )
  nftBoughtEvent.parameters.push(
    new ethereum.EventParam("price", ethereum.Value.fromUnsignedBigInt(price))
  )

  return nftBoughtEvent
}

export function createNftDelistedEvent(
  nftAddr: Address,
  tokenId: BigInt
): NftDelisted {
  let nftDelistedEvent = changetype<NftDelisted>(newMockEvent())

  nftDelistedEvent.parameters = new Array()

  nftDelistedEvent.parameters.push(
    new ethereum.EventParam("nftAddr", ethereum.Value.fromAddress(nftAddr))
  )
  nftDelistedEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )

  return nftDelistedEvent
}

export function createNftListedEvent(
  seller: Address,
  nftAddr: Address,
  tokenId: BigInt,
  price: BigInt,
  tokensForPayment: Array<Address>
): NftListed {
  let nftListedEvent = changetype<NftListed>(newMockEvent())

  nftListedEvent.parameters = new Array()

  nftListedEvent.parameters.push(
    new ethereum.EventParam("seller", ethereum.Value.fromAddress(seller))
  )
  nftListedEvent.parameters.push(
    new ethereum.EventParam("nftAddr", ethereum.Value.fromAddress(nftAddr))
  )
  nftListedEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )
  nftListedEvent.parameters.push(
    new ethereum.EventParam("price", ethereum.Value.fromUnsignedBigInt(price))
  )
  nftListedEvent.parameters.push(
    new ethereum.EventParam(
      "tokensForPayment",
      ethereum.Value.fromAddressArray(tokensForPayment)
    )
  )

  return nftListedEvent
}

export function createNftPaymentTokenAddedEvent(
  nftAddr: Address,
  tokenId: BigInt,
  paymentTokenAddress: Address
): NftPaymentTokenAdded {
  let nftPaymentTokenAddedEvent = changetype<NftPaymentTokenAdded>(
    newMockEvent()
  )

  nftPaymentTokenAddedEvent.parameters = new Array()

  nftPaymentTokenAddedEvent.parameters.push(
    new ethereum.EventParam("nftAddr", ethereum.Value.fromAddress(nftAddr))
  )
  nftPaymentTokenAddedEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )
  nftPaymentTokenAddedEvent.parameters.push(
    new ethereum.EventParam(
      "paymentTokenAddress",
      ethereum.Value.fromAddress(paymentTokenAddress)
    )
  )

  return nftPaymentTokenAddedEvent
}

export function createNftPaymentTokenRemovedEvent(
  nftAddr: Address,
  tokenId: BigInt,
  paymentTokenAddress: Address
): NftPaymentTokenRemoved {
  let nftPaymentTokenRemovedEvent = changetype<NftPaymentTokenRemoved>(
    newMockEvent()
  )

  nftPaymentTokenRemovedEvent.parameters = new Array()

  nftPaymentTokenRemovedEvent.parameters.push(
    new ethereum.EventParam("nftAddr", ethereum.Value.fromAddress(nftAddr))
  )
  nftPaymentTokenRemovedEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )
  nftPaymentTokenRemovedEvent.parameters.push(
    new ethereum.EventParam(
      "paymentTokenAddress",
      ethereum.Value.fromAddress(paymentTokenAddress)
    )
  )

  return nftPaymentTokenRemovedEvent
}

export function createNftPriceUpdatedEvent(
  nftAddr: Address,
  tokenId: BigInt,
  price: BigInt
): NftPriceUpdated {
  let nftPriceUpdatedEvent = changetype<NftPriceUpdated>(newMockEvent())

  nftPriceUpdatedEvent.parameters = new Array()

  nftPriceUpdatedEvent.parameters.push(
    new ethereum.EventParam("nftAddr", ethereum.Value.fromAddress(nftAddr))
  )
  nftPriceUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )
  nftPriceUpdatedEvent.parameters.push(
    new ethereum.EventParam("price", ethereum.Value.fromUnsignedBigInt(price))
  )

  return nftPriceUpdatedEvent
}

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent = changetype<OwnershipTransferred>(
    newMockEvent()
  )

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
}

export function createPaymentTokenAddedEvent(
  tokenAddress: Address
): PaymentTokenAdded {
  let paymentTokenAddedEvent = changetype<PaymentTokenAdded>(newMockEvent())

  paymentTokenAddedEvent.parameters = new Array()

  paymentTokenAddedEvent.parameters.push(
    new ethereum.EventParam(
      "tokenAddress",
      ethereum.Value.fromAddress(tokenAddress)
    )
  )

  return paymentTokenAddedEvent
}

export function createPaymentTokenRemovedEvent(
  tokenAddress: Address
): PaymentTokenRemoved {
  let paymentTokenRemovedEvent = changetype<PaymentTokenRemoved>(newMockEvent())

  paymentTokenRemovedEvent.parameters = new Array()

  paymentTokenRemovedEvent.parameters.push(
    new ethereum.EventParam(
      "tokenAddress",
      ethereum.Value.fromAddress(tokenAddress)
    )
  )

  return paymentTokenRemovedEvent
}
