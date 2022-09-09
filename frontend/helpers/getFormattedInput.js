import { ethers } from "ethers"

const getFormattedInput = (input) => {
    return input != 0 ? ethers.utils.parseUnits(input, "ether").toString() : ""
}

module.exports = { getFormattedInput }
