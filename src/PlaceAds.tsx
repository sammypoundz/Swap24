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
import { formatUnits, parseUnits } from "viem";
import ERC20_ABI from "./abi/ERC20.json";
import TokenSelectModal from "./TokenSelectModal";

const MARKETPLACE_CONTRACT = "0xYourMarketplaceContract";

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
  const [isApproved, setIsApproved] = useState(false);
  const [usdRate] = useState(1600);

  // ✅ Check token allowance
  useEffect(() => {
    if (!selectedToken || !address) return;

    const checkAllowance = async () => {
      try {
        const allowance = await client?.readContract({
          address: selectedToken.address as `0x${string}`,
          abi: ERC20_ABI,
          functionName: "allowance",
          args: [address, MARKETPLACE_CONTRACT],
        });

        setIsApproved(Number(allowance) > 0);
      } catch (err) {
        console.error("Error reading allowance:", err);
      }
    };

    checkAllowance();
  }, [selectedToken, address]);

  // ✅ Approve token
  const handleApprove = async () => {
    if (!walletClient || !selectedToken) return;

    try {
      await walletClient.writeContract({
        address: selectedToken.address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [MARKETPLACE_CONTRACT, BigInt(2 ** 256 - 1)],
      });
      setIsApproved(true);
      alert(`${selectedToken.symbol} approved successfully!`);
    } catch (err) {
      console.error("Approve failed:", err);
      alert("Approval failed");
    }
  };

  // ✅ Post Ad handler
  const handlePostAd = async () => {
    if (!selectedToken) return alert("Select a token first");
    if (!isApproved) return alert("Approve token first");

    // Future: Call backend or smart contract here
    alert(`Ad posted successfully for ${selectedToken.symbol}!`);
  };

  const estimatedValue =
    amount && price
      ? (parseFloat(amount) * parseFloat(price)).toLocaleString()
      : "0";

  return (
    <div className="succ-placeads">
      {/* Header */}
      <div className="succ-placeads-header">
        <button className="succ-back-btn" onClick={() => navigate(-1)}>
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
              Balance: {selectedToken.balance} {selectedToken.symbol}
            </small>
          )}
        </div>

        {/* Summary */}
        <div className="succ-summary">
          <p>
            Estimated Total: <strong>₦{estimatedValue}</strong>
          </p>
        </div>

        {/* Approve Button */}
        {!isApproved && selectedToken && (
          <button className="succ-approve-btn" onClick={handleApprove}>
            Approve {selectedToken.symbol}
          </button>
        )}

        {/* Submit */}
        <button className="succ-submit-btn" onClick={handlePostAd}>
          {tab === "buy" ? "Post Buy Ad" : "Post Sell Ad"}
        </button>
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
