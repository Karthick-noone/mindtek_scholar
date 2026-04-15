import { secureStorage } from "../utils/secureStorage";
import apiClient from "./apiClient";

export const createComplaint = (data) => {
  return apiClient.post("/store/complaint", data);
};

export const getComplaints = (scholarId, page = 1, perPage = 10, status = 'all', search = '') => {
  let url = `/scholar/complaints/${scholarId}?page=${page}&per_page=${perPage}`;
  
  if (status !== 'all') {
    url += `&status=${status}`;
  }
  
  if (search) {
    url += `&search=${encodeURIComponent(search)}`;
  }
  
  return apiClient.get(url);
};

export const getComplaintCounts = () => {
  const scholar = secureStorage.getScholar();

  if (!scholar?.id) throw new Error("No scholar ID");

  return apiClient.get(`/complaints/count/${scholar.id}`);
};

// Update rating
export const updateComplaintRating = (id, data) => {
  return apiClient.post(`/update-rating/${id}`, data);
};