/**
 * Centralized API Configuration
 * This file manages API base URLs based on environment variables
 */

// Determine the API base URL based on environment
const getApiBaseUrl = (): string => {
  // In development, we might want to use a direct URL or fall back to proxy
  if (typeof window !== 'undefined') {
    // Client-side (browser) environment
    const envBaseUrl = import.meta.env.VITE_API_BASE_URL;
    
    if (envBaseUrl) {
      // Ensure the URL ends with '/api' for our backend routes
      return envBaseUrl.endsWith('/api') ? envBaseUrl : `${envBaseUrl}/api`;
    }
    
    // Fallback for development when VITE_API_BASE_URL is not set
    // Use the production backend URL instead of current hostname
    return 'https://crucial-berti-premiumqtrust-83e7436c.koyeb.app/api';
  } else {
    // Server-side environment (SSR, etc.) - though unlikely for this app
    const envBaseUrl = process.env.VITE_API_BASE_URL;
    if (envBaseUrl) {
      return envBaseUrl.endsWith('/api') ? envBaseUrl : `${envBaseUrl}/api`;
    }
    return 'https://crucial-berti-premiumqtrust-83e7436c.koyeb.app/api';
  }
};

// Export the API base URL
export const API_BASE_URL = getApiBaseUrl();

// Export a function to get the API base URL (useful for dynamic changes)
export const getApiUrl = (): string => getApiBaseUrl();

// Type for environment configuration
export interface EnvironmentConfig {
  apiUrl: string;
  isDevelopment: boolean;
  isProduction: boolean;
}

// Get environment configuration
export const getEnvironmentConfig = (): EnvironmentConfig => {
  const apiUrl = getApiBaseUrl();
  const isDev = import.meta.env.DEV;
  const isProd = import.meta.env.PROD;
  
  return {
    apiUrl,
    isDevelopment: isDev,
    isProduction: isProd
  };
};