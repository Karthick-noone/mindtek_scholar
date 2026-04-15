import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createComplaint, getComplaintCounts, getComplaints, updateComplaintRating } from "../services/complaintService";
import { secureStorage } from "../utils/secureStorage";

// Fetch complaints with pagination, filters, search
export const useComplaints = (page = 1, perPage = 10, resolve_status = 'all', search = '') => {
  const scholar = secureStorage.getScholar();

  return useQuery({
    queryKey: ["complaints", scholar?.id, page, perPage, resolve_status, search],
    queryFn: () => getComplaints(scholar?.id, page, perPage, resolve_status, search).then(res => res.data),
    enabled: !!scholar?.id,
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes (ADD THIS)
    refetchOnMount: false, // Don't refetch when component mounts (ADD THIS)
    refetchOnWindowFocus: false, // Don't refetch when window regains focus (ADD THIS)
    refetchOnReconnect: false, // Don't refetch on network reconnect (ADD THIS)
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



export const useUpdateRating = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateComplaintRating(id, data),

    onSuccess: (data, variables) => {
      // Instead of invalidating ALL complaints, just update the specific complaint
      queryClient.setQueryData(["complaints"], (oldData) => {
        if (!oldData) return oldData;
        
        // Update the rating for the specific complaint in the cache
        const updatedData = {
          ...oldData,
          data: oldData.data.map(complaint => 
            complaint.id === variables.id 
              ? { ...complaint, ratings: variables.data.ratings }
              : complaint
          )
        };
        return updatedData;
      });
      
      // Also update complaint counts if needed
      queryClient.invalidateQueries(["complaintCounts"]);
    },
  });
};