import apiClient from './apiClient';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  lastLoginAt: string | null;
  permissions?: string[];
}

export const userService = {
  getUsers: async (filters: any) => {
    const { data } = await apiClient.get('/users', { params: filters });
    return data.data.map((user: any) => ({
      ...user,
      firstName: user.first_name,
      lastName: user.last_name,
      isActive: user.is_active,
      lastLoginAt: user.last_login_at,
    }));
  },
  getUser: async (id: number) => {
    const { data } = await apiClient.get(`/users/${id}`);
    return data.data;
  },
  inviteUser: async (userData: any) => {
    const { data } = await apiClient.post('/users/invite', userData);
    return data.data;
  },
  updateUser: async (id: number, userData: any) => {
    const { data } = await apiClient.put(`/users/${id}`, userData);
    return data.data;
  },
  updateUserRoles: async (id: number, roleIds: number[]) => {
    const { data } = await apiClient.put(`/users/${id}/roles`, { roleIds });
    return data.data;
  },
  deleteUser: async (id: number) => {
    const { data } = await apiClient.delete(`/users/${id}`);
    return data.data;
  },
};
