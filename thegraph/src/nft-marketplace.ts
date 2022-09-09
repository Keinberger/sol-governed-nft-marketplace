import { BigInt, Address, Bytes } from "@graphprotocol/graph-ts"
import {
    NftMarketplace,
    Initialized as InitializedEvent,
    NftBought as NftBoughtEvent,
    NftDelisted as NftDelistedEvent,
    NftListed as NftListedEvent,
    NftPaymentTokenAdded as NftPaymentTokenAddedEvent,
    NftPaymentTokenRemoved as NftPaymentTokenRemovedEvent,
    NftPriceUpdated as NftPriceUpdatedEvent,
    OwnershipTransferred as OwnershipTransferredEvent,
    PaymentTokenAdded as PaymentTokenAddedEvent,
    PaymentTokenRemoved as PaymentTokenRemovedEvent
} from "../generated/NftMarketplace/NftMarketplace"
import {
    ActiveNft,
    ActivePaymentToken,
    NftListed,
    NftDelisted,
    NftPriceUpdated,
    NftPaymentTokenAdded,
    NftPaymentTokenRemoved,
    NftBought,
    PaymentTokenAdded,
    PaymentTokenRemoved
} from "../generated/schema"

const deadAddress = Address.fromString("0x000000000000000000000000000000000000dEaD")

export function handleInitialized(event: InitializedEvent): void {}

export function handleNftBought(event: NftBoughtEvent): void {
    const id = getIdFromEventParams(event.params.tokenId, event.params.nftAddr)

    let nftBought = NftBought.load(id)
    let activeNft = ActiveNft.load(id)

    if (!nftBought) {
        nftBought = new NftBought(id)
    }

    nftBought.buyer = event.params.buyer
    nftBought.nftAddress = event.params.nftAddr
    nftBought.tokenId = event.params.tokenId
    nftBought.price = event.params.price

    activeNft!.buyer = event.params.buyer

    nftBought.save()
    activeNft!.save()
}

export function handleNftDelisted(event: NftDelistedEvent): void {
    const id = getIdFromEventParams(event.params.tokenId, event.params.nftAddr)

    let nftDelisted = NftDelisted.load(id)
    let activeNft = ActiveNft.load(id)

    if (!nftDelisted) {
        nftDelisted = new NftDelisted(id)
    }

    nftDelisted.nftAddress = event.params.nftAddr
    nftDelisted.tokenId = event.params.tokenId

    activeNft!.seller = deadAddress

    nftDelisted.save()
    activeNft!.save()
}

export function handleNftListed(event: NftListedEvent): void {
    const id = getIdFromEventParams(event.params.tokenId, event.params.nftAddr)

    let nftListed = new NftListed(id)
    let activeNft = new ActiveNft(id)

    nftListed.seller = event.params.seller
    nftListed.nftAddress = event.params.nftAddr
    nftListed.tokenId = event.params.tokenId
    nftListed.price = event.params.price

    activeNft.seller = event.params.seller
    activeNft.buyer = null
    activeNft.nftAddress = event.params.nftAddr
    activeNft.tokenId = event.params.tokenId
    activeNft.price = event.params.price

    let paymentTokens: Array<Bytes>
    paymentTokens = new Array<Bytes>(event.params.tokensForPayment.length)
    for (let i = 0; i < event.params.tokensForPayment.length; i++) {
        paymentTokens[i] = event.params.tokensForPayment[i]
    }

    nftListed.paymentTokens = paymentTokens
    activeNft.paymentTokens = paymentTokens

    nftListed.save()
    activeNft.save()
}

