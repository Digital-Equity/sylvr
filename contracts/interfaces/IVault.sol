// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

interface IVault  {
  function deposit(uint amount) external;
  function withdraw(uint amount) external;

  event Deposit(address indexed from, uint256 amount);
  event Withdrawal(address indexed to, uint256 amount);
}