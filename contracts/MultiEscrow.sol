// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "./interfaces/IERC20.sol";
import "./interfaces/IEscrow.sol";

contract MultiEscrow is IEscrow {
    IERC20 public immutable token;
    uint256 public immutable minDeposit;
    uint256 public participants;
    uint256 public immutable maxParticipants;
    mapping(address => uint256) private balances;

    constructor(IERC20 _token, uint256 _minDeposit, uint _maxParticipants) {
        token = IERC20(_token);
        minDeposit = _minDeposit;
        maxParticipants = _maxParticipants;
    }

    function deposit(uint256 _amount) external override returns (uint256) {
        require(_amount > minDeposit);
    }

    function withdraw() external override returns (uint256) {
        uint balance = balances[msg.sender];
        require(balance > 0, "User has no balance");

        emit Withdrawal(balance, msg.sender);
    }
}