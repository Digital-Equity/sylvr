// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "./interfaces/ITrust.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TrustFund is ITrust, Ownable {
    address public immutable beneficiary;
    address public admin;
    address[] public tokens;
    mapping (address => uint256) balances;

    constructor(address _beneficiary) {
        beneficiary = _beneficiary;
        admin = msg.sender;
    }

    // accept eth
    receive() external payable {}

    // accept ERC20 deposits
    function deposit(address _token, uint256 _amount) external override returns (uint256) {
        require(IERC20(_token).allowance(msg.sender, address(this)) >= _amount, "Insufficient allowance");
        require(IERC20(_token).balanceOf(msg.sender) >= _amount, "Insufficient balance");

        // check if current token exists, if not push to token array
        if (!_tokenExists(_token)) {
            tokens.push(_token);
        }

        IERC20(_token).transferFrom(msg.sender, address(this), _amount); // transfer ERC20 to contract
        balances[_token] += _amount; // update balance for token

        emit Deposit(_token, _amount);
        return balances[_token];
    }

    function setAdmin(address _admin) external override onlyOwner {
        address prevAdmin = admin;
        admin = _admin;

        emit AdminAssigned(admin, prevAdmin);
    }

    function revokeRights() external override onlyOwner {
        address removedAdmin = admin;
        admin = owner();
        
        emit AdminRemoved(removedAdmin, admin);
    }

    function payout(address _token, uint256 _amount) external onlyOwner returns (uint256) {
        require(IERC20(_token).balanceOf(address(this)) >= _amount);
        
        balances[_token] -= _amount;
        emit Payment(_token, _amount);
        
        return balances[_token];
    } 

    function withdraw(address _token, uint256 _amount) external onlyOwner {
        require(balances[_token] > _amount, "TrustFund: Zero balance");
        uint balance = balances[_token];
        
        IERC20(_token).transferFrom(address(this), owner(), balance);
        emit Withdrawal(_token, _amount, owner());
    }

    function withdrawEth(uint _amount) external onlyOwner {
        require(address(this).balance > _amount, "TrustFund: Zero balance");
        payable(msg.sender);

        payable(owner()).transfer(_amount);

    }

    function getBalanceForToken(address _token) external view override returns (uint256) {
        require(balances[_token] > 0, "There is no balance");
        return balances[_token];
    }

    function _tokenExists(address _token) internal view returns (bool) {
        for (uint i = 0; i < tokens.length; i++) {
            if (_token == tokens[i]) {
                return true;
            }
        }

        return false;
    }
}