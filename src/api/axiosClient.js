import axios from "axios";

// ✅ Không cần VITE_API_URL nữa, dùng relative path
const axiosClient = axios.create({
  baseURL: "/api/v1", // ✅ Proxy sẽ forward tới http://localhost:8080/api/v1
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

// =============================
// 🔹 REQUEST INTERCEPTOR
// =============================
axiosClient.interceptors.request.use(
  (config) => {
    console.log(`📤 ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// =============================
// 🔹 RESPONSE INTERCEPTOR
// =============================
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/login") &&
      !originalRequest.url.includes("/auth/refresh")
    ) {
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
        console.log("⏳ Refreshing token...");

        await axiosClient.post("/auth/refresh"); // ✅ Dùng relative path

        console.log("✅ Token refreshed");
        isRefreshing = false;
        processQueue(null);

        return axiosClient(originalRequest);
      } catch (refreshError) {
        console.error("❌ Refresh failed:", refreshError);
        isRefreshing = false;
        processQueue(refreshError);

        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
