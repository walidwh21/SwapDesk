import Head from "next/head";
import "../styles/globals.css";
import { APP_NAME } from "../config";
import { WalletProvider } from "../context/WalletContext";
import Header from "../components/Header";

export default function App({ Component, pageProps }) {
  return (
    <WalletProvider>
      <Head>
        <title>{APP_NAME}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Swap tokens and manage Uniswap V3 liquidity." />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>
      <Header />
      <main className="page">
        <Component {...pageProps} />
      </main>
    </WalletProvider>
  );
}
