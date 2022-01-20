// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "./IERC20.sol";

interface ITrust {
    function setAdmin(address admin) external returns (bool);
    function getBalanceForToken(address token) external view returns (uint256);
    // function getTokenReserves() external view returns (bytes32[] memory);
    function deposit(IERC20 token, uint256 amount) external returns (uint256);
    event Deposit(IERC20 token, uint256 amount);
    event Payment(IERC20 token, uint256 amount);
}