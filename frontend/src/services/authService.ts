import apiClient from './apiClient';

export const authService = {
  register: async (userData: any) => {
    const { data } = await apiClient.post('/auth/register', userData);
    return data.data;
  },
  login: async (credentials: any) => {
    const { data } = await apiClient.post('/auth/login', credentials);
    return data.data;
  },
};
