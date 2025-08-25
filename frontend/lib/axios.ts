import axios from "axios";
import Cookies from "js-cookie";
import { APP_URL } from "./constants";

const axiosClient = axios.create({
  baseURL: APP_URL,
  withCredentials: true,
});

// Attach CSRF token if available
axiosClient.interceptors.request.use((config) => {
  const csrf = Cookies.get("csrfToken");
  if (csrf) config.headers["x-csrf-token"] = csrf;
  return config;
});

export default axiosClient;
