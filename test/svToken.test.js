const { assert } = require("chai");
const { expectRevert } = require("@openzeppelin/test-helpers");
const expectEvent = require("@openzeppelin/test-helpers/src/expectEvent");

const SVToken = artifacts.require("SVToken");

contract("SylvrVaultToken", ([dev, user]) => {
  this.mintAmount = web3.utils.toWei("50");

  beforeEach(async () => {
    this.svToken = await SVToken.new("svETH", { from: dev });
  });

  it("Should emit a Mint event upon minting to user", async () => {
    let receipt = await this.svToken.mint(user, this.mintAmount, { from: dev });

    expectEvent(receipt, "Mint", { to: user, amount: this.mintAmount });
  });

  it("Should Mint 50 svETH to user and update outstanding to 50", async () => {
    await this.svToken.mint(user, this.mintAmount, { from: dev });

    let balance = await this.svToken.balanceOf(user); // should be 50 after mint
    let outstanding = await this.svToken.outstanding.call(); // should be 50

    assert(this.mintAmount.toString(), balance.toString());
    assert(this.mintAmount.toString(), outstanding.toString());
  });

  it("Should emit a Burn event upon burning from user", async () => {
    await this.svToken.mint(user, this.mintAmount, { from: dev });

    let receipt = await this.svToken.burn(this.mintAmount, {
      from: user,
    });

    expectEvent(receipt, "Burn", { from: user, amount: this.mintAmount });
  });

  it("Should Burn 50 from user, reducing the outstanding to 0", async () => {
    await this.svToken.mint(user, this.mintAmount, { from: dev });
    await this.svToken.burn(this.mintAmount, { from: user });

    let balance = await this.svToken.balanceOf.call(user); // should be 0 after burn
    let outstanding = await this.svToken.outstanding.call(); // should be 0

    assert.equal("0", balance.toString());
    assert.equal("0", outstanding.toString());
  });

  it("Should revert if somebody other than owner tries to mint", async () => {
    await expectRevert(
      this.svToken.mint(user, this.mintAmount, { from: user }),
      "Ownable: "
    );
  });
});
