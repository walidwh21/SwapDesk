import { ethers } from "ethers";
import { ADDRESSES, DEFAULT_FEE } from "../config";
import { QUOTER_ABI, SINGLE_HOP_ABI, WETH_ABI } from "./abis";
import { ensureAllowance, formatAmount, getProvider, parseAmount } from "./web3";

/**
 * Ask the on-chain Quoter how much `tokenOut` a swap would return.
 * Returns a decimal string, or null when the amount is empty / zero.
 */
export async function getQuote({ tokenIn, tokenOut, amountIn, fee = DEFAULT_FEE }) {
  if (!amountIn || Number(amountIn) <= 0) return null;
  const provider = getProvider();
  const quoter = new ethers.Contract(ADDRESSES.quoter, QUOTER_ABI, provider);
  const raw = await quoter.callStatic.quoteExactInputSingle(
    tokenIn.address,
    tokenOut.address,
    fee,
    parseAmount(amountIn, tokenIn.decimals),
    0
  );
  return formatAmount(raw, tokenOut.decimals);
}

/**
 * Execute a single-hop exact-input swap through SingleHopSwapper.
 * Native ETH is wrapped first; native output is delivered as WETH.
 */
export async function executeSwap({
  account,
  tokenIn,
  tokenOut,
  amountIn,
  expectedOut,
  slippagePct,
  deadlineMin,
  fee = DEFAULT_FEE,
  onStep = () => {},
}) {
  if (!ADDRESSES.singleHop) {
    throw new Error("SingleHopSwapper is not configured. Set NEXT_PUBLIC_SINGLE_HOP.");
  }
  const provider = getProvider();
  const signer = provider.getSigner();
  const rawIn = parseAmount(amountIn, tokenIn.decimals);

  if (tokenIn.isNative) {
    onStep("Wrapping ETH");
    const weth = new ethers.Contract(ADDRESSES.weth, WETH_ABI, signer);
    await (await weth.deposit({ value: rawIn })).wait();
  }

  onStep(`Approving ${tokenIn.symbol}`);
  await ensureAllowance(tokenIn.address, account, ADDRESSES.singleHop, rawIn, signer);

  // minimum output = quote reduced by the slippage tolerance (basis points)
  const quoted = parseAmount(expectedOut, tokenOut.decimals);
  const bps = Math.round(slippagePct * 100);
  const minOut = quoted.mul(10000 - bps).div(10000);
  const deadline = Math.floor(Date.now() / 1000) + deadlineMin * 60;

  onStep("Swapping");
  const swapper = new ethers.Contract(ADDRESSES.singleHop, SINGLE_HOP_ABI, signer);
  const tx = await swapper.swapExactIn(
    tokenIn.address,
    tokenOut.address,
    fee,
    rawIn,
    minOut,
    deadline
  );
  const receipt = await tx.wait();
  return receipt.transactionHash;
}
