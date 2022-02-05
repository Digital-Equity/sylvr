const { assert } = require("chai");
const { BN, expectRevert } = require("@openzeppelin/test-helpers");

const Sylvr = artifacts.require("Sylvr");

contract("Sylvr", ([dev, user]) => {
  this.maxSupply = new BN("500000000000000000000000000"); // 500M tokens
  this.mintAmount = new BN("1000000000000000000000000"); // 1M tokens

  beforeEach(async () => {
    this.sylvr = await Sylvr.new({ from: dev });
  });

  it("Should deploy a token with a maximum supply of 500M tokens", async () => {
    let totalSupply = await this.sylvr.maxSupply.call();
    assert.equal(totalSupply, this.maxSupply.toString());
  });

  it("Should Mint 1M tokens to the dev address", async () => {
    await this.sylvr.mint(dev, this.mintAmount, { from: dev });
    let balance = await this.sylvr.balanceOf(dev);

    assert(balance.toString(), this.mintAmount.toString());
  });

  it("Should have a total supply of 1M after minting 1M to dev address", async () => {
    await this.sylvr.mint(dev, this.mintAmount, { from: dev });
    let totalSupply = await this.sylvr.totalSupply.call();

    assert.equal(totalSupply.toString(), this.mintAmount.toString());
  })

  it("Should revert if somebody other than the owner tries to mint", async () => {
    await expectRevert(
      this.sylvr.mint(user, this.mintAmount, { from: user }),
      "Ownable: caller is not the owner"
    );
  });

  it("Should revert if the mint exceeps maximum supply", async () => {
    await expectRevert(
      this.sylvr.mint(user, this.maxSupply + 1, {from: dev}),
      "SYLVR: Mint amount exceeds max supply"
    )
  })
});
