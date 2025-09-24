import { useRef, useState, useEffect } from "react";
import Swal from "sweetalert2"; // ✅ import SweetAlert2
import VerifyEmailImg from "./assets/VerifyEmail.svg";
import { registerUser, verifyOtp, resendOtp } from "./api";

type Step = 1 | 2;

interface SignupWizardProps {
  onClose: () => void;
  onVerified: () => void;
}

const SignupWizard = ({ onClose, onVerified }: SignupWizardProps) => {
  const [step, setStep] = useState<Step>(1);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(300);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  // countdown
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

  // register
  const handleRegister = async () => {
    try {
      setLoading(true);
      await registerUser(formData);
      setStep(2);
      Swal.fire("Success ✅", "Account created. OTP sent to your email.", "success");
    } catch (err: any) {
      Swal.fire("Error ❌", err.response?.data?.message || "Registration failed", "error");
    } finally {
      setLoading(false);
    }
  };

  // verify otp
  const handleVerify = async () => {
    const otp = inputsRef.current.map((input) => input?.value).join("");
    if (otp.length !== 4) {
      Swal.fire("Warning ⚠️", "Enter the full 4-digit OTP", "warning");
      return;
    }

    try {
      setLoading(true);
      await verifyOtp({ email: formData.email, otp });
      Swal.fire("Verified 🎉", "Email verified successfully!", "success");
      onVerified();
    } catch (err: any) {
      Swal.fire("Error ❌", err.response?.data?.message || "OTP verification failed", "error");
    } finally {
      setLoading(false);
    }
  };

  // resend
  const handleResend = async () => {
    try {
      await resendOtp({ email: formData.email });
      Swal.fire("New OTP 🔄", "A new OTP has been sent to your email.", "info");
      setTimeLeft(300); // reset countdown
    } catch (err: any) {
      Swal.fire("Error ❌", err.response?.data?.message || "Failed to resend OTP", "error");
    }
  };

  // OTP input behavior
  const handleOtpChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    idx: number
  ) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    e.target.value = value;

    if (value && idx < 3) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    idx: number
  ) => {
    if (e.key === "Backspace" && !e.currentTarget.value && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").slice(0, 4).replace(/\D/g, "");

    pasteData.split("").forEach((char, i) => {
      if (inputsRef.current[i]) {
        inputsRef.current[i]!.value = char;
      }
    });

    if (pasteData.length === 4) {
      inputsRef.current[3]?.focus();
    }
  };

  const progress = (step / 2) * 100;

  return (
    <div className="signup-container">
      <button className="close-btn" onClick={onClose}>
        {step === 1 ? "×" : "←"}
      </button>

      <div className="signUpInnerWrap">
        <div className="progress-wrapper">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <div className="signup-step">
            <h2 className="signup-title">Create your account</h2>

            <form
              className="signup-form"
              onSubmit={(e) => {
                e.preventDefault();
                handleRegister();
              }}
            >
              <label className="label">First Name</label>
              <input
                type="text"
                placeholder="John"
                className="input"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
              />

              <label className="label">Last Name</label>
              <input
                type="text"
                placeholder="Mark"
                className="input"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
              />

              <label className="label">Email</label>
              <input
                type="email"
                placeholder="forexample@gmail.com"
                className="input"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />

              <label className="label">Password</label>
              <div className="password-field">
                <input
                  type={passwordVisible ? "text" : "password"}
                  placeholder="XXXXXXXXXX"
                  className="input"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <span
                  className="toggle-visibility"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                >
                  👁
                </span>
              </div>
              <p className="success-msg">Looks Good ✔</p>

              <button type="submit" className="next-btn" disabled={loading}>
                {loading ? "Creating..." : "Next"}
              </button>
            </form>
          </div>
        )}

        {/* STEP 2: OTP */}
        {step === 2 && (
          <div className="verify-step">
            <h2 className="signup-title">Verify your email</h2>
            <div className="illustration">
              <img src={VerifyEmailImg} alt="Verify Email" />
            </div>
            <p className="verify-text">
              Enter the 4-digit OTP sent to your email –{" "}
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
                  onChange={(e) => handleOtpChange(e, i)}
                  onKeyDown={(e) => handleOtpKeyDown(e, i)}
                  onPaste={handleOtpPaste}
                />
              ))}
            </div>

            <div className="parent-container">
              <button
                className="btn primary"
                onClick={handleVerify}
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify"}
              </button>
            </div>

            {timeLeft <= 0 && (
              <div className="parent-container">
                <button className="btn secondary" onClick={handleResend}>
                  Resend OTP
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SignupWizard;
