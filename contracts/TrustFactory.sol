// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "./interfaces/ITrust.sol";
import "./Trust.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";

contract TrustFactory is Ownable {
    address immutable trustImplementation;
    address[] public instances;

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
        instances.push(clone);
        instance = clone;
    }
}
