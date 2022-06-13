// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./Vault.sol";
import "./interfaces/IVault.sol";

contract VaultFactory is Ownable {
    uint256 public vaultCount;
    address public implementation;
    address[] public svTokens;
    mapping(address => VaultDetails) vaults;

    event NewVault(address indexed instance, address indexed token);

    struct VaultDetails {
        bytes32 name;
        address token;
        address instance;
        uint32 deploymentTimestamp;
    }

    constructor() {
        implementation = address(new Vault());
    }

    function deployVault(address _token, bytes32 _symbol) external onlyOwner {
        address clone = Clones.clone(implementation);
        IVault(clone).initialize(_token, _symbol);

        vaults[clone] = VaultDetails({
            name: _symbol,
            token: _token,
            instance: clone,
            deploymentTimestamp: uint32(block.timestamp)
        });

        emit NewVault(clone, _token);
    }
}
