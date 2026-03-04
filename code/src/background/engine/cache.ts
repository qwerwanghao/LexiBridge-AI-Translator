import type { CacheOptions, CacheStats, TranslateResult } from '@/background/types';
import { StorageManager } from '@/background/storage';

const CACHE_STORAGE_KEY = 'translationCache';
const CACHE_META_KEY = 'translationCacheMeta';
const DEFAULT_MAX_SIZE = 1000;
const DEFAULT_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

interface CacheRecord {
  value: TranslateResult;
  createdAt: number;
  lastAccessedAt: number;
}

interface CacheMeta {
  totalRequests: number;
  totalHits: number;
}

/**
 * CacheManager 管理翻译缓存并执行 LRU + TTL 淘汰。
 */
export class CacheManager {
  private readonly storage: StorageManager;

  private readonly maxSize: number;

  private readonly maxAge: number;

  constructor(storageManager: StorageManager, options: CacheOptions = {}) {
    this.storage = storageManager;
    this.maxSize = options.maxSize ?? DEFAULT_MAX_SIZE;
    this.maxAge = options.maxAge ?? DEFAULT_MAX_AGE;
  }

  async get(key: string): Promise<TranslateResult | null> {
    const cache = await this.readCache();
    const meta = await this.readMeta();
    meta.totalRequests += 1;

    const entry = cache[key];
    if (!entry) {
      await this.writeMeta(meta);
      return null;
    }

    const now = Date.now();
    if (now - entry.createdAt > this.maxAge) {
      delete cache[key];
      await Promise.all([this.writeCache(cache), this.writeMeta(meta)]);
      return null;
    }

    entry.lastAccessedAt = now;
    meta.totalHits += 1;
    await Promise.all([this.writeCache(cache), this.writeMeta(meta)]);

    return { ...entry.value, fromCache: true };
  }

  async set(key: string, value: TranslateResult): Promise<void> {
    const cache = await this.readCache();
    cache[key] = {
      value,
      createdAt: Date.now(),
      lastAccessedAt: Date.now(),
    };

    await this.evictIfNeeded(cache);
    await this.writeCache(cache);
  }

  async clear(): Promise<void> {
    await Promise.all([
      this.storage.set(CACHE_STORAGE_KEY, {}),
      this.storage.set(CACHE_META_KEY, { totalRequests: 0, totalHits: 0 }),
    ]);
  }

  async getStats(): Promise<CacheStats> {
    const cache = await this.readCache();
    const meta = await this.readMeta();
    const hitRate = meta.totalRequests > 0 ? meta.totalHits / meta.totalRequests : 0;

    return {
      size: Object.keys(cache).length,
      maxSize: this.maxSize,
      hitRate,
      totalRequests: meta.totalRequests,
      totalHits: meta.totalHits,
    };
  }

  buildCacheKey(input: string): string {
    return this.hashString(input);
  }

  private async evictIfNeeded(cache: Record<string, CacheRecord>): Promise<void> {
    const entries = Object.entries(cache);
    if (entries.length <= this.maxSize) {
      return;
    }

    entries.sort((left, right) => left[1].lastAccessedAt - right[1].lastAccessedAt);
    const removeCount = entries.length - this.maxSize;
    for (let i = 0; i < removeCount; i += 1) {
      delete cache[entries[i][0]];
    }
  }

  private async readCache(): Promise<Record<string, CacheRecord>> {
    const result = await this.storage.get(CACHE_STORAGE_KEY);
    return (result[CACHE_STORAGE_KEY] as Record<string, CacheRecord> | undefined) ?? {};
  }

  private async writeCache(cache: Record<string, CacheRecord>): Promise<void> {
    await this.storage.set(CACHE_STORAGE_KEY, cache);
  }

  private async readMeta(): Promise<CacheMeta> {
    const result = await this.storage.get(CACHE_META_KEY);
    return (
      (result[CACHE_META_KEY] as CacheMeta | undefined) ?? {
        totalRequests: 0,
        totalHits: 0,
      }
    );
  }

  private async writeMeta(meta: CacheMeta): Promise<void> {
    await this.storage.set(CACHE_META_KEY, meta);
  }

  private hashString(input: string): string {
    let hash = 5381;
    for (let index = 0; index < input.length; index += 1) {
      hash = (hash * 33) ^ input.charCodeAt(index);
    }
    return (hash >>> 0).toString(16);
  }
}
