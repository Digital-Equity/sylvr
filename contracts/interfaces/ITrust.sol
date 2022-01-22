// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "./IERC20.sol";

interface ITrust {
    function setAdmin(address admin) external;
    function revokeRights() external returns(address);
    function payout(address token, uint256 amount) external;
    function deposit(address token, uint256 amount) external returns (uint256);
    function getBalanceForToken(address token) external view returns (uint256);

    event Deposit(address token, uint256 amount);
    event Payment(address token, uint256 amount);
    event AdminAssigned(address newAdmin, address prevAdmin);
    event AdminRemoved(address removedAdmin, address currentAdmin);
}