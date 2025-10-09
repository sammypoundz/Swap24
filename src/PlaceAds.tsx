import React, { useState } from "react";
import "./PlaceAds.css";
import { ArrowLeft, DollarSign, Coins, CreditCard, Clock, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PlaceAds: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"buy" | "sell">("buy");

  return (
    <div className="succ-placeads">
      {/* Header */}
      <div className="succ-placeads-header">
        <button className="succ-back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <h2>Place an Ad</h2>
      </div>

      {/* Buy / Sell Tabs */}
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

      {/* Form Section */}
      <div className="succ-placeads-body">
        <div className="succ-input-group">
          <label>Asset</label>
          <div className="succ-select">
            <span>USDT</span>
            <ChevronDown size={16} />
          </div>
        </div>

        <div className="succ-input-group">
          <label>Price (₦)</label>
          <input type="number" placeholder="Enter price per USDT" />
        </div>

        <div className="succ-input-group">
          <label>Available Amount</label>
          <input type="number" placeholder="Enter total USDT to trade" />
        </div>

        <div className="succ-input-group">
          <label>Minimum Order (₦)</label>
          <input type="number" placeholder="Enter minimum limit" />
        </div>

        <div className="succ-input-group">
          <label>Maximum Order (₦)</label>
          <input type="number" placeholder="Enter maximum limit" />
        </div>

        <div className="succ-input-group">
          <label>Payment Method</label>
          <div className="succ-select">
            <span>Bank Transfer</span>
            <ChevronDown size={16} />
          </div>
        </div>

        <div className="succ-input-group">
          <label>Trade Duration</label>
          <div className="succ-select">
            <span>
              <Clock size={14} style={{ marginRight: "6px" }} /> 15 minutes
            </span>
            <ChevronDown size={16} />
          </div>
        </div>

        <button className="succ-submit-btn">
          {tab === "buy" ? "Post Buy Ad" : "Post Sell Ad"}
        </button>
      </div>
    </div>
  );
};

export default PlaceAds;
