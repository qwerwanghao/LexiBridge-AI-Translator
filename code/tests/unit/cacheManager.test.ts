import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CacheManager } from '@/background/engine/cache';
import type { TranslateResult } from '@/background/types';
import { StorageManager } from '@/background/storage';

const state = new Map<string, unknown>();

beforeEach(() => {
  state.clear();
  const storageLocal = {
    get: vi.fn((keys?: string | string[] | null) => {
      if (!keys) {
        return Promise.resolve(Object.fromEntries(state));
      }
      if (typeof keys === 'string') {
        return Promise.resolve({ [keys]: state.get(keys) });
      }
      return Promise.resolve(Object.fromEntries(keys.map((key) => [key, state.get(key)])));
    }),
    set: vi.fn((items: Record<string, unknown>) => {
      for (const [key, value] of Object.entries(items)) {
        state.set(key, value);
      }
      return Promise.resolve();
    }),
  };

  vi.stubGlobal('chrome', {
    storage: {
      local: storageLocal,
      onChanged: {
        addListener: vi.fn(),
        removeListener: vi.fn(),
      },
    },
  });
});

const buildResult = (text: string): TranslateResult => ({
  originalText: text,
  translatedText: `${text}-zh`,
  matchedTerms: [],
  fromCache: false,
  timestamp: Date.now(),
});

describe('CacheManager', () => {
  it('stores and reads cache entry', async () => {
    const manager = new CacheManager(new StorageManager(), { maxSize: 2, maxAge: 100000 });

    await manager.set('k1', buildResult('hello'));
    const entry = await manager.get('k1');

    expect(entry?.translatedText).toBe('hello-zh');
  });

  it('evicts old entries when max size reached', async () => {
    const manager = new CacheManager(new StorageManager(), { maxSize: 1, maxAge: 100000 });

    await manager.set('k1', buildResult('a'));
    await manager.set('k2', buildResult('b'));

    const k1 = await manager.get('k1');
    const k2 = await manager.get('k2');

    expect(k1).toBeNull();
    expect(k2?.translatedText).toBe('b-zh');
  });
});
