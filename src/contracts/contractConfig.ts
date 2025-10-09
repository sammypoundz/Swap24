import { createPublicClient, createWalletClient, custom, http } from "viem";
import { sepolia } from "viem/chains";
import Swap24MarketABI from "./Swap24MarketABI.json";

// 👇 Your deployed contract address from Hardhat
export const contractAddress = "0x7b66522d365e4c906b89d2263d37c2c306264f89";

// 👇 Public client for reading contract data
export const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(import.meta.env.VITE_SEPOLIA_RPC_URL || "https://sepolia.infura.io/v3/YOUR_INFURA_KEY"),
});

// 👇 Wallet client for sending transactions (using MetaMask)
export const walletClient = createWalletClient({
  chain: sepolia,
  transport: custom(window.ethereum),
});

// 👇 Contract configuration (used for both read/write)
export const contractConfig = {
  address: contractAddress as `0x${string}`,
  abi: Swap24MarketABI,
};
