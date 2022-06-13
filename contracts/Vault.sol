// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./interfaces/IVault.sol";

contract Vault is IVault, ReentrancyGuard {
    IERC20 public token;
    bytes32 public symbol;
    address public registry;
    uint256 public outstandingShares;
    mapping(address => uint256) public balanceOf;

    modifier onlyRegistry() { 
        require(
            msg.sender == registry,
            "Only the registry can perform this action"
        );
        _;
    }

    constructor(address _token, bytes32 _symbol) {
        token = IERC20(_token);
        symbol = _symbol;
        registry = msg.sender;
    }

    function initialize(address _token, bytes32 _symbol) external onlyRegistry {
        token = IERC20(_token);
        symbol = _symbol;
        registry = msg.sender;
    }

    function deposit(uint256 _amount) external {
        require(token.transferFrom(msg.sender, address(this), _amount));
        _deposit(_amount);
    }

    function withdraw(uint256 _amount) external nonReentrant {
        require(
            balanceOf[msg.sender] >= _amount,
            "Insufficient funds for withdrawal"
        );
        require(token.transfer(msg.sender, _amount));
        _withdraw(_amount);
    }

    function _deposit(uint256 _amount) internal {
        balanceOf[msg.sender] = _amount;
        outstandingShares += _amount;
        emit Deposit(msg.sender, _amount);
    }

    function _withdraw(uint256 _amount) internal {
        outstandingShares -= _amount;
        balanceOf[msg.sender] -= _amount;
        emit Withdraw(msg.sender, _amount);
    }
}
