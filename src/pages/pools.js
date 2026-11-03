import React, { useCallback, useEffect, useState } from "react";
import { useWallet } from "../context/WalletContext";
import { loadPositions } from "../lib/liquidity";
import { readableError } from "../lib/web3";
import AddLiquidityForm from "../components/AddLiquidityForm";
import PositionList from "../components/PositionList";

export default function PoolsPage() {
  const { account, connect } = useWallet();
  const [creating, setCreating] = useState(false);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!account) return setPositions([]);
    setLoading(true);
    setError("");
    try {
      setPositions(await loadPositions(account));
    } catch (err) {
      setError(readableError(err));
    } finally {
      setLoading(false);
    }
  }, [account]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return creating ? (
    <AddLiquidityForm
      onBack={() => setCreating(false)}
      onDone={() => {
        setCreating(false);
        refresh();
      }}
    />
  ) : (
    <PositionList
      account={account}
      positions={positions}
      loading={loading}
      error={error}
      onConnect={connect}
      onNew={() => setCreating(true)}
    />
  );
}
