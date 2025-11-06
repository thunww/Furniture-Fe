import axios from "axios";

const BACKEND_PORT = import.meta.env.VITE_BACKEND_PORT || "8080";
const API_URL =
  import.meta.env.VITE_API_URL || `http://localhost:${BACKEND_PORT}/api/v1`;

const axiosClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Gửi cookie tự động
  timeout: 10000,
});

// ========= REQUEST =========
axiosClient.interceptors.request.use(
  (config) => {
    // có thể thêm Authorization nếu cần (token trong localStorage)
    return config;
  },
  (error) => Promise.reject(error)
);

// ========= RESPONSE =========
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, data) => {
  failedQueue.forEach((prom) => {
    error ? prom.reject(error) : prom.resolve(data);
  });
  failedQueue = [];
};

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // không có response (network fail)
    if (!error.response) return Promise.reject(error);

    // Nếu là refresh-token endpoint bị lỗi → không retry
    if (originalRequest.url === "/auth/refresh-token") {
      return Promise.reject(error);
    }

    // lỗi 401
    if (error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => axiosClient(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // gọi refresh token endpoint
        await axiosClient.post("/auth/refresh-token");

        processQueue(null, true);
        return axiosClient(originalRequest);
      } catch (err) {
        processQueue(err, null);
        // Để Redux xử lý việc redirect, không dùng window.location.href
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
