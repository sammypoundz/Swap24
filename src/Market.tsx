import React, { useState, useEffect } from "react";
import "./Market.css";
import { useNavigate } from "react-router-dom";
import { useAccount } from "wagmi";
import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";

import backBtn from "./assets/backbtn.svg";
import searchIcon from "./assets/searchicon.svg";
import bellIcon from "./assets/bell-02.svg";
import avatarImg from "./assets/avatarimg.svg";
import BottomNav from "./BottomNav";

import swap24Abi from "./contracts/Swap24MarketABI.json"; // ✅ ABI file

// ✅ Create a public client using your Alchemy Sepolia RPC
const client = createPublicClient({
  chain: sepolia,
  transport: http("https://eth-sepolia.g.alchemy.com/v2/kXzHzmRhXZwsatZnwtLik"),
});

// ✅ Your deployed contract address
const CONTRACT_ADDRESS = "0x4f12d6fb32891acb6221d5c0f6b90a11b6da1427";

interface Offer {
  id: number;
  vendor: string;
  cryptoToken: string;
  tokenAmount: string;
  priceInNaira: string;
  paymentMethod: string;
  rate: string;
  isActive: boolean;
}

const Market: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<"buy" | "sell">("buy");
  const [selectedAsset, setSelectedAsset] = useState<string>("BTC");
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { isConnected } = useAccount();
  // const { address, isConnected } = useAccount();
  const navigate = useNavigate();

  // ✅ Fetch ads directly from the blockchain
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const ads = await client.readContract({
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: swap24Abi,
          functionName: "getAllAds",
        });

        if (ads && Array.isArray(ads)) {
          const formattedOffers: Offer[] = ads.map((ad: any) => ({
            id: Number(ad.id),
            vendor: ad.vendor,
            cryptoToken: ad.cryptoToken,
            tokenAmount: ad.tokenAmount
              ? (Number(ad.tokenAmount) / 1e18).toFixed(4)
              : "0.0000",
            priceInNaira: ad.priceInNaira
              ? `₦${Number(ad.priceInNaira).toLocaleString()}`
              : "₦0",
            paymentMethod: ad.paymentMethod,
            rate: ad.rate || "-",
            isActive: ad.isActive,
          }));

          setOffers(formattedOffers.filter((o) => o.isActive)); // ✅ Show only active ads
        } else {
          setOffers([]);
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
            ⏳ Fetching offers from blockchain...
          </p>
        ) : error ? (
          <p style={{ color: "red", textAlign: "center" }}>
            ⚠️ Failed to load offers: {error}
          </p>
        ) : offers.length === 0 ? (
          <p style={{ textAlign: "center", marginTop: "20px" }}>
            No offers available
          </p>
        ) : (
          <div className="market-inner-wrap">
            {offers.map((offer) => (
              <div key={offer.id} className="succ-offer-card">
                <div className="succ-offer-info">
                  <div className="succ-offer-user">
                    <div className="succ-avatar">
                      <img src={avatarImg} alt="Vendor" />
                    </div>
                    <div>
                      <p className="succ-name">
                        {offer.vendor.slice(0, 6)}...
                        {offer.vendor.slice(-4)}
                      </p>
                      <span className="succ-rate">Verified</span>
                    </div>
                  </div>

                  <div className="succ-offer-tokenAmount">
                    <h2>
                      <span className="crypto-prefix">
                        {offer.cryptoToken}
                      </span>{" "}
                      {offer.tokenAmount}
                    </h2>
                    <span className="succ-offer-change">0%</span>
                  </div>

                  <p className="succ-offer-desc">{offer.priceInNaira}</p>
                  <p className="succ-offer-limit">{offer.paymentMethod}</p>
                  <p className="succ-offer-limit">{offer.rate}</p>
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
