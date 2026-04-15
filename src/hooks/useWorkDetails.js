import { useQuery } from "@tanstack/react-query";
import {
  getWorkDetails,
  getLastWorkStatus,
} from "../services/workDetailsService";
import { secureStorage } from "../utils/secureStorage";

//  Work Details Hook
export const useWorkDetails = () => {
  const scholar = secureStorage.getScholar();

  return useQuery({
    queryKey: ["workDetails", scholar?.id],
    queryFn: async () => {
      const res = await getWorkDetails();
      return res.data.data || res.data; // handle both formats
    },
    enabled: !!scholar?.id,
     keepPreviousData: true,
    staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes (ADD THIS)
    refetchOnMount: false, // Don't refetch when component mounts (ADD THIS)
    refetchOnWindowFocus: false, // Don't refetch when window regains focus (ADD THIS)
    refetchOnReconnect: false, // Don't refetch on network reconnect (ADD THIS)
  });
};

//  Last Status Hook
export const useLastWorkStatus = () => {
  const scholar = secureStorage.getScholar();

  return useQuery({
    queryKey: ["lastWorkStatus", scholar?.id],
    queryFn: async () => {
      const res = await getLastWorkStatus();
      return res.data.data || res.data;
    },
    enabled: !!scholar?.id,
     keepPreviousData: true,
    staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes (ADD THIS)
    refetchOnMount: false, // Don't refetch when component mounts (ADD THIS)
    refetchOnWindowFocus: false, // Don't refetch when window regains focus (ADD THIS)
    refetchOnReconnect: false, // Don't refetch on network reconnect (ADD THIS)
  });
};