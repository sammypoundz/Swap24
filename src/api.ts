import axios from "axios";
import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";

/* ========== AXIOS SETUP ========== */
const API = axios.create({
  baseURL:
    import.meta.env.MODE === "development"
      ? "http://localhost:5000/api" // local backend
      : import.meta.env.VITE_API_BASE_URL, // production (Render)
  withCredentials: true,
});

/* ========== TYPES ========== */
export interface Transaction {
  _id: string;
  type: string;
  asset: string;
  amount: number;
  valueInNaira?: number;
  status: "pending" | "completed" | "failed";
  txHash?: string;
  date: string;
  transactionDescription?: string;
}

export interface UserProfile {
  _id: string;
  userId: string;
  username: string;
  bio?: string | null;
  profilePicture?: string | null;
  walletAddress?: string | null;
  balance: {
    naira: number;
    crypto: Record<string, number>;
  };
  transactions: Transaction[];
}

/* ========== AUTH TYPES ========== */
export interface RegisterResponse {
  message: string;
  userId: string;
  profileId: string;
}

export interface SigninInitResponse {
  message: string;
  step: string;
  phone: string;
}

export interface SigninVerifyResponse {
  message: string;
  token: string;
  userId: string;
  profileId: string | null;
}

/* ========== AUTH ROUTES ========== */

// REGISTER
export const registerUser = (data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}) => API.post<RegisterResponse>("/auth/register", data);

// VERIFY EMAIL OTP
export const verifyOtp = (data: { email: string; otp: string }) =>
  API.post("/auth/verify-otp", data);

// RESEND EMAIL OTP
export const resendOtp = (data: { email: string }) =>
  API.post("/auth/resend-otp", data);

// SEND OTP TO PHONE
export const sendOtpPhone = (data: { email: string; phone: string }) =>
  API.post("/auth/send-otp-phone", data);

// VERIFY PHONE OTP
export const verifyPhoneOtp = (data: { email: string; phone: string; otp: string }) =>
  API.post("/auth/verify-otp-phone", data);

// RESEND PHONE OTP
export const resendPhoneOtp = (data: { email: string; phone: string }) =>
  API.post("/auth/resend-otp-phone", data);

// SIGNIN (Step 1 → triggers OTP)
export const signinUser = (data: { email: string; password: string }) =>
  API.post<SigninInitResponse>("/auth/signin", data);

// VERIFY LOGIN OTP (Step 2 → finalize login)
export const loginVerifyOtp = (data: { email: string; otp: string }) =>
  API.post<SigninVerifyResponse>("/auth/login-verify-otp", data);

// LOGOUT
export const logoutUser = () => API.post("/auth/logout");

/* ========== USER & TRANSACTIONS ========== */

// GET USER PROFILE
export const getUserProfile = (userId: string) =>
  API.get<UserProfile>(`/user/${userId}`);

// GET USER TRANSACTIONS
export const getUserTransactions = (userId: string) =>
  API.get<{ transactions: Transaction[] }>(`/transactions/${userId}`);

// ADD NEW TRANSACTION
export const addUserTransaction = (data: {
  userId: string;
  type: string;
  asset: string;
  amount: number;
  valueInNaira?: number;
  status?: "pending" | "completed" | "failed";
  txHash?: string;
  transactionDescription?: string;
}) =>
  API.post<{ message: string; transaction: Transaction }>(
    "/transactions/add",
    data
  );

/* ========== SMART CONTRACT INTEGRATION HELPER ========== */

/**
 * Automatically record a transaction after successful smart contract execution.
 * This function:
 * 1️⃣ Reads userId from localStorage
 * 2️⃣ Posts transaction to the backend
 * 3️⃣ Handles optional conversion or txHash logging
 */
