require("@nomiclabs/hardhat-waffle");

// Optional: fork mainnet for realistic swap tests. Provide your own RPC endpoint
// through the environment, never in source control.
const forkUrl = process.env.FORK_RPC_URL;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.7.6",
    settings: { optimizer: { enabled: true, runs: 5000 } },
  },
  networks: {
    hardhat: forkUrl ? { forking: { url: forkUrl } } : {},
    localhost: { url: process.env.LOCAL_RPC_URL || "http://127.0.0.1:8545" },
  },
};
