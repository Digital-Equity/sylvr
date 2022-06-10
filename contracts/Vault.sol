// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Vault is Ownable, ReentrancyGuard {
    IERC20 public immutable token;
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;

    event Deposit(address indexed from, uint256 amount);
    event Withdrawal(address indexed to, uint256 amount);

    constructor(address _token) {
        token = IERC20(_token);
    }

    function _mint(address _to, uint256 _amount) private {
        totalSupply += _amount;
        balanceOf[_to] += _amount;
    }

    function _burn(address _from, uint256 _amount) private {
        totalSupply -= _amount;
        balanceOf[_from] -= _amount;
    }

    function deposit(uint256 _amount) external {
        // we will need to mint shares to represent their deposited balance
        /**
        a = amount
        B = balance of token before deposit
        T = total supply
        s = shares to mint
       */
        // (T + s) / T = (a + b) / B
        require(token.transferFrom(msg.sender, address(this), _amount));

        uint256 shares;
        if (totalSupply == 0) {
            shares = _amount;
        } else {
            shares = (_amount * totalSupply) / token.balanceOf(address(this));
        }

        _mint(msg.sender, shares);
        emit Deposit(msg.sender, _amount);
    }

    function withdraw(uint256 _shares) external nonReentrant {
        uint256 amount = (_shares * token.balanceOf(address(this))) /
            totalSupply;
        require(balanceOf[msg.sender] >= amount);

        _burn(msg.sender, _shares);
        token.transfer(msg.sender, amount);
        emit Withdrawal(msg.sender, amount);
    }
}
