import authApi from "../api/authApi";

const authService = {
  login: async (userData) => {
    const response = await authApi.login(userData);
    return response.data;
  },

  register: async (userData) => {
    const response = await authApi.register(userData);
    return response.data;
  },

  logout: async () => {
    await authApi.logout();
  },

  getProfile: async () => {
    const response = await authApi.getProfile();
    return response.data;
  },

  getUserById: async (userId) => {
    if (!userId) throw new Error("userId is required");
    const response = await authApi.getUserById(userId);
    return response.data;
  },

  refreshToken: async () => {
    const response = await authApi.refresh();
    return response.data;
  },
};

export default authService;
