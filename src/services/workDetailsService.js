import apiClient from "./apiClient";
import { secureStorage } from "../utils/secureStorage";

//  Get full work details
export const getWorkDetails = () => {
  const scholar = secureStorage.getScholar();

  if (!scholar?.id) throw new Error("No scholar ID");

  return apiClient.get(`/work-details/reg/${scholar.id}`);
};

//  Get last work status
export const getLastWorkStatus = () => {
  const scholar = secureStorage.getScholar();

  if (!scholar?.id) throw new Error("No scholar ID");

  return apiClient.get(`/workdetails/last-status/${scholar.id}`);
};