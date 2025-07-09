/**
 * Cache interface to allow different cache implementations
 */
export interface CacheProvider {
  get(key: string): Promise<any | null>;
  set(key: string, value: any, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<void>;
}

/**
 * Simple in-memory cache implementation
 * Not persistent, clears on process exit
 */
export class InMemoryCache implements CacheProvider {
  private cache = new Map<string, { value: any; expiry: number }>();

  async get(key: string): Promise<any | null> {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (entry.expiry < Date.now()) {
      this.cache.delete(key);
      return null;
    }
    return entry.value;
  }

  async set(key: string, value: any, ttlSeconds = 300): Promise<void> {
    const expiry = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, { value, expiry });
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }
}
