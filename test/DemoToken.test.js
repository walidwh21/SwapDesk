const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DemoToken", () => {
  it("mints the full supply, scaled by decimals, to the deployer", async () => {
    const [deployer] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("DemoToken");
    const token = await Token.deploy("Alpha Token", "ALPHA", 1000);
    await token.deployed();

    expect(await token.symbol()).to.equal("ALPHA");
    expect(await token.balanceOf(deployer.address)).to.equal(
      ethers.utils.parseUnits("1000", 18)
    );
  });
});
