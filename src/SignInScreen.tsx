// src/pages/SignIn.tsx
import { useState } from "react";

interface SignInProps {
  onClose: () => void;          // 👈 go back to Welcome
  onCreateAccount: () => void;  // 👈 go to Signup
  onSignInSuccess: () => void;  // 👈 go to TFA
}

const SignIn = ({ onClose, onCreateAccount, onSignInSuccess }: SignInProps) => {
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ later, add real validation here
    // For now, just go to TFA
    onSignInSuccess();
  };

  return (
    <div className="signin-container">
      <div className="signInInnerWrap">
        {/* Cancel button → back to welcome */}
        <button className="close-btn" onClick={onClose}>
          ×
        </button>

        <h2 className="signin-title">Sign in to Swap24</h2>

        <form className="signin-form" onSubmit={handleSubmit}>
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
              style={{ cursor: "pointer" }}
            >
              {passwordVisible ? "🙈" : "👁"}
            </span>
          </div>

          <div className="links">
            <a href="#">Forgot password</a>
            {/* Create account → go to signup */}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onCreateAccount();
              }}
            >
              Create account
            </a>
          </div>

          <div className="parent-container">
            <button type="submit" className="signin-btn">
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignIn;
