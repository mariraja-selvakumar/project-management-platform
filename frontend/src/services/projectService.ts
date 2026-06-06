import apiClient from './apiClient';

export interface Project {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'on_hold' | 'completed' | 'archived';
  startDate: string | null;
  dueDate: string | null;
  ownerId: number;
  taskSummary?: {
    todo: number;
    in_progress: number;
    in_review: number;
    done: number;
    cancelled: number;
  };
}

export const projectService = {
  getProjects: async (filters: any) => {
    const { data } = await apiClient.get('/projects', { params: filters });
    return data;
  },
  getProject: async (id: number) => {
    const { data } = await apiClient.get(`/projects/${id}`);
    return data.data;
  },
  createProject: async (projectData: Partial<Project>) => {
    const { data } = await apiClient.post('/projects', projectData);
    return data.data;
  },
  updateProject: async (id: number, projectData: Partial<Project>) => {
    const { data } = await apiClient.put(`/projects/${id}`, projectData);
    return data.data;
  },
  deleteProject: async (id: number) => {
    const { data } = await apiClient.delete(`/projects/${id}`);
    return data.data;
  },
};
