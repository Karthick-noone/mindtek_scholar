import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadProfileImage, deleteProfileImage } from "../services/profileService";

export const useUploadProfileImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadProfileImage,

    onSuccess: (res) => {
      const updatedImage = res.data.data?.scholar_profile;

      queryClient.setQueryData(["scholar"], (oldData) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          scholar_profile: updatedImage,
        };
      });
    },
  });
};
