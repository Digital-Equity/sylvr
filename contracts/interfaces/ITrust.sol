// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

interface ITrust {
    function payoutEth(uint256 amount) external payable;

    function payout(address token, uint256 amount) external returns (uint256);

    function depositEth() external payable;

    function deposit(address token, uint256 amount) external returns (uint256);

    function withdrawEth(uint256 amount) external;

    function withdraw(address token, uint256 amount) external;

    event Deposit(address indexed token, address indexed from, uint256 amount);
    event Payment(address indexed token, address indexed to, uint256 amount);
    event Withdrawal(address indexed token, uint256 amount, address to);
}
