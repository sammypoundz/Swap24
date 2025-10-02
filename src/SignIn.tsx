import React, { useState } from "react";
import "./SignIn.css";
import { useNavigate } from "react-router-dom";
import { signinUser } from "./api"; // 👈 import your API function

const SignIn: React.FC = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleClose = () => {
    navigate("/welcome");
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await signinUser({ email, password });

      // 👇 Backend response includes `step: "VERIFY_OTP"`
      if (res.data.step === "VERIFY_OTP") {
        // Navigate to phone-tfa and pass email along
        navigate("/phone-tfa", { state: { email, phone: res.data.phone } });
      } else {
        setError("Unexpected response. Please try again.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Signin failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signin-container">
      {/* Close button */}
      <button className="signin-close" onClick={handleClose}>
        ×
      </button>

      {/* Header */}
      <h2 className="signin-title">Sign in to Swap24</h2>

      {/* Email Input */}
      <label className="signin-label">Email</label>
      <div className="sign-in-wrapper">
        <input
          type="email"
          placeholder="forexample@gmail.com"
          className="signin-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      {/* Password Input */}
      <label className="signin-label">Password</label>
      <div className="signin-password-wrapper">
        <input
          type={passwordVisible ? "text" : "password"}
          placeholder="XXXXXXXXXX"
          className="signin-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="button"
          className="signin-toggle"
          onClick={() => setPasswordVisible(!passwordVisible)}
        >
          {passwordVisible ? "🙈" : "👁️"}
        </button>
      </div>

      {/* Links */}
      <div className="signin-links">
        <a href="#">Forgot password</a>
        <a href="#">Privacy policy</a>
      </div>

      {/* Error */}
      {error && <p className="signin-error">{error}</p>}

      {/* Submit Button */}
      <button
        className="signin-btn"
        onClick={handleSignIn}
        disabled={loading}
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>
    </div>
  );
};

export default SignIn;
