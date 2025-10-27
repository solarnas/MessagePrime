// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract SimpleNFT is ERC721 {
    uint256 private _currentTokenId = 0;

    constructor() ERC721("Simple NFT", "SNFT") {}

    // Public mint function that anyone can call
    function mint(address to) public returns (uint256) {
        _currentTokenId++;
        uint256 tokenId = _currentTokenId;
        _mint(to, tokenId);
        return tokenId;
    }

    // Convenience function to mint to msg.sender
    function mint() public returns (uint256) {
        return mint(msg.sender);
    }
}
