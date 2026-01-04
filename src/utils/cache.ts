export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface CacheConfig {
  maxSize?: number;
  defaultTTL?: number;
}

class CacheManager {
  private cache: Map<string, CacheEntry<unknown>>;
  private maxSize: number;
  private defaultTTL: number;
  private accessOrder: string[] = [];

  constructor(config?: CacheConfig) {
    this.cache = new Map();
    this.maxSize = config?.maxSize ?? 50;
    this.defaultTTL = config?.defaultTTL ?? 5 * 60 * 1000; // 5 minutes
  }

  set<T>(key: string, data: T, ttl?: number): void {
    if (this.cache.has(key)) {
      this.accessOrder = this.accessOrder.filter((k) => k !== key);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl ?? this.defaultTTL,
    });

    this.accessOrder.push(key);

    if (this.cache.size > this.maxSize && this.accessOrder.length > 0) {
      const lruKey = this.accessOrder.shift();
      if (lruKey) {
        this.cache.delete(lruKey);
      }
    }
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.accessOrder = this.accessOrder.filter((k) => k !== key);
      return null;
    }

    this.accessOrder = this.accessOrder.filter((k) => k !== key);
    this.accessOrder.push(key);

    return entry.data as T;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.accessOrder = this.accessOrder.filter((k) => k !== key);
      return false;
    }

    return true;
  }

  delete(key: string): void {
    this.cache.delete(key);
    this.accessOrder = this.accessOrder.filter((k) => k !== key);
  }

  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
  }

  size(): number {
    return this.cache.size;
  }

  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  setTTL(key: string, ttl: number): void {
    const entry = this.cache.get(key);
    if (entry) {
      entry.ttl = ttl;
    }
  }
}

export const cacheManager = new CacheManager({
  maxSize: 100,
  defaultTTL: 5 * 60 * 1000,
});
