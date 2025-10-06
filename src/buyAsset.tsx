// src/pages/buyAsset.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./buyAsset.css";

import backIcon from "./assets/Expand_down.svg";
import swapIcon from "./assets/swap.svg";

interface Offer {
  id: number;
  name: string;
  positiveRate: string;
  tokenAmount: number;
  change: string;
  rate: string;
  limit: string;
  paymentMethod: string;
  offererImg: string;
  totalPrice: string;
}

// ✅ Utility to format money or token
const formatAmount = (value: number, isMoney = false): string => {
  if (isNaN(value)) return "0";
  return isMoney
    ? `₦${value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    : value.toLocaleString(undefined, {
        minimumFractionDigits: value % 1 === 0 ? 0 : 2,
        maximumFractionDigits: value < 1 ? 8 : 2,
      });
};

const BuyAsset: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const state = (location.state || {}) as { offer?: Offer; asset?: string };
  const offer = state.offer;
  const asset = state.asset || "TOKEN";

  useEffect(() => {
    if (!offer) navigate("/market");
  }, [offer, navigate]);

  // --- Extract limits like "500 - 10000"
  const extractLimits = (limitStr = ""): [number, number] => {
    const match = limitStr.match(/([\d.]+)\s*-\s*([\d.]+)/);
    return match ? [parseFloat(match[1]), parseFloat(match[2])] : [0, 0];
  };
  const [minLimit, maxLimit] = extractLimits(offer?.limit);

  // ✅ Extract rate (supports both directions)
  const extractRate = (rateStr = ""): number => {
    if (!rateStr) return 0;

    // Case 1: "1 NGN = 0.00001 of BTC"
    const ngnToToken = rateStr.match(/1\s*NGN\s*=\s*([\d.]+)\s*(of)?\s*\w+/i);
    if (ngnToToken) {
      const tokenPerNaira = parseFloat(ngnToToken[1]);
      if (tokenPerNaira > 0) {
        const ngnPerToken = 1 / tokenPerNaira;
        console.log("💱 Rate parsed:", rateStr);
        console.log(`👉 1 Token = ${ngnPerToken} NGN`);
        return ngnPerToken;
      }
    }

    // Case 2: "1 BTC = 45000000 NGN"
    const tokenToNgn = rateStr.match(/1\s*\w+\s*=\s*([\d.]+)\s*NGN/i);
    if (tokenToNgn) {
      const ngnValue = parseFloat(tokenToNgn[1]);
      console.log("💱 Rate parsed:", rateStr);
      console.log(`👉 1 Token = ${ngnValue} NGN`);
      return ngnValue;
    }

    console.warn("⚠️ Could not parse rate:", rateStr);
    return 0;
  };

  const nairaPerToken = extractRate(offer?.rate || "");

  console.log("🔍 Parsed rate from backend:", offer?.rate);
  console.log("💰 Computed NGN per token:", nairaPerToken);

  // --- States ---
  const [tokenInput, setTokenInput] = useState<string>("");
  const [nairaAmount, setNairaAmount] = useState<number>(0);
  const [error, setError] = useState<string>("");

  // ✅ Compute conversion on input
  useEffect(() => {
    console.group("💡 Conversion Debug");
    console.log("🔢 Token input:", tokenInput);
    console.log("💹 NGN per Token:", nairaPerToken);

    if (!offer) {
      console.warn("⚠️ No offer found — exiting");
      console.groupEnd();
      return;
    }

    if (tokenInput === "") {
      setNairaAmount(0);
      setError("");
      console.groupEnd();
      return;
    }

    const tokenAmount = Number(tokenInput);
    if (isNaN(tokenAmount)) {
      setError("Invalid number");
      setNairaAmount(0);
      console.groupEnd();
      return;
    }

    if (nairaPerToken <= 0) {
      setError("Unable to compute conversion — invalid rate");
      setNairaAmount(0);
      console.groupEnd();
      return;
    }

    // ✅ Convert Token → NGN
    const converted = tokenAmount * nairaPerToken;
    setNairaAmount(converted);
    setError("");

    // ✅ Log the result in console
    console.log(`🧮 ${tokenAmount} ${asset} × ${nairaPerToken} = ${converted} NGN`);
    console.log("✅ Naira amount:", converted);
    console.groupEnd();
  }, [tokenInput, nairaPerToken, offer, asset]);

  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    if (/^\d*\.?\d*$/.test(input)) {
      setTokenInput(input);
    }
  };

  const handleBack = () => navigate("/market");

  const handleBuy = () => {
    if (!offer) return;
    if (!tokenInput || Number(tokenInput) === 0) {
      setError("Enter token amount to proceed");
      return;
    }
    if (error) return;

    console.log("🟢 Buy Request:", {
      offerId: offer.id,
      tokenAmount: tokenInput,
      nairaAmount,
    });
  };

  if (!offer) return null;

  return (
    <div className="succ-buyasset">
      {/* Header */}
      <header className="succ-buyasset-header">
        <button className="succ-buyasset-back" onClick={handleBack}>
          <img src={backIcon} alt="Back" />
        </button>
        <h2>Buy {asset}</h2>
      </header>

      <section className="succ-buyasset-body">
        {/* Seller Info */}
        <div className="succ-asset-seller">
          <div className="succ-asset-seller-info">
            <img
              src={offer.offererImg}
              alt={offer.name}
              className="succ-asset-avatar"
            />
            <div>
              <h3>{offer.name}</h3>
              <p>
                <span>{offer.positiveRate}</span>
              </p>
            </div>
          </div>

          <div className="succ-seller-time">
            <p>
              <strong>3.85 Minute</strong>
              <span>Avg. Release Time</span>
            </p>
          </div>
        </div>

        {/* Price Info */}
        <div className="succ-asset-price">
          <div>
            <h4>{offer.totalPrice}</h4>
            <h3>{offer.rate}</h3>
            <p>
              Available:{" "}
              <span className="spa">
                {formatAmount(offer.tokenAmount)} {asset}
              </span>
            </p>
          </div>

          <div className="price-dflex">
            <strong>15 Minute</strong>
            <span>Payment Time</span>
          </div>
        </div>

        {/* Conversion Section */}
        <div className="succ-convert-box">
          {/* NGN Pay */}
          <div className="succ-convert-row">
            <div className="succ-convert-item">
              <div className="succ-convert-header">
                <b>NGN</b>
                <button className="succ-pay-btn">Pay</button>
              </div>
              <div className="succ-convert-input">
                <h4>{formatAmount(nairaAmount, true)}</h4>
              </div>
            </div>
          </div>

          {/* Swap Icon */}
          <div className="succ-convert-swap">
            <div className="swap-inner">
              <img src={swapIcon} alt="Swap" />
            </div>
          </div>

          {/* Token Receive */}
          <div className="succ-convert-row">
            <div className="succ-convert-item">
              <div className="succ-convert-header">
                <b>{asset}</b>
                <button className="succ-receive-btn">Receive</button>
              </div>

              <div className="succ-convert-input">
                <input
                  type="number"
                  inputMode="decimal"
                  value={tokenInput}
                  onChange={handleTokenChange}
                  placeholder="0.00000000"
                  className="succ-convert-field"
                />
              </div>

              {error && <p className="succ-error">{error}</p>}
            </div>
          </div>
        </div>

        {/* Payment method */}
        <div className="succ-payment-method">
          <p>
            Payment method: <strong>{offer.paymentMethod}</strong>
          </p>
        </div>

        {/* Buy button */}
        <button
          className="suc-buy-btn"
          disabled={!!error || Number(tokenInput) === 0}
          onClick={handleBuy}
        >
          Buy {asset}
        </button>
      </section>
    </div>
  );
};

export default BuyAsset;
