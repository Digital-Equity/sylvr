const { assert } = require("chai");
const { expectEvent, expectRevert } = require("@openzeppelin/test-helpers");

const TrustFactory = artifacts.require("TrustFactory");

contract("TrustFactory", ([dev, benefactor, beneficiary, attacker]) => {
  this.maturityDate = 1845667890; // 06/28/2028

  beforeEach(async () => {
    this.trustFactory = await TrustFactory.new({ from: dev });
    await this.trustFactory.deployTrust(
      benefactor,
      beneficiary,
      this.maturityDate,
      { from: dev }
    );
  });

  it("Should have deployed one contract", async () => {
    let count = await this.trustFactory.getInstanceCount();
    assert.equal(1, count);
  });

  it("Should emit a NewTrust event upon successful deployment of clone", async () => {
    let receipt = await this.trustFactory.deployTrust(
      benefactor,
      beneficiary,
      this.maturityDate,
      { from: dev }
    );

    let trustAddr = receipt.logs[0].args.contractAddr;

    expectEvent(receipt, "NewTrust", {
      contractAddr: trustAddr,
    });
  });

  it("Should have deployed two contracts (including the one from beforeEach method) ", async () => {
    await this.trustFactory.deployTrust(
      benefactor,
      beneficiary,
      this.maturityDate,
      { from: dev }
    );

    let count = await this.trustFactory.getInstanceCount();
    assert.equal(2, count);
  });

  it("Should return an array of addresses associated with input address", async () => {
    let trusts = await this.trustFactory.getTrusts(benefactor);

    assert.isTrue(trusts instanceof Array);
  });


  it("Should have one contract at the benefactors address", async () => {
    let trusts = await this.trustFactory.getTrusts(benefactor);

    assert.equal(1, trusts.length);
  });

  it("Should return the same address for beneficiary and benefactor trust", async () => {
    let benefactorTrusts = await this.trustFactory.getTrusts(benefactor);
    let beneficiaryTrusts = await this.trustFactory.getTrusts(beneficiary);

    assert.deepEqual(benefactorTrusts, beneficiaryTrusts);
  })

  it("should revert if caller is not the owner", async () => {
    await expectRevert(
      this.trustFactory.deployTrust(
        benefactor,
        beneficiary,
        this.maturityDate,
        { from: attacker }
      ),
      "Ownable: caller is not the owner"
    );
  });
});
