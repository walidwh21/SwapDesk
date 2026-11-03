import React, { useEffect, useState } from "react";
import { fetchTopTokens } from "../lib/subgraph";
import TokenTable from "../components/TokenTable";

export default function TokensPage() {
  const [state, setState] = useState({ tokens: [], error: "", loading: true });

  useEffect(() => {
    let alive = true;
    fetchTopTokens(20).then(({ tokens, error }) => alive && setState({ tokens, error: error || "", loading: false }));
    return () => {
      alive = false;
    };
  }, []);

  return <TokenTable tokens={state.tokens} loading={state.loading} error={state.error} />;
}
