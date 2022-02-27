// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "./interfaces/ITrust.sol";
import "./Trust.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";

contract TrustFactory is Ownable {
    address immutable implementation;
    address[] private instanceAddresses;
    mapping(address => address[]) public instances;

    event NewTrust(address indexed contractAddr);

    constructor() {
        implementation = address(new Trust());
    }

    function deployTrust(
        address _benefactor,
        address _beneficiary,
        uint256 _maturityDate
    ) external onlyOwner returns (address trust) {
        address clone = Clones.clone(implementation);
        ITrust(clone).initialize(_benefactor, _beneficiary, _maturityDate);
        // emit event so that we can grab the address to new clone via logs
        emit NewTrust(clone);
        instanceAddresses.push(clone);
        instances[_benefactor].push(clone);
        instances[_beneficiary].push(clone);
        trust = clone;
    }

    function getInstanceCount() external view returns (uint256) {
        return instanceAddresses.length;
    }

    function getTrusts(address _client)
        external
        view
        returns (address[] memory)
    {
        return instances[_client];
    }
}
