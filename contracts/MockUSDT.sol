// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockUSDT is ERC20 {
    uint8 private _decimals = 6; // USDT typically has 6 decimals

    event Mint(address indexed to, uint256 amount);

    /**
     * @dev Constructor - creates Mock USDT with no initial supply
     */
    constructor() ERC20("Mock USDT", "mUSDT") {
        // No initial supply, tokens are minted as needed
    }

    /**
     * @dev Override decimals to return 6 instead of default 18
     */
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    /**
     * @dev Mint tokens to any address - anyone can call this function
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint (with 6 decimals)
     */
    function mint(address to, uint256 amount) external {
        require(to != address(0), "MockUSDT: mint to zero address");
        require(amount > 0, "MockUSDT: mint amount must be > 0");

        _mint(to, amount);
        emit Mint(to, amount);
    }

    /**
     * @dev Mint tokens to caller - convenience function
     * @param amount Amount of tokens to mint to caller
     */
    function mintToSelf(uint256 amount) external {
        _mint(msg.sender, amount);
        emit Mint(msg.sender, amount);
    }

    /**
     * @dev Mint standard amounts for testing
     * Mints 10,000 USDT (with 6 decimals) to caller
     */
    function mintStandard() external {
        _mint(msg.sender, 10000 * 10 ** 6); // 10,000 USDT
        emit Mint(msg.sender, 10000 * 10 ** 6);
    }
}
