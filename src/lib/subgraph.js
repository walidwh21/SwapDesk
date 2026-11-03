import { SUBGRAPH_URL } from "../config";

const TOP_TOKENS_QUERY = `
  query TopTokens($first: Int!) {
    tokens(first: $first, orderBy: volumeUSD, orderDirection: desc) {
      id
      symbol
      name
      volumeUSD
      totalValueLockedUSD
      txCount
      derivedETH
    }
  }
`;

/**
 * Fetch the most traded tokens from a Uniswap V3 subgraph.
 * The endpoint is user supplied (NEXT_PUBLIC_SUBGRAPH_URL) because hosted
 * endpoints now require an API key.
 */
export async function fetchTopTokens(first = 20) {
  if (!SUBGRAPH_URL) {
    return { tokens: [], error: "No subgraph endpoint configured (NEXT_PUBLIC_SUBGRAPH_URL)." };
  }
  try {
    const res = await fetch(SUBGRAPH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: TOP_TOKENS_QUERY, variables: { first } }),
    });
    const body = await res.json();
    if (body.errors) throw new Error(body.errors[0].message);
    return { tokens: body.data.tokens, error: null };
  } catch (err) {
    return { tokens: [], error: err.message || "Subgraph request failed." };
  }
}
