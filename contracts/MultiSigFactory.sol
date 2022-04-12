// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "./interfaces/IMultiSig.sol";
import "./MultiSig.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";

contract MultiSigFactory is Ownable {
    address immutable implementation;
    address[] private instanceAddresses;
    mapping(bytes => address) public instances;

    event NewMultiSig(bytes indexed multiSigId, address indexed contractAddr);

    constructor() {
        implementation = address(new MultiSig());
    }

    function deployMultiSig(address[] memory _owners, uint8 _requiredVotes)
        external
        onlyOwner
        returns (address multiSig)
    {
        bytes memory multiSigId = _hashInstanceId(_owners);
        require(
            instances[multiSigId] == address(0),
            "MultiSig: multisig exists already"
        );

        address clone = Clones.clone(implementation);
        IMultiSig(clone).initialize(_owners, _requiredVotes);

        instanceAddresses.push(clone);
        instances[multiSigId] = clone; // store the multisig address at the hash of owners array

        emit NewMultiSig(multiSigId, clone);
        multiSig = clone;
    }

    function getInstanceCount() external view returns (uint256 count) {
        count = instanceAddresses.length;
    }

    function getInstance(bytes memory _multiSigId)
        external
        view
        returns (address)
    {
        address instance = instances[_multiSigId];
        require(instance != address(0), "MultiSig: invalid multisig id");
        return instance;
    }

    function _hashInstanceId(address[] memory _owners)
        internal
        pure
        returns (bytes memory multiSigId)
    {
        for (uint256 i = 0; i < _owners.length; i++) {
            multiSigId = abi.encodePacked(multiSigId, _owners[i]);
        }
    }
}
