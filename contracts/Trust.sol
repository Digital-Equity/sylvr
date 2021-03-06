// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "./interfaces/ITrust.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";

contract Trust is ITrust, ReentrancyGuard, Initializable {
    address public immutable factory;
    address public benefactor;
    address public beneficiary;
    uint256 public deploymentTimestamp;
    uint256 public maturityDate;
    address[] public tokens;
    mapping(address => bool) tokenExists;
    mapping(address => uint256) balances;

    modifier onlyFactory() {
        require(msg.sender == factory, "Trust: caller is not the factory");
        _;
    }

    modifier onlyBenefactor() {
        require(
            msg.sender == benefactor,
            "Trust: caller is not the benefactor"
        );
        _;
    }

    modifier onlyBeneficiary() {
        require(
            msg.sender == beneficiary,
            "Trust: caller is not the beneficiary"
        );
        _;
    }

    modifier hasMatured() {
        require(
            block.timestamp >= maturityDate,
            "Trust: trust has not matured"
        );
        _;
    }

    constructor() {
        factory = msg.sender;
    }

    function initialize(
        address _benefactor,
        address _beneficiary,
        uint256 _maturityDate
    ) external onlyFactory initializer {
        benefactor = _benefactor;
        beneficiary = _beneficiary;
        maturityDate = _maturityDate;
    }

    // accept ERC20 
    function deposit(address _token, uint256 _amount) external nonReentrant {
        require(
            IERC20(_token).allowance(msg.sender, address(this)) >= _amount,
            "Insufficient allowance"
        );
        require(
            IERC20(_token).balanceOf(msg.sender) >= _amount,
            "Insufficient balance"
        );

        // check if current token exists, if not push to token array
        if (!tokenExists[_token]) {
            tokens.push(_token);
        }

        IERC20(_token).transferFrom(msg.sender, address(this), _amount); // transfer ERC20 to contract
        balances[_token] += _amount; // update balance for token

        emit Deposit(_token, msg.sender, _amount);
    }

    // payout ERC20 tokens
    function payout(address _token, uint256 _amount)
        external
        onlyBenefactor
        returns (uint256 remainingBal)
    {
        uint256 balance = balances[_token];
        require(balance >= _amount, "Trust: insufficient balance");

        IERC20(_token).transfer(beneficiary, _amount);
        balance -= _amount;
        balances[_token] = balance; // update token balances

        emit Payment(_token, beneficiary, _amount);
        remainingBal = balance;
    }

    function withdrawBenefactor(address _token, uint256 _amount)
        external
        onlyBenefactor
        returns (uint256 remainingBal)
    {
        uint256 balance = _withdraw(_token, _amount, benefactor);
        remainingBal = balance;
    }

    function withdrawBeneficiary(address _token, uint256 _amount)
        external
        onlyBeneficiary
        hasMatured
        returns (uint256 remainingBal)
    {
        uint256 balance = _withdraw(_token, _amount, beneficiary);
        remainingBal = balance;
    }

    function getTokenBalance(address _token)
        external
        view
        returns (uint256 balance)
    {
        balance = balances[_token];
    }

    function _withdraw(
        address _token,
        uint256 _amount,
        address _to
    ) internal returns (uint256 remainingBal) {
        uint256 balance = balances[_token];
        require(balance >= _amount, "Trust: insufficient balance");

        IERC20(_token).transfer(_to, _amount);
        emit Withdrawal(_token, _to, _amount);

        balance -= _amount; // update current balance
        balances[_token] = balance; // update token balance in mapping
        remainingBal = balance;
    }
}
