/**
 * Centralized API Configuration
 * This file manages API base URLs based on environment variables
 */

// Determine the API base URL based on environment
const getApiBaseUrl = (): string => {
  // Client-side (browser) environment
  if (typeof window !== 'undefined') {
    const isDev = import.meta.env.DEV;
    const devUrl = import.meta.env.VITE_API_BASE_URL;
    const prodUrl = import.meta.env.VITE_API_BASE_URL_PROD;
    
    if (isDev && devUrl) {
      return devUrl;
    }
    
    if (!isDev && prodUrl) {
      return prodUrl;
    }
    
    // Fallback
    if (devUrl) {
      return devUrl;
    }
    
    throw new Error('API base URL environment variable is not defined');
  } else {
    // Server-side environment (SSR, etc.) - though unlikely for this app
    const isDev = process.env.NODE_ENV === 'development';
    const devUrl = process.env.VITE_API_BASE_URL;
    const prodUrl = process.env.VITE_API_BASE_URL_PROD;
    
    if (isDev && devUrl) {
      return devUrl;
    }
    
    if (!isDev && prodUrl) {
      return prodUrl;
    }
    
    // Fallback
    if (devUrl) {
      return devUrl;
    }
    
    throw new Error('API base URL environment variable is not defined');
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