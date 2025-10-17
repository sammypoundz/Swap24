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
import { parseUnits } from "viem"; // removed unused formatUnits
import ERC20_ABI from "./abi/ERC20.json";
import MARKET_ABI from "./contracts/Swap24MarketABI.json";
import TokenSelectModal from "./TokenSelectModal";

// ✅ Replace after redeploy
const MARKETPLACE_CONTRACT = "0x4f12d6fb32891acb6221d5c0f6b90a11b6da1427";

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
  const [isLoading, setIsLoading] = useState(false);
  const [usdRate] = useState(1600);

  // ✅ Check ERC20 allowance
  useEffect(() => {
    const checkAllowance = async () => {
      if (!selectedToken || !address || !client) return;

      // Skip for native ETH
      if (
        selectedToken.symbol === "ETH" ||
        selectedToken.symbol === "SepoliaETH"
      ) {
        setIsApproved(true);
        return;
      }

      try {
        const allowance = (await client.readContract({
          address: selectedToken.address as `0x${string}`,
          abi: ERC20_ABI,
          functionName: "allowance",
          args: [address, MARKETPLACE_CONTRACT],
        })) as bigint;

        const enoughAllowance =
          allowance >= parseUnits(amount || "0", selectedToken.decimals);

        setIsApproved(enoughAllowance);
      } catch (err) {
        console.error("❌ Error checking allowance:", err);
      }
    };

    checkAllowance();
  }, [selectedToken, amount, address, client]);

  // ✅ Approve ERC20 token
  const handleApprove = async () => {
    if (!walletClient || !client)
      return alert("⚠️ Please connect your wallet first.");
    if (!selectedToken) return alert("⚠️ Select a token first.");
    if (!amount) return alert("⚠️ Enter an amount to approve.");

    try {
      setIsLoading(true);
      const txHash = (await walletClient.writeContract({
        address: selectedToken.address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [
          MARKETPLACE_CONTRACT,
          parseUnits(amount, selectedToken.decimals),
        ],
      })) as `0x${string}`;

      await client.waitForTransactionReceipt({ hash: txHash });
      alert(`✅ Approved ${selectedToken.symbol}`);
      setIsApproved(true);
    } catch (err) {
      console.error("❌ Approval failed:", err);
      alert("Approval failed. Please check your wallet.");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Create Ad (ETH or ERC20)
  const handlePostAd = async () => {
    if (!walletClient || !client)
      return alert("⚠️ Please connect your wallet first.");
    if (!selectedToken) return alert("⚠️ Select a token first.");
    if (!amount || !price) return alert("⚠️ Fill all required fields.");

    const isETH =
      selectedToken.symbol.toUpperCase() === "ETH" ||
      selectedToken.symbol.toUpperCase().includes("SEP");

    if (!isETH && !isApproved)
      return alert(`⚠️ Please approve ${selectedToken.symbol} first.`);

    try {
      setIsLoading(true);

      // 🧮 Convert user input
      const tokenAmount = parseUnits(amount, selectedToken.decimals);
      const priceInNaira = BigInt(price);

      // 🪙 Use address(0) for ETH, otherwise token address
      const tokenAddress = isETH
        ? "0x0000000000000000000000000000000000000000"
        : selectedToken.address;

      // 💬 Generate dynamic rate if empty
      const computedRate =
        rate ||
        `1 NGN = ${(1 / parseFloat(price)).toFixed(6)} ${selectedToken.symbol}`;

      // ✅ Prepare args for contract
      const args: readonly [
        `0x${string}`,
        string,
        bigint,
        bigint,
        string,
        string
      ] = [
        tokenAddress as `0x${string}`,
        selectedToken.symbol,
        tokenAmount,
        priceInNaira,
        paymentMethod,
        computedRate,
      ];

      console.log("🚀 Posting ad with args:", args);

      // ✅ Send transaction (only attach ETH value for native)
      const txHash = await walletClient.writeContract({
        address: MARKETPLACE_CONTRACT,
        abi: MARKET_ABI,
        functionName: "createAd",
        args,
        ...(isETH ? { value: tokenAmount } : {}), // <== 🔥 key fix here
      });

      console.log("✅ Transaction sent:", txHash);

      // ⏳ Wait for transaction confirmation
      const receipt = await client.waitForTransactionReceipt({ hash: txHash });
      if (receipt.status === "success") {
        alert(`🎉 Ad created successfully!\nTx: ${txHash}`);
      } else {
        alert(`⚠️ Transaction failed on-chain.`);
      }
    } catch (err: any) {
      console.error("❌ Ad creation failed:", err);
      alert(
        `⚠️ Transaction failed.\nReason: ${
          err?.shortMessage || err?.message || "Unknown error"
        }`
      );
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
        <button
          className="succ-back-btn"
          onClick={() => navigate("/dashboard")}
        >
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

      {/* Form */}
      <div className="succ-placeads-body">
        {/* Token Selector */}
        <div className="succ-input-group">
          <label>Asset</label>
          <div className="succ-select" onClick={() => setTokenModalOpen(true)}>
            <span>
              {selectedToken ? (
                <>
                  {selectedToken.logo && (
                    <img
                      src={selectedToken.logo}
                      alt={selectedToken.symbol}
                      width="18"
                      style={{ marginRight: "6px" }}
                    />
                  )}
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
            <small>
              ≈ ${(parseFloat(price) / usdRate).toFixed(2)} per token
            </small>
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
              Balance: {selectedToken.balance || 0} {selectedToken.symbol}
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

        {/* Rate */}
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

        {/* Buttons */}
        {selectedToken &&
        selectedToken.symbol !== "ETH" &&
        selectedToken.symbol !== "SepoliaETH" &&
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
        )}
      </div>

      {/* Token Modal */}
      <TokenSelectModal
        isOpen={isTokenModalOpen}
        onClose={() => setTokenModalOpen(false)}
        onSelect={setSelectedToken}
      />
    </div>
  );
};

export default PlaceAds;
