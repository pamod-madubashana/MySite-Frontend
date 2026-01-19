import { API_BASE_URL } from '../lib/apiConfig';
import { apiCache, cacheKeys } from '../lib/cache';

export interface TimelineItem {
  _id: string;
  year: string;
  role: string;
  company: string;
  description: string;
  icon: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface TimelineResponse {
  success: boolean;
  timeline: TimelineItem[];
}

export const timelineApi = {
  getTimeline: async (): Promise<TimelineItem[]> => {
    const cacheKey = cacheKeys.timeline();
    const cachedData = apiCache.get<TimelineItem[]>(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }
    
    const response = await fetch(`${API_BASE_URL}/timeline/public`);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch timeline: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    apiCache.set(cacheKey, data);
    
    return data;
  },

  getAllTimeline: async (token: string): Promise<TimelineItem[]> => {
    const cacheKey = cacheKeys.timeline();
    const cachedData = apiCache.get<TimelineItem[]>(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }
    
    const response = await fetch(`${API_BASE_URL}/timeline`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch all timeline items: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    apiCache.set(cacheKey, data);
    
    return data;
  },

  createTimeline: async (token: string, timelineData: Omit<TimelineItem, '_id' | 'createdAt' | 'updatedAt'>): Promise<TimelineItem> => {
    const response = await fetch(`${API_BASE_URL}/timeline`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(timelineData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create timeline item: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    
    // Invalidate cache after creating a timeline item
    apiCache.invalidate('timeline:*');
    
    return result;
  },

  updateTimeline: async (token: string, id: string, timelineData: Partial<Omit<TimelineItem, '_id' | 'createdAt' | 'updatedAt'>>): Promise<TimelineItem> => {
    const response = await fetch(`${API_BASE_URL}/timeline/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(timelineData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update timeline item: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    
    // Invalidate cache after updating a timeline item
    apiCache.invalidate('timeline:*');
    
    return result;
  },

  deleteTimeline: async (token: string, id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/timeline/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to delete timeline item: ${response.status} - ${errorText}`);
    }
    
    // Invalidate cache after deleting a timeline item
    apiCache.invalidate('timeline:*');
  }
};