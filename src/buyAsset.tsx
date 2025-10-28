import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./buyAsset.css";

import backIcon from "./assets/Expand_down.svg";
import swapIcon from "./assets/swap.svg";
import avatarImg from "./assets/avatarimg.svg";

interface TraderStats {
  totalOrders: number;
  successfulOrders: number;
  cancelledOrders: number;
  positivityRate: number;
  averageReleaseTime: number;
  averagePaymentTime: number;
  bankDetails: {
    bankName: string;
    accountNumber: string;
    accountUsername: string;
  };
}

interface Seller {
  username?: string;
  bio?: string;
  profilePicture?: string;
  traderStats?: TraderStats | null;
}

interface Offer {
  adsId?: string;
  title: string;
  description: string;
  assetType: string;
  pricePerUnit: number;
  availableAmount: number;
  minLimit?: number;
  maxLimit?: number;
  paymentMethods: string[];
  status: string;
  createdAt: string;
  seller?: Seller | null;
}

// ✅ Utility for number formatting
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
  const assetFromState = state.asset;

  // ✅ Automatically detect and update asset (BTC, ETH, etc.)
  const asset =
    assetFromState || offer?.assetType?.toUpperCase() || "TOKEN";

  useEffect(() => {
    if (!offer) navigate("/market");
  }, [offer, navigate]);

  // --- States ---
  const [tokenInput, setTokenInput] = useState<string>("");
  const [nairaAmount, setNairaAmount] = useState<number>(0);
  const [error, setError] = useState<string>("");

  // ✅ Compute conversion (Token → NGN)
  useEffect(() => {
    if (!offer || !offer.pricePerUnit) return;

    if (tokenInput === "") {
      setNairaAmount(0);
      return;
    }

    const tokenValue = parseFloat(tokenInput);
    if (isNaN(tokenValue)) {
      setError("Invalid token value");
      return;
    }

    const ngnValue = tokenValue * offer.pricePerUnit;
    setNairaAmount(ngnValue);
    setError("");
  }, [tokenInput, offer]);

  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    if (/^\d*\.?\d*$/.test(input)) setTokenInput(input);
  };

  const handleBack = () => navigate("/market");

  const handleBuy = async () => {
    if (!offer) return;
    if (!tokenInput || Number(tokenInput) <= 0) {
      setError("Enter a valid token amount");
      return;
    }

    alert(
      `Buying ${tokenInput} ${asset} for ₦${nairaAmount.toLocaleString()} from ${
        offer.seller?.username || "Vendor"
      }`
    );
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
              src={offer.seller?.profilePicture || avatarImg}
              alt={offer.seller?.username || "Seller"}
              className="succ-asset-avatar"
            />
            <div>
              <h3>{offer.seller?.username || "Vendor"}</h3>
              <p>{offer.seller?.bio || "Verified Seller"}</p>
              {offer.seller?.traderStats && (
                <p>
                  {offer.seller.traderStats.positivityRate}% Success •{" "}
                  {offer.seller.traderStats.totalOrders} Orders
                </p>
              )}
            </div>
          </div>

          <div className="succ-seller-time">
            <p>
              <strong>
                {offer.seller?.traderStats?.averageReleaseTime || "3.8"} mins
              </strong>
              <span>Avg Release</span>
            </p>
          </div>
        </div>

        {/* Price Info */}
        <div className="succ-asset-price">
          <div>
            <h4>{formatAmount(offer.pricePerUnit, true)}</h4>
            <p>
              Available:{" "}
              <span className="spa">
                {formatAmount(offer.availableAmount)} {asset}
              </span>
            </p>
            <p>
              Limit:{" "}
              <span className="spa">
                ₦{offer.minLimit?.toLocaleString() || 0} - ₦
                {offer.maxLimit?.toLocaleString() || 0}
              </span>
            </p>
          </div>

          <div className="price-dflex">
            <strong>
              {offer.seller?.traderStats?.averagePaymentTime || "15"} mins
            </strong>
            <span>Payment Time</span>
          </div>
        </div>

        {/* Conversion Box */}
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
            Payment method:{" "}
            <strong>{offer.paymentMethods.join(", ")}</strong>
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
