import { API_BASE_URL } from '../lib/apiConfig';
import { apiCache, cacheKeys } from '../lib/cache';

export interface Settings {
  aboutContent: string;
  featuredRepos: string[];
  themeOptions: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
  };
  siteSections: {
    showAbout: boolean;
    showProjects: boolean;
    showArticles: boolean;
    showContact: boolean;
  };
  socialLinks: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    email?: string;
  };
}

export interface UpdateSettingsData {
  aboutContent?: string;
  featuredRepos?: string[];
  themeOptions?: {
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
  };
  siteSections?: {
    showAbout?: boolean;
    showProjects?: boolean;
    showArticles?: boolean;
    showContact?: boolean;
  };
  socialLinks?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    email?: string;
  };
}

export const settingsApi = {
  getSettings: async (forceRefresh = false): Promise<Settings> => {
    const cacheKey = cacheKeys.settings();
    
    if (!forceRefresh) {
      const cachedData = apiCache.get<Settings>(cacheKey);
      
      if (cachedData) {
        return cachedData;
      }
    }
    
    const response = await fetch(`${API_BASE_URL}/settings`);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch settings: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    apiCache.set(cacheKey, data);
    
    return data;
  },

  updateSettings: async (token: string, settingsData: UpdateSettingsData): Promise<{ message: string; settings: Settings }> => {
    const response = await fetch(`${API_BASE_URL}/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(settingsData)
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update settings: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    
    // Invalidate cache after updating settings
    apiCache.delete(cacheKeys.settings());
    
    return result;
  }
};