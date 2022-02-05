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

    event Deposit(address token, uint256 amount);
    event Payment(address token, uint256 amount);
    event Withdrawal(address token, uint256 amount, address to);
    event AdminAssigned(address newAdmin, address prevAdmin);
    event AdminRemoved(address removedAdmin, address currentAdmin);
}
