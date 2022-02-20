// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "./interfaces/ITrust.sol";
import "./Trust.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";

contract TrustFactory is Ownable {
    address immutable trustImplementation;
    address[] private instanceAddresses;
    mapping(address => address[]) public trustDeployments;

    event NewTrust(address indexed contractAddr);

    constructor() {
        trustImplementation = address(new Trust());
    }

    function deployTrust(
        address _benefactor,
        address _beneficiary,
        uint256 _maturityDate
    ) external onlyOwner returns (address instance) {
        address clone = Clones.clone(trustImplementation);
        Trust(clone).initialize(_benefactor, _beneficiary, _maturityDate);
        // emit event so that we can grab the address to new clone via logs
        emit NewTrust(clone);
        instanceAddresses.push(clone);
        trustDeployments[_benefactor].push(clone);
        trustDeployments[_beneficiary].push(clone);
        instance = clone;
    }

    function getInstanceCount() external view returns (uint256) {
        return instanceAddresses.length;
    }

    function getTrusts(address _client) external view returns (address[] memory) {
        return trustDeployments[_client];
    }
}
