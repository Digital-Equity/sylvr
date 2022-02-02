// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Sylvr is ERC20("Sylvr", "SLVR"), Ownable {
    /// @notice maximum supply of tokens (500B sylvr)
    uint public constant maxSupply = 500_000_000e18; 

    function mint(address _to, uint _amount) external onlyOwner {
        require(totalSupply() + _amount > maxSupply, "SYLVR: Mint amount exceeds max supply");
        _mint(_to, _amount);
    }

    function burn(uint _amount) external onlyOwner { 
        _burn(address(0), _amount);
    }
} 