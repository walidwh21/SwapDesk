const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PositionRegistry", () => {
  let registry, alice, bob;

  beforeEach(async () => {
    [alice, bob] = await ethers.getSigners();
    const Registry = await ethers.getContractFactory("PositionRegistry");
    registry = await Registry.deploy();
    await registry.deployed();
  });

  it("stores entries per account", async () => {
    const pool = ethers.Wallet.createRandom().address;
    const t0 = ethers.Wallet.createRandom().address;
    const t1 = ethers.Wallet.createRandom().address;

    await registry.connect(alice).record(pool, t0, t1, 3000);

    expect(await registry.countOf(alice.address)).to.equal(1);
    expect(await registry.countOf(bob.address)).to.equal(0);

    const [entry] = await registry.entriesOf(alice.address);
    expect(entry.pool).to.equal(pool);
    expect(entry.fee).to.equal(3000);
  });

  it("emits PositionRecorded", async () => {
    const a = ethers.Wallet.createRandom().address;
    await expect(registry.record(a, a, a, 500)).to.emit(registry, "PositionRecorded");
  });
});
