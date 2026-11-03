import { ethers } from "ethers";
import { Percent, Token } from "@uniswap/sdk-core";
import { Pool, Position, TickMath, encodeSqrtRatioX96, nearestUsableTick } from "@uniswap/v3-sdk";
import { ADDRESSES } from "../config";
import {
  FACTORY_ABI,
  POOL_ABI,
  POSITION_MANAGER_ABI,
  REGISTRY_ABI,
} from "./abis";
import { ensureAllowance, erc20, getProvider, parseAmount } from "./web3";

const TICK_SPACING = { 100: 1, 500: 10, 3000: 60, 10000: 200 };
const LOG_1_0001 = Math.log(1.0001);

export const RANGE_PRESETS = [
  { id: "full", label: "Full range", pct: null },
  { id: "wide", label: "±50%", pct: 0.5 },
  { id: "narrow", label: "±10%", pct: 0.1 },
];

const sortPair = (a, b) =>
  a.address.toLowerCase() < b.address.toLowerCase() ? [a, b] : [b, a];

/** Convert a preset into a pair of usable ticks around `currentTick`. */
export function tickRange(preset, currentTick, spacing) {
  if (preset.pct === null) {
    return [
      nearestUsableTick(TickMath.MIN_TICK, spacing),
      nearestUsableTick(TickMath.MAX_TICK, spacing),
    ];
  }
  const down = Math.floor(Math.log(1 - Math.min(preset.pct, 0.99)) / LOG_1_0001);
  const up = Math.ceil(Math.log(1 + preset.pct) / LOG_1_0001);
  let lower = nearestUsableTick(currentTick + down, spacing);
  let upper = nearestUsableTick(currentTick + up, spacing);
  if (lower === upper) upper += spacing;
  return [lower, upper];
}

/**
 * Create the pool when it does not exist yet (initial price derived from the
 * deposited amounts), then mint a concentrated-liquidity position.
 */
export async function addLiquidity({
  account,
  tokenA,
  tokenB,
  amountA,
  amountB,
  fee,
  preset,
  slippagePct,
  deadlineMin,
  onStep = () => {},
}) {
  const provider = getProvider();
  const signer = provider.getSigner();
  const { chainId } = await provider.getNetwork();

  // Pools always order their tokens by address.
  const swapped = tokenA.address.toLowerCase() > tokenB.address.toLowerCase();
  const [t0, t1] = sortPair(tokenA, tokenB);
  const [a0, a1] = swapped ? [amountB, amountA] : [amountA, amountB];
  const raw0 = parseAmount(a0, t0.decimals);
  const raw1 = parseAmount(a1, t1.decimals);

  const factory = new ethers.Contract(ADDRESSES.factory, FACTORY_ABI, signer);
  const manager = new ethers.Contract(ADDRESSES.positionManager, POSITION_MANAGER_ABI, signer);

  let poolAddress = await factory.getPool(t0.address, t1.address, fee);
  if (poolAddress === ethers.constants.AddressZero) {
    onStep("Creating pool");
    const sqrtPrice = encodeSqrtRatioX96(raw1.toString(), raw0.toString());
    await (
      await manager.createAndInitializePoolIfNecessary(
        t0.address,
        t1.address,
        fee,
        sqrtPrice.toString()
      )
    ).wait();
    poolAddress = await factory.getPool(t0.address, t1.address, fee);
  }

  const pool = new ethers.Contract(poolAddress, POOL_ABI, signer);
  const [slot0, liquidity] = await Promise.all([pool.slot0(), pool.liquidity()]);

  const sdkPool = new Pool(
    new Token(chainId, t0.address, t0.decimals, t0.symbol, t0.name),
    new Token(chainId, t1.address, t1.decimals, t1.symbol, t1.name),
    fee,
    slot0.sqrtPriceX96.toString(),
    liquidity.toString(),
    slot0.tick
  );

  const [tickLower, tickUpper] = tickRange(preset, slot0.tick, TICK_SPACING[fee]);
  const position = Position.fromAmounts({
    pool: sdkPool,
    tickLower,
    tickUpper,
    amount0: raw0.toString(),
    amount1: raw1.toString(),
    useFullPrecision: true,
  });
  const mins = position.mintAmountsWithSlippage(new Percent(Math.round(slippagePct * 100), 10000));

  onStep(`Approving ${t0.symbol}`);
  await ensureAllowance(t0.address, account, ADDRESSES.positionManager, raw0, signer);
  onStep(`Approving ${t1.symbol}`);
  await ensureAllowance(t1.address, account, ADDRESSES.positionManager, raw1, signer);

  onStep("Minting position");
  const tx = await manager.mint({
    token0: t0.address,
    token1: t1.address,
    fee,
    tickLower,
    tickUpper,
    amount0Desired: raw0,
    amount1Desired: raw1,
    amount0Min: mins.amount0.toString(),
    amount1Min: mins.amount1.toString(),
    recipient: account,
    deadline: Math.floor(Date.now() / 1000) + deadlineMin * 60,
  });
  const receipt = await tx.wait();

  if (ADDRESSES.registry) {
    onStep("Saving to registry");
    const registry = new ethers.Contract(ADDRESSES.registry, REGISTRY_ABI, signer);
    await (await registry.record(poolAddress, t0.address, t1.address, fee)).wait();
  }
  return { hash: receipt.transactionHash, poolAddress };
}

/** Pools recorded for `account` in the registry, enriched with live pool data. */
export async function loadPositions(account) {
  if (!ADDRESSES.registry) return [];
  const provider = getProvider();
  const registry = new ethers.Contract(ADDRESSES.registry, REGISTRY_ABI, provider);
  const entries = await registry.entriesOf(account);

  return Promise.all(
    entries.map(async (e) => {
      const pool = new ethers.Contract(e.pool, POOL_ABI, provider);
      const [slot0, liquidity, s0, s1] = await Promise.all([
        pool.slot0(),
        pool.liquidity(),
        erc20(e.token0, provider).symbol(),
        erc20(e.token1, provider).symbol(),
      ]);
      return {
        pool: e.pool,
        symbol0: s0,
        symbol1: s1,
        fee: e.fee,
        tick: slot0.tick,
        liquidity: liquidity.toString(),
        createdAt: Number(e.createdAt) * 1000,
      };
    })
  );
}
