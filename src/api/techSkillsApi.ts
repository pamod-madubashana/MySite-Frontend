import { API_BASE_URL } from '../lib/apiConfig';
import { apiCache, cacheKeys } from '../lib/cache';

export interface TechSkill {
  _id: string;
  name: string;
  level: number; // 0-100 percentage
  category?: string; // e.g., 'frontend', 'backend', 'database', 'devops'
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface TechSkillsResponse {
  success: boolean;
  techSkills: TechSkill[];
}

export const techSkillsApi = {
  getTechSkills: async (): Promise<TechSkill[]> => {
    const cacheKey = cacheKeys.techSkills();
    const cachedData = apiCache.get<TechSkill[]>(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }
    
    const response = await fetch(`${API_BASE_URL}/enhanced-dashboard/tech-skills`);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch tech skills: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    apiCache.set(cacheKey, data);
    
    return data;
  },

  getAllTechSkills: async (token: string): Promise<TechSkill[]> => {
    const cacheKey = cacheKeys.techSkills();
    const cachedData = apiCache.get<TechSkill[]>(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }
    
    const response = await fetch(`${API_BASE_URL}/tech-skills`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch all tech skills: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    apiCache.set(cacheKey, data);
    
    return data;
  },

  createTechSkill: async (token: string, techSkillData: Omit<TechSkill, '_id' | 'createdAt' | 'updatedAt'>): Promise<TechSkill> => {
    const response = await fetch(`${API_BASE_URL}/tech-skills`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(techSkillData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create tech skill: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    
    // Invalidate cache after creating a tech skill
    apiCache.invalidate('techskills:*');
    
    return result;
  },

  updateTechSkill: async (token: string, id: string, techSkillData: Partial<Omit<TechSkill, '_id' | 'createdAt' | 'updatedAt'>>): Promise<TechSkill> => {
    const response = await fetch(`${API_BASE_URL}/tech-skills/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(techSkillData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update tech skill: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    
    // Invalidate cache after updating a tech skill
    apiCache.invalidate('techskills:*');
    
    return result;
  },

  deleteTechSkill: async (token: string, id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/tech-skills/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to delete tech skill: ${response.status} - ${errorText}`);
    }
    
    // Invalidate cache after deleting a tech skill
    apiCache.invalidate('techskills:*');
  }
};