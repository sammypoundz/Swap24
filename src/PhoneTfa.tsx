import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./PhoneTfa.css";
import Arrow_left from "./assets/Arrow_left.svg";
import { loginVerifyOtp } from "./api";

interface LocationState {
  email?: string;
  phone?: string;
}

const PhoneTfa: React.FC = () => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ safely grab email & phone from navigation state
  const { email = "", phone = "" } = (location.state as LocationState) || {};

  const handleBack = () => {
    navigate("/signin");
  };

  const handleSubmit = async () => {
    if (!code) {
      setError("Please enter the OTP code.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await loginVerifyOtp({ email, otp: code });
      console.log("OTP verified ✅:", res.data);

      // ✅ Check response and store necessary details
      if (res.data?.token) {
        localStorage.setItem("authToken", res.data.token);
      }

      if (res.data?.userId) {
        localStorage.setItem("userId", res.data.userId);
      }

      // ✅ Redirect to dashboard
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Mask phone: keep country code & last 2 digits
  const maskPhone = (num: string) => {
    if (!num) return "+xx xxxx xx**";
    const last2 = num.slice(-2);
    return `+xx xxxx xx${last2}`;
  };

  return (
    <div className="tfa-container">
      <div className="tfa-content">
        <button className="tfa-back" onClick={handleBack}>
          <img src={Arrow_left} className="tfa-back-img" alt="Back" />
        </button>

        <h2 className="tfa-title">
          Enter the 7-digit code we texted to <br />
          <span className="tfa-phone">{maskPhone(phone)}</span>
        </h2>
        <p className="tfa-subtext">
          This extra step shows it’s really you trying to sign in
        </p>

        <div className="tfaInputWrap">
          <input
            type="text"
            maxLength={7}
            placeholder="7754397"
            className="tfa-input"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </div>

        {error && <p className="tfa-error">{error}</p>}
      </div>

      <div className="tfa-footer">
        <button
          className="tfa-submit"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Verifying..." : "Submit"}
        </button>
        <button className="tfa-help">I need help</button>
      </div>
    </div>
  );
};

export default PhoneTfa;
