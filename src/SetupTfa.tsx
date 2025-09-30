import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendOtpPhone } from "./api";
import "./SetupTfa.css";

const SetupTfa: React.FC = () => {
  const [countryCode, setCountryCode] = useState("+234");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // 👇 Get logged-in user's email from localStorage
  const email = localStorage.getItem("userEmail") || "";

  const handleSendOtp = async () => {
    if (!phone) {
      setMessage("Please enter your phone number.");
      return;
    }
    if (!email) {
      setMessage("User email not found. Please log in again.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const fullPhone = `${countryCode}${phone}`;
      const res = await sendOtpPhone({ email, phone: fullPhone });

      // ✅ Handle response safely
      const resMessage = (res.data as any)?.message || "OTP sent successfully!";
      setMessage(resMessage);

      // Navigate to PhoneOtp page with both email and phone
      navigate("/phone-otp", { state: { email, phone: fullPhone } });
    } catch (err: any) {
      console.error(err);
      setMessage(err.response?.data?.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/dashboard"); // Go back to dashboard
  };

  return (
    <div className="secure-container">
      {/* Top Bar */}
      <div className="secure-top-bar">
        <button className="secure-close-btn" onClick={handleCancel}>×</button>
        <div className="secure-progress">
          <span className="secure-dot secure-active"></span>
          <span className="secure-dot secure-active"></span>
          <span className="secure-dot"></span>
        </div>
      </div>

      {/* Text */}
      <div className="secure-text-section">
        <h2>Set up 2-step verification</h2>
        <p>Enter your phone number so we can text you an authentication code.</p>
      </div>

      {/* Input Form */}
      <div className="secure-form">
        <div className="secure-labels">
          <span>Country</span>
          <span>Phone</span>
        </div>
        <div className="secure-input-row">
          <select
            className="secure-country-select"
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
          >
            <option value="+234">+234</option>
            <option value="+1">+1</option>
            <option value="+44">+44</option>
            <option value="+91">+91</option>
          </select>
          <input
            type="tel"
            placeholder="Your phone number"
            className="secure-phone-input"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
      </div>

      {/* Message */}
      {message && <p className="secure-message">{message}</p>}

      {/* Continue Button */}
      <button
        className="secure-continue-btn"
        onClick={handleSendOtp}
        disabled={loading}
      >
        {loading ? "Sending..." : "Continue"}
      </button>
    </div>
  );
};

export default SetupTfa;
    