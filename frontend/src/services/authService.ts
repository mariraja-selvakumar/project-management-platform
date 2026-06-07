import apiClient from './apiClient';

export const authService = {
  register: async (userData: any) => {
    const { data } = await apiClient.post('/auth/register', userData);
    const result = data.data;
    if (result && result.first_name) {
      result.firstName = result.first_name;
      result.lastName = result.last_name;
    }
    return result;
  },
  login: async (credentials: any) => {
    const { data } = await apiClient.post('/auth/login', credentials);
    const result = data.data;
    if (result && result.user) {
      result.user.firstName = result.user.first_name;
      result.user.lastName = result.user.last_name;
    }
    return result;
  },
  changePassword: async (passwordData: { oldPassword: string, newPassword: string }) => {
    const { data } = await apiClient.post('/auth/changepassword', passwordData);
    return data;
  },
};
