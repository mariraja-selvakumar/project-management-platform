import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
  timeout: 10000,
});

// Request interceptor to attach access token
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const { refreshToken, logout } = useAuthStore.getState();

      if (refreshToken) {
        try {
          const { data } = await axios.post(`${apiClient.defaults.baseURL}/auth/refresh`, {
            refreshToken,
          });
          const newAccessToken = data.accessToken;
          const newRefreshToken = data.refreshToken;
          
          useAuthStore.getState().setAuth(
            useAuthStore.getState().user!,
            newAccessToken,
            newRefreshToken
          );

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          logout();
          return Promise.reject(refreshError);
        }
      } else {
        logout();
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
