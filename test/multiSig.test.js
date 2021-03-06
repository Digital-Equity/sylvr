const { assert } = require("chai");
const { expectRevert, expectEvent } = require("@openzeppelin/test-helpers");

const MultiSig = artifacts.require("MultiSig");
const MultiSigFactory = artifacts.require("MultiSigFactory");

contract(
  "MultiSig",
  ([dev, alice, bob, michael, daniel, attacker, contractor]) => {
    this.deposit = web3.utils.toWei("1", "ether");
    this.data = web3.utils.asciiToHex("send 1 eth for nft");

    beforeEach(async () => {
      this.multiSigFactory = await MultiSigFactory.new({ from: dev });
      let multiSigCloneTx = await this.multiSigFactory.deployMultiSig(
        [alice, bob, daniel, michael],
        3,
        { from: dev }
      );
      let cloneAddress = multiSigCloneTx.logs[0].args.contractAddr;
      this.multiSig = await MultiSig.at(cloneAddress);

      await web3.eth.sendTransaction({
        to: this.multiSig.address,
        from: alice,
        value: this.deposit,
      });
      await web3.eth.sendTransaction({
        to: this.multiSig.address,
        from: bob,
        value: this.deposit,
      });
      await web3.eth.sendTransaction({
        to: this.multiSig.address,
        from: daniel,
        value: this.deposit,
      });
      await web3.eth.sendTransaction({
        to: this.multiSig.address,
        from: michael,
        value: this.deposit,
      });
    });

    it("Should give the multisig a balance of 4ETH to start", async () => {
      let balance = await web3.eth.getBalance(this.multiSig.address);

      assert.equal(
        web3.utils.toWei("4", "ether").toString(),
        balance.toString()
      );
    });

    it("Should emit a Submit event when Alice adds new transaction", async () => {
      let receipt = await this.multiSig.submitTransaction(
        contractor,
        this.deposit,
        this.data,
        { from: alice }
      );
      expectEvent(receipt, "Submit", {
        txId: "0",
      });
    });

    it("Should emit an Approve event when Bob approves alice's transaction", async () => {
      await this.multiSig.submitTransaction(
        contractor,
        this.deposit,
        this.data,
        {
          from: alice,
        }
      );

      let receipt = await this.multiSig.approve("0", { from: bob });

      expectEvent(receipt, "Approve", { from: bob, txId: "0" });
    });

    it("Should revert when somebody tries to execute transaction without enough votes", async () => {
      await this.multiSig.submitTransaction(
        contractor,
        this.deposit,
        this.data,
        {
          from: alice,
        }
      );

      await expectRevert(
        this.multiSig.execute(0, { from: bob }),
        "MultiSig: Transaction does not have enough approvals"
      );
    });

    it("Should revert if somebody that isn't an owner tries to execute transaction", async () => {
      await this.multiSig.submitTransaction(
        contractor,
        this.deposit,
        this.data,
        {
          from: alice,
        }
      );

      await expectRevert(
        this.multiSig.execute(0, { from: attacker }),
        "MultiSig: Caller is not an owner"
      );
    });

    it("Should emit an Execute event if the required vote count is met", async () => {
      await this.multiSig.submitTransaction(
        contractor,
        this.deposit,
        this.data,
        {
          from: alice,
        }
      );

      await this.multiSig.approve(0, { from: bob });
      await this.multiSig.approve(0, { from: daniel });
      await this.multiSig.approve(0, { from: michael });

      let receipt = await this.multiSig.execute(0, { from: alice });
      expectEvent(receipt, "Execute", { txId: "0" });
    });

    it("Should emit a Revoke event after an owner changes their vote", async () => {
      await this.multiSig.submitTransaction(
        contractor,
        this.deposit,
        this.data,
        {
          from: alice,
        }
      );

      await this.multiSig.approve(0, { from: bob });
      await this.multiSig.approve(0, { from: daniel });

      let receipt = await this.multiSig.revoke(0, { from: daniel });
      expectEvent(receipt, "Revoke", {
        from: daniel,
        txId: "0",
      });
    });

    it("Should revert due to change of votes after initially meeting required vote count", async () => {
      await this.multiSig.submitTransaction(
        contractor,
        this.deposit,
        this.data,
        {
          from: alice,
        }
      );

      await this.multiSig.approve(0, { from: bob });
      await this.multiSig.approve(0, { from: daniel });
      await this.multiSig.approve(0, { from: michael }); // currently meets the requirement of 3 votes of approval

      await this.multiSig.revoke(0, { from: daniel });

      await expectRevert(
        this.multiSig.execute(0, { from: alice }),
        "MultiSig: Transaction does not have enough approvals"
      );
    });
  }
);
