import { API_BASE_URL } from '../lib/apiConfig';
import { apiCache, cacheKeys } from '../lib/cache';

interface Project {
  _id: string;
  title: string;
  description: string;
  tags: string[];
  languages: string[];
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
    const cacheKey = cacheKeys.projects.all(params);
    const cachedData = apiCache.get<GetProjectsResponse>(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }
    
    // Build query string from params
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.featured !== undefined) queryParams.append('featured', params.featured.toString());

    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/projects${queryString ? '?' + queryString : ''}`;

    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch projects: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    apiCache.set(cacheKey, data);
    
    return data;
  },

  getAllProjects: async (token: string): Promise<GetProjectsResponse> => {
    const cacheKey = cacheKeys.projects.all();
    const cachedData = apiCache.get<GetProjectsResponse>(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }
    
    const response = await fetch(`${API_BASE_URL}/projects/all`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch all projects: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    apiCache.set(cacheKey, data);
    
    return data;
  },

  getProject: async (id: string): Promise<Project> => {
    const cacheKey = cacheKeys.projects.byId(id);
    const cachedData = apiCache.get<Project>(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }
    
    const response = await fetch(`${API_BASE_URL}/projects/${id}`);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch project: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    apiCache.set(cacheKey, data);
    
    return data;
  },

  createProject: async (token: string, projectData: Omit<Project, '_id' | 'createdAt' | 'updatedAt'>): Promise<{ message: string; project: Project }> => {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(projectData),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Create project error details:', errorText);
      throw new Error(`Failed to create project: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    
    // Invalidate cache after creating a project
    apiCache.invalidate('projects:*');
    
    return result;
  },

  createProjectWithImage: async (
    token: string, 
    formData: FormData
  ): Promise<{ message: string; project: Project }> => {
    const response = await fetch(`${API_BASE_URL}/projects/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData,
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Create project with image error details:', errorText);
      throw new Error(`Failed to create project with image: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    
    // Invalidate cache after creating a project
    apiCache.invalidate('projects:*');
    
    return result;
  },

  updateProject: async (id: string, token: string, projectData: Partial<Project>): Promise<{ message: string; project: Project }> => {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(projectData),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Update project error details:', errorText);
      throw new Error(`Failed to update project: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    
    // Invalidate cache after updating a project
    apiCache.delete(cacheKeys.projects.byId(id));
    apiCache.invalidate('projects:*');
    
    return result;
  },

  updateProjectWithImage: async (
    id: string, 
    token: string, 
    formData: FormData
  ): Promise<{ message: string; project: Project }> => {
    const response = await fetch(`${API_BASE_URL}/projects/upload/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData,
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Update project with image error details:', errorText);
      throw new Error(`Failed to update project with image: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    
    // Invalidate cache after updating a project
    apiCache.delete(cacheKeys.projects.byId(id));
    apiCache.invalidate('projects:*');
    
    return result;
  },

  deleteProject: async (id: string, token: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Delete project error details:', errorText);
      throw new Error(`Failed to delete project: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    
    // Invalidate cache after deleting a project
    apiCache.delete(cacheKeys.projects.byId(id));
    apiCache.invalidate('projects:*');
    
    return result;
  },
};