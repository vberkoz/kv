// In-memory Lambda cache with TTL - v1.1
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<any>>();

export function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  
  return entry.data;
}

export function setCache<T>(key: string, data: T, ttlSeconds: number = 60): void {
  cache.set(key, {
    data,
    expiresAt: Date.now() + (ttlSeconds * 1000)
  });
}

export function clearCache(key?: string): void {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
}
