const { assert } = require("chai");
const { expectEvent } = require("@openzeppelin/test-helpers");

const Sylvr = artifacts.require("Sylvr");
const Vault = artifacts.require("Vault");

contract("Vault", ([dev, user]) => {
  this.deposit = web3.utils.toWei("50"); // 50 tokens

  beforeEach(async () => {
    this.sylvr = await Sylvr.new({ from: dev });
    this.vault = await Vault.new(this.sylvr.address, { from: dev });

    await this.sylvr.mint(user, this.deposit, { from: dev });
    await this.sylvr.approve(this.vault.address, this.deposit, { from: user });
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

  it("Should emit a withdrawal event upon withdrawal", async () => {
    await this.vault.deposit(this.deposit, { from: user });
    let receipt = await this.vault.withdraw(this.deposit, { from: user });

    expectEvent(receipt, "Withdrawal", { to: user, amount: this.deposit });
  });

  it("Should burn 50 shares and return 50 sylvr tokens to depositor", async () => {
    await this.vault.deposit(this.deposit, { from: user });
    await this.vault.withdraw(this.deposit, { from: user });

    // should be 50 after prior withdrawal
    let balance = await this.sylvr.balanceOf.call(user);
    // should be 0 after user withdrawal
    let totalSupply = await this.vault.totalSupply.call();

    assert.equal(balance.toString(), this.deposit.toString());
    assert.equal(totalSupply, "0");
  });
});
