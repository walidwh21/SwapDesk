// Requires a mainnet fork:  FORK_RPC_URL=<your rpc> npx hardhat test
const { expect } = require("chai");
const { ethers } = require("hardhat");

const ROUTER = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

const suite = process.env.FORK_RPC_URL ? describe : describe.skip;

suite("Swappers (mainnet fork)", () => {
  let signer, weth, dai, single, multi;
  const deadline = () => Math.floor(Date.now() / 1000) + 600;

  before(async () => {
    [signer] = await ethers.getSigners();
    weth = await ethers.getContractAt("IWETH", WETH);
    dai = await ethers.getContractAt(
      "@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20",
      DAI
    );
    single = await (await ethers.getContractFactory("SingleHopSwapper")).deploy(ROUTER);
    multi = await (await ethers.getContractFactory("MultiHopSwapper")).deploy(ROUTER);
  });

  it("single hop: WETH -> DAI", async () => {
    const amountIn = ethers.utils.parseEther("1");
    await weth.deposit({ value: amountIn });
    await weth.approve(single.address, amountIn);

    const before = await dai.balanceOf(signer.address);
    await single.swapExactIn(WETH, DAI, 3000, amountIn, 1, deadline());
    expect(await dai.balanceOf(signer.address)).to.be.gt(before);
  });

  it("multi hop: WETH -> USDC -> DAI", async () => {
    const amountIn = ethers.utils.parseEther("1");
    await weth.deposit({ value: amountIn });
    await weth.approve(multi.address, amountIn);

    const before = await dai.balanceOf(signer.address);
    await multi.swapExactIn([WETH, USDC, DAI], [3000, 100], amountIn, 1, deadline());
    expect(await dai.balanceOf(signer.address)).to.be.gt(before);
  });
});
