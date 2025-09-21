import { useEffect } from "react";
import logo from "./assets/logo.svg";

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 3000); // 3 seconds

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="splash">
      <img src={logo} alt="Swap24 Logo" className="splash-logo" />
    </div>
  );
}
