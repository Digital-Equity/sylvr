const { assert } = require("chai");
const {
  BN, // Big Number support
  constants, //
  expectEvent, // Assertions for emitted events
  expectRevert, // Assertions for transactions that should fail
} = require("@openzeppelin/test-helpers");

const Sylvr = artifacts.require("Sylvr");

contract("Sylvr", async ([dev]) => {
  beforeEach(async () => {
    this.sylvr = Sylvr.new({ from: dev });
  });
});
