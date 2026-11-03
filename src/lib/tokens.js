import { ADDRESSES } from "../config";

// Built-in token list (Ethereum mainnet). `isNative` marks the chain currency,
// which is wrapped into WETH transparently before a swap.
export const TOKENS = [
  { symbol: "ETH", name: "Ether", address: ADDRESSES.weth, decimals: 18, isNative: true, color: "#6f7cf7" },
  { symbol: "WETH", name: "Wrapped Ether", address: ADDRESSES.weth, decimals: 18, color: "#8b95f9" },
  { symbol: "USDC", name: "USD Coin", address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", decimals: 6, color: "#2f80ed" },
  { symbol: "USDT", name: "Tether USD", address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", decimals: 6, color: "#26a17b" },
  { symbol: "DAI", name: "Dai Stablecoin", address: "0x6B175474E89094C44Da98b954EedeAC495271d0F", decimals: 18, color: "#f5ac37" },
  { symbol: "WBTC", name: "Wrapped BTC", address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", decimals: 8, color: "#f7931a" },
  { symbol: "UNI", name: "Uniswap", address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984", decimals: 18, color: "#ff5ca8" },
  { symbol: "LINK", name: "Chainlink", address: "0x514910771AF9Ca656af840dff83E8264EcF986CA", decimals: 18, color: "#2a5ada" },
];

// Liquidity positions need real ERC-20s, so the native entry is left out.
export const POOL_TOKENS = TOKENS.filter((t) => !t.isNative);

export const tokenKey = (t) => `${t.symbol}:${t.address.toLowerCase()}`;

export const sameToken = (a, b) => !!a && !!b && tokenKey(a) === tokenKey(b);
