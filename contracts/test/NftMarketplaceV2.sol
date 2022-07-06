// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "../NftMarketplace.sol";

contract NftMarketplaceV2 is NftMarketplace {
    uint256 public newValue;

    function setNewValue(uint256 value) public {
        newValue = value;
    }

    function getNewVersion() public pure returns (uint8) {
        return 2;
    }
}
