// src/api.ts
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api", // 👈 update if backend hosted elsewhere
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
  transactionDescription?: string; // 👈 added here
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
    crypto: Record<string, number>; // 👈 flexible for BTC, ETH, LTC, etc.
  };
  transactions: Transaction[];
}

/* ========== AUTH TYPES ========== */
export interface RegisterResponse {
  message: string;
  userId: string;
  profileId: string;
}

export interface SigninResponse {
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

// SIGNIN
export const signinUser = (data: { email: string; password: string }) =>
  API.post<SigninResponse>("/auth/signin", data);

// LOGOUT
export const logoutUser = () => API.post("/auth/logout");

/* ========== NEW ROUTES ========== */

// GET USER PROFILE
export const getUserProfile = (userId: string) =>
  API.get<UserProfile>(`/user/${userId}`);

// GET USER TRANSACTIONS
export const getUserTransactions = (userId: string) =>
  API.get<{ transactions: Transaction[] }>(`/transactions/${userId}`);

// ADD NEW TRANSACTION (✅ now supports description)
export const addUserTransaction = (data: {
  userId: string;
  type: string;
  asset: string;
  amount: number;
  valueInNaira?: number;
  status?: "pending" | "completed" | "failed";
  txHash?: string;
  transactionDescription?: string; // 👈 added
}) => API.post<{ message: string; transaction: Transaction }>(
  "/transactions/add",
  data
);
