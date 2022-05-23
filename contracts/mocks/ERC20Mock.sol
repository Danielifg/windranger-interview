// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC20Mock is ERC20 {
    constructor() ERC20("mock", "MOCK") {
        _mint(msg.sender, 10_000_000 * 10e18);
    }
}
