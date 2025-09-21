// AuthFlow.tsx
import { useState } from "react";
import SignupWizard from "./Signup";
import AcctSetup from "./AcctSetup";

interface AuthFlowProps {
  onClose: () => void;
  onComplete?: () => void; // optional → e.g. move to TFA after setup
}

const AuthFlow = ({ onClose, onComplete }: AuthFlowProps) => {
  const [view, setView] = useState<"signup" | "setup">("signup");

  return (
    <>
      {view === "signup" && (
        <SignupWizard
          onClose={onClose}
          onVerified={() => setView("setup")}
        />
      )}

      {view === "setup" && (
        <AcctSetup
          onFinish={onComplete} // 👈 move out of AuthFlow (e.g. → TFA)
          onBack={() => setView("signup")}
        />
      )}
    </>
  );
};

export default AuthFlow;
