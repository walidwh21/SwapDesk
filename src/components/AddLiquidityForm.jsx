import React, { useState } from "react";
import { DEFAULT_DEADLINE_MIN, DEFAULT_SLIPPAGE, FEE_TIERS } from "../config";
import { POOL_TOKENS, sameToken } from "../lib/tokens";
import { isPositiveNumber, trimAmount } from "../lib/format";
import { RANGE_PRESETS, addLiquidity } from "../lib/liquidity";
import { readableError } from "../lib/web3";
import { useWallet } from "../context/WalletContext";
import { IconArrowLeft, IconChevron, TokenBadge } from "./Icons";
import TokenPicker from "./TokenPicker";

export default function AddLiquidityForm({ onBack, onDone }) {
  const { account, balances, connect, refreshBalances } = useWallet();

  const [tokenA, setTokenA] = useState(POOL_TOKENS[0]);
  const [tokenB, setTokenB] = useState(POOL_TOKENS[1]);
  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  const [fee, setFee] = useState(3000);
  const [rangeId, setRangeId] = useState("wide");
  const [picker, setPicker] = useState(null);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState(null);

  const ready = isPositiveNumber(amountA) && isPositiveNumber(amountB);
  const exceeds = (sym, v) => balances[sym] !== undefined && Number(v) > Number(balances[sym]);

  const pick = (side) => (t) => {
    const other = side === "a" ? tokenB : tokenA;
    if (sameToken(t, other)) {
      setTokenA(tokenB);
      setTokenB(tokenA);
    } else (side === "a" ? setTokenA : setTokenB)(t);
  };

  const submit = async () => {
    setMessage(null);
    try {
      const { hash } = await addLiquidity({
        account,
        tokenA,
        tokenB,
        amountA,
        amountB,
        fee,
        preset: RANGE_PRESETS.find((r) => r.id === rangeId),
        slippagePct: DEFAULT_SLIPPAGE,
        deadlineMin: DEFAULT_DEADLINE_MIN,
        onStep: setBusy,
      });
      setMessage({ kind: "ok", text: `Position minted · ${hash.slice(0, 10)}…` });
      refreshBalances();
      onDone?.();
    } catch (err) {
      setMessage({ kind: "error", text: readableError(err) });
    } finally {
      setBusy("");
    }
  };

  let action = { label: "Add liquidity", disabled: false, run: submit };
  if (!account) action = { label: "Connect wallet", disabled: false, run: connect };
  else if (!ready) action = { label: "Enter both amounts", disabled: true };
  else if (exceeds(tokenA.symbol, amountA)) action = { label: `Insufficient ${tokenA.symbol}`, disabled: true };
  else if (exceeds(tokenB.symbol, amountB)) action = { label: `Insufficient ${tokenB.symbol}`, disabled: true };
  if (busy) action = { label: `${busy}…`, disabled: true };

  const amountRow = (token, value, setValue, side) => (
    <div className="field">
      <div className="field-row">
        <input
          className="amount"
          inputMode="decimal"
          placeholder="0.0"
          value={value}
          onChange={(e) => /^\d*\.?\d*$/.test(e.target.value) && setValue(e.target.value)}
        />
        <button className="token-btn" onClick={() => setPicker(side)}>
          <TokenBadge token={token} size={24} />
          {token.symbol}
          <IconChevron size={16} />
        </button>
      </div>
      <div className="field-foot">
        <span>Balance: {balances[token.symbol] !== undefined ? trimAmount(balances[token.symbol], 4) : "–"}</span>
      </div>
    </div>
  );

  return (
    <section className="card wide">
      <div className="card-head">
        <button className="icon-btn" onClick={onBack} aria-label="Back">
          <IconArrowLeft size={18} />
        </button>
        <h2>New position</h2>
        <span />
      </div>

      <div className="two-col">
        <div>
          <p className="label">1 · Deposit amounts</p>
          {amountRow(tokenA, amountA, setAmountA, "a")}
          {amountRow(tokenB, amountB, setAmountB, "b")}
          <p className="hint">
            If the pool does not exist yet, the ratio of these two amounts becomes its starting price.
          </p>
        </div>

        <div>
          <p className="label">2 · Fee tier</p>
          <div className="tiers">
            {FEE_TIERS.map((t) => (
              <button key={t.value} className={fee === t.value ? "tier on" : "tier"} onClick={() => setFee(t.value)}>
                <strong>{t.label}</strong>
                <small>{t.hint}</small>
              </button>
            ))}
          </div>

          <p className="label">3 · Price range</p>
          <div className="seg">
            {RANGE_PRESETS.map((r) => (
              <button key={r.id} className={rangeId === r.id ? "seg-btn on" : "seg-btn"} onClick={() => setRangeId(r.id)}>
                {r.label}
              </button>
            ))}
          </div>
          <p className="hint">Narrower ranges earn more fees per dollar but go out of range sooner.</p>
        </div>
      </div>

      <button className="btn btn-primary btn-block" disabled={action.disabled} onClick={action.run}>
        {action.label}
      </button>
      {message && <p className={`notice ${message.kind}`}>{message.text}</p>}

      {picker && (
        <TokenPicker
          tokens={POOL_TOKENS}
          selected={picker === "a" ? tokenA : tokenB}
          disabled={null}
          onSelect={pick(picker)}
          onClose={() => setPicker(null)}
        />
      )}
    </section>
  );
}
