import { ethers } from "ethers";
import { ERC20_ABI } from "./abis";

/** EIP-1193 provider injected by the user's wallet, if any. */
export const getEthereum = () =>
  typeof window !== "undefined" ? window.ethereum : undefined;

export const hasWallet = () => !!getEthereum();

export const getProvider = () => {
  const eth = getEthereum();
  if (!eth) throw new Error("No wallet found. Install a browser wallet such as MetaMask.");
  return new ethers.providers.Web3Provider(eth, "any");
};

export const getSigner = () => getProvider().getSigner();

export const erc20 = (address, signerOrProvider) =>
  new ethers.Contract(address, ERC20_ABI, signerOrProvider);

export const parseAmount = (value, decimals) =>
  ethers.utils.parseUnits(String(value), decimals);

export const formatAmount = (raw, decimals) => ethers.utils.formatUnits(raw, decimals);

/** Approve `spender` for `amount` only when the current allowance is too low. */
export async function ensureAllowance(tokenAddress, owner, spender, amount, signer) {
  const token = erc20(tokenAddress, signer);
  const current = await token.allowance(owner, spender);
  if (current.gte(amount)) return null;
  const tx = await token.approve(spender, amount);
  await tx.wait();
  return tx.hash;
}

/** Turn wallet / RPC errors into a short, readable message. */
export const readableError = (err) => {
  if (!err) return "Unknown error";
  if (err.code === 4001 || err.code === "ACTION_REJECTED") return "Request rejected in wallet.";
  const msg = err.reason || err.data?.message || err.error?.message || err.message || String(err);
  return msg.length > 160 ? `${msg.slice(0, 157)}…` : msg;
};
