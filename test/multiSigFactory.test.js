const { assert } = require("chai");
const { hashAddressArray } = require("./utils");
const { expectEvent, expectRevert } = require("@openzeppelin/test-helpers");

const MultiSig = artifacts.require("MultiSig");
const MultiSigFactory = artifacts.require("MultiSigFactory");

contract("MultiSigFactory", ([dev, alice, bob, michael, attacker]) => {
  beforeEach(async () => {
    this.multiSigFactory = await MultiSigFactory.new({ from: dev });
    let deploymentTx = await this.multiSigFactory.deployMultiSig(
      [alice, bob, michael],
      2,
      {
        from: dev,
      }
    );

    let contractAddr = deploymentTx.logs[0].args.contractAddr;
    this.multiSig = await MultiSig.at(contractAddr);
  });

  it("Should emit a New Multi Sig event upon deploying new multisig", async () => {
    let receipt = await this.multiSigFactory.deployMultiSig(
      [bob, alice, michael],
      2,
      {
        from: dev,
      }
    );
    let { multiSigId, contractAddr } = receipt.logs[0].args;

    expectEvent(receipt, "NewMultiSig", {
      multiSigId,
      contractAddr,
    });
  });

  it("Should have deployed one contract", async () => {
    let count = await this.multiSigFactory.getInstanceCount();

    assert.equal(count, 1);
  });

  it("Should have stored the correct multi sig at the hash of owners array", async () => {
    const owners = [alice, bob, michael];
    const hash = hashAddressArray(owners);
    const instanceAddr = await this.multiSigFactory.getInstance(hash);

    assert.equal(instanceAddr, this.multiSig.address);
  });

  it("Should revert if there was no instance found at that hash", async () => {
    const owners = [alice, attacker];
    const hash = hashAddressArray(owners);

    await expectRevert(
      this.multiSigFactory.getInstance(hash),
      "MultiSig: invalid multisig id"
    );
  });

  it("Should revert if the same owners try to deploy another multisig", async () => {
    const owners = [alice, bob, michael];
    await expectRevert(
      this.multiSigFactory.deployMultiSig(owners, 2, { from: dev }),
      "MultiSig: multisig exists already"
    );
  });
});
