// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "./interfaces/IMultiSig.sol";
import "./MultiSig.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";

contract MultiSigFactory is Ownable {
    address immutable implementation;
    address[] private instances;

    event NewMultiSig(address indexed contractAddr);

    constructor() {
        implementation = address(new MultiSig());
    }

    function deployMultiSig(address[] memory _owners, uint8 _requiredVotes)
        external
        onlyOwner
        returns (address instance)
    {
        address clone = Clones.clone(implementation);
        IMultiSig(clone).initialize(_owners, _requiredVotes);

        instances.push(clone);
        emit NewMultiSig(clone);

        instance = clone;
    }
}
