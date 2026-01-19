export interface Article {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  status: 'draft' | 'published';
  tags: string[];
  featuredImage?: string;
  author?: {
    username: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateArticleData {
  title: string;
  content: string;
  excerpt?: string;
  status: 'draft' | 'published';
  tags: string[];
  featuredImage?: string;
}

export interface UpdateArticleData {
  title?: string;
  content?: string;
  excerpt?: string;
  status?: 'draft' | 'published';
  tags?: string[];
  featuredImage?: string;
}

import { API_BASE_URL } from '../lib/apiConfig';
import { apiCache, cacheKeys } from '../lib/cache';

export const articleApi = {
  getPublishedArticles: async (): Promise<{ articles: Article[] }> => {
    const cacheKey = cacheKeys.articles.published();
    const cachedData = apiCache.get<{ articles: Article[] }>(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }
    
    const response = await fetch(`${API_BASE_URL}/articles`);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch published articles: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    apiCache.set(cacheKey, data);
    
    return data;
  },

  getAllArticles: async (token: string): Promise<{ articles: Article[] }> => {
    const cacheKey = cacheKeys.articles.all();
    const cachedData = apiCache.get<{ articles: Article[] }>(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }
    
    const response = await fetch(`${API_BASE_URL}/articles/all`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch all articles: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    apiCache.set(cacheKey, data);
    
    return data;
  },

  getArticleById: async (id: string): Promise<Article> => {
    const cacheKey = cacheKeys.articles.byId(id);
    const cachedData = apiCache.get<Article>(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }
    
    const response = await fetch(`${API_BASE_URL}/articles/${id}`);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch article: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    apiCache.set(cacheKey, data);
    
    return data;
  },

  createArticle: async (token: string, articleData: CreateArticleData): Promise<{ message: string; article: Article }> => {
    const response = await fetch(`${API_BASE_URL}/articles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(articleData)
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create article: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    
    // Invalidate cache after creating an article
    apiCache.invalidate('articles:*');
    
    return result;
  },

  createArticleWithImage: async (
    token: string,
    formData: FormData
  ): Promise<{ message: string; article: Article }> => {
    const response = await fetch(`${API_BASE_URL}/articles/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create article with image: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    
    // Invalidate cache after creating an article
    apiCache.invalidate('articles:*');
    
    return result;
  },

  updateArticle: async (token: string, id: string, articleData: UpdateArticleData): Promise<{ message: string; article: Article }> => {
    const response = await fetch(`${API_BASE_URL}/articles/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(articleData)
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update article: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    
    // Invalidate cache after updating an article
    apiCache.delete(cacheKeys.articles.byId(id));
    apiCache.invalidate('articles:*');
    
    return result;
  },

  updateArticleWithImage: async (
    token: string,
    id: string,
    formData: FormData
  ): Promise<{ message: string; article: Article }> => {
    const response = await fetch(`${API_BASE_URL}/articles/upload/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update article with image: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    
    // Invalidate cache after updating an article
    apiCache.delete(cacheKeys.articles.byId(id));
    apiCache.invalidate('articles:*');
    
    return result;
  },

  deleteArticle: async (token: string, id: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/articles/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to delete article: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    
    // Invalidate cache after deleting an article
    apiCache.delete(cacheKeys.articles.byId(id));
    apiCache.invalidate('articles:*');
    
    return result;
  }
};