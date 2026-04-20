// src/services/forgotPasswordService.js
import apiClient from "./apiClient";

// Send OTP to email
export const sendOtp = (data) => {
  return apiClient.post("/forgot/send-otp", data);
};

// Reset Password
export const resetPassword = (data) => {
  return apiClient.post("/forgot/reset-password", data);
};


// Verify OTP via backend
export const verifyOtpApi = (data) => {
  return apiClient.post("/forgot/verify-otp", data);
};