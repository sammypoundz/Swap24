import React from "react";
import { useNavigate } from "react-router-dom";
import "./SecureAccountSteps.css";
import secure_illustration from "./assets/Group 5276.svg";

interface Step {
  id: number;
  title: string;
  subtitle?: string;
  status: "completed" | "active" | "pending";
  time?: string;
}

const steps: Step[] = [
  { id: 1, title: "Create your account", status: "completed" },
  {
    id: 2,
    title: "Secure your account",
    subtitle: "2-step verification",
    status: "active",
    time: "1 min",
  },
  {
    id: 3,
    title: "Verify your identity",
    subtitle: "Required by financial regulations",
    status: "pending",
    time: "5 min",
  },
];

const SecureAccountSteps: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="steps-container">
      {/* Close + Progress bar */}
      <div className="top-bar">
        {/* <button className="close-btn">×</button> */}
        <div className="progress-wrapper">
          <div className="progress-bar" style={{ width: "33%" }} />
        </div>
      </div>

      {/* Illustration */}
      <div className="illustration2">
        <img src={secure_illustration} alt="secure" />
      </div>

      {/* Title */}
      <h2 className="steps-title">Let’s secure your account</h2>

      {/* Steps List */}
      <div className="steps-list">
        {steps.map((step) => (
          <div key={step.id} className={`step-item ${step.status}`}>
            <div className="step-icon">{step.id}</div>
            <div className="step-text">
              <span className="step-title">{step.title}</span>
              {step.subtitle && (
                <span className="step-subtitle">{step.subtitle}</span>
              )}
            </div>
            <div className="step-meta">
              {step.status === "completed" && (
                <span className="completed-text">Completed</span>
              )}
              {step.time && <span className="step-time">{step.time}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Buttons */}
      <button
        className="next-btn"
        onClick={() => navigate("/start-tfa")} // ✅ go to StartTfa
      >
        Next
      </button>
      <button
        className="skip-btn"
        onClick={() => navigate("/dashboard")} // ✅ go to Dashboard
      >
        Skip
      </button>
    </div>
  );
};

export default SecureAccountSteps;
