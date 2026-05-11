// services/accountStatusService.js
import apiClient from "./apiClient";
import { secureStorage } from "../utils/secureStorage";

export const checkAccountStatus = async () => {
  const scholar = secureStorage.getUser();
  
  if (!scholar?.id) {
    return { isActive: true };
  }

  try {
    const response = await apiClient.get(`/user/details/${scholar.id}`);
    
    // Simple check - just look at scholar_status
    const scholarStatus = response?.data?.data?.scholar_status;
    const isActive = scholarStatus?.toLowerCase() === "active";
    
    return {
      isActive: isActive,
      message: isActive ? "" : "Your account has been deactivated. Please contact support."
    };
  } catch (error) {
    // On any error, assume active to prevent unwanted logouts
    console.error("Error checking account status:", error);
    return { isActive: true };
  }
};