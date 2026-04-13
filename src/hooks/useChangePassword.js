import { useMutation } from "@tanstack/react-query";
import { changePassword } from "../services/authService";

export const useChangePassword = () => {
  return useMutation({
    mutationFn: changePassword,
  });
};