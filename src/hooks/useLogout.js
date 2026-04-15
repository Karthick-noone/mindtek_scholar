import { useMutation } from "@tanstack/react-query";
import { logoutUser } from "../services/authService";
import { performLogout } from "../utils/logout";

export const useLogout = () => {
  return useMutation({
    mutationFn: logoutUser,

    onSuccess: () => {
      performLogout(); 
    },

    onError: () => {
      performLogout();
    },
  });
};