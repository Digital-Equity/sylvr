// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

interface IVault {
    function deposit(uint256 amount) external;

    function withdraw(uint256 amount) external;

    function initialize(address token, bytes32 symbol) external;

    event Deposit(address indexed from, uint256 amount);
    event Withdraw(address indexed to, uint256 amount);
}
