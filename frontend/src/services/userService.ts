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
    const user = data.data;
    return {
      ...user,
      firstName: user.first_name,
      lastName: user.last_name,
      isActive: user.is_active,
      lastLoginAt: user.last_login_at,
    };
  },
  inviteUser: async (userData: any) => {
    const { data } = await apiClient.post('/users/invite', userData);
    const user = data.data;
    return {
      ...user,
      firstName: user.first_name,
      lastName: user.last_name,
    };
  },
  updateProfile: async (id: number, userData: { firstName: string, lastName: string }) => {
    const { data } = await apiClient.put(`/users/${id}`, userData);
    const user = data.data;
    return {
      ...user,
      firstName: user.first_name,
      lastName: user.last_name,
    };
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
