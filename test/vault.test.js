const { assert } = require("chai");
const { expectEvent } = require("@openzeppelin/test-helpers");

const Sylvr = artifacts.require("Sylvr");
const Vault = artifacts.require("Vault");

contract("Vault", ([dev, user, user2]) => {
  this.deposit = web3.utils.toWei("50"); // 50 tokens
  this.symbol = web3.utils.asciiToHex("svETH");

  beforeEach(async () => {
    this.sylvr = await Sylvr.new({ from: dev });
    this.vault = await Vault.new(this.sylvr.address, this.symbol, {
      from: dev,
    });

    await this.sylvr.mint(user, this.deposit, { from: dev });
    await this.sylvr.approve(this.vault.address, this.deposit, { from: user });
  });

  it("Should have deployed the vault with dev as owner", async () => {
    let owner = await this.vault.owner.call();

    assert.equal(dev, owner);
  });

  it("Should emit a Deposit event upon successful deposit", async () => {
    let receipt = await this.vault.deposit(this.deposit, { from: user });

    expectEvent(receipt, "Deposit", { from: user, amount: this.deposit });
  });

  it("Should send 50 shares to depositor upon deposit", async () => {
    await this.vault.deposit(this.deposit, { from: user });
    let shares = await this.vault.balanceOf.call(user);
    let endBalance = await this.sylvr.balanceOf.call(user);

    assert.equal("0", endBalance.toString());
    assert.equal(shares.toString(), this.deposit.toString());
  });

  it("Should emit a withdraw event upon withdrawal", async () => {
    await this.vault.deposit(this.deposit, { from: user });
    let receipt = await this.vault.withdraw(this.deposit, { from: user });

    expectEvent(receipt, "Withdraw", { to: user, amount: this.deposit });
  });

  it("Should burn 50 shares and return 50 sylvr tokens to depositor", async () => {
    await this.vault.deposit(this.deposit, { from: user });
    await this.vault.withdraw(this.deposit, { from: user });

    // should be 50 after prior withdrawal
    let balance = await this.sylvr.balanceOf.call(user);
    // should be 0 after user withdrawal
    let outstandingShares = await this.vault.outstandingShares.call();

    assert.equal(balance.toString(), this.deposit.toString());
    assert.equal(outstandingShares, "0");
  });

  it("Should set outstandingShares to 50 after 2 deposits of 50 and 1 withdrawal of 50", async () => {
    await this.sylvr.mint(user2, this.deposit, { from: dev });
    await this.sylvr.approve(this.vault.address, this.deposit, { from: user2 });

    await this.vault.deposit(this.deposit, { from: user });
    await this.vault.deposit(this.deposit, { from: user2 });

    let shares = await this.vault.balanceOf.call(user2);

    await this.vault.withdraw(shares, { from: user2 });

    let balance = await this.sylvr.balanceOf.call(user2);
    let totalSupply = await this.vault.outstandingShares.call();

    assert.equal(this.deposit.toString(), balance.toString());
    assert.equal(totalSupply.toString(), this.deposit.toString());
  });
});
