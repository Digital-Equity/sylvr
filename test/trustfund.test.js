const { assert } = require("chai");
const {
  BN, // Big Number support
  expectEvent, // Assertions for emitted events
  expectRevert, // Assertions for transactions that should fail
} = require("@openzeppelin/test-helpers");

const TrustFund = artifacts.require("TrustFund");
const Sylvr = artifacts.require("Sylvr");

contract("TrustFund", async ([dev, parent, child, admin1, admin2]) => {
  this.deposit = new BN("5000000000000000000"); // 5 sylvr tokens
  this.mintAmount = new BN("10000000000000000000"); // 10 sylvr tokens

  beforeEach(async () => {
    this.trustFund = await TrustFund.new(child, { from: parent });
    this.sylvr = await Sylvr.new({ from: dev });

    await this.sylvr.mint(parent, this.mintAmount, { from: dev });
  });

  it("Should emit a deposit event when the parent deposits into trust", async () => {
    let receipt = await this.trustFund.deposit(this.sylvr.address, this.deposit, { from: parent });

    expectEvent(receipt, "Deposit", {
      token: this.sylvr.address,
      from: parent,
      amount: this.deposit,
    });
  });
});
