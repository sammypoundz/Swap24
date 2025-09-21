import { useState } from "react";
import SplashScreen from "./SplashScreen";
import WelcomeScreen from "./WelcomeScreen";
import OnboardingCarousel from "./OnboardingCarousel";
import SignInScreen from "./SignInScreen";
import SignUpScreen from "./Signup"; // 👈 make sure this file exists
import TwoFA from "./twoFA"; // 👈 import your TFA page

export default function App() {
  const [stage, setStage] = useState<
    "splash" | "welcome" | "onboarding" | "signin" | "signup" | "tfa"
  >("splash");

  return (
    <>
      {stage === "splash" && (
        <SplashScreen onFinish={() => setStage("welcome")} />
      )}

      {stage === "welcome" && (
        <WelcomeScreen
          onGetStarted={() => setStage("onboarding")}
          onSignIn={() => setStage("signin")}
        />
      )}

      {stage === "onboarding" && (
        <OnboardingCarousel onFinish={() => setStage("signup")} />
        // 👈 after onboarding, move to signup
      )}

      {stage === "signin" && (
        <SignInScreen
          onClose={() => setStage("welcome")} // cancel → back to welcome
          onCreateAccount={() => setStage("signup")} // create account → signup
          onSignInSuccess={() => setStage("tfa")} // sign in success → TFA
        />
      )}

      {stage === "signup" && (
        <SignUpScreen onClose={() => setStage("welcome")} />
      )}

      {stage === "tfa" && (
        <TwoFA
          onClose={() => setStage("signin")} // cancel → back to sign in
          // onCreateAccount={() => setStage("signup")} // optional link to signup
        />
      )}
    </>
  );
}
