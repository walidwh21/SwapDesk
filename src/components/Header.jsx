import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { APP_NAME } from "../config";
import { shortAddress } from "../lib/format";
import { useWallet } from "../context/WalletContext";
import { IconWallet, LogoMark } from "./Icons";

const LINKS = [
  { href: "/", label: "Swap" },
  { href: "/pools", label: "Pools" },
  { href: "/tokens", label: "Tokens" },
];

export default function Header() {
  const { pathname } = useRouter();
  const { account, chainName, connect } = useWallet();

  return (
    <header className="header">
      <Link href="/" className="brand">
        <LogoMark size={30} />
        <span>{APP_NAME}</span>
      </Link>

      <nav className="nav" aria-label="Primary">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} className={pathname === l.href ? "nav-link active" : "nav-link"}>
            {l.label}
          </Link>
        ))}
      </nav>

      <div className="header-right">
        {account && chainName && <span className="chip">{chainName}</span>}
        <button className={account ? "btn btn-ghost" : "btn btn-primary"} onClick={account ? undefined : connect}>
          <IconWallet size={16} />
          {account ? shortAddress(account) : "Connect wallet"}
        </button>
      </div>
    </header>
  );
}
