const { assert } = require("chai");
const {
  constants,
  expectEvent, // Assertions for emitted events
  expectRevert, // Assertions for transactions that should fail
} = require("@openzeppelin/test-helpers");

const TrustFactory = artifacts.require("TrustFactory");

contract("TrustFactory", ([dev, benefactor, beneficiary]) => {});
