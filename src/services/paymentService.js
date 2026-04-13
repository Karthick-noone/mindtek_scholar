import apiClient from "./apiClient";

export const getPaymentData = (id) => {
  return apiClient.get(`/sclr/payments/${id}`); 
};