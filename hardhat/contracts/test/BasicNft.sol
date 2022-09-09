// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract BasicNft is ERC721 {
    uint256 private s_tokenCounter;

    constructor() ERC721("BasicNft", "BNFT") {}

    function mint() public {
        uint256 tokenId = s_tokenCounter;
        s_tokenCounter++;
        _safeMint(msg.sender, tokenId);
    }

    function getTokenCount() public view returns (uint256) {
        return s_tokenCounter;
    }
}
