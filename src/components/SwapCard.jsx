import React, { useEffect, useMemo, useState } from "react";
import { DEFAULT_DEADLINE_MIN, DEFAULT_SLIPPAGE } from "../config";
import { TOKENS, sameToken } from "../lib/tokens";
import { isPositiveNumber, trimAmount } from "../lib/format";
import { getQuote, executeSwap } from "../lib/swap";
import { readableError } from "../lib/web3";
import { useWallet } from "../context/WalletContext";
import { IconChevron, IconSettings, IconSwapVertical, TokenBadge } from "./Icons";
import SettingsPanel from "./SettingsPanel";
import TokenPicker from "./TokenPicker";

const TokenButton = ({ token, onClick }) => (
  <button className="token-btn" onClick={onClick}>
    <TokenBadge token={token} size={24} />
    {token.symbol}
    <IconChevron size={16} />
  </button>
);

export default function SwapCard() {
  const { account, balances, connect, refreshBalances } = useWallet();

  const [tokenIn, setTokenIn] = useState(TOKENS[0]);
  const [tokenOut, setTokenOut] = useState(TOKENS[2]);
  const [amountIn, setAmountIn] = useState("");
  const [quote, setQuote] = useState(null);
  const [quoting, setQuoting] = useState(false);
  const [slippage, setSlippage] = useState(DEFAULT_SLIPPAGE);
  const [deadline, setDeadline] = useState(DEFAULT_DEADLINE_MIN);
  const [picker, setPicker] = useState(null); // "in" | "out" | null
  const [showSettings, setShowSettings] = useState(false);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState(null); // { kind, text }

  // debounce quote requests while the user types
  useEffect(() => {
    setQuote(null);
    if (!isPositiveNumber(amountIn) || !account) return undefined;
    let stale = false;
    setQuoting(true);
    const timer = setTimeout(async () => {
      try {
        const out = await getQuote({ tokenIn, tokenOut, amountIn });
        if (!stale) setQuote(out);
      } catch {
        if (!stale) setMessage({ kind: "error", text: "No liquidity found for this pair on the 0.3% tier." });
      } finally {
        if (!stale) setQuoting(false);
      }
    }, 450);
    return () => {
      stale = true;
      clearTimeout(timer);
    };
  }, [amountIn, tokenIn, tokenOut, account]);

  const balanceIn = balances[tokenIn.symbol];
  const insufficient = isPositiveNumber(amountIn) && balanceIn !== undefined && Number(amountIn) > Number(balanceIn);

  const rate = useMemo(() => {
    if (!quote || !isPositiveNumber(amountIn)) return null;
    return Number(quote) / Number(amountIn);
  }, [quote, amountIn]);

  const flip = () => {
    setTokenIn(tokenOut);
    setTokenOut(tokenIn);
    setAmountIn(quote ? trimAmount(quote, 6) : "");
  };

  const pick = (side) => (t) => {
    const other = side === "in" ? tokenOut : tokenIn;
    if (sameToken(t, other)) flip();
    else (side === "in" ? setTokenIn : setTokenOut)(t);
  };

  const submit = async () => {
    setMessage(null);
    try {
      const hash = await executeSwap({
        account,
        tokenIn,
        tokenOut,
        amountIn,
        expectedOut: quote,
        slippagePct: slippage,
        deadlineMin: deadline,
        onStep: setBusy,
      });
      setMessage({ kind: "ok", text: `Swap confirmed · ${hash.slice(0, 10)}…` });
      setAmountIn("");
      refreshBalances();
    } catch (err) {
      setMessage({ kind: "error", text: readableError(err) });
    } finally {
      setBusy("");
    }
  };

  let action = { label: "Swap", disabled: false, run: submit };
  if (!account) action = { label: "Connect wallet", disabled: false, run: connect };
  else if (!isPositiveNumber(amountIn)) action = { label: "Enter an amount", disabled: true };
  else if (insufficient) action = { label: `Insufficient ${tokenIn.symbol}`, disabled: true };
  else if (quoting || !quote) action = { label: "Fetching quote…", disabled: true };
  if (busy) action = { label: `${busy}…`, disabled: true };

  return (
    <section className="card swap-card">
      <div className="card-head">
        <h2>Swap</h2>
        <button className="icon-btn" aria-label="Settings" onClick={() => setShowSettings(true)}>
          <IconSettings size={18} />
        </button>
      </div>

      <div className="field">
        <span className="label">You pay</span>
        <div className="field-row">
          <input
            className="amount"
            inputMode="decimal"
            placeholder="0.0"
            value={amountIn}
            onChange={(e) => /^\d*\.?\d*$/.test(e.target.value) && setAmountIn(e.target.value)}
          />
          <TokenButton token={tokenIn} onClick={() => setPicker("in")} />
        </div>
        <div className="field-foot">
          <span>Balance: {balanceIn !== undefined ? trimAmount(balanceIn, 4) : "–"}</span>
          {balanceIn && (
            <button className="link" onClick={() => setAmountIn(trimAmount(balanceIn, 8))}>
              Max
            </button>
          )}
        </div>
      </div>

      <button className="flip" onClick={flip} aria-label="Reverse pair">
        <IconSwapVertical size={18} />
      </button>

      <div className="field">
        <span className="label">You receive</span>
        <div className="field-row">
          <input className="amount" readOnly placeholder="0.0" value={quoting ? "…" : quote ? trimAmount(quote, 6) : ""} />
          <TokenButton token={tokenOut} onClick={() => setPicker("out")} />
        </div>
        <div className="field-foot">
          <span>Balance: {balances[tokenOut.symbol] !== undefined ? trimAmount(balances[tokenOut.symbol], 4) : "–"}</span>
        </div>
      </div>

      {rate && (
        <dl className="details">
          <div><dt>Rate</dt><dd>1 {tokenIn.symbol} ≈ {trimAmount(rate, 4)} {tokenOut.symbol}</dd></div>
          <div><dt>Minimum received</dt><dd>{trimAmount(Number(quote) * (1 - slippage / 100), 6)} {tokenOut.symbol}</dd></div>
          <div><dt>Pool fee</dt><dd>0.3%</dd></div>
          {tokenOut.isNative && <div><dt>Note</dt><dd>ETH is delivered as WETH</dd></div>}
        </dl>
      )}

      <button className="btn btn-primary btn-block" disabled={action.disabled} onClick={action.run}>
        {action.label}
      </button>
      {message && <p className={`notice ${message.kind}`}>{message.text}</p>}

      {picker && (
        <TokenPicker
          tokens={TOKENS}
          selected={picker === "in" ? tokenIn : tokenOut}
          onSelect={pick(picker)}
          onClose={() => setPicker(null)}
        />
      )}
      {showSettings && (
        <SettingsPanel
          slippage={slippage}
          deadline={deadline}
          onSlippage={setSlippage}
          onDeadline={setDeadline}
          onClose={() => setShowSettings(false)}
        />
      )}
    </section>
  );
}
