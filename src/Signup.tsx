import { useRef, useState, useEffect } from "react";
import VerifyEmailImg from "./assets/VerifyEmail.svg";

type Step = 1 | 2 | 3;

interface SignupWizardProps {
  onClose: () => void; // 👈 parent handles going back to Welcome
}

const SignupWizard = ({ onClose }: SignupWizardProps) => {
  const [step, setStep] = useState<Step>(1);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer (5 minutes = 300s)
  const [timeLeft, setTimeLeft] = useState(300);

  useEffect(() => {
    if (step === 2 && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [step, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleNext = () => {
    if (step < 3) {
      setStep((prev) => (prev + 1) as Step);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as Step);
    } else {
      onClose(); // 👈 if at step 1, exit to welcome
    }
  };

  // OTP logic
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    idx: number
  ) => {
    const value = e.target.value.replace(/[^0-9]/g, ""); // only digits
    e.target.value = value;
    if (value && idx < 3) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    idx: number
  ) => {
    if (e.key === "Backspace" && !e.currentTarget.value && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData
      .getData("text")
      .slice(0, 4)
      .replace(/\D/g, "");
    pasteData.split("").forEach((char, i) => {
      if (inputsRef.current[i]) {
        inputsRef.current[i]!.value = char;
      }
    });
    if (pasteData.length === 4) {
      inputsRef.current[3]?.focus();
    }
  };

  // Progress percentage
  const progress = (step / 3) * 100;

  return (
    <div className="signup-container">
      {/* Close or Back button */}
      <button className="close-btn" onClick={handleBack}>
        {step === 1 ? "×" : "←"}
      </button>

      <div className="signUpInnerWrap">
        {/* Progress Bar */}
        <div className="progress-wrapper">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
        </div>

        {/* STEP 1: Create Account */}
        {step === 1 && (
          <div className="signup-step">
            <h2 className="signup-title">Create your account</h2>

            <form className="signup-form">
              <label className="label">First Name</label>
              <input type="text" placeholder="John" className="input" />

              <label className="label">Last Name</label>
              <input type="text" placeholder="Mark" className="input" />

              <label className="label">Email</label>
              <input
                type="email"
                placeholder="forexample@gmail.com"
                className="input"
              />

              <label className="label">Password</label>
              <div className="password-field">
                <input
                  type={passwordVisible ? "text" : "password"}
                  placeholder="XXXXXXXXXX"
                  className="input"
                />
                <span
                  className="toggle-visibility"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                >
                  👁
                </span>
              </div>
              <p className="success-msg">Looks Good ✔</p>

              <button type="button" className="next-btn" onClick={handleNext}>
                Next
              </button>
            </form>
          </div>
        )}

        {/* STEP 2: Verify Email (OTP) */}
        {step === 2 && (
          <div className="verify-step">
            <h2 className="signup-title">Verify your email</h2>
            <div className="illustration">
              <img src={VerifyEmailImg} alt="Verify Email" />
            </div>
            <p className="verify-text">
              Enter the 4-digit OTP sent to your email -{" "}
              <span className="countDown">{formatTime(timeLeft)}</span>
            </p>

            <div className="otp-inputs">
              {Array.from({ length: 4 }).map((_, i) => (
                <input
                  key={i}
                  type="text"
                  maxLength={1}
                  className="otp-input"
                  ref={(el) => {
                    inputsRef.current[i] = el;
                  }}
                  onChange={(e) => handleChange(e, i)}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                  onPaste={handlePaste}
                />
              ))}
            </div>

            <div className="parent-container">
              <button
                className="btn primary"
                onClick={handleNext}
                disabled={timeLeft <= 0}
              >
                Verify
              </button>
            </div>
            <div className="parent-container">
              <button className="btn secondary" disabled={timeLeft > 0}>
                Resend OTP
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Finish */}
        {step === 3 && (
          <div className="signup-step">
            <h2 className="signup-title">Step 3: Finish</h2>
            <p>🎉 Account setup complete!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignupWizard;
