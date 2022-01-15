// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Sylvr is ERC20("Sylvr", "SLVR"), ERC20Burnable, Ownable {
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
