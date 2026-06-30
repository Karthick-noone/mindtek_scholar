import { useQuery } from "@tanstack/react-query";
import apiClient from "../services/apiClient";
import { secureStorage } from "../utils/secureStorage";

const fetchScholar = async () => {
  const scholar = secureStorage.getScholar();

  if (!scholar?.id) throw new Error("No scholar ID");

  const res = await apiClient.get(`/sclr/payments/${scholar.id}`);
  const paymentList = Array.isArray(res.data?.data) ? res.data.data : [];

  paymentList.overall_referral_amount = Number(res.data?.overall_referral_amount ?? 0);
  paymentList.total_payments = Number(res.data?.total_payments ?? 0);

  return paymentList;
};

export const usePayments = () => {
  return useQuery({
    queryKey: ["payments"],
    queryFn: fetchScholar,
    staleTime: 1000 * 60 * 10,
    refetchOnMount: 'always',
    enabled: !!secureStorage.getScholar()?.id, 
  });
};