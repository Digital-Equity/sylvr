const { assert } = require("chai");
const { expectEvent, expectRevert } = require("@openzeppelin/test-helpers");

const MultiSig = artifacts.require("MultiSig");
const MultiSigFactory = artifacts.require("MultiSigFactory");

contract("MultiSigFactory", (dev, alice, bob, michael, attacker) => {
  beforeEach(async () => {
    this.multiSigFactory = MultiSigFactory.new({ from: dev });
    await this.multiSigFactory.deployMultiSig([alice, bob, michael], 2, {
      from: dev,
    });
  });
});
