// Human-readable ABIs (ethers v5 format). Only the fragments the UI needs.

export const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
];

export const WETH_ABI = [
  ...ERC20_ABI,
  "function deposit() payable",
  "function withdraw(uint256 amount)",
];

export const SINGLE_HOP_ABI = [
  "function swapExactIn(address tokenIn, address tokenOut, uint24 fee, uint256 amountIn, uint256 minAmountOut, uint256 deadline) returns (uint256)",
  "function swapExactOut(address tokenIn, address tokenOut, uint24 fee, uint256 amountOut, uint256 maxAmountIn, uint256 deadline) returns (uint256)",
];

export const MULTI_HOP_ABI = [
  "function swapExactIn(address[] tokens, uint24[] fees, uint256 amountIn, uint256 minAmountOut, uint256 deadline) returns (uint256)",
  "function swapExactOut(address[] tokens, uint24[] fees, uint256 amountOut, uint256 maxAmountIn, uint256 deadline) returns (uint256)",
];

export const REGISTRY_ABI = [
  "function record(address pool, address token0, address token1, uint24 fee)",
  "function countOf(address owner) view returns (uint256)",
  "function entriesOf(address owner) view returns (tuple(address pool, address token0, address token1, uint24 fee, uint64 createdAt)[])",
];

export const QUOTER_ABI = [
  "function quoteExactInputSingle(address tokenIn, address tokenOut, uint24 fee, uint256 amountIn, uint160 sqrtPriceLimitX96) returns (uint256 amountOut)",
];

export const FACTORY_ABI = [
  "function getPool(address tokenA, address tokenB, uint24 fee) view returns (address)",
];

export const POOL_ABI = [
  "function token0() view returns (address)",
  "function token1() view returns (address)",
  "function fee() view returns (uint24)",
  "function tickSpacing() view returns (int24)",
  "function liquidity() view returns (uint128)",
  "function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)",
];

export const POSITION_MANAGER_ABI = [
  "function createAndInitializePoolIfNecessary(address token0, address token1, uint24 fee, uint160 sqrtPriceX96) payable returns (address pool)",
  "function mint(tuple(address token0, address token1, uint24 fee, int24 tickLower, int24 tickUpper, uint256 amount0Desired, uint256 amount1Desired, uint256 amount0Min, uint256 amount1Min, address recipient, uint256 deadline) params) payable returns (uint256 tokenId, uint128 liquidity, uint256 amount0, uint256 amount1)",
];