export function handleNftPaymentTokenAdded(event: NftPaymentTokenAddedEvent): void {
    const id = getIdFromEventParams(event.params.tokenId, event.params.nftAddr)

    let nftPaymentTokenAdded = NftPaymentTokenAdded.load(id)
    let activeNft = ActiveNft.load(id)

    if (!nftPaymentTokenAdded) {
        nftPaymentTokenAdded = new NftPaymentTokenAdded(id)
    }

    nftPaymentTokenAdded.nftAddress = event.params.nftAddr
    nftPaymentTokenAdded.tokenId = event.params.tokenId
    nftPaymentTokenAdded.paymentTokenAddress = event.params.paymentTokenAddress

    let paymentTokens = activeNft!.paymentTokens!
    paymentTokens.push(event.params.paymentTokenAddress)
    activeNft!.paymentTokens! = paymentTokens

    nftPaymentTokenAdded.save()
    activeNft!.save()
}

export function handleNftPaymentTokenRemoved(event: NftPaymentTokenRemovedEvent): void {
    const id = getIdFromEventParams(event.params.tokenId, event.params.nftAddr)

    let nftPaymentTokenRemoved = NftPaymentTokenRemoved.load(id)
    let activeNft = ActiveNft.load(id)

    if (!nftPaymentTokenRemoved) {
        nftPaymentTokenRemoved = new NftPaymentTokenRemoved(id)
    }

    nftPaymentTokenRemoved.nftAddress = event.params.nftAddr
    nftPaymentTokenRemoved.tokenId = event.params.tokenId
    nftPaymentTokenRemoved.paymentTokenAddress = event.params.paymentTokenAddress

    let index = 0
    for (let i = 0; i < activeNft!.paymentTokens!.length; i++) {
        if (activeNft!.paymentTokens![i] == event.params.paymentTokenAddress) {
            index = i
            break
        }
    }

    let paymentTokens = activeNft!.paymentTokens!
    paymentTokens[index] = paymentTokens[paymentTokens.length - 1]
    paymentTokens.pop()

    activeNft!.paymentTokens = paymentTokens

    nftPaymentTokenRemoved.save()
    activeNft!.save()
}

export function handleNftPriceUpdated(event: NftPriceUpdatedEvent): void {
    const id = getIdFromEventParams(event.params.tokenId, event.params.nftAddr)

    let nftPriceUpdated = NftPriceUpdated.load(id)
    let activeNft = ActiveNft.load(id)

    if (!nftPriceUpdated) {
        nftPriceUpdated = new NftPriceUpdated(id)
    }

    nftPriceUpdated.nftAddress = event.params.nftAddr
    nftPriceUpdated.tokenId = event.params.tokenId
    nftPriceUpdated.price = event.params.price

    activeNft!.price = event.params.price

    nftPriceUpdated.save()
    activeNft!.save()
}

export function handleOwnershipTransferred(event: OwnershipTransferredEvent): void {}

export function handlePaymentTokenAdded(event: PaymentTokenAddedEvent): void {
    const id = getIdFromEventParams(new BigInt(0), event.params.tokenAddress)

    let paymentTokenAdded = PaymentTokenAdded.load(id)
    let activePaymentToken = ActivePaymentToken.load(id)

    if (!paymentTokenAdded) {
        paymentTokenAdded = new PaymentTokenAdded(id)
    }
    if (!activePaymentToken) {
        activePaymentToken = new ActivePaymentToken(id)
    }

    paymentTokenAdded.tokenAddress = event.params.tokenAddress

    activePaymentToken.tokenAddress = event.params.tokenAddress

    paymentTokenAdded.save()
    activePaymentToken.save()
}

export function handlePaymentTokenRemoved(event: PaymentTokenRemovedEvent): void {
    const id = getIdFromEventParams(new BigInt(0), event.params.tokenAddress)

    let paymentTokenRemoved = PaymentTokenRemoved.load(id)
    let activePaymentToken = ActivePaymentToken.load(id)

    if (!paymentTokenRemoved) {
        paymentTokenRemoved = new PaymentTokenRemoved(id)
    }

    paymentTokenRemoved.tokenAddress = event.params.tokenAddress

    activePaymentToken!.tokenAddress = deadAddress

    paymentTokenRemoved.save()
    activePaymentToken!.save()
}

function getIdFromEventParams(tokenId: BigInt, nftAddress: Address): string {
    return tokenId.toHexString() + nftAddress.toHexString()
}
