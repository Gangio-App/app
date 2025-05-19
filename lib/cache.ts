/**
 * Simple in-memory cache implementation
 */

interface CacheItem<T> {
  data: T;
  expiry: number; // Timestamp when this item expires
}

class MemoryCache {
  private cache: Map<string, CacheItem<any>> = new Map();
  private defaultTtl: number = 5 * 60 * 1000; // 5 minutes in milliseconds
  private maxItems: number = 1000;
  
  constructor(options?: { ttl?: number; maxItems?: number }) {
    if (options?.ttl) this.defaultTtl = options.ttl;
    if (options?.maxItems) this.maxItems = options.maxItems;
    console.log(`[Cache] Initialized with TTL: ${this.defaultTtl}ms, max items: ${this.maxItems}`);
  }
  
  /**
   * Get an item from the cache
   */
  get<T>(key: string): T | undefined {
    this.removeExpiredItems();
    
    const item = this.cache.get(key) as CacheItem<T> | undefined;
    if (!item) return undefined;
    
    // Check if the item has expired
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return undefined;
    }
    
    return item.data;
  }
  
  /**
   * Set an item in the cache
   */
  set<T>(key: string, data: T, ttl?: number): void {
    // Enforce max items limit
    if (this.cache.size >= this.maxItems && !this.cache.has(key)) {
      this.removeOldestItem();
    }
    
    const expiry = Date.now() + (ttl || this.defaultTtl);
    this.cache.set(key, { data, expiry });
  }
  
  /**
   * Delete an item from the cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }
  
  /**
   * Clear all items from the cache
   */
  clear(): void {
    this.cache.clear();
  }
  
  /**
   * Get all keys in the cache
   */
  keys(): string[] {
    this.removeExpiredItems();
    return Array.from(this.cache.keys());
  }
  
  /**
   * Remove expired items from the cache
   */
  private removeExpiredItems(): void {
    const now = Date.now();
    // Use forEach to avoid TypeScript iterator issues
    this.cache.forEach((item, key) => {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    });
  }
  
  /**
   * Remove the oldest item from the cache
   */
  private removeOldestItem(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;
    
    // Use forEach to avoid TypeScript iterator issues
    this.cache.forEach((item, key) => {
      if (item.expiry < oldestTime) {
        oldestKey = key;
        oldestTime = item.expiry;
      }
    });
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }
}

// Create a singleton instance
const memoryCache = new MemoryCache({
  ttl: 5 * 60 * 1000, // 5 minutes
  maxItems: 1000
});

/**
 * Get data from cache or fetch it using the provided function
 * @param key Cache key
 * @param fetchFn Function to fetch data if not in cache
 * @param ttl Optional custom TTL in milliseconds
 */
export async function getCachedData<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl?: number
): Promise<T> {
  try {
    // Try to get data from cache first
    const cachedData = memoryCache.get<T>(key);
    
    if (cachedData !== undefined) {
      console.log(`[Cache] Cache hit for key: ${key}`);
      return cachedData;
    }
    
    // If not in cache, fetch the data
    console.log(`[Cache] Cache miss for key: ${key}, fetching data...`);
    const freshData = await fetchFn();
    
    // Store in cache for future use
    if (freshData !== undefined && freshData !== null) {
      memoryCache.set(key, freshData, ttl);
      console.log(`[Cache] Data stored in cache for key: ${key}`);
    }
    
    return freshData;
  } catch (error) {
    console.error(`[Cache] Error getting/setting cached data for key: ${key}`, error);
    // If cache fails, just fetch the data directly
    return fetchFn();
  }
}

/**
 * Invalidate a specific cache entry
 * @param key Cache key to invalidate
 */
export function invalidateCache(key: string): void {
  try {
    memoryCache.delete(key);
    console.log(`[Cache] Invalidated cache for key: ${key}`);
  } catch (error) {
    console.error(`[Cache] Error invalidating cache for key: ${key}`, error);
  }
}

/**
 * Invalidate multiple cache entries based on a prefix
 * @param prefix Cache key prefix to match
 */
export function invalidateCacheByPrefix(prefix: string): void {
  try {
    const keys = memoryCache.keys();
    const matchingKeys = keys.filter(key => key.startsWith(prefix));
    
    for (const key of matchingKeys) {
      memoryCache.delete(key);
    }
    
    console.log(`[Cache] Invalidated ${matchingKeys.length} cache entries with prefix: ${prefix}`);
  } catch (error) {
    console.error(`[Cache] Error invalidating cache with prefix: ${prefix}`, error);
  }
}
