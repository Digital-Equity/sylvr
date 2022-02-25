// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

interface IMultiSig {
    event Deposit(address indexed from, uint256 amount);
    event Submit(uint256 indexed txId);
    event Approve(address indexed from, uint256 indexed txId);
    event Revoke(address indexed from, uint256 indexed txId);
    event Execute(uint256 indexed txId);

    function initialize(address[] memory owners, uint8 votesRequired) external;

    function submitTransaction(
        address to,
        uint256 value,
        bytes calldata data
    ) external;

    function execute(uint256 txId) external;

    function revoke(uint256 txId) external;
}
