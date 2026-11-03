// Central place for network addresses and runtime settings.
// Every value can be overridden through NEXT_PUBLIC_* variables (see .env.example).
// NOTE: Next.js only inlines env vars that are referenced statically, so each
// one is spelled out below instead of being read through a loop.

export const ADDRESSES = {
  // Uniswap V3 core deployments (Ethereum mainnet defaults)
  weth: process.env.NEXT_PUBLIC_WETH || "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  factory: process.env.NEXT_PUBLIC_FACTORY || "0x1F98431c8aD98523631AE4a59f267346ea31F984",
  quoter: process.env.NEXT_PUBLIC_QUOTER || "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6",
  positionManager:
    process.env.NEXT_PUBLIC_POSITION_MANAGER || "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",

  // Contracts from this repository (printed by `npm run deploy:local`)
  singleHop: process.env.NEXT_PUBLIC_SINGLE_HOP || "",
  multiHop: process.env.NEXT_PUBLIC_MULTI_HOP || "",
  registry: process.env.NEXT_PUBLIC_REGISTRY || "",
};

// Optional GraphQL endpoint of a Uniswap V3 subgraph (for the Tokens page).
export const SUBGRAPH_URL = process.env.NEXT_PUBLIC_SUBGRAPH_URL || "";

export const DEFAULT_FEE = 3000; // 0.3 % pool
export const DEFAULT_SLIPPAGE = 0.5; // percent
export const DEFAULT_DEADLINE_MIN = 10;

export const FEE_TIERS = [
  { value: 500, label: "0.05%", hint: "Stable or correlated pairs" },
  { value: 3000, label: "0.3%", hint: "Most pairs" },
  { value: 10000, label: "1%", hint: "Exotic pairs" },
];

export const APP_NAME = "SwapDesk";
