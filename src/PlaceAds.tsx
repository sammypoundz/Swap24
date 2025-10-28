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
import MARKET_ABI from "./contracts/Swap24MarketABI.json";
import TokenSelectModal from "./TokenSelectModal";
import { addUserTransaction } from "./api"; // ✅ backend integration
import { decodeEventLog } from "viem";

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

  // ✅ Create Ad and record it both on blockchain and backend
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

      const tokenAmount = parseUnits(amount, selectedToken.decimals);
      const priceInNaira = BigInt(price);
      const tokenAddress = isETH
        ? "0x0000000000000000000000000000000000000000"
        : selectedToken.address;

      const computedRate =
        rate ||
        `1 NGN = ${(1 / parseFloat(price)).toFixed(6)} ${selectedToken.symbol}`;

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

      // ✅ Step 1: Send ad to blockchain
      const txHash = await walletClient.writeContract({
        address: MARKETPLACE_CONTRACT,
        abi: MARKET_ABI,
        functionName: "createAd",
        args,
        ...(isETH ? { value: tokenAmount } : {}),
      });

      // ✅ Step 2: Wait for transaction confirmation
      const receipt = await client.waitForTransactionReceipt({ hash: txHash });

      if (receipt.status === "success") {
        alert(`🎉 Ad created successfully!\nTx: ${txHash}`);

        const storedUser = localStorage.getItem("userId");
        const userId = storedUser || "";

        if (!userId) {
          alert("⚠️ User not found in local storage. Please log in again.");
          setIsLoading(false);
          return;
        }

        // ✅ Step 3: Extract adsId (adId) from contract event safely
        let adsId: string | null = null;
        try {
          const logEvent = receipt.logs.find(
            (log: any) =>
              log.address.toLowerCase() === MARKETPLACE_CONTRACT.toLowerCase()
          );

          if (logEvent) {
            const decoded = decodeEventLog({
              abi: MARKET_ABI,
              data: logEvent.data,
              topics: logEvent.topics,
            });

            // viem sometimes returns .args as array or object depending on ABI
            if (Array.isArray(decoded?.args)) {
              adsId = decoded.args[0]?.toString() || null;
            } else if (decoded?.args && typeof decoded.args === "object") {
              adsId =
                (decoded.args as any)?.adId?.toString() ||
                (decoded.args as any)?.id?.toString() ||
                null;
            }
          }
        } catch (err) {
          console.warn("⚠️ Could not decode adsId:", err);
        }

        console.log("🆔 Extracted adsId:", adsId);

        // ✅ Step 4: Log transaction
        await addUserTransaction({
          userId,
          type: "adPlacement",
          asset: selectedToken.symbol,
          amount: parseFloat(amount),
          valueInNaira: parseFloat(price) * parseFloat(amount),
          status: "completed",
          txHash,
          transactionDescription: `Placed a ${tab} ad for ${amount} ${selectedToken.symbol} at ₦${price} via ${paymentMethod}`,
        });

        // ✅ Step 5: Record ad with adsId in backend
        const backendURL =
          import.meta.env.MODE === "development"
            ? "http://localhost:5000"
            : "https://swap24server.onrender.com";

        const offerData = {
          userId,
          adsId, // ✅ include blockchain ad ID
          title: `${tab === "buy" ? "Buy" : "Sell"} ${selectedToken.symbol}`,
          description: `User posted ${tab} ad on blockchain`,
          assetType: selectedToken.symbol,
          pricePerUnit: parseFloat(price),
          availableAmount: parseFloat(amount),
          minLimit: 0,
          maxLimit: parseFloat(amount),
          paymentMethods: [paymentMethod],
          txHash,
        };

        const res = await fetch(
          `${backendURL}/api/transactions/recordAdAfterContract`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(offerData),
          }
        );

        const data = await res.json();
        if (data.success) {
          console.log("✅ Ad recorded in backend:", data.offer);
        } else {
          console.warn("⚠️ Failed to record ad in backend:", data.message);
        }
      } else {
        alert("⚠️ Transaction failed on-chain.");
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

  // ✅ Cancel Ad and log transaction properly using on-chain data
  // const handleCancelAd = async (adId: number) => {
  //   if (!walletClient || !client)
  //     return alert("⚠️ Please connect your wallet first.");

  //   try {
  //     setIsLoading(true);

  //     // ✅ Step 1: Fetch ad details BEFORE cancellation
  //     console.log("🔍 Fetching ad details before cancellation...");
  //     const adData: any = await client.readContract({
  //       address: MARKETPLACE_CONTRACT,
  //       abi: MARKET_ABI,
  //       functionName: "getAd",
  //       args: [BigInt(adId)],
  //     });

  //     if (!adData) {
  //       alert("⚠️ Ad not found on blockchain.");
  //       setIsLoading(false);
  //       return;
  //     }

  //     // ✅ Extract proper values from adData
  //     const [
  //       id,
  //       vendor,
  //       tokenAddress,
  //       cryptoToken,
  //       tokenAmount,
  //       priceInNaira,
  //       paymentMethod,
  //       rate,
  //       isActive,
  //       isETH,
  //     ] = adData;

  //     console.log("📦 Ad data fetched:", {
  //       id,
  //       vendor,
  //       tokenAddress,
  //       cryptoToken,
  //       tokenAmount: tokenAmount.toString(),
  //       priceInNaira: priceInNaira.toString(),
  //       paymentMethod,
  //       rate,
  //       isETH,
  //     });

  //     // ✅ Step 2: Execute on-chain cancellation
  //     const txHash = await walletClient.writeContract({
  //       address: MARKETPLACE_CONTRACT,
  //       abi: MARKET_ABI,
  //       functionName: "cancelAd",
  //       args: [BigInt(adId)],
  //     });

  //     const receipt = await client.waitForTransactionReceipt({ hash: txHash });

  //     if (receipt.status === "success") {
  //       alert(`✅ Ad #${adId} cancelled successfully!`);

  //       // ✅ Step 3: Log the transaction to backend
  //       const storedUser = localStorage.getItem("userId");
  //       const userId = storedUser || "";

  //       if (!userId) {
  //         alert("⚠️ User not found in local storage. Please log in again.");
  //         setIsLoading(false);
  //         return;
  //       }

  //       const tokenDecimals = isETH ? 18 : 18; // Adjust based on known token decimals
  //       const cancelledAmount = Number(tokenAmount) / 10 ** tokenDecimals;
  //       const cancelledPrice = Number(priceInNaira);
  //       const totalRefund = cancelledAmount * cancelledPrice;

  //       console.log("💰 Logging refund transaction:", {
  //         userId,
  //         asset: cryptoToken,
  //         amount: cancelledAmount,
  //         valueInNaira: totalRefund,
  //       });

  //       try {
  //         const res = await addUserTransaction({
  //           userId,
  //           type: "adCancellation",
  //           asset: cryptoToken,
  //           amount: cancelledAmount,
  //           valueInNaira: totalRefund,
  //           status: "completed",
  //           txHash,
  //           transactionDescription: `Cancelled Ad #${adId} — refunded ${cancelledAmount} ${cryptoToken} to wallet via ${paymentMethod}`,
  //         });

  //         console.log("✅ Transaction logged successfully:", res.data);
  //       } catch (logErr) {
  //         console.error("❌ Failed to log cancellation:", logErr);
  //         alert(
  //           "⚠️ Cancelled successfully on-chain but not logged in backend."
  //         );
  //       }
  //     } else {
  //       alert("⚠️ Ad cancellation failed on-chain.");
  //     }
  //   } catch (err: any) {
  //     console.error("❌ Ad cancellation failed:", err);
  //     alert(
  //       `Failed to cancel ad.\nReason: ${
  //         err?.shortMessage || err?.message || "Unknown error"
  //       }`
  //     );
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const estimatedValue =
    amount && price
      ? (parseFloat(amount) * parseFloat(price)).toLocaleString()
      : "0";

  return (
    <div className="succ-placeads">
      <div className="succ-placeads-header">
        <button className="succ-back-btn" onClick={() => navigate("/my-ads")}>
          <ArrowLeft size={20} />
        </button>
        <h2>Place an Ad</h2>
      </div>

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

      <div className="succ-info-card">
        <div className="succ-info-icon">
          <CreditCard size={20} />
        </div>
        <div>
          <h3>Create your {tab === "buy" ? "Buy" : "Sell"} Ad</h3>
          <p>Set your preferred price, limits, and payment methods.</p>
        </div>
      </div>

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
          <>
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

            {/* ✅ Cancel Ad Example */}
            {/* <button
              className="succ-cancel-btn"
              onClick={() => handleCancelAd(1)} // 🔧 Replace with actual ad ID
              disabled={isLoading}
              style={{ marginTop: "10px", background: "#b71c1c" }}
            >
              Cancel Ad
            </button> */}
          </>
        )}
      </div>

      <TokenSelectModal
        isOpen={isTokenModalOpen}
        onClose={() => setTokenModalOpen(false)}
        onSelect={setSelectedToken}
      />
    </div>
  );
};

export default PlaceAds;
