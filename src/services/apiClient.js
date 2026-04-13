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
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginAPI = error.config?.url?.includes("/login");

    if (error.response?.status === 401 && !isLoginAPI) {
      secureStorage.clear();
      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);
export default apiClient;