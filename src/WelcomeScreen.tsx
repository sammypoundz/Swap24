import logo from "./assets/logo.svg";

interface WelcomeProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export default function WelcomeScreen({ onGetStarted, onSignIn }: WelcomeProps) {
  return (
    <div className="welcome">
      <div className="welcome-content">
        <img src={logo} alt="Swap24 Logo" className="welcome-logo" />

        <div className="btnWrap">
          <button
            className="welcome-btn"
            onClick={onGetStarted} // 👈 uses callback passed from App.tsx
          >
            Get started
          </button>
          <p
            className="welcome-signin"
            onClick={onSignIn} // 👈 uses callback passed from App.tsx
          >
            Sign in
          </p>
        </div>
      </div>
    </div>
  );
}
