import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { WagmiProvider, createConfig, http } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { mainnet, sepolia } from "wagmi/chains";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";

import SplashScreen from "./SplashScreen";
import WelcomeScreen from "./WelcomeScreen";
import OnboardingCarousel from "./OnboardingCarousel";
import SignupForm from "./SignupForm";
import VerifyOtp from "./VerifyOtp";
import SecureAccount from "./SecureAccountSteps";
import StartTfa from "./StartTfa";
import SetupTfa from "./SetupTfa";
import PhoneOtp from "./PhoneOtp";
import AcctCreationSuccess from "./AcctCreationSuccess";
import Dashboard from "./dashboard";
import SignIn from "./SignIn";
import PhoneTfa from "./PhoneTfa";

// 🔹 RainbowKit Wallet Setup
const { connectors } = getDefaultWallets({
  appName: "Swap24",
  projectId: "bfc1d429ce7b8141774763ac158210fb", 
});

// 🔹 Wagmi Config
const config = createConfig({
  chains: [mainnet, sepolia],
  connectors,
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});

// 🔹 React Query Client
const queryClient = new QueryClient();

function SplashWrapper() {
  const navigate = useNavigate();
  return <SplashScreen onFinish={() => navigate("/welcome")} />;
}

function WelcomeWrapper() {
  const navigate = useNavigate();
  return (
    <WelcomeScreen
      onGetStarted={() => navigate("/onboarding")}
      onSignIn={() => navigate("/signin")}
    />
  );
}

function OnboardingWrapper() {
  const navigate = useNavigate();
  return <OnboardingCarousel onFinish={() => navigate("/signup")} />;
}

export default function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {/* ✅ Don't pass `chains` anymore, RainbowKit gets them from config */}
        <RainbowKitProvider>
          <Router>
            <Routes>
              <Route path="/" element={<SplashWrapper />} />
              <Route path="/welcome" element={<WelcomeWrapper />} />
              <Route path="/onboarding" element={<OnboardingWrapper />} />
              <Route path="/signup" element={<SignupForm />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/verify-otp" element={<VerifyOtp />} />
              <Route path="/secure-account-steps" element={<SecureAccount />} />
              <Route path="/start-tfa" element={<StartTfa />} />
              <Route path="/setup-tfa" element={<SetupTfa />} />
              <Route path="/phone-otp" element={<PhoneOtp />} />
              <Route path="/acct-creation-success" element={<AcctCreationSuccess />} />
              <Route path="/phone-tfa" element={<PhoneTfa />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </Router>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
