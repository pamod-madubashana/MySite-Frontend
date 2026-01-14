import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

interface Project {
  _id: string;
  title: string;
  description: string;
  techStack: string[];
  githubUrl?: string;
  liveUrl?: string;
  featured: boolean;
  status: 'draft' | 'published';
  thumbnail?: string;
  screenshots?: string[];
  createdAt: string;
  updatedAt: string;
}

interface GetProjectsResponse {
  projects: Project[];
  totalPages: number;
  currentPage: number;
  total: number;
}

export const projectApi = {
  getProjects: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    featured?: boolean;
  }): Promise<GetProjectsResponse> => {
    const response = await axios.get(`${API_BASE_URL}/projects`, { params });
    return response.data;
  },

  getProject: async (id: string): Promise<Project> => {
    const response = await axios.get(`${API_BASE_URL}/projects/${id}`);
    return response.data;
  },

  createProject: async (projectData: Omit<Project, '_id' | 'createdAt' | 'updatedAt'>): Promise<{ message: string; project: Project }> => {
    const response = await axios.post(`${API_BASE_URL}/projects`, projectData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },

  updateProject: async (id: string, projectData: Partial<Project>): Promise<{ message: string; project: Project }> => {
    const response = await axios.put(`${API_BASE_URL}/projects/${id}`, projectData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },

  deleteProject: async (id: string): Promise<{ message: string }> => {
    const response = await axios.delete(`${API_BASE_URL}/projects/${id}`);
    return response.data;
  },
};