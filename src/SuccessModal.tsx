import React from "react";
import "./SuccessModal.css";

interface SuccessModalProps {
  onContinue: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ onContinue }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-card">
        {/* Shield with check */}
        <div className="icon-wrap">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="200"
            height="200"
            viewBox="0 0 24 24"
            fill="#0A2E87"
          >
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-1 16l-5-5 1.41-1.42L11 14.17l6.59-6.59L19 9l-8 8z" />
          </svg>
        </div>

        {/* Title */}
        <h2 className="modal-title">Successful</h2>

        {/* Description */}
        <p className="modal-text">
          You have successfully created your account, click continue to go to
          the home page
        </p>

        {/* Button */}
        <button className="continue-btn" onClick={onContinue}>
          Continue
        </button>
      </div>
    </div>
  );
};

export default SuccessModal;
