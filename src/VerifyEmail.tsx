import { useRef } from "react";


const VerifyEmail = () => {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const value = e.target.value.replace(/[^0-9]/g, ""); // allow only numbers
    e.target.value = value;

    if (value && idx < 3) {
      inputsRef.current[idx + 1]?.focus(); // move to next
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === "Backspace" && !e.currentTarget.value && idx > 0) {
      inputsRef.current[idx - 1]?.focus(); // move back
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").slice(0, 4).replace(/\D/g, "");
    pasteData.split("").forEach((char, i) => {
      if (inputsRef.current[i]) {
        inputsRef.current[i]!.value = char;
      }
    });
    if (pasteData.length === 4) {
      inputsRef.current[3]?.focus(); // move to last if full
    }
  };

  return (
    <div className="verify-container">
      <button className="close-btn">×</button>

      {/* Progress Bar */}
      <div className="progress-wrapper">
        <div className="progress-bar" style={{ width: "66%" }} />
      </div>

      {/* Illustration (replace with real image asset) */}
      <div className="illustration">
        <img src="/email-illustration.png" alt="Verify Email" />
      </div>

      <h2 className="verify-title">Verify your email</h2>
      <p className="verify-text">Enter the 4-digit OTP sent to your email</p>

      <div className="otp-inputs">
        {Array.from({ length: 4 }).map((_, i) => (
          <input
            key={i}
            type="text"
            maxLength={1}
            className="otp-input"
            ref={(el) => (inputsRef.current[i] = el)}
            onChange={(e) => handleChange(e, i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            onPaste={handlePaste}
          />
        ))}
      </div>

      <button className="btn primary">Verify</button>
      <button className="btn secondary">Resend OTP</button>
    </div>
  );
};

export default VerifyEmail;
