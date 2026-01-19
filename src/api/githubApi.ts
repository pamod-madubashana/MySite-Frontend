import { API_BASE_URL } from '@/lib/apiConfig';
import { apiCache, cacheKeys } from '../lib/cache';

const GITHUB_API_BASE_URL = `${API_BASE_URL}/github`;

export const githubApi = {
  getRepos: async (username: string) => {
    const cacheKey = cacheKeys.github.repos(username);
    const cachedData = apiCache.get<any>(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }
    
    const response = await fetch(`${GITHUB_API_BASE_URL}/repos?username=${encodeURIComponent(username)}`);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch repos: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    apiCache.set(cacheKey, data, 600000); // 10 minute TTL for GitHub repos
    
    return data;
  },

  getRepoDetails: async (owner: string, repo: string) => {
    const cacheKey = `github:repo:${owner}/${repo}`; // Direct key since not in cacheKeys
    const cachedData = apiCache.get<any>(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }
    
    const response = await fetch(`${GITHUB_API_BASE_URL}/repo/${owner}/${repo}`);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch repo details: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    apiCache.set(cacheKey, data, 600000); // 10 minute TTL for GitHub repo details
    
    return data;
  }
};