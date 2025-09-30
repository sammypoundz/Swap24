import React from "react";
import { useNavigate } from "react-router-dom"; // ✅ import
import "./StartTfa.css";
import FingerprintIcon from "./assets/fingerprint.svg";

const StartTfa: React.FC = () => {
  const navigate = useNavigate(); // ✅ hook for navigation

  return (
    <div className="secure-container">
      {/* Top Bar */}
      <div className="secure-top-bar">
        <button className="secure-close-btn">×</button>
        <div className="secure-progress">
          <span className="secure-dot secure-active"></span>
          <span className="secure-dot"></span>
          <span className="secure-dot"></span>
        </div>
      </div>

      {/* Illustration */}
      <div className="secure-illustration">
        <img
          src={FingerprintIcon}
          alt="Fingerprint"
          className="secure-fingerprint"
        />
      </div>

      {/* Text */}
      <div className="secure-text-section">
        <h2>Secure your account</h2>
        <p>
          One way we keep your account secure is with 2-step verification,
          which requires your phone number. We will never call you or use your
          number without your permission.
        </p>
      </div>

      {/* Button */}
      <button
        className="secure-continue-btn"
        onClick={() => navigate("/setup-tfa")} // ✅ route to SetupTfa
      >
        Continue
      </button>
    </div>
  );
};

export default StartTfa;