export const recordTransactionAfterContract = async ({
  type,
  asset,
  amount,
  valueInNaira,
  txHash,
  description,
}: {
  type: string;
  asset: string;
  amount: number;
  valueInNaira?: number;
  txHash?: string;
  description?: string;
}) => {
  const userId = localStorage.getItem("userId");

  if (!userId) {
    console.warn("⚠️ No userId found in localStorage — skipping transaction record.");
    return;
  }

  try {
    const res = await addUserTransaction({
      userId,
      type,
      asset,
      amount,
      valueInNaira: valueInNaira || 0,
      status: "completed",
      txHash,
      transactionDescription: description || "Blockchain transaction recorded",
    });

    console.log("✅ Transaction recorded successfully:", res.data);
    return res.data;
  } catch (error: any) {
    console.error("❌ Error recording transaction:", error.response?.data || error);
    throw error;
  }
};

/* ========== AD CANCELLATION LOGGER (wallet-based safe) ========== */
export const logAdCancellation = async ({
  // walletAddress,
  cryptoToken,
  tokenAmount,
  priceInNaira,
  txHash,
  paymentMethod,
  adId,
}: {
  walletAddress: string;
  cryptoToken: string;
  tokenAmount: number;
  priceInNaira: number;
  txHash: string;
  paymentMethod: string;
  adId: number;
}) => {
  try {
    // ✅ Try getting userId from localStorage first
    let userId = localStorage.getItem("userId");

    // ✅ If not found, attempt to fetch user profile via wallet address
    // if (!userId && walletAddress) {
    //   console.log("🔍 Fetching user by wallet address...");
    //   const res = await API.get(`/user/by-wallet/${walletAddress}`);
    //   userId = res.data?.user?._id;
    // }

    if (!userId) {
      console.warn("⚠️ No valid userId found — skipping backend sync.");
      return;
    }

    const valueInNaira = tokenAmount * priceInNaira;

    console.log("🧾 Logging ad cancellation transaction:", {
      userId,
      cryptoToken,
      tokenAmount,
      valueInNaira,
    });

    const result = await addUserTransaction({
      userId,
      type: "adCancellation",
      asset: cryptoToken,
      amount: tokenAmount,
      valueInNaira,
      status: "completed",
      txHash,
      transactionDescription: `Cancelled Ad #${adId} — refunded ${tokenAmount} ${cryptoToken} via ${paymentMethod}`,
    });

    console.log("✅ Transaction successfully logged:", result.data);
    return result.data;
  } catch (err: any) {
    console.error("❌ Error logging ad cancellation:", err.response?.data || err);
  }
};


/* ========== BLOCKCHAIN: GET ADS (viem) ========== */

export const getAllAdsFromContract = async () => {
  try {
    const CONTRACT_ADDRESS = import.meta.env
      .VITE_SWAP24_CONTRACT_ADDRESS as `0x${string}`;

    const CONTRACT_ABI = [
      {
        name: "getAllAds",
        type: "function",
        stateMutability: "view",
        inputs: [],
        outputs: [
          {
            components: [
              { internalType: "uint256", name: "id", type: "uint256" },
              { internalType: "address payable", name: "vendor", type: "address" },
              { internalType: "address", name: "tokenAddress", type: "address" },
              { internalType: "string", name: "cryptoToken", type: "string" },
              { internalType: "uint256", name: "tokenAmount", type: "uint256" },
              { internalType: "uint256", name: "priceInNaira", type: "uint256" },
              { internalType: "string", name: "paymentMethod", type: "string" },
              { internalType: "string", name: "rate", type: "string" },
              { internalType: "bool", name: "isActive", type: "bool" },
              { internalType: "bool", name: "isETH", type: "bool" },
            ],
            internalType: "struct Swap24Market.Ad[]",
            name: "",
            type: "tuple[]",
          },
        ],
      },
    ] as const;

    const client = createPublicClient({
      chain: sepolia, // change this if not using Sepolia
      transport: http(),
    });

    const ads = await client.readContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "getAllAds",
    });

    console.log("📦 Ads fetched from blockchain:", ads);
    return ads;
  } catch (error: any) {
    console.error("❌ Failed to fetch ads from blockchain:", error);
    throw error;
  }
};
