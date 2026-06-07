import apiClient from './apiClient';

export interface Task {
  id: number;
  project_id: number;
  assigneeId: number | null;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'in_review' | 'done' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueDate: string | null;
  assignee?: {
    firstName: string;
    lastName: string;
  };
}

export const taskService = {
  getProjectTasks: async (project_id: number, filters: any) => {
    const { data } = await apiClient.get(`/projects/${project_id}/tasks`, { params: filters });
    return data.data;
  },
  getTask: async (id: number) => {
    const { data } = await apiClient.get(`/tasks/${id}`);
    return data.data;
  },
  createTask: async (project_id: number, taskData: Partial<Task>) => {
    const { data } = await apiClient.post(`/projects/${project_id}/tasks`, taskData);
    return data.data;
  },
  updateTask: async (id: number, taskData: Partial<Task>) => {
    const { data } = await apiClient.put(`/tasks/${id}`, taskData);
    return data.data;
  },
  updateTaskStatus: async (id: number, status: string) => {
    const { data } = await apiClient.patch(`/tasks/${id}/status`, { status });
    return data.data;
  },
  deleteTask: async (id: number) => {
    const { data } = await apiClient.delete(`/tasks/${id}`);
    return data.data;
  },
};
