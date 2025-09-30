import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "./api";
import "./SignupForm.css";

export default function SignupForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    // clear error for this field when typing
    if (fieldErrors[e.target.name]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: "" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setFieldErrors({});
    setLoading(true);

    try {
      const res = await registerUser(formData);
      console.log("✅ Registration success:", res.data);

      // Save userId & profileId in localStorage
      localStorage.setItem("userId", res.data.userId);
      localStorage.setItem("profileId", res.data.profileId);
      localStorage.setItem("userEmail", formData.email);

      // Navigate to OTP verification screen
      navigate("/verify-otp", { state: { email: formData.email } });
    } catch (err: any) {
      console.error("❌ Registration failed:", err);
      const serverError = err.response?.data;

      if (serverError?.field) {
        setFieldErrors({ [serverError.field]: serverError.message });
      } else if (typeof serverError?.message === "string") {
        const msg = serverError.message.toLowerCase();
        if (msg.includes("email")) setFieldErrors({ email: serverError.message });
        else if (msg.includes("password")) setFieldErrors({ password: serverError.message });
        else if (msg.includes("first name")) setFieldErrors({ firstName: serverError.message });
        else if (msg.includes("last name")) setFieldErrors({ lastName: serverError.message });
        else setGeneralError(serverError.message);
      } else {
        setGeneralError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Password validation rules
  const password = formData.password;
  const rules = [
    { text: "At least 8 characters", valid: password.length >= 8 },
    { text: "At least one uppercase letter", valid: /[A-Z]/.test(password) },
    { text: "At least one lowercase letter", valid: /[a-z]/.test(password) },
    { text: "At least one number", valid: /[0-9]/.test(password) },
    {
      text: "At least one special character (!@#$%^&*)",
      valid: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    },
  ];

  const isFormValid =
    formData.firstName.trim() &&
    formData.lastName.trim() &&
    formData.email.trim() &&
    rules.every((r) => r.valid);

  return (
    <div className="signup-container">
      <div className="signup-top">
        <button
          type="button"
          className="cancel-icon"
          aria-label="Cancel and go back"
          onClick={() => navigate("/welcome")}
        >
          ×
        </button>
      </div>

      <div className="signup-progress" aria-hidden>
        <span className="dot active"></span>
        <span className="dot"></span>
        <span className="dot"></span>
      </div>

      <h2 className="signup-title">Create your account</h2>

      {generalError && <p className="error-message">{generalError}</p>}

      <form className="signup-form" onSubmit={handleSubmit}>
        <label>
          First Name
          {fieldErrors.firstName && <p className="field-error">{fieldErrors.firstName}</p>}
          <input
            type="text"
            name="firstName"
            placeholder="John"
            value={formData.firstName}
            onChange={handleChange}
            autoComplete="given-name"
            required
            className={fieldErrors.firstName ? "input-error" : ""}
          />
        </label>

        <label>
          Last Name
          {fieldErrors.lastName && <p className="field-error">{fieldErrors.lastName}</p>}
          <input
            type="text"
            name="lastName"
            placeholder="Mark"
            value={formData.lastName}
            onChange={handleChange}
            autoComplete="family-name"
            required
            className={fieldErrors.lastName ? "input-error" : ""}
          />
        </label>

        <label>
          Email
          {fieldErrors.email && <p className="field-error">{fieldErrors.email}</p>}
          <input
            type="email"
            name="email"
            placeholder="forexample@gmail.com"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
            required
            className={fieldErrors.email ? "input-error" : ""}
          />
        </label>

        <label className="password-field">
          Password
          {fieldErrors.password && <p className="field-error">{fieldErrors.password}</p>}
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="XXXXXXXXXXX"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              required
              className={fieldErrors.password ? "input-error" : ""}
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {password && (
            <ul className="password-rules">
              {rules.map((rule, idx) => (
                <li key={idx} className={rule.valid ? "valid" : "invalid"}>
                  {rule.valid ? "✓" : "✗"} {rule.text}
                </li>
              ))}
            </ul>
          )}
        </label>

        <p className="signup-terms">
          By clicking on “Next” you are agreeing to our <a href="#">Terms of service</a> and{" "}
          <a href="#">privacy policy</a>
        </p>

        <button type="submit" className="signup-btn" disabled={!isFormValid || loading}>
          {loading ? "Creating account..." : "Next"}
        </button>
      </form>
    </div>
  );
}
