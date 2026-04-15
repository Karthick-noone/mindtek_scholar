//authService.js
import apiClient from "./apiClient";

export const loginUser = (data) => {
  return apiClient.post("/scholar/login", data);
};

export const changePassword = ({ id, data }) => {
  return apiClient.post(`/change-password/${id}`, data);
};

export const logoutUser = () => {
  return apiClient.post("/logout"); 
};