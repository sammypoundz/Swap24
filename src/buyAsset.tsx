import React from "react";
import "./buyAsset.css";
import { useNavigate } from "react-router-dom";

import backIcon from "./assets/Expand_down.svg";
import avatarImg from "./assets/avatarimg.svg";
import swapIcon from "./assets/swap.svg"; // make sure you have a swap icon asset
import nairaIcon from "./assets/mdi_naira.svg"; // make sure you have a swap icon asset
import ETH from "./assets/ETC - Binance-Peg Ethereum Classic.svg";
import likeIcon from "./assets/iconamoon_like-light.svg";
const BuyAsset: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/market");
  };

  return (
    <div className="succ-buyasset">
      <header className="succ-buyasset-header">
        <button className="succ-buyasset-back" onClick={handleBack}>
          <img src={backIcon} alt="Back" />
        </button>
        <h2>Buy ETH</h2>
      </header>

      <section className="succ-buyasset-body">
        {/* User info */}
        <div className="succ-asset-seller">
          <div className="succ-asset-seller-info">
            <img src={avatarImg} alt="Seller" className="succ-asset-avatar" />
            <div>
              <h3>Leslie Alexander</h3>
              <p>
                <span>1128 orders | </span>
                <span className="succ-seller-rate">
                  <img src={likeIcon} />
                  95.20%
                </span>
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

        {/* Asset info */}
        <div className="succ-asset-price">
          <div className="">
            <h3>₦3,706.22/ETH</h3>
            <p>Available: <span className="spa">0.05723735 ETH</span></p>
          </div>

          <div className="price-dflex ">
            
              <strong>15 Minute</strong>
              <span>Payment Time</span>
            
          </div>
        </div>

        {/* Conversion card */}
        <div className="succ-convert-box">
          <div className="succ-convert-row">
            <div className="succ-convert-item">
              <div className="succ-convert-header">
                <b className="nairaWrap-dflex">
                  <span className="nairaWrap ">
                    {" "}
                    <img src={nairaIcon} />
                  </span>
                  NGN
                </b>
                <button className="succ-pay-btn">Pay</button>
              </div>
              <div className="succ-convert-input">
                <h4>₦10,000 - ₦10,000,000</h4>
                <p>
                  Limit: <span>₦10,000 - ₦500,000</span>
                </p>
              </div>
            </div>
          </div>

          <div className="succ-convert-swap">
            <div className="swap-inner">
              <img src={swapIcon} alt="Swap" />
            </div>
          </div>

          <div className="succ-convert-row">
            <div className="succ-convert-item">
              <div className="succ-convert-header">
                <b className="coinWrap-dflex">
                  {" "}
                  <span className="coinWrap">
                    <img src={ETH} alt="Swap" />
                  </span>{" "}
                  ETH
                </b>
                <button className="succ-receive-btn">Receive</button>
              </div>
              <h4>0.00000000</h4>
            </div>
          </div>
        </div>

        {/* Payment method */}
        <div className="succ-payment-method">
          <p>
            Payment method: <strong>Bank Transfer</strong>
          </p>
        </div>

        {/* Buy button */}
        <button className="suc-buy-btn">Buy ETH</button>
      </section>
    </div>
  );
};

export default BuyAsset;
