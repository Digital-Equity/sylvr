// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SVToken is ERC20, Ownable {
    uint256 public outstanding;

    constructor(string memory _symbol) ERC20("SVToken", _symbol) {}

    function mint(address _to, uint256 _amount) external onlyOwner {
        require(_to != address(0), "SYLVR: Cannot mint to zero address");
        _mint(_to, _amount);
        outstanding += _amount;
        emit Mint(_to, _amount);
    }

    function burn(uint256 _amount) external {
        _burn(msg.sender, _amount);
        outstanding -= _amount;
        emit Burn(msg.sender, _amount);
    }

    event Mint(address indexed to, uint256 amount);
    event Burn(address indexed from, uint256 amount);
}
