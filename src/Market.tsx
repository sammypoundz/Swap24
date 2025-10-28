import React, { useState, useEffect } from "react";
import "./Market.css";
import { useNavigate } from "react-router-dom";
import { useAccount } from "wagmi";

import backBtn from "./assets/backbtn.svg";
import searchIcon from "./assets/searchicon.svg";
import bellIcon from "./assets/bell-02.svg";
import avatarImg from "./assets/avatarimg.svg";
import BottomNav from "./BottomNav";

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
  updatedAt: string;
}

interface Seller {
  username?: string;
  bio?: string;
  profilePicture?: string;
  walletAddress?: string;
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

const Market: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<"buy" | "sell">("buy");
  const [selectedAsset, setSelectedAsset] = useState<string>("BTC");
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { isConnected } = useAccount();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // ✅ Automatically pick backend URL
        const backendURL =
          import.meta.env.MODE === "development"
            ? "http://localhost:5000"
            : "https://swap24server.onrender.com";

        // ✅ Add /api/offers/test endpoint fallback for Postman or testing
        const res = await fetch(`${backendURL}/api/offers`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          mode: "cors",
        });

        if (!res.ok) throw new Error(`Server responded with ${res.status}`);
        const data = await res.json();

        if (data.success) {
          console.log("✅ Offers fetched:", data.offers);
          setOffers(data.offers);
        } else {
          throw new Error(data.message || "Failed to load offers");
        }
      } catch (err: any) {
        console.error("⚠️ Failed to load offers:", err);
        setError(err.message || "Failed to load offers");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOffers();
  }, []);

  const handleBack = () => navigate("/dashboard");

  const handleBuyClick = (offer: Offer) => {
    if (!isConnected) {
      alert("Please connect your wallet first.");
      return;
    }
    navigate("/buy-asset", { state: { offer, asset: selectedAsset } });
  };

  return (
    <div className="succ-market">
      <header className="succ-market-header">
        <div className="markettitle">
          <h4 className="succ-market-title">
            <button className="Market-backbtn" onClick={handleBack}>
              <img src={backBtn} alt="Back" />
            </button>
            Market
          </h4>
          <p className="succ-market-p">
            <img src={bellIcon} alt="Notifications" />
          </p>
        </div>

        <div className="succ-market-topbar">
          <button className="succ-market-icon">
            <img src={searchIcon} alt="Search" />
          </button>
          <input
            type="text"
            placeholder="Search..."
            className="succ-market-search"
          />
        </div>

        <div className="succ-market-tabs">
          <button
            className={`succ-tab ${selectedTab === "buy" ? "active" : ""}`}
            onClick={() => setSelectedTab("buy")}
          >
            Buy
          </button>
          <button
            className={`succ-tab ${selectedTab === "sell" ? "active" : ""}`}
            onClick={() => setSelectedTab("sell")}
          >
            Sell
          </button>
        </div>

        <div className="succ-market-assets">
          {["BTC", "ETH", "USDT", "BNB", "ADA"].map((asset) => (
            <button
              key={asset}
              className={`succ-asset-btn ${
                selectedAsset === asset ? "active" : ""
              }`}
              onClick={() => setSelectedAsset(asset)}
            >
              {asset}
            </button>
          ))}
        </div>
      </header>

      <section className="succ-market-body">
        <h3 className="succ-market-subtitle">All Offers</h3>

        {isLoading ? (
          <p style={{ textAlign: "center", marginTop: "20px" }}>
            ⏳ Fetching offers...
          </p>
        ) : error ? (
          <p style={{ color: "red", textAlign: "center" }}>⚠️ {error}</p>
        ) : offers.length === 0 ? (
          <p style={{ textAlign: "center", marginTop: "20px" }}>
            No offers available
          </p>
        ) : (
          <div className="market-inner-wrap">
            {offers.map((offer, index) => (
              <div key={index} className="succ-offer-card">
                <div className="succ-offer-info">
                  <div className="succ-offer-user">
                    <div className="succ-avatar">
                      <img
                        src={offer.seller?.profilePicture || avatarImg}
                        alt={offer.seller?.username || "Vendor"}
                      />
                    </div>
                    <div>
                      <p className="succ-name">
                        {offer.seller?.username || "Unknown"}
                      </p>
                      <span className="succ-rate">
                        {offer.seller?.bio || "Verified Seller"}
                      </span>
                    </div>
                  </div>

                  {offer.seller?.traderStats && (
                    <div className="succ-trader-stats">
                      <p>
                        <strong>{offer.seller.traderStats.totalOrders}</strong>{" "}
                        Orders •{" "}
                        <strong>
                          {offer.seller.traderStats.positivityRate}%
                        </strong>{" "}
                        Success
                      </p>
                      <p>
                        ⏱️ Avg Release:{" "}
                        {offer.seller.traderStats.averageReleaseTime}m •
                        Payment: {offer.seller.traderStats.averagePaymentTime}m
                      </p>
                    </div>
                  )}

                  <div className="succ-offer-tokenAmount">
                    <h2>
                      <span className="crypto-prefix">{offer.assetType}</span>{" "}
                      {offer.availableAmount}
                    </h2>
                  </div>

                  <p className="succ-offer-desc">
                    ₦{offer.pricePerUnit.toLocaleString()}
                  </p>
                  <p className="succ-offer-limit">
                    {offer.paymentMethods.join(", ")}
                  </p>
                </div>

                <button
                  className="succ-buy-btn"
                  onClick={() => handleBuyClick(offer)}
                >
                  Buy
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <footer className="succ-market-footer">
        <BottomNav />
      </footer>
    </div>
  );
};

export default Market;
