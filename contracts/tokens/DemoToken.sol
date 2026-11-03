// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @notice Configurable ERC-20 used for local pools and tests.
///         The whole supply is minted to the deployer.
contract DemoToken is ERC20 {
    constructor(
        string memory name_,
        string memory symbol_,
        uint256 supply
    ) ERC20(name_, symbol_) {
        _mint(msg.sender, supply * 10**uint256(decimals()));
    }
}
