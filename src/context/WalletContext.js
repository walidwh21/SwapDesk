import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { TOKENS } from "../lib/tokens";
import { erc20, formatAmount, getEthereum, getProvider, readableError } from "../lib/web3";

const WalletContext = createContext(null);

const CHAIN_NAMES = { 1: "Ethereum", 5: "Goerli", 11155111: "Sepolia", 31337: "Localhost", 1337: "Localhost" };

export function WalletProvider({ children }) {
  const [account, setAccount] = useState("");
  const [chainId, setChainId] = useState(null);
  const [balances, setBalances] = useState({}); // symbol -> decimal string
  const [error, setError] = useState("");

  const loadBalances = useCallback(async (address) => {
    if (!address) return setBalances({});
    try {
      const provider = getProvider();
      const entries = await Promise.all(
        TOKENS.map(async (t) => {
          try {
            const raw = t.isNative
              ? await provider.getBalance(address)
              : await erc20(t.address, provider).balanceOf(address);
            return [t.symbol, formatAmount(raw, t.decimals)];
          } catch {
            return [t.symbol, "0"]; // token missing on this network
          }
        })
      );
      setBalances(Object.fromEntries(entries));
    } catch (err) {
      setError(readableError(err));
    }
  }, []);

  const syncChain = useCallback(async () => {
    try {
      const net = await getProvider().getNetwork();
      setChainId(net.chainId);
    } catch {
      /* wallet missing: nothing to sync */
    }
  }, []);

  const connect = useCallback(async () => {
    setError("");
    try {
      const eth = getEthereum();
      if (!eth) throw new Error("No wallet found. Install a browser wallet such as MetaMask.");
      const [first] = await eth.request({ method: "eth_requestAccounts" });
      setAccount(first || "");
      await syncChain();
    } catch (err) {
      setError(readableError(err));
    }
  }, [syncChain]);

  // restore an already authorised session and follow wallet events
  useEffect(() => {
    const eth = getEthereum();
    if (!eth) return undefined;

    eth.request({ method: "eth_accounts" }).then((list) => {
      if (list && list[0]) {
        setAccount(list[0]);
        syncChain();
      }
    });

    const onAccounts = (list) => setAccount(list[0] || "");
    const onChain = () => syncChain();
    eth.on?.("accountsChanged", onAccounts);
    eth.on?.("chainChanged", onChain);
    return () => {
      eth.removeListener?.("accountsChanged", onAccounts);
      eth.removeListener?.("chainChanged", onChain);
    };
  }, [syncChain]);

  useEffect(() => {
    loadBalances(account);
  }, [account, chainId, loadBalances]);

  const value = useMemo(
    () => ({
      account,
      chainId,
      chainName: chainId ? CHAIN_NAMES[chainId] || `Chain ${chainId}` : "",
      balances,
      error,
      connect,
      refreshBalances: () => loadBalances(account),
    }),
    [account, chainId, balances, error, connect, loadBalances]
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export const useWallet = () => {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside <WalletProvider>");
  return ctx;
};
