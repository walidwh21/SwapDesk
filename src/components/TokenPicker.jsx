import React, { useMemo, useState } from "react";
import { sameToken } from "../lib/tokens";
import { trimAmount } from "../lib/format";
import { useWallet } from "../context/WalletContext";
import Modal from "./Modal";
import { IconCheck, IconSearch, TokenBadge } from "./Icons";

export default function TokenPicker({ tokens, selected, disabled, onSelect, onClose }) {
  const [query, setQuery] = useState("");
  const { balances } = useWallet();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tokens;
    return tokens.filter(
      (t) => t.symbol.toLowerCase().includes(q) || t.name.toLowerCase().includes(q) || t.address.toLowerCase() === q
    );
  }, [tokens, query]);

  return (
    <Modal title="Select a token" onClose={onClose}>
      <label className="search-field">
        <IconSearch size={16} />
        <input autoFocus placeholder="Search by name or paste an address" value={query} onChange={(e) => setQuery(e.target.value)} />
      </label>

      <ul className="token-list">
        {filtered.map((t) => {
          const blocked = sameToken(t, disabled);
          return (
            <li key={t.symbol + t.address}>
              <button className="token-row" disabled={blocked} onClick={() => (onSelect(t), onClose())}>
                <TokenBadge token={t} size={32} />
                <span className="token-row-name">
                  <strong>{t.symbol}</strong>
                  <small>{t.name}</small>
                </span>
                <span className="token-row-bal">{balances[t.symbol] ? trimAmount(balances[t.symbol], 4) : ""}</span>
                {sameToken(t, selected) && <IconCheck size={16} />}
              </button>
            </li>
          );
        })}
        {filtered.length === 0 && <li className="empty">No token matches “{query}”.</li>}
      </ul>
    </Modal>
  );
}
