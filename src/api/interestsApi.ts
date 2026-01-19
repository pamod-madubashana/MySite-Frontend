import { API_BASE_URL } from '../lib/apiConfig';
import { apiCache, cacheKeys } from '../lib/cache';

export interface Interest {
  _id: string;
  icon: string;
  label: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface InterestsResponse {
  success: boolean;
  interests: Interest[];
}

export const interestsApi = {
  getInterests: async (): Promise<Interest[]> => {
    const cacheKey = cacheKeys.interests();
    const cachedData = apiCache.get<Interest[]>(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }
    
    const response = await fetch(`${API_BASE_URL}/enhanced-dashboard/interests`);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch interests: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    apiCache.set(cacheKey, data);
    
    return data;
  },

  getAllInterests: async (token: string): Promise<Interest[]> => {
    const cacheKey = cacheKeys.interests();
    const cachedData = apiCache.get<Interest[]>(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }
    
    const response = await fetch(`${API_BASE_URL}/interests`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch all interests: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    apiCache.set(cacheKey, data);
    
    return data;
  },

  createInterest: async (token: string, interestData: Omit<Interest, '_id' | 'createdAt' | 'updatedAt'>): Promise<Interest> => {
    const response = await fetch(`${API_BASE_URL}/interests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(interestData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create interest: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    
    // Invalidate cache after creating an interest
    apiCache.invalidate('interests:*');
    
    return result;
  },

  updateInterest: async (token: string, id: string, interestData: Partial<Omit<Interest, '_id' | 'createdAt' | 'updatedAt'>>): Promise<Interest> => {
    const response = await fetch(`${API_BASE_URL}/interests/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(interestData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update interest: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    
    // Invalidate cache after updating an interest
    apiCache.invalidate('interests:*');
    
    return result;
  },

  deleteInterest: async (token: string, id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/interests/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to delete interest: ${response.status} - ${errorText}`);
    }
    
    // Invalidate cache after deleting an interest
    apiCache.invalidate('interests:*');
  }
};