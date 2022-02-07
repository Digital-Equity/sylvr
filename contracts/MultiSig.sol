// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/access/Ownable.sol";

contract MultiSig {
    event Deposit(address indexed from, uint256 amount);
    event Submit(uint256 indexed txId);
    event Approve(address indexed from, uint256 indexed txId);
    event Revoke(address indexed from, uint256 indexed txId);
    event Execute(uint256 indexed txId);

    struct Transaction {
        address to;
        uint256 value;
        bytes data;
        bool executed;
    }

    address[] public owners;
    mapping(address => bool) public isOwner;
    uint256 public requiredVotes;

    Transaction[] public transactions;
    mapping(uint256 => mapping(address => bool)) public approvals;

    modifier onlyOwner() {
        require(isOwner[msg.sender], "MultiSig: Caller is not an owner");
        _;
    }

    modifier txExists(uint256 _txId) {
        require(
            _txId < transactions.length,
            "MultiSig: Transaction does not exist"
        );
        _;
    }

    modifier txNotApproved(uint256 _txId) {
        require(
            !approvals[_txId][msg.sender],
            "MultiSig: Transaction already approved"
        );
        _;
    }

    modifier txNotExecuted(uint256 _txId) {
        require(
            !transactions[_txId].executed,
            "MultiSig: Transaction already executed"
        );
        _;
    }

    constructor(address[] memory _owners, uint256 _required) {
        require(
            _owners.length > 0,
            "MultiSig: Cannot create with less than 1 owners"
        );
        require(
            _required > 0 && _required <= owners.length,
            "MultiSig: Invalid number of required votes"
        );

        for (uint256 i = 0; i < _owners.length; i++) {
            address owner = _owners[i];
            require(
                owner != address(0),
                "MultiSig: Zero address cannot be an owner"
            );
            require(!isOwner[owner], "MultiSig: Owner is not unique");

            isOwner[owner] = true;
            owners.push(owner);
        }

        requiredVotes = _required;
    }

    receive() external payable {
        emit Deposit(msg.sender, msg.value);
    }

    function submitTransaction(
        address _to,
        uint256 _value,
        bytes calldata _data
    ) external onlyOwner {
        transactions.push(
            Transaction({to: _to, value: _value, data: _data, executed: false})
        );

        emit Submit(transactions.length - 1);
    }

    function approve(uint256 _txId)
        external
        onlyOwner
        txExists(_txId)
        txNotApproved(_txId)
        txNotExecuted(_txId)
    {
        approvals[_txId][msg.sender] = true;
        emit Approve(msg.sender, _txId);
    }

    function _getApprovalCount(uint256 _txId)
        private
        view
        returns (uint256 count)
    {
        for (uint256 i = 0; i < owners.length; i++) {
            if (approvals[_txId][owners[i]]) {
                count += 1;
            }
        }
    }

    function execute(uint256 _txId)
        external
        onlyOwner
        txExists(_txId)
        txNotApproved(_txId)
        txNotExecuted(_txId)
    {
        require(
            _getApprovalCount(_txId) >= requiredVotes,
            "MultiSig: Transaction does not have enough approvals"
        );

        Transaction storage transaction = transactions[_txId];
        transaction.executed = true;
        (bool success, ) = transaction.to.call{value: transaction.value}(
            transaction.data
        );

        require(success, "MultiSig: Transaction failed");

        emit Execute(_txId);
    }
}