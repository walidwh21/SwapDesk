const fs = require("fs");
const path = require("path");
const hre = require("hardhat");

// Canonical Uniswap V3 SwapRouter (same address on most networks / forks).
const ROUTER = process.env.SWAP_ROUTER || "0xE592427A0AEce92De3Edee1F18E0157C05861564";

async function deploy(name, ...args) {
  const factory = await hre.ethers.getContractFactory(name);
  const contract = await factory.deploy(...args);
  await contract.deployed();
  console.log(`${name.padEnd(18)} ${contract.address}`);
  return contract;
}

async function main() {
  const registry = await deploy("PositionRegistry");
  const single = await deploy("SingleHopSwapper", ROUTER);
  const multi = await deploy("MultiHopSwapper", ROUTER);

  const tokens = {};
  for (const [name, symbol, supply] of [
    ["Alpha Token", "ALPHA", 1_000_000],
    ["Beta Token", "BETA", 1_000_000],
    ["Gamma Token", "GAMMA", 1_000_000],
  ]) {
    tokens[symbol] = (await deploy("DemoToken", name, symbol, supply)).address;
  }

  const out = {
    network: hre.network.name,
    registry: registry.address,
    singleHopSwapper: single.address,
    multiHopSwapper: multi.address,
    tokens,
  };
  const dir = path.join(__dirname, "..", "deployments");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${hre.network.name}.json`), JSON.stringify(out, null, 2));

  console.log("\nAdd these to .env.local:\n");
  console.log(`NEXT_PUBLIC_REGISTRY=${out.registry}`);
  console.log(`NEXT_PUBLIC_SINGLE_HOP=${out.singleHopSwapper}`);
  console.log(`NEXT_PUBLIC_MULTI_HOP=${out.multiHopSwapper}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
