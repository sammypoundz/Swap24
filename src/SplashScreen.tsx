import { useEffect } from "react";
import logo from "./assets/logo.svg";

interface SplashProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish(); // 👈 use callback from props
    }, 3000);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="splash">
      <img src={logo} alt="Swap24 Logo" className="splash-logo" />
    </div>
  );
}
