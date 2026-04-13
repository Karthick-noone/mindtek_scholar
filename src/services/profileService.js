import apiClient from "./apiClient";
import { secureStorage } from "../utils/secureStorage";

//  Upload image with scholar ID
export const uploadProfileImage = (formData) => {
  const scholar = secureStorage.getScholar();

  if (!scholar?.id) throw new Error("No scholar ID");

  return apiClient.post(`/scholar/profile/${scholar.id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const deleteProfileImage = () => {
  const scholar = secureStorage.getScholar();

  if (!scholar?.id) throw new Error("No scholar ID");

  return apiClient.delete(`/scholar/profile/${scholar.id}`);
};