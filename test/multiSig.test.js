const { assert } = require("chai");
const { expectRevert, expectEvent } = require("@openzeppelin/test-helpers");

const MultiSig = artifacts.require("MultiSig");

contract("MultiSig", ([alice, bob, michael, daniel, attacker, seller]) => {
  this.deposit = web3.utils.toWei("1", "ether");
  this.data = web3.utils.asciiToHex("send 1 eth for nft");

  beforeEach(async () => {
    this.multiSig = await MultiSig.new([alice, bob, michael, daniel], 3, {
      from: bob,
    });

    await this.multiSig.deposit({ from: alice, value: this.deposit });
    await this.multiSig.deposit({ from: bob, value: this.deposit });
    await this.multiSig.deposit({ from: daniel, value: this.deposit });
    await this.multiSig.deposit({ from: michael, value: this.deposit });
  });

  it("Should emit a Submit event when Alice adds new transaction", async () => {
    let receipt = await this.multiSig.submitTransaction(
      seller,
      this.deposit,
      this.data,
      { from: alice }
    );
    expectEvent(receipt, "Submit", {
      txId: "0",
    });
  });

  it("Should emit an Approve event when Bob approves alice's transaction", async () => {
    await this.multiSig.submitTransaction(seller, this.deposit, this.data, {
      from: alice,
    });

    let receipt = await this.multiSig.approve("0", { from: bob });

    expectEvent(receipt, "Approve", { from: bob, txId: "0" });
  });
});
