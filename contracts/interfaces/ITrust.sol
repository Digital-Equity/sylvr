// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

interface ITrust {
    function deposit(address token, uint256 amount) external;

    function payout(address token, uint256 amount)
        external
        returns (uint256 remainingBal);

    function withdrawBenefactor(address token, uint256 amount)
        external
        returns (uint256 remainingBal);

    function withdrawBeneficiary(address token, uint256 amount)
        external
        returns (uint256 remainingBal);

    event Deposit(address indexed token, address indexed from, uint256 amount);
    event Payment(address indexed token, address indexed to, uint256 amount);
    event Withdrawal(address indexed token, address indexed to, uint256 amount);
}
