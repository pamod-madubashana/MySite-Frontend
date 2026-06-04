import { API_BASE_URL } from "@/lib/apiConfig";
import { apiCache, cacheKeys } from "@/lib/cache";

export interface SiteProject {
  _id: string;
  slug?: string;
  title: string;
  description: string;
  tags: string[];
  languages: string[];
  githubUrl?: string;
  liveUrl?: string;
  featured: boolean;
  status: "draft" | "published";
  thumbnail?: string;
  screenshots?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SiteTimelineItem {
  _id?: string;
  year: string;
  role: string;
  company?: string;
  description: string;
  icon?: string;
  order?: number;
}

export interface SiteTechStackCategory {
  _id?: string;
  title: string;
  icon: string;
  skills: string[];
  order?: number;
}

export interface SiteTechSkill {
  _id?: string;
  name: string;
  level: number;
  category?: string;
  order?: number;
}

export interface SiteInterest {
  _id?: string;
  icon?: string;
  label: string;
  order?: number;
}

export interface SiteArticle {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  status: "draft" | "published";
  tags: string[];
  featuredImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PublicSiteData {
  about: {
    content: string;
  } | null;
  projects: SiteProject[];
  featuredProjects: SiteProject[];
  timeline: SiteTimelineItem[];
  techStackCategories: SiteTechStackCategory[];
  techSkills: SiteTechSkill[];
  interests: SiteInterest[];
  articles: SiteArticle[];
  github: {
    repos: unknown[];
    projectStats: Record<string, { stars: number; forks: number }>;
  };
  settings: {
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
      telegram?: string;
      email?: string;
    };
  } | null;
  contactInfo: {
    email?: string;
    github?: string;
    linkedin?: string;
    telegram?: string;
  } | null;
  errors?: Record<string, string>;
}

export const siteDataApi = {
  getPublicSiteData: async (forceRefresh = false): Promise<PublicSiteData> => {
    const cacheKey = cacheKeys.siteData();

    if (!forceRefresh) {
      const cachedData = apiCache.get<PublicSiteData>(cacheKey);

      if (cachedData) {
        return cachedData;
      }
    }

    const response = await fetch(`${API_BASE_URL}/api/public/site-data`);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch public site data: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    apiCache.set(cacheKey, data, 3 * 60 * 1000);

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("public-site-data:loaded"));
    }

    return data;
  },
};

export const getPublicSiteData = siteDataApi.getPublicSiteData;
