import React, { useMemo, useState } from "react";
import { usd, compactNumber } from "../lib/format";
import { IconSearch } from "./Icons";

export default function TokenTable({ tokens, loading, error }) {
  const [query, setQuery] = useState("");
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tokens.filter((t) => !q || t.name.toLowerCase().includes(q) || t.symbol.toLowerCase().includes(q));
  }, [tokens, query]);

  return (
    <section className="card wide">
      <div className="card-head">
        <h2>Top tokens</h2>
        <label className="search-field compact">
          <IconSearch size={16} />
          <input placeholder="Filter tokens" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
      </div>

      {error && <p className="notice error">{error}</p>}
      {loading && <p className="empty">Loading…</p>}

      {!loading && !error && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Token</th>
                <th className="num">Volume</th>
                <th className="num">TVL</th>
                <th className="num hide-sm">Transactions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t, i) => (
                <tr key={t.id}>
                  <td className="muted">{i + 1}</td>
                  <td><strong>{t.name}</strong> <span className="muted">{t.symbol}</span></td>
                  <td className="num">{usd(t.volumeUSD)}</td>
                  <td className="num">{usd(t.totalValueLockedUSD)}</td>
                  <td className="num hide-sm">{compactNumber(t.txCount)}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={5} className="empty">No tokens match “{query}”.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
