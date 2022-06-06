const { assert } = require("chai");
const { expectRevert, expectEvent } = require("@openzeppelin/test-helpers");

const Sylvr = artifacts.require("Sylvr");
const Vault = artifacts.require("Vault");

contract("Vault", ([dev, user]) => {
  this.deposit = web3.utils.toWei("100"); // 1M tokens

  beforeEach(async () => {
    this.sylvr = await Sylvr.new({ from: dev });
    this.vault = await Vault.new(this.sylvr.address, { from: dev });

    await this.sylvr.mint(user, 1000, { from: dev });
  });

  it("Should deploy a new vault and issue 100 shares to depositor", async () => {
    
  });
});
