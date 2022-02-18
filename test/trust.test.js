const { assert } = require("chai");
const {
  constants,
  expectEvent, // Assertions for emitted events
  expectRevert, // Assertions for transactions that should fail
} = require("@openzeppelin/test-helpers");

const Sylvr = artifacts.require("Sylvr");
const Trust = artifacts.require("Trust");
const TrustFactory = artifacts.require("TrustFactory");

contract("Trust", ([dev, benefactor, beneficiary, attacker]) => {
  this.erc20Deposit = web3.utils.toWei("5"); // 5 sylvr tokens
  this.mintAmount = web3.utils.toWei("10"); // 10 sylvr tokens
  this.maturityDate = 1845667890; // 06/28/2028

  beforeEach(async () => {
    this.trustFactory = await TrustFactory.new({ from: dev });
    let trustCloneTx = await this.trustFactory.deployTrust(
      benefactor,
      beneficiary,
      this.maturityDate,
      { from: dev }
    );
    // the logs will contain the address to the new trust clone
    let cloneAddress = trustCloneTx.logs[0].args.contractAddr;
    this.trust = await Trust.at(cloneAddress);
    this.sylvr = await Sylvr.new({ from: dev });
    // mint 5 tokens to the benefactor for testing
    await this.sylvr.mint(benefactor, this.mintAmount, { from: dev });
    // approve the contract to spend the SYLVR tokens on the benefactors behalf
    await this.sylvr.approve(this.trust.address, constants.MAX_UINT256, {
      from: benefactor,
    });
  });

  it("Should emit a deposit event when somebody deposits into trust", async () => {
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

  it("Should emit a Withdrawal event when the benefactor withdraws from trust", async () => {
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

  /**
   * =========================================================================================
   * BENIFICIARY ACTIONS
   */

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
});
