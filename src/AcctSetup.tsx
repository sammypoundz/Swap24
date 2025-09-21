import React from "react";
import SecureAccount from "./assets/Group 5276.svg";
interface AcctSetupProps {
  onFinish?: () => void; // e.g. continue to TFA
  onBack?: () => void; // e.g. go back to signup
}

const AcctSetup: React.FC<AcctSetupProps> = ({ onFinish, onBack }) => {
  return (
    <div className="acct-container">
      {/* Close Icon */}
      <button className="acct-close" onClick={onBack}>
        x
      </button>

      {/* Progress Indicator */}
      <div className="acct-progress">
        <div className="acct-progress-line">
          <div className="acct-progress-active" style={{ width: "33%" }} />
        </div>
        <div className="acct-progress-dots">
          <span className="active"></span>
          <span></span>
          <span></span>
        </div>
      </div>

      {/* Illustration */}
      <div className="acct-illustration">
        <div className="acct-illustration-box">
          {/* <div className="acct-lock">🔒</div> */}
          <img src={SecureAccount} alt="Verify Email" />
        </div>
      </div>

      {/* Title */}
      <h2 className="acct-title">Let’s secure your account</h2>

      {/* Steps */}
      <div className="acct-steps">
        <div className="acct-step completed">
          <span className="acct-step-num">1</span>
          <div className="MyDflex">
            <p className="acct-step-title">Create your account</p>
            <p className="acct-step-status">Completed</p>
          </div>
        </div>

        <div className="acct-step">
          <span className="acct-step-num">2</span>
          <div className="MyDflex">
            <p className="acct-step-title">
              Secure your account <br />
              <span className="sub-con">2-step verification</span>
            </p>

            <p className="acct-step-status ">1 min </p>
          </div>
        </div>

        <div className="acct-step">
          <span className="acct-step-num">3</span>
          <div className="MyDflex">
            <p className="acct-step-title">
              Verify your identity <br />
              <span className="sub-con">Required by financial regulations</span>
            </p>

            <p className="acct-step-status ">5 min </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <button className="acct-start-btn" onClick={onFinish}>
        Start
      </button>
    </div>
  );
};

export default AcctSetup;
