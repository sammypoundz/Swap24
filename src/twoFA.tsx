// src/pages/TwoFA.tsx
import { useState } from "react";

interface TwoFAProps {
  onClose: () => void; // 👈 go back to SignIn
  onNeedHelp?: () => void; // optional extra action
}

const TwoFA = ({ onClose, onNeedHelp }: TwoFAProps) => {
  return (
    <div className="signin-container">
      <div className="signInInnerWrap">
        {/* Cancel button → back to SignIn */}
        <button className="close-btn" onClick={onClose}>
          ←
        </button>

        <h2 className="signin-title">
          Enter the 7-digit code we texted to +xx xxxx xx88
        </h2>

        <form className="signin-form">
          <label className="label lSty">
            This extra step shows it’s really you trying to sign in
          </label>
          <input type="number" placeholder="7754397" className="input" />

          <div className="btnWrap2">
            <div className="parent-container mb">
              <button type="submit" className="signin-btn ">
                Submit
              </button>
            </div>

            <div className="parent-container">
              <button
                type="button"
                className="signin-btn help-btn btn secondary"
                onClick={onNeedHelp}
              >
                I need help
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TwoFA;
