// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

interface ITrust {
    function setAdmin(address admin) external;

    function revokeRights() external returns (address);

    function payout(address token, uint256 amount) external returns (uint256);

    function deposit(address token, uint256 amount) external returns (uint256);

    function getBalanceForToken(address token) external view returns (uint256);

    function emergencyWithdrawal() external;

    event Deposit(address token, uint256 amount);
    event Payment(address token, uint256 amount);
    event AdminAssigned(address newAdmin, address prevAdmin);
    event AdminRemoved(address removedAdmin, address currentAdmin);
}
