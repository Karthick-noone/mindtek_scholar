import { useQuery } from "@tanstack/react-query";
import apiClient from "../services/apiClient";
import { secureStorage } from "../utils/secureStorage";

const fetchScholar = async () => {
  const scholar = secureStorage.getScholar();

  if (!scholar?.id) throw new Error("No scholar ID");

  const res = await apiClient.get(`/sclr/scholar/${scholar.id}`);

  return res.data.data; 
};

export const useScholar = () => {
  return useQuery({
    queryKey: ["scholar"],
    queryFn: fetchScholar,
    staleTime: 1000 * 60 * 10,
    refetchOnMount: 'always',
    enabled: !!secureStorage.getScholar()?.id, 
  });
};