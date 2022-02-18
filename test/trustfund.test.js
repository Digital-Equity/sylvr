const { assert } = require("chai");
const {
  constants,
  expectEvent, // Assertions for emitted events
  expectRevert, // Assertions for transactions that should fail
} = require("@openzeppelin/test-helpers");

const Trust = artifacts.require("Trust");
const Sylvr = artifacts.require("Sylvr");

contract("Trust", ([dev, factory, benefactor, beneficiary, attacker]) => {
  this.ethDeposit = web3.utils.toWei("1", "ether"); // 1 ETH
  this.erc20Deposit = web3.utils.toWei("5"); // 5 sylvr tokens
  this.mintAmount = web3.utils.toWei("10"); // 10 sylvr tokens
  this.maturityDate = 1845667890; // 1645067890

  beforeEach(async () => {
    this.trust = await Trust.new(benefactor, beneficiary, this.maturityDate, {
      from: factory,
    });
    this.sylvr = await Sylvr.new({ from: dev });
    // mint 5 tokens to the benefactor for testing
    await this.sylvr.mint(benefactor, this.mintAmount, { from: dev });
    // approve the contract to spend the SYLVR tokens on the benefactors behalf
    await this.sylvr.approve(this.trust.address, constants.MAX_UINT256, {
      from: benefactor,
    });
  });

  it("Should emit a deposit event when the benefactor deposits into trust", async () => {
    let receipt = await this.trust.deposit(
      this.sylvr.address,
      this.erc20Deposit,
      { from: benefactor }
    );

    expectEvent(receipt, "Deposit", {
      token: this.sylvr.address,
      from: benefactor,
      amount: this.erc20Deposit,
    });
  });

  it("Should give the trust fund have a balance of 5 Sylvr tokens", async () => {
    await this.trust.deposit(this.sylvr.address, this.erc20Deposit, {
      from: benefactor,
    });
    let balance = await this.sylvr.balanceOf.call(this.trust.address);

    assert.equal(this.erc20Deposit.toString(), balance.toString());
  });

  it("Should give the trust a balance of 1 ether after ETH deposit", async () => {
    await web3.eth.sendTransaction({
      to: this.trust.address,
      from: benefactor,
      value: this.ethDeposit,
    });
    let balance = await web3.eth.getBalance(this.trust.address);

    assert.equal(this.ethDeposit.toString(), balance.toString());
  });

  it("Should revert if anybody tries to withdraw ERC20 and isn't the benefactor", async () => {
    await this.trust.deposit(this.sylvr.address, this.erc20Deposit, {
      from: benefactor,
    });

    await expectRevert(
      this.trust.withdrawBenefactor(this.sylvr.address, this.erc20Deposit, {
        from: attacker,
      }),
      "Trust: caller is not the benefactor"
    );
  });

  it("Should revert if anybody tries to withdraw ETH and isn't the benefactor", async () => {
    await web3.eth.sendTransaction({
      to: this.trust.address,
      from: benefactor,
      value: this.ethDeposit,
    });
    await expectRevert(
      this.trust.withdrawETHBenefactor(this.ethDeposit, {
        from: attacker,
      }),
      "Trust: caller is not the benefactor"
    );
  });

  it("Should revert if anybody tries to payout ERC20 and isn't the benefactor", async () => {
    await this.trust.deposit(this.sylvr.address, this.erc20Deposit, {
      from: benefactor,
    });

    await expectRevert(
      this.trust.payout(this.sylvr.address, this.erc20Deposit, {
        from: attacker,
      }),
      "Trust: caller is not the benefactor"
    );
  });

  it("Should revert if anybody tries to payout ETH and isn't the benefactor", async () => {
    await web3.eth.sendTransaction({
      to: this.trust.address,
      from: benefactor,
      value: this.ethDeposit,
    });
    await expectRevert(
      this.trust.payoutEth(this.ethDeposit, {
        from: attacker,
      }),
      "Trust: caller is not the benefactor"
    );
  });

  it("Should transfer 5 sylvr to beneficiary upon payout call", async () => {
    await this.trust.deposit(this.sylvr.address, this.erc20Deposit, {
      from: benefactor,
    });
    await this.trust.payout(this.sylvr.address, this.erc20Deposit, {
      from: benefactor,
    });

    let balance = await this.sylvr.balanceOf(beneficiary);

    assert.equal(this.erc20Deposit.toString(), balance.toString());
  });

  it("Should emit Payment event upon payout call", async () => {
    await this.trust.deposit(this.sylvr.address, this.erc20Deposit, {
      from: benefactor,
    });
    let receipt = await this.trust.payout(
      this.sylvr.address,
      this.erc20Deposit,
      {
        from: benefactor,
      }
    );

    expectEvent(receipt, "Payment", {
      token: this.sylvr.address,
      to: beneficiary,
      amount: this.erc20Deposit,
    });
  });

  it("Should emit Payment event upon payoutEth call", async () => {
    await web3.eth.sendTransaction({
      to: this.trust.address,
      from: benefactor,
      value: this.ethDeposit,
    });
    let receipt = await this.trust.payoutEth(this.ethDeposit, {
      from: benefactor,
    });

    expectEvent(receipt, "Payment", {
      token: constants.ZERO_ADDRESS,
      to: beneficiary,
      amount: this.ethDeposit,
    });
  });

  it("Should emit a Withdrawal event when the benefactor withdraws ERC20 from trust", async () => {
    await this.trust.deposit(this.sylvr.address, this.erc20Deposit, {
      from: benefactor,
    });

    let receipt = await this.trust.withdrawBenefactor(
      this.sylvr.address,
      this.erc20Deposit,
      { from: benefactor }
    );

    expectEvent(receipt, "Withdrawal", {
      token: this.sylvr.address,
      amount: this.erc20Deposit,
      to: benefactor,
    });
  });

  it("Should emit a Withdrawal event when the benefactor withdraws ETH from trust", async () => {
    await web3.eth.sendTransaction({
      to: this.trust.address,
      from: benefactor,
      value: this.ethDeposit,
    });

    let receipt = await this.trust.withdrawETHBenefactor(this.ethDeposit, {
      from: benefactor,
    });

    expectEvent(receipt, "Withdrawal", {
      token: constants.ZERO_ADDRESS,
      to: benefactor,
      amount: this.ethDeposit,
    });
  });

  /**
   * =========================================================================================
   * BENIFICIARY ACTIONS
   */

  it("Should revert if beneficiary attempts to withdraw ETH before maturity", async () => {
    await web3.eth.sendTransaction({
      to: this.trust.address,
      from: benefactor,
      value: this.ethDeposit,
    });

    await expectRevert(
      this.trust.withdrawETHBeneficiary(this.ethDeposit, { from: beneficiary }),
      "Trust: trust has not matured"
    );
  });

  it("Should revert if beneficiary attempts to withdraw ERC20 before maturity", async () => {
    await this.trust.deposit(this.sylvr.address, this.erc20Deposit, {
      from: benefactor,
    });

    await expectRevert(
      this.trust.withdrawBeneficiary(this.sylvr.address, this.erc20Deposit, {
        from: beneficiary,
      }),
      "Trust: trust has not matured"
    );
  });

  it("Should revert if attacker tries to withdraw ERC20 instead of beneficiary", async () => {
    await this.trust.deposit(this.sylvr.address, this.erc20Deposit, {
      from: benefactor,
    });

    await expectRevert(
      this.trust.withdrawBeneficiary(this.sylvr.address, this.erc20Deposit, {
        from: attacker,
      }),
      "Trust: caller is not the beneficiary"
    );
  });

  it("Should revert if attacker tries to withdraw ETH instead of beneficiary", async () => {
    await web3.eth.sendTransaction({
      to: this.trust.address,
      from: benefactor,
      value: this.ethDeposit,
    });

    await expectRevert(
      this.trust.withdrawETHBeneficiary(this.ethDeposit, {
        from: attacker,
      }),
      "Trust: caller is not the beneficiary"
    );
  });
});
