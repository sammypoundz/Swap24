import React, { useState, useEffect } from "react";
import "./PlaceAds.css";
import {
  ArrowLeft,
  DollarSign,
  Coins,
  CreditCard,
  ChevronDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { parseUnits } from "viem";
import ERC20_ABI from "./abi/ERC20.json";
import MARKET_ABI from "./contracts/Swap24MarketABI.json"; // ✅ Updated ABI for new contract
import TokenSelectModal from "./TokenSelectModal";

// ✅ Update this when you redeploy
const MARKETPLACE_CONTRACT = "0x12f1e05c7224a3f1f2b55ce1e7152632d9d5399e";

const PlaceAds: React.FC = () => {
  const navigate = useNavigate();
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const client = usePublicClient();

  const [tab, setTab] = useState<"buy" | "sell">("buy");
  const [isTokenModalOpen, setTokenModalOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");
  const [rate, setRate] = useState("");
  const [isApproved, setIsApproved] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // ✅ New loading state
  const [usdRate] = useState(1600);

  // ✅ Check ERC20 approval on token select
  useEffect(() => {
    if (!selectedToken || !address || !client) return;

    const checkAllowance = async () => {
      try {
        const allowance = await client.readContract({
          address: selectedToken.address as `0x${string}`,
          abi: ERC20_ABI,
          functionName: "allowance",
          args: [address, MARKETPLACE_CONTRACT],
        });
        setIsApproved(Number(allowance) >= parseFloat(amount || "0"));
      } catch (err) {
        console.error("Error checking allowance:", err);
      }
    };

    checkAllowance();
  }, [selectedToken, address, amount, client]);

  // ✅ Approve ERC20 token for escrow
  const handleApprove = async () => {
    if (!walletClient) return alert("Wallet not connected");
    if (!client) return alert("Public client not initialized");
    if (!selectedToken) return alert("Select a token first");
    if (!amount) return alert("Enter amount before approving");

    try {
      setIsLoading(true);
      const txHash = await walletClient.writeContract({
        address: selectedToken.address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [MARKETPLACE_CONTRACT, parseUnits(amount, selectedToken.decimals)],
      });

      await client.waitForTransactionReceipt({ hash: txHash });
      alert(`✅ ${selectedToken.symbol} approved successfully!`);
      setIsApproved(true);
    } catch (err) {
      console.error("Approval failed:", err);
      alert("Approval failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Create Ad (calls createAd on the new contract)
  const handlePostAd = async () => {
    if (!walletClient) return alert("Wallet not connected");
    if (!selectedToken) return alert("Select a token first");
    if (!isApproved && selectedToken.symbol !== "ETH")
      return alert(`Please approve ${selectedToken.symbol} first`);
    if (!amount || !price) return alert("Fill all fields");

    try {
      setIsLoading(true);
      const txHash = await walletClient.writeContract({
        address: MARKETPLACE_CONTRACT,
        abi: MARKET_ABI,
        functionName: "createAd",
        args: [
          selectedToken.address,
          selectedToken.symbol,
          parseUnits(amount, selectedToken.decimals),
          BigInt(price),
          paymentMethod,
          rate ||
            `1 NGN = ${(1 / parseFloat(price)).toFixed(6)} ${
              selectedToken.symbol
            }`,
        ],
      });

      alert(`🎉 Ad created successfully!\nTx: ${txHash}`);
    } catch (err) {
      console.error("Ad creation failed:", err);
      alert("Transaction failed. Please check console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  const estimatedValue =
    amount && price
      ? (parseFloat(amount) * parseFloat(price)).toLocaleString()
      : "0";

  return (
    <div className="succ-placeads">
      {/* Header */}
      <div className="succ-placeads-header">
        <button className="succ-back-btn" onClick={() => navigate("/dashboard")}>
          <ArrowLeft size={20} />
        </button>
        <h2>Place an Ad</h2>
      </div>

      {/* Tabs */}
      <div className="succ-placeads-tabs">
        <button
          className={`succ-tab-btn ${tab === "buy" ? "active" : ""}`}
          onClick={() => setTab("buy")}
        >
          <Coins size={16} /> Buy
        </button>
        <button
          className={`succ-tab-btn ${tab === "sell" ? "active" : ""}`}
          onClick={() => setTab("sell")}
        >
          <DollarSign size={16} /> Sell
        </button>
      </div>

      {/* Info Card */}
      <div className="succ-info-card">
        <div className="succ-info-icon">
          <CreditCard size={20} />
        </div>
        <div>
          <h3>Create your {tab === "buy" ? "Buy" : "Sell"} Ad</h3>
          <p>Set your preferred price, limits, and payment methods.</p>
        </div>
      </div>

      {/* Form Body */}
      <div className="succ-placeads-body">
        {/* Asset Selector */}
        <div className="succ-input-group">
          <label>Asset</label>
          <div className="succ-select" onClick={() => setTokenModalOpen(true)}>
            <span>
              {selectedToken ? (
                <>
                  <img
                    src={selectedToken.logo}
                    alt={selectedToken.symbol}
                    width="18"
                    style={{ marginRight: "6px" }}
                  />
                  {selectedToken.symbol}
                </>
              ) : (
                "Select Token"
              )}
            </span>
            <ChevronDown size={16} />
          </div>
        </div>

        {/* Price */}
        <div className="succ-input-group">
          <label>Price (₦)</label>
          <input
            type="number"
            placeholder="Enter price per token"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          {price && (
            <small>≈ ${(parseFloat(price) / usdRate).toFixed(2)} per token</small>
          )}
        </div>

        {/* Amount */}
        <div className="succ-input-group">
          <label>Available Amount</label>
          <input
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          {selectedToken && (
            <small>
              Balance: {selectedToken.balance} {selectedToken.symbol}
            </small>
          )}
        </div>

        {/* Payment Method */}
        <div className="succ-input-group">
          <label>Payment Method</label>
          <input
            type="text"
            placeholder="e.g. Bank Transfer"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
        </div>

        {/* Optional Rate */}
        <div className="succ-input-group">
          <label>Exchange Rate</label>
          <input
            type="text"
            placeholder="e.g. 1 NGN = 0.00031 BTC"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
          />
        </div>

        {/* Summary */}
        <div className="succ-summary">
          <p>
            Estimated Total: <strong>₦{estimatedValue}</strong>
          </p>
        </div>

        {/* ✅ Approve or Submit Button (one at a time) */}
        {selectedToken && selectedToken.symbol !== "ETH" ? (
          !isApproved ? (
            <button
              className="succ-approve-btn"
              onClick={handleApprove}
              disabled={isLoading}
            >
              {isLoading
                ? `Approving ${selectedToken.symbol}...`
                : `Approve ${selectedToken.symbol}`}
            </button>
          ) : (
            <button
              className="succ-submit-btn"
              onClick={handlePostAd}
              disabled={isLoading}
            >
              {isLoading
                ? "Posting Ad..."
                : tab === "buy"
                ? "Post Buy Ad"
                : "Post Sell Ad"}
            </button>
          )
        ) : (
          <button
            className="succ-submit-btn"
            onClick={handlePostAd}
            disabled={isLoading}
          >
            {isLoading
              ? "Posting Ad..."
              : tab === "buy"
              ? "Post Buy Ad"
              : "Post Sell Ad"}
          </button>
        )}
      </div>

      {/* Token Select Modal */}
      <TokenSelectModal
        isOpen={isTokenModalOpen}
        onClose={() => setTokenModalOpen(false)}
        onSelect={setSelectedToken}
      />
    </div>
  );
};

export default PlaceAds;
