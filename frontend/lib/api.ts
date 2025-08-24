import axios from "axios";
import Cookies from "js-cookie";

const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
  withCredentials: true,
});

// Attach CSRF token if available
axiosClient.interceptors.request.use((config) => {
  const csrf = Cookies.get("csrfToken");
  if (csrf) config.headers["x-csrf-token"] = csrf;
  return config;
});

export default axiosClient;
