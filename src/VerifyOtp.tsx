import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { verifyOtp, resendOtp } from "./api";
import SuccessModal from "./SuccessModal";
import "./VerifyOtp.css";

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "forexample@gmail.com";

  const [otp, setOtp] = useState<string[]>(["", "", "", ""]);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [timer, setTimer] = useState(60);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState(false); // ✅ inline success for resend

  // countdown timer
  useEffect(() => {
    if (timer > 0) {
      const t = setTimeout(() => setTimer((s) => s - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [timer]);

  const handleChange = (value: string, index: number) => {
    if (/^\d$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (index < otp.length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    } else if (value === "") {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("Text").trim();
    if (/^\d{4}$/.test(pasteData)) {
      const pasteOtp = pasteData.split("");
      setOtp(pasteOtp);
      pasteOtp.forEach((digit, i) => {
        if (inputRefs.current[i]) inputRefs.current[i]!.value = digit;
      });
      inputRefs.current[3]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 4) return;

    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await verifyOtp({ email, otp: code });
      console.log("OTP Verified:", res.data);

      // ✅ show success modal
      setShowSuccess(true);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || "Invalid OTP, try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setOtp(["", "", "", ""]);
      setTimer(60);
      setErrorMsg(null);
      setResendSuccess(false);
      inputRefs.current[0]?.focus();

      const res = await resendOtp({ email });
      console.log("Resend OTP response:", res.data);

      // ✅ show inline success
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 3000); // auto-hide after 3s
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || "Failed to resend OTP.");
    }
  };

  const isOtpComplete = otp.every((digit) => digit !== "");

  return (
    <div className="otp-container">
      {/* ✅ Show Success Modal */}
      {showSuccess && (
        <SuccessModal onContinue={() => navigate("/secure-account-steps")} />
      )}

      <div className="otp-top">
        <button
          type="button"
          className="cancel-icon"
          aria-label="Cancel and go back"
          onClick={() => navigate("/welcome")}
        >
          ×
        </button>

        <div className="signup-progress" aria-hidden>
          <span className="dot"></span>
          <span className="dot active"></span>
          <span className="dot"></span>
        </div>
      </div>

      <h2 className="otp-title">Enter the 4-digit OTP sent to</h2>
      <p className="otp-email">{email}</p>

      <form className="otp-form" onSubmit={handleSubmit}>
        <div className="otp-inputs">
          {otp.map((digit, idx) => (
            <input
              key={idx}
              type="text"
              maxLength={1}
              value={digit}
              ref={(el) => (inputRefs.current[idx] = el)}
              onChange={(e) => handleChange(e.target.value, idx)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              onPaste={handlePaste}
              className={`otp-input ${digit ? "filled" : ""}`}
            />
          ))}
        </div>

        {/* Inline error message */}
        {errorMsg && <p className="otp-error">{errorMsg}</p>}

        {/* Inline success for resend */}
        {resendSuccess && <p className="otp-success">New OTP resent</p>}

        <p className="resend-text">
          Didn’t receive code?{" "}
          {timer > 0 ? (
            <span className="resend-disabled">Resend in {timer}s</span>
          ) : (
            <button type="button" className="resend-btn" onClick={handleResend}>
              Resend
            </button>
          )}
        </p>

        <button
          type="submit"
          className={`otp-submit ${!isOtpComplete ? "disabled" : ""}`}
          disabled={!isOtpComplete || loading}
        >
          {loading ? "Verifying..." : "Verify"}
        </button>
      </form>
    </div>
  );
}
