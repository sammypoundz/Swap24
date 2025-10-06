import React, { useState } from "react";
import "./Market.css";
import { useNavigate } from "react-router-dom";

import backBtn from "./assets/backbtn.svg";
import searchIcon from "./assets/searchicon.svg";
import bellIcon from "./assets/bell-02.svg";
import avatarImg from "./assets/avatarimg.svg";
import BottomNav from "./BottomNav";

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
  CryptoToken: string;
  totalPrice: string;
}

const offers: Offer[] = [
  {
    id: 1,
    name: "Leslie Alexander",
    positiveRate: "83% positive",
    tokenAmount: 0.16207834,
    change: "0%",
    rate: "1 NGN = 0.00031 of BTC",
    limit: "order limit 0.947 - 0.903854 BTC",
    paymentMethod: "Bank Transfer",
    offererImg: avatarImg,
    CryptoToken: "BTC",
    totalPrice: "₦1,000,000",
  },
  {
    id: 2,
    name: "Leslie Alexander",
    positiveRate: "83% positive",
    tokenAmount: 162077734.26,
    change: "1%",
    rate: "1 NGN = 1.00  of ETH",
    limit: "order limit 15,947 - 41,854 ETH",
    paymentMethod: "Bank Transfer",
    offererImg: avatarImg,
    CryptoToken: "ETH",
    totalPrice: "₦1,000,000",
  },
  {
    id: 3,
    name: "Leslie Alexander",
    positiveRate: "83% positive",
    tokenAmount: 162077734.26,
    change: "1%",
    rate: "1 NGN = 0.01 of BTC",
    limit: "order limit 0.23344 - 0.5677789 BTC",
    paymentMethod: "Bank Transfer",
    offererImg: avatarImg,
    CryptoToken: "USDT",
    totalPrice: "₦1,000,000",
  },
];

const Market: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<"buy" | "sell">("buy");
  const [selectedAsset, setSelectedAsset] = useState<string>("BTC");

  const navigate = useNavigate();
  const handleBack = () => {
    navigate("/dashboard");
  };

  return (
    <div className="succ-market">
      <header className="succ-market-header">
        <div className="markettitle">
          <h4 className="succ-market-title">
            <button className="Market-backbtn" onClick={handleBack}>
              {" "}
              <img src={backBtn} />
            </button>
            Market
          </h4>
          <p className="succ-market-p">
            <img src={bellIcon} />
          </p>
        </div>
        <div className="succ-market-topbar">
          <button className="succ-market-icon">
            <img src={searchIcon} />
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

        <div className="market-inner-wrap">
          {offers.map((offer) => (
            <div key={offer.id} className="succ-offer-card">
              <div className="succ-offer-info">
                <div className="succ-offer-user">
                  <div className="succ-avatar">
                    <img src={offer.offererImg} />
                  </div>
                  <div>
                    <p className="succ-name">{offer.name}</p>
                    <span className="succ-rate">{offer.positiveRate}</span>
                  </div>
                </div>

                <div className="succ-offer-tokenAmount">
                  <h2>
                    <span className="crypto-prefix">{offer.CryptoToken}</span>
                    &nbsp;
                    {Number(offer.tokenAmount).toLocaleString(undefined, {
                      minimumFractionDigits:
                        offer.tokenAmount % 1 === 0 ? 0 : 2,
                      maximumFractionDigits: offer.tokenAmount < 1 ? 8 : 2, // show more decimals if less than 1 (for crypto)
                    })}
                  </h2>

                  <span className="succ-offer-change">{offer.change}</span>
                </div>

                <p className="succ-offer-desc">{offer.rate}</p>
                <p className="succ-offer-limit">{offer.limit}</p>

                <p className="succ-offer-method">{offer.paymentMethod}</p>
              </div>

              <button
                className="succ-buy-btn"
                onClick={() =>
                  navigate("/buy-asset", {
                    state: { offer, asset: selectedAsset },
                  })
                }
              >
                Buy
              </button>
            </div>
          ))}
        </div>
      </section>

      <footer className="succ-market-footer">
        <BottomNav />
      </footer>
    </div>
  );
};

export default Market;
