/**
 * Cache utility for frontend API responses
 * Provides in-memory caching with TTL (Time To Live) functionality
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class ApiCache {
  private cache: Map<string, CacheEntry<any>> = new Map();

  /**
   * Get cached data by key
   * @param key Cache key
   * @returns Cached data if valid, null otherwise
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    // Check if cache is expired
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key); // Remove expired entry
      return null;
    }

    return entry.data;
  }

  /**
   * Set data in cache with TTL
   * @param key Cache key
   * @param data Data to cache
   * @param ttl Time to live in milliseconds (default: 5 minutes)
   */
  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * Check if a key exists and is not expired
   * @param key Cache key
   * @returns True if valid cache exists, false otherwise
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Delete specific cache entry
   * @param key Cache key to delete
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Invalidate cache entries by pattern
   * @param pattern Pattern to match keys against (supports '*' wildcard)
   */
  invalidate(pattern: string): void {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  stats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }
}

// Global cache instance
export const apiCache = new ApiCache();

// Utility functions for common cache keys
export const cacheKeys = {
  articles: {
    all: () => 'articles:all',
    published: () => 'articles:published',
    byId: (id: string) => `article:${id}`,
  },
  projects: {
    all: (params?: Record<string, any>) => {
      const paramStr = params ? `:${JSON.stringify(params)}` : '';
      return `projects:all${paramStr}`;
    },
    byId: (id: string) => `project:${id}`,
  },
  settings: () => 'settings:current',
  timeline: () => 'timeline:all',
  techSkills: () => 'techskills:all',
  interests: () => 'interests:all',
  dashboard: {
    stats: (token: string) => `dashboard:stats:${token.substring(0, 8)}...`,
    analytics: (token: string) => `dashboard:analytics:${token.substring(0, 8)}...`,
  },
  github: {
    repos: (username: string) => `github:repos:${username}`,
  }
};