import { secureStorage } from "./secureStorage";

export const performLogout = () => {
  secureStorage.clear();

  localStorage.clear();

  // redirect
  window.location.href = "/";
};