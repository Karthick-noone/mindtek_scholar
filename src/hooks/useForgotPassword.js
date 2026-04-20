// src/hooks/useForgotPassword.js
import { useMutation } from "@tanstack/react-query";
import { sendOtp, resetPassword,verifyOtpApi } from "../services/forgotPasswordService";
import { decryptOtp, verifyOtpCode } from "../utils/otpDecryption";

// Hook for sending OTP
export const useSendOtp = () => {
  return useMutation({
    mutationFn: (data) => sendOtp(data),
    onSuccess: (response) => {
      console.log("OTP sent successfully:", response);
    },
    onError: (error) => {
      console.error("Failed to send OTP:", error);
    },
  });
};

// Hook for verifying OTP (local decryption)
export const useVerifyOtpLocally = () => {
  const verifyOtp = async (encryptedOtp, enteredOtp) => {
    return await verifyOtpCode(encryptedOtp, enteredOtp);
  };
  
  return { verifyOtp };
};

// Hook for resetting password
export const useResetPassword = () => {
  return useMutation({
    mutationFn: (data) => resetPassword(data),
    onSuccess: (response) => {
      console.log("Password reset successfully:", response);
    },
    onError: (error) => {
      console.error("Failed to reset password:", error);
    },
  });
};

// Hook to get decrypted OTP (for debugging/testing)
export const useDecryptOtp = () => {
  const getDecryptedOtp = async (encryptedOtp) => {
    return await decryptOtp(encryptedOtp);
  };
  
  return { getDecryptedOtp };
};

// Hook for verifying OTP via API
export const useVerifyOtp = () => {
  return useMutation({
    mutationFn: (data) => verifyOtpApi(data),
    onSuccess: (response) => {
      console.log("OTP verified successfully:", response);
    },
    onError: (error) => {
      console.error("OTP verification failed:", error);
    },
  });
};