import axios from "axios";

const BACKEND_PORT = import.meta.env.VITE_BACKEND_PORT || "8080";
const API_URL =
  import.meta.env.VITE_API_URL || `http://localhost:${BACKEND_PORT}/api/v1`;

const axiosClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Tự động gửi cookie (accessToken, refreshToken)
  timeout: 10000,
});

// ========= REQUEST =========
axiosClient.interceptors.request.use(
  (config) => {
    // Có thể thêm Authorization header nếu cần
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

    // Nếu không có phản hồi (network lỗi)
    if (!error.response) return Promise.reject(error);

    // Không xử lý lỗi từ chính endpoint refresh-token
    if (originalRequest.url === "/auth/refresh-token") {
      return Promise.reject(error);
    }

    // Nếu là 401 mà chưa login → đừng gọi refresh
    const hasRefresh = document.cookie.includes("refreshToken=");
    if (!hasRefresh) {
      // 🚫 Không có refreshToken cookie, bỏ qua retry
      return Promise.reject(error);
    }

    // Nếu là 401 (Unauthorized)
    if (error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Nếu đang có request refresh khác → chờ xong rồi retry
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => axiosClient(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Gọi refresh token endpoint
        await axiosClient.post("/auth/refresh-token");

        // Sau khi refresh xong → retry lại request cũ
        processQueue(null, true);
        return axiosClient(originalRequest);
      } catch (err) {
        processQueue(err, null);
        // Để Redux hoặc FE xử lý logout, không redirect ở đây
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
