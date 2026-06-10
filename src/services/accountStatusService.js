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
    
    // Simple check - only show deactivation popup when scholar_status is explicitly inactive or deactivated
    const scholarStatus = response?.data?.data?.scholar_status?.toString?.().toLowerCase().trim();
    const isInactive = scholarStatus === "inactive" || scholarStatus === "deactivated" || scholarStatus === "deactive";
    const isActive = scholarStatus === "active";

    return {
      isActive: isInactive ? false : true,
      popupType: isInactive ? "deactivated" : "",
      message: isInactive ? "Your account has been deactivated. Please contact support." : "",
    };
  } catch (error) {
    const status = error?.response?.status;
    const serverMessage = error?.response?.data?.message;
    console.error("Error checking account status:", error);

    if (status === 503) {
      return {
        isActive: true,
        popupType: "serverError",
        message: serverMessage || "Server is currently unavailable. Please refresh the page.",
      };
    }

    if (!error?.response || status >= 500) {
      return {
        isActive: true,
        popupType: "serverError",
        message: serverMessage || "We're experiencing technical issues. Please try again later.",
      };
    }

    return { isActive: true };
  }
};