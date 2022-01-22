// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "./interfaces/ITrust.sol";
import "./utils/Ownable.sol";

contract TrustFund is ITrust, Ownable {
    address public immutable beneficiary;
    address public admin;
    mapping (address => uint256) balances;

    constructor(address _beneficiary) {
        beneficiary = _beneficiary;
        admin = msg.sender;
    }

    function deposit(address _token, uint256 _amount) external override returns (uint256) {
        require(IERC20(_token).allowance(msg.sender, address(this)) >= _amount, "Insufficient allowance");
        require(IERC20(_token).balanceOf(msg.sender) >= _amount, "Insufficient balance");

        IERC20(_token).transferFrom(msg.sender, address(this), _amount); // transfer ERC20 to contract
        balances[_token] += _amount; // update balance in mapping

        emit Deposit(_token, _amount);
        return balances[_token];
    }

    function setAdmin(address _admin) external override onlyOwner {
        address prevAdmin = admin;
        admin = _admin;

        emit AdminAssigned(admin, prevAdmin);
    }

    function revokeRights() external override onlyOwner returns (address) {
        address removedAdmin = admin;
        admin = owner();
        
        emit AdminRemoved(removedAdmin, admin);
        return admin;
    }

    function getBalanceForToken(address _token) external view override returns (uint256) {
        require(balances[_token] > 0, "There is no balance");
        return balances[_token];
    }
}