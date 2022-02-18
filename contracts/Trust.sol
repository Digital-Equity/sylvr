// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "./interfaces/ITrust.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Trust is ITrust, ReentrancyGuard {
    address public immutable benefactor;
    address public immutable beneficiary;
    uint256 public immutable deploymentTimestamp;
    uint256 public immutable maturityDate;
    address[] public tokens;
    mapping(address => bool) tokenExists;
    mapping(address => uint256) balances;

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

    constructor(
        address _benefactor,
        address _beneficiary,
        uint256 _maturityDate
    ) {
        benefactor = _benefactor;
        beneficiary = _beneficiary;
        deploymentTimestamp = block.timestamp;
        maturityDate = _maturityDate;
    }

    // accept eth and emit deposit event
    receive() external payable {
        emit Deposit(address(0), msg.sender, msg.value);
    }

    // accept ERC20 deposits
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

    function payoutEth(uint256 _amount) external payable onlyBenefactor {
        require(
            address(this).balance >= _amount,
            "Trust: insufficient ETH balance"
        );
        payable(beneficiary).transfer(_amount);

        emit Payment(address(0), beneficiary, _amount);
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

    function withdrawETHBenefactor(uint256 _amount)
        external
        onlyBenefactor
        returns (uint256 remainingBal)
    {
        _withdrawETH(_amount, benefactor);
        remainingBal = address(this).balance;
    }

    function withdrawETHBeneficiary(uint256 _amount)
        external
        onlyBeneficiary
        hasMatured
        returns (uint256 remainingBal)
    {
        _withdrawETH(_amount, beneficiary);
        remainingBal = address(this).balance;
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

    function _withdrawETH(uint256 _amount, address _to) internal {
        require(
            address(this).balance >= _amount,
            "Trust: insufficient balance"
        );

        (bool success, ) = _to.call{value: _amount}("");
        require(success, "failed to send ether");
        emit Withdrawal(address(0), _to, _amount);
    }
}
