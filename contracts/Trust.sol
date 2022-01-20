// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/ITrust.sol";

contract Trust is ITrust, Ownable {
    address public immutable beneficiary;
    address public admin;
    mapping (address => uint256) balances;

    constructor(address _beneficiary) {
        beneficiary = _beneficiary;
        admin = msg.sender;
    }

    function deposit(IERC20 _token, uint256 _amount) external override returns (uint256) {
        require(_token.allowance(msg.sender, address(this)) >= _amount, "Insufficient allowance");
        require(_token.balanceOf(msg.sender) >= _amount, "Insufficient balance");

        _token.transferFrom(msg.sender, address(this), _amount);
        emit Deposit(_token, _amount);

        return balances[address(_token)];
    }

    function setAdmin(address _admin) external override onlyOwner returns (bool) {
        admin = _admin;
        return true;
    }

    function getBalanceForToken(address _token) external view override returns (uint256) {
        require(balances[_token] > 0, "There is no balance");
        return balances[_token];
    }
    
}