import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  verifyPhoneOtp,
  resendPhoneOtp,
} from "./api";
import "./PhoneOtp.css";

interface LocationState {
  phone: string;
  email: string;
}

const PhoneOtp: React.FC = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  const email = state?.email; // You must pass email when navigating
  const phone = state?.phone;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !phone || !email) {
      setMessage("OTP or phone/email missing.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await verifyPhoneOtp({ email, phone, otp });
      setMessage((res.data as any).message || "OTP verified successfully!");

      // Navigate to account creation success
      navigate("/acct-creation-success");
    } catch (err: any) {
      console.error(err);
      setMessage(err.response?.data?.message || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!phone || !email) {
      setMessage("Phone or email missing.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await resendPhoneOtp({ email, phone });
      setMessage((res.data as any).message || "OTP resent successfully!");
    } catch (err: any) {
      console.error(err);
      setMessage(err.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/setup-tfa");
  };

  return (
    <div className="phone-otp-container">
      <button className="phone-otp-close" onClick={handleCancel}>
        &times;
      </button>

      {/* Progress bar */}
      <div className="phone-otp-progress">
        <span className="phone-otp-step phone-otp-completed" />
        <span className="phone-otp-step phone-otp-active" />
        <span className="phone-otp-step" />
      </div>

      <div className="phone-otp-body">
        <h2 className="phone-otp-title">Enter authentication code</h2>
        <p className="phone-otp-subtitle">
          Enter the 7-digit code we just texted to your phone number.
        </p>

        <form onSubmit={handleSubmit}>
          <label className="phone-otp-label">Code</label>
          <input
            type="text"
            className="phone-otp-input"
            maxLength={7}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter code"
          />
          {message && <p className="phone-otp-message">{message}</p>}
          <button
            type="submit"
            className="phone-otp-button"
            disabled={loading}
          >
            {loading ? "Processing..." : "Continue"}
          </button>
        </form>
      </div>

      <div className="phone-otp-footer">
        <button
          type="button"
          className="phone-otp-resend"
          onClick={handleResend}
          disabled={loading}
        >
          Resend code
        </button>
      </div>
    </div>
  );
};

export default PhoneOtp;
