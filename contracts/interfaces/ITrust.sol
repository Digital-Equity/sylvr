// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

interface ITrust {
    function setAdmin(address admin) external;

    function revokeRights() external;

    function payout(address token, uint256 amount) external returns (uint256);

    function deposit(address token, uint256 amount) external returns (uint256);

    function getBalanceForToken(address token) external view returns (uint256);

    function withdrawEth(uint256 amount) external;

    function withdraw(address token, uint256 amount) external;

    event Deposit(address indexed token, address indexed to, uint256 amount);
    event Payment(address indexed token, address indexed to, uint256 amount);
    event Withdrawal(address indexed token, uint256 amount, address to);
    event AdminAssigned(address indexed newAdmin, address indexed prevAdmin);
    event AdminRemoved(address indexed removedAdmin, address indexed currentAdmin);
}
