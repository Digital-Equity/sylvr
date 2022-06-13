const { assert } = require("chai");
const { expectEvent, expectRevert } = require("@openzeppelin/test-helpers");

const Vault = artifacts.require("Vault");
const VaultFactory = artifacts.require("VaultFactory");
const Sylvr = artifacts.require("Sylvr");

contract("VaultFactory", ([dev]) => {
  beforeEach(async () => {
    this.sylvr = await Sylvr.new({ from: dev });
    this.vaultFactory = await VaultFactory.new({ from: dev });
    let deploymentTx = await this.vaultFactory.deployVault(this.sylvr.address, {
      from: dev,
    });
  });
});
