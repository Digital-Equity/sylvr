const { assert } = require("chai");
const {
  BN, // Big Number support
  constants, //
  expectEvent, // Assertions for emitted events
  expectRevert, // Assertions for transactions that should fail
} = require("@openzeppelin/test-helpers");

const TrustFund = artifacts.require("TrustFund");

contract("TrustFund", async ([dev, parent, child, admin1, admin2]) => {
  this.deposit = new BN("5000000000000000000"); // 5 eth

  beforeEach(async () => {
    const trustFund = await TrustFund.new(child, { from: parent });
  });
});
