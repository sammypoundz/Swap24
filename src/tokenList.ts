import { mainnet, sepolia } from "wagmi/chains";

export const supportedTokensByChain: Record<number, any[]> = {
  [mainnet.id]: [
    {
      symbol: "USDC",
      address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      decimals: 6,
      logo: "/tokens/usdc.svg",
    },
    {
      symbol: "DAI",
      address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
      decimals: 18,
      logo: "/tokens/dai.svg",
    },
  ],
  [sepolia.id]: [
    {
      symbol: "USDC",
      address: "0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b",
      decimals: 6,
      logo: "/tokens/usdc.svg",
    },
    {
      symbol: "DAI",
      address: "0xF14f9596430931E177469715c591513308244e8F",
      decimals: 18,
      logo: "/tokens/dai.svg",
    },
    {
      symbol: "WETH",
      address: "0xdd13E55209Fd76AfE204dBda4007C227904f0a81",
      decimals: 18,
      logo: "/tokens/weth.svg",
    },
  ],
};
