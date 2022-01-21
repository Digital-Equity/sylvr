// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "./IERC20.sol";

interface IEscrow {
    function deposit(IERC20 token, uint256 amount) external returns(uint256);
    function withdraw() external returns (uint256);
    function payout() external returns (uint256);
    event Deposit(uint256 amount, address from);
    event Withdraw(uint256 amount, address to);
}