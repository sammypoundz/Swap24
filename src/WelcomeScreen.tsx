import logo from "./assets/logo.svg";

interface WelcomeScreenProps {
  onGetStarted: () => void;
  onSignIn: () => void; 
}

export default function WelcomeScreen({ onGetStarted, onSignIn }: WelcomeScreenProps) {
  return (
    <div className="welcome">
      <div className="welcome-content">
        <img src={logo} alt="Swap24 Logo" className="welcome-logo" />

        <div className="btnWrap">
          <button className="welcome-btn" onClick={onGetStarted}>
            Get started
          </button>
          <p className="welcome-signin" onClick={onSignIn}>
            Sign in
          </p>
        </div>
      </div>
    </div>
  );
}
