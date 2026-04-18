// src/utils/otpDecryption.js

const SECRET_KEY = "8f3c9b1a7d5e4c2f9a6b8d1e3c4f7a9b0d2e6c8f1a3b5d7c9e2f4a6b8d0c1e3";

// Convert base64 to Uint8Array
const base64ToUint8Array = (base64) => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

// Decrypt OTP using AES-CBC
export const decryptOtp = async (encryptedBase64, secret = SECRET_KEY) => {
  try {
    const enc = new TextEncoder();
    
    // Create SHA-256 hash of the secret key
    const secretKeyHash = await crypto.subtle.digest(
      "SHA-256",
      enc.encode(secret)
    );
    
    // Convert base64 to Uint8Array
    const rawData = base64ToUint8Array(encryptedBase64);
    
    // Extract IV (first 16 bytes)
    const iv = rawData.slice(0, 16);
    
    // Extract encrypted data (remaining bytes)
    const encryptedData = rawData.slice(16);
    
    // Import the key for decryption
    const key = await crypto.subtle.importKey(
      "raw",
      secretKeyHash,
      { name: "AES-CBC" },
      false,
      ["decrypt"]
    );
    
    // Decrypt the data
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: "AES-CBC",
        iv: iv
      },
      key,
      encryptedData
    );
    
    // Decode the decrypted buffer to string
    const decryptedOtp = new TextDecoder().decode(decryptedBuffer);
    return decryptedOtp;
  } catch (error) {
    console.error("Decryption failed:", error);
    throw new Error("Failed to decrypt OTP");
  }
};

// Verify if entered OTP matches decrypted OTP
export const verifyOtpCode = async (encryptedOtp, enteredOtp, secret = SECRET_KEY) => {
  try {
    const decryptedOtp = await decryptOtp(encryptedOtp, secret);
    return decryptedOtp === enteredOtp;
  } catch (error) {
    console.error("Verification failed:", error);
    return false;
  }
};