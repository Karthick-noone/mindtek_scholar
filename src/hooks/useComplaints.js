import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createComplaint, getComplaintCounts, getComplaints } from "../services/complaintService";
import { secureStorage } from "../utils/secureStorage";

// Fetch complaints with pagination, filters, search
export const useComplaints = (page = 1, perPage = 10, resolve_status = 'all', search = '') => {
  const scholar = secureStorage.getScholar();

  return useQuery({
    queryKey: ["complaints", scholar?.id, page, perPage, resolve_status, search],
    queryFn: () => getComplaints(scholar?.id, page, perPage, resolve_status, search).then(res => res.data),
    enabled: !!scholar?.id,
    keepPreviousData: true, // Keeps previous data while fetching new
  });
};


// Create complaint
export const useCreateComplaint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createComplaint,
    onSuccess: () => {
      queryClient.invalidateQueries(["complaints"]);
    },
  });
};

export const useComplaintCounts = () => {
  const scholar = secureStorage.getScholar();

  return useQuery({
    queryKey: ["complaintCounts", scholar?.id],
    queryFn: async () => {
      const res = await getComplaintCounts();
      return res.data.counts; 
    },
    enabled: !!scholar?.id,
    staleTime: 1000 * 60 * 5, // 5 mins cache
  });
};