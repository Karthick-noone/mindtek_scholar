import axios from "axios";
import { secureStorage } from "../utils/secureStorage";

const apiClient = axios.create({
    baseURL: process.env.REACT_APP_API_URL || "http://scholarapi.seasense.in/api",
    headers: {
        "Content-Type": "application/json",
    },
});

//  Request Interceptor (Attach Token)
apiClient.interceptors.request.use(
    (config) => {
        const token = secureStorage.getToken(); 
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

//  Response Interceptor (Global Error Handling)
//  Response Interceptor (Global Error Handling)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginAPI = error.config?.url?.includes("/login");

    const status = error.response?.status;
    const message = error.response?.data?.message;

    //  Existing 401 logic (unchanged)
    if (status === 401 && !isLoginAPI) {
      secureStorage.clear();
      window.location.href = "/";
    }

    //  NEW: Handle deactivated / not found scholar
    if (status === 404 && message?.toLowerCase().includes("scholar not found")) {
      secureStorage.clear();
      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);
export default apiClient;