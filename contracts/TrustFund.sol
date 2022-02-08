// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "./interfaces/ITrust.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract TrustFund is ITrust, Ownable, ReentrancyGuard {
    address public immutable beneficiary;
    // uint256 public immutable deploymentTimestamp;
    // uint256 public immutable maturityDate;
    address[] public tokens;
    mapping(address => uint256) balances;

    constructor(address _beneficiary) {
        beneficiary = _beneficiary;
        // deploymentTimestamp = block.timestamp;
        // maturityDate = block.timestamp + _daysUntilMaturity;
    }

    // accept eth and emit deposit event
    receive() external payable {
        emit Deposit(address(0), msg.sender, msg.value);
    }

    // accept ERC20 deposits
    function deposit(address _token, uint256 _amount)
        external
        nonReentrant
        returns (uint256)
    {
        require(
            IERC20(_token).allowance(msg.sender, address(this)) >= _amount,
            "Insufficient allowance"
        );
        require(
            IERC20(_token).balanceOf(msg.sender) >= _amount,
            "Insufficient balance"
        );

        // check if current token exists, if not push to token array
        if (!_tokenExists(_token)) {
            tokens.push(_token);
        }

        IERC20(_token).transferFrom(msg.sender, address(this), _amount); // transfer ERC20 to contract
        balances[_token] += _amount; // update balance for token

        emit Deposit(_token, msg.sender, _amount);
        return balances[_token];
    }

    // payout ERC20 tokens
    function payout(address _token, uint256 _amount)
        external
        onlyOwner
        returns (uint256)
    {
        require(IERC20(_token).balanceOf(address(this)) >= _amount);

        balances[_token] -= _amount; // update token balances
        IERC20(_token).transfer(beneficiary, _amount);

        emit Payment(_token, beneficiary, _amount);
        return balances[_token];
    }

    function payoutEth(uint256 _amount) external payable onlyOwner {
        require(
            address(this).balance >= _amount,
            "TrustFund: Zero ETH balance"
        );
        payable(beneficiary).transfer(_amount);

        emit Payment(address(0), beneficiary, _amount);
    }

    function withdraw(address _token, uint256 _amount) external onlyOwner {
        require(balances[_token] > _amount, "TrustFund: Zero balance");
        uint256 balance = balances[_token];

        IERC20(_token).transferFrom(address(this), msg.sender, balance);
        balances[_token] -= _amount; // update token balance
        emit Withdrawal(_token, _amount, msg.sender);
    }

    function withdrawEth(uint256 _amount) external onlyOwner {
        require(address(this).balance > _amount, "TrustFund: Zero balance");

        payable(msg.sender).transfer(_amount);
    }

    function _tokenExists(address _token) internal view returns (bool) {
        for (uint256 i = 0; i < tokens.length; i++) {
            if (_token == tokens[i]) {
                return true;
            }
        }

        return false;
    }
}
