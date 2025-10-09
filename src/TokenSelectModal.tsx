import React, { useEffect, useState } from "react";
import { X, Search } from "lucide-react";
import { useAccount, usePublicClient, useChainId } from "wagmi";
import { formatUnits } from "viem";
import ERC20_ABI from "./abi/ERC20.json";
import "./PlaceAds.css";

// ✅ Tokens by network (Mainnet + Sepolia)
const supportedTokensByChain: Record<number, any[]> = {
  1: [
    {
      symbol: "USDC",
      address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      decimals: 6,
    },
    {
      symbol: "DAI",
      address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
      decimals: 18,
    },
    {
      symbol: "WETH",
      address: "0xC02aaA39b223FE8D0A0E5C4F27eAD9083C756Cc2",
      decimals: 18,
    },
  ],
  11155111: [
    {
      symbol: "USDC",
      address: "0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b",
      decimals: 6,
    },
    {
      symbol: "DAI",
      address: "0xF14f9596430931E177469715c591513308244e8F",
      decimals: 18,
    },
    {
      symbol: "WETH",
      address: "0xdd13E55209Fd76AfE204dBda4007C227904f0a81",
      decimals: 18,
    },
  ],
};

interface Token {
  symbol: string;
  address: string;
  decimals: number;
  logo?: string;
  balance?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (token: Token) => void;
}

// ✅ Helper to get logo from TrustWallet’s assets repo
const getTokenLogo = (address: string) => {
  if (address === "0x0000000000000000000000000000000000000000") {
    return "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png"; // ETH logo
  }
  return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${address}/logo.png`;
};

const TokenSelectModal: React.FC<Props> = ({ isOpen, onClose, onSelect }) => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const client = usePublicClient();
  const [search, setSearch] = useState("");
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(false);

  const supportedTokens = supportedTokensByChain[chainId] || [];

  useEffect(() => {
    if (!isOpen || !isConnected || !address || !client) return;

    const fetchBalances = async () => {
      setLoading(true);
      try {
        const balances: Token[] = [];

        // ✅ Native ETH balance
        const nativeBalance = await client.getBalance({ address });
        const nativeFormatted = Number(formatUnits(nativeBalance, 18));
        if (nativeFormatted > 0) {
          balances.push({
            symbol: chainId === 1 ? "ETH" : "SEP-ETH",
            address: "0x0000000000000000000000000000000000000000",
            decimals: 18,
            logo: getTokenLogo("0x0000000000000000000000000000000000000000"),
            balance: nativeFormatted.toFixed(4),
          });
        }

        // ✅ ERC-20 tokens
        for (const token of supportedTokens) {
          try {
            const balanceRaw = await client.readContract({
              address: token.address as `0x${string}`,
              abi: ERC20_ABI,
              functionName: "balanceOf",
              args: [address],
            });

            const balance = Number(formatUnits(balanceRaw as bigint, token.decimals));
            if (balance > 0) {
              balances.push({
                ...token,
                logo: getTokenLogo(token.address),
                balance: balance.toFixed(4),
              });
            }
          } catch (err) {
            console.warn(`Error reading ${token.symbol} balance:`, err);
          }
        }

        setTokens(balances);
      } catch (err) {
        console.error("Error fetching token balances:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBalances();
  }, [isOpen, isConnected, address, client, chainId]);

  const filtered = tokens.filter((t) =>
    t.symbol.toLowerCase().includes(search.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="succ-modal-overlay">
      <div className="succ-modal-content">
        <div className="succ-modal-header">
          <h3>Select Token</h3>
          <button onClick={onClose} className="succ-close-btn">
            <X size={18} />
          </button>
        </div>

        <div className="succ-search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search token..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="succ-token-list">
          {loading ? (
            <p>Fetching wallet balances...</p>
          ) : filtered.length > 0 ? (
            filtered.map((token) => (
              <div
                key={token.address + token.symbol}
                className="succ-token-item"
                onClick={() => {
                  onSelect(token);
                  onClose();
                }}
              >
                <img
                  src={token.logo}
                  alt={token.symbol}
                  className="succ-token-logo"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png";
                  }}
                />
                <div className="succ-token-info">
                  <h4>{token.symbol}</h4>
                  <p>{token.balance}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="succ-no-token">
              {isConnected
                ? "No tokens found in your wallet."
                : "Connect your wallet to view tokens."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TokenSelectModal;
