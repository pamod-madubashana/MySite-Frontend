import { API_BASE_URL } from '../lib/apiConfig';
import { apiCache, cacheKeys } from '../lib/cache';
import { TimelineItem } from './timelineApi';
import { Interest } from './interestsApi';

export interface AboutPageData {
  timeline: TimelineItem[];
  techCategories: any[];
  interests: Interest[];
}

export const aboutApi = {
  // Fetch all about page data in one call
  getAllAboutData: async (): Promise<AboutPageData> => {
    const cacheKey = 'about:all-data';
    const cachedData = apiCache.get<AboutPageData>(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }
    
    try {
      // Fetch all data in parallel for better performance
      const [timelineResponse, techStackResponse, interestsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/timeline/public`),
        fetch(`${API_BASE_URL}/tech-stack-categories/public`),
        fetch(`${API_BASE_URL}/interests/public`)
      ]);
      
      // Process timeline data
      let timelineData: TimelineItem[] = [];
      if (timelineResponse.ok) {
        timelineData = await timelineResponse.json();
      }
      
      // Process tech stack categories data
      let techCategoriesData: any[] = [];
      if (techStackResponse.ok) {
        techCategoriesData = await techStackResponse.json();
      }
      
      // Process interests data
      let interestsData: Interest[] = [];
      if (interestsResponse.ok) {
        interestsData = await interestsResponse.json();
      }
      
      const result: AboutPageData = {
        timeline: timelineData,
        techCategories: techCategoriesData,
        interests: interestsData
      };
      
      // Cache for 10 minutes
      apiCache.set(cacheKey, result, 10 * 60 * 1000);
      
      return result;
    } catch (error) {
      console.error('Error fetching about page data:', error);
      throw error;
    }
  },
  
  // Pre-fetch about page data (used on home page)
  prefetchAboutData: async (): Promise<void> => {
    try {
      await aboutApi.getAllAboutData();
      console.log('About page data pre-fetched successfully');
    } catch (error) {
      console.warn('Failed to pre-fetch about page data:', error);
      // Don't throw error as this is a background operation
    }
  },
  
  // Get cached about data (used on about page)
  getCachedAboutData: (): AboutPageData | null => {
    const cacheKey = 'about:all-data';
    return apiCache.get<AboutPageData>(cacheKey);
  },
  
  // Clear about page cache (useful when data is updated)
  clearCache: (): void => {
    apiCache.delete('about:all-data');
  }
};