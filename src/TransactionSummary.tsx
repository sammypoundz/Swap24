// src/pages/TransactionSummary.tsx
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./transactionSummary.css";
import checkIcon from "./assets/check.svg";

const TransactionSummary: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { summary } = state || {};

  if (!summary) {
    navigate("/market");
    return null;
  }

  const handleCancel = () => navigate("/market");
  const handlePaymentMade = () => {
    // ✅ send confirmation to backend
    console.log("✅ Payment confirmed for:", summary.transactionId);
    navigate("/payment-status", { state: { success: true } });
  };

  return (
    <div className="succ-summary">
      <header className="succ-summary-header">
        <h2>Transaction Summary</h2>
      </header>

      <div className="succ-summary-card">
        <div className="succ-summary-top">
          <img src={checkIcon} alt="Token" className="succ-summary-icon" />
          <h3>Buy {summary.asset}</h3>
          <p>
            You’re buying <b>{summary.tokenAmount}</b> {summary.asset} for{" "}
            <b>₦{summary.nairaAmount.toLocaleString()}</b>
          </p>
        </div>

        <div className="succ-summary-details">
          <p>
            <span>Seller:</span> <b>{summary.sellerName}</b>
          </p>
          <p>
            <span>Bank:</span> <b>{summary.bankName}</b>
          </p>
          <p>
            <span>Account Number:</span> <b>{summary.accountNumber}</b>
          </p>
          <p>
            <span>Payment Method:</span> <b>{summary.paymentMethod}</b>
          </p>
        </div>

        <div className="succ-summary-actions">
          <button className="succ-cancel-btn" onClick={handleCancel}>
            Cancel
          </button>
          <button className="succ-confirm-btn" onClick={handlePaymentMade}>
            I’ve Made Payment
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionSummary;
