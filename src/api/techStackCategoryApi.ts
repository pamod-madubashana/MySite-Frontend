import { API_BASE_URL } from '@/lib/apiConfig';
import { apiCache, cacheKeys } from '@/lib/cache';

export interface TechStackCategory {
  _id: string;
  title: string;
  icon: string;
  skills: string[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

const invalidateTechStackCaches = () => {
  apiCache.invalidate('techstack:*');
  apiCache.invalidate('public:*');
  apiCache.invalidate('about:*');
  apiCache.invalidate('dashboard:*');
};

export const techStackCategoryApi = {
  getPublicCategories: async (forceRefresh = false): Promise<TechStackCategory[]> => {
    const cacheKey = cacheKeys.techStack.public();

    if (!forceRefresh) {
      const cachedData = apiCache.get<TechStackCategory[]>(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }

    const response = await fetch(`${API_BASE_URL}/tech-stack-categories/public`);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch public tech stack categories: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    apiCache.set(cacheKey, data);

    return data;
  },

  getAllCategories: async (token: string, forceRefresh = false): Promise<TechStackCategory[]> => {
    const cacheKey = cacheKeys.techStack.all();

    if (!forceRefresh) {
      const cachedData = apiCache.get<TechStackCategory[]>(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }

    const response = await fetch(`${API_BASE_URL}/tech-stack-categories`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch tech stack categories: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    apiCache.set(cacheKey, data);

    return data;
  },

  createCategory: async (
    token: string,
    categoryData: Omit<TechStackCategory, '_id' | 'createdAt' | 'updatedAt'>,
  ): Promise<TechStackCategory> => {
    const response = await fetch(`${API_BASE_URL}/tech-stack-categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(categoryData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create tech stack category: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    invalidateTechStackCaches();

    return result;
  },

  updateCategory: async (
    token: string,
    id: string,
    categoryData: Partial<Omit<TechStackCategory, '_id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<TechStackCategory> => {
    const response = await fetch(`${API_BASE_URL}/tech-stack-categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(categoryData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update tech stack category: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    invalidateTechStackCaches();

    return result;
  },

  deleteCategory: async (token: string, id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/tech-stack-categories/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to delete tech stack category: ${response.status} - ${errorText}`);
    }

    invalidateTechStackCaches();
  }
};
