import React from "react";
import { compactNumber, feeLabel } from "../lib/format";
import { IconPlus, IconWallet } from "./Icons";

export default function PositionList({ account, positions, loading, error, onConnect, onNew }) {
  return (
    <section className="card">
      <div className="card-head">
        <h2>Your pools</h2>
        <button className="btn btn-primary btn-sm" onClick={onNew}>
          <IconPlus size={16} /> New position
        </button>
      </div>

      {!account ? (
        <div className="empty-state">
          <IconWallet size={36} />
          <p>Connect a wallet to see the pools you have created.</p>
          <button className="btn btn-ghost" onClick={onConnect}>Connect wallet</button>
        </div>
      ) : loading ? (
        <p className="empty">Loading positions…</p>
      ) : error ? (
        <p className="notice error">{error}</p>
      ) : positions.length === 0 ? (
        <div className="empty-state">
          <p>No positions yet. Create a pool and add liquidity to start earning fees.</p>
        </div>
      ) : (
        <ul className="positions">
          {positions.map((p) => (
            <li key={p.pool + p.createdAt} className="position">
              <div>
                <strong>{p.symbol0} / {p.symbol1}</strong>
                <span className="chip">{feeLabel(p.fee)}</span>
              </div>
              <dl className="mini">
                <div><dt>Pool liquidity</dt><dd>{compactNumber(p.liquidity)}</dd></div>
                <div><dt>Current tick</dt><dd>{p.tick}</dd></div>
                <div><dt>Created</dt><dd>{new Date(p.createdAt).toLocaleDateString()}</dd></div>
              </dl>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
