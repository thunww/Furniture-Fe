import authApi from "../api/authApi";

const authService = {
  login: async (userData, captchaToken = null) => {
    // ← THÊM captchaToken parameter
    const response = await authApi.login({
      ...userData,
      captchaToken, // ← Gửi captchaToken cùng với userData
    });
    return response.data;
  },

  register: async (userData) => {
    const response = await authApi.register(userData);
    return response.data;
  },

  logout: async () => {
    await authApi.logout();
  },

  getUserById: async (userId) => {
    if (!userId) throw new Error("userId is required");
    const response = await authApi.getUserById(userId);
    return response.data;
  },

  refresh: async () => {
    const response = await authApi.refresh();
    return response.data.user;
  },

  getProfile: async () => {
    const response = await authApi.getProfile();
    return response.data.user;
  },
};

export default authService;
