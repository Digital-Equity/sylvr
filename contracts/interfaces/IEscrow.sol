// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

interface IEscrow {
    function deposit(uint256 amount) external returns(uint256);
    function withdraw() external returns (uint256);
    function payout() external returns (uint256);
    event Deposit(uint256 amount, address from);
    event Withdrawal(uint256 amount, address to);
}