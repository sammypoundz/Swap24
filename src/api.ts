// src/api.ts
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api", // 👈 update if backend hosted elsewhere
});

// REGISTER
export const registerUser = (data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}) => API.post("/auth/register", data);

// VERIFY OTP
export const verifyOtp = (data: { email: string; otp: string }) =>
  API.post("/auth/verify-otp", data);

// RESEND OTP
export const resendOtp = (data: { email: string }) =>
  API.post("/auth/resend-otp", data);

// SIGNIN
export const signinUser = (data: { email: string; password: string }) =>
  API.post("/auth/signin", data);

// LOGOUT
export const logoutUser = () => API.post("/auth/logout");
