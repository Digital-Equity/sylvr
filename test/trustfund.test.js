const { assert } = require("chai");
const {
  constants, 
  expectEvent, // Assertions for emitted events
  expectRevert, // Assertions for transactions that should fail
} = require("@openzeppelin/test-helpers");

const TrustFund = artifacts.require("TrustFund");
const Sylvr = artifacts.require("Sylvr");

contract("TrustFund", async ([dev, parent, child, attacker]) => {
  this.ethDeposit = web3.utils.toWei("1", "ether"); // 1 ETH
  this.erc20Deposit = web3.utils.toWei("5"); // 5 sylvr tokens
  this.mintAmount = web3.utils.toWei("10"); // 10 sylvr tokens

  beforeEach(async () => {
    this.trustFund = await TrustFund.new(child, { from: parent });
    this.sylvr = await Sylvr.new({ from: dev });

    await this.sylvr.mint(parent, this.mintAmount, { from: dev }); // mint 5 tokens to the parent for testing
    // approve the contract to spend the SYLVR tokens on the parent behalf
    await this.sylvr.approve(this.trustFund.address, constants.MAX_UINT256, {
      from: parent,
    });
  });

  it("Should emit a deposit event when the parent deposits into trust", async () => {
    let receipt = await this.trustFund.deposit(
      this.sylvr.address,
      this.erc20Deposit,
      { from: parent }
    );

    expectEvent(receipt, "Deposit", {
      token: this.sylvr.address,
      from: parent,
      amount: this.erc20Deposit,
    });
  });

  it("Should give the trust fund have a balance of 5 Sylvr tokens", async () => {
    await this.trustFund.deposit(this.sylvr.address, this.erc20Deposit, {
      from: parent,
    });
    let balance = await this.sylvr.balanceOf.call(this.trustFund.address);

    assert.equal(this.erc20Deposit.toString(), balance.toString());
  });

  it("Should give the trust a balance of 1 ether after ETH deposit", async () => {
    await web3.eth.sendTransaction({
      to: this.trustFund.address,
      from: parent,
      value: this.ethDeposit,
    });
    let balance = await web3.eth.getBalance(this.trustFund.address);

    assert.equal(this.ethDeposit.toString(), balance.toString());
  });

  it("Should revert if anybody tries to withdraw ERC20 and isn't the owner", async () => {
    await this.trustFund.deposit(this.sylvr.address, this.erc20Deposit, {
      from: parent,
    });

    await expectRevert(
      this.trustFund.withdraw(this.sylvr.address, this.erc20Deposit, {
        from: attacker,
      }),
      "Ownable: caller is not the owner"
    );
  });

  it("Should revert if anybody tries to withdraw ETH and isn't the owner", async () => {
    await web3.eth.sendTransaction({
      to: this.trustFund.address,
      from: parent,
      value: this.ethDeposit,
    });
    await expectRevert(
      this.trustFund.withdrawEth(this.ethDeposit, {
        from: attacker,
      }),
      "Ownable: caller is not the owner"
    );
  });

  it("Should revert if anybody tries to payout ERC20 and isn't the owner", async () => {
    await this.trustFund.deposit(this.sylvr.address, this.erc20Deposit, {
      from: parent,
    });

    await expectRevert(
      this.trustFund.payout(this.sylvr.address, this.erc20Deposit, {
        from: attacker,
      }),
      "Ownable: caller is not the owner"
    );
  });

  it("Should revert if anybody tries to payout ETH and isn't the owner", async () => {
    await web3.eth.sendTransaction({
      to: this.trustFund.address,
      from: parent,
      value: this.ethDeposit,
    });
    await expectRevert(
      this.trustFund.payoutEth(this.ethDeposit, {
        from: attacker,
      }),
      "Ownable: caller is not the owner"
    );
  });

  it("Should transfer 5 sylvr to beneficiary upon payout call", async () => {
    await this.trustFund.deposit(this.sylvr.address, this.erc20Deposit, {
      from: parent,
    });
    await this.trustFund.payout(this.sylvr.address, this.erc20Deposit, {
      from: parent,
    });

    let balance = await this.sylvr.balanceOf(child);

    assert.equal(this.erc20Deposit.toString(), balance.toString());
  });

  it("Should emit Payment event upon payout call", async () => {
    await this.trustFund.deposit(this.sylvr.address, this.erc20Deposit, {
      from: parent,
    });
    let receipt = await this.trustFund.payout(
      this.sylvr.address,
      this.erc20Deposit,
      {
        from: parent,
      }
    );

    expectEvent(receipt, "Payment", {
      token: this.sylvr.address,
      to: child,
      amount: this.erc20Deposit,
    });
  });

  it("Should emit Payment event upon payoutEth call", async () => {
    await web3.eth.sendTransaction({
      to: this.trustFund.address,
      from: parent,
      value: this.ethDeposit,
    });
    let receipt = await this.trustFund.payoutEth(this.ethDeposit, {
      from: parent,
    });

    expectEvent(receipt, "Payment", {
      token: constants.ZERO_ADDRESS,
      to: child,
      amount: this.ethDeposit,
    });
  });
});
