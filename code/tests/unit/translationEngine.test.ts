import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TranslationEngine } from '@/background/engine';
import type { APIConfig, TermTable } from '@/background/types';
import { StorageManager } from '@/background/storage';

const storageState = new Map<string, unknown>();

beforeEach(() => {
  vi.restoreAllMocks();
  storageState.clear();
  vi.stubGlobal('chrome', {
    storage: {
      local: {
        get: vi.fn(async (keys?: string | string[] | null) => {
          if (!keys) {
            return Object.fromEntries(storageState);
          }
          if (typeof keys === 'string') {
            return { [keys]: storageState.get(keys) };
          }
          return Object.fromEntries(keys.map((key) => [key, storageState.get(key)]));
        }),
        set: vi.fn(async (items: Record<string, unknown>) => {
          for (const [key, value] of Object.entries(items)) {
            storageState.set(key, value);
          }
        }),
        remove: vi.fn(async (key: string) => {
          storageState.delete(key);
        }),
      },
      onChanged: {
        addListener: vi.fn(),
        removeListener: vi.fn(),
      },
    },
  });
});

describe('TranslationEngine', () => {
  it('returns cached result when hit', async () => {
    const config: APIConfig = {
      baseUrl: 'https://api.openai.com',
      apiKey: 'k',
      model: 'gpt-4o-mini',
      maxRetries: 0,
      timeout: 500,
    };

    const engine = new TranslationEngine(new StorageManager(), config, []);
    await engine.cacheManager.set('manual-key', {
      originalText: 'hello',
      translatedText: '你好',
      matchedTerms: [],
      fromCache: false,
      timestamp: Date.now(),
    });

    const result = await engine.translate({ text: 'hello', to: 'zh-CN', cacheKey: 'manual-key' });
    expect(result.fromCache).toBe(true);
    expect(result.translatedText).toBe('你好');
  });

  it('translates using API when cache missed', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { role: 'assistant', content: '你好，世界' } }],
          usage: { prompt_tokens: 10, completion_tokens: 10, total_tokens: 20 },
        }),
      }),
    );

    const terms: TermTable[] = [
      {
        id: 't1',
        name: 'terms',
        terms: [{ source: 'world', target: '世界', type: 'exact', priority: 1 }],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ];

    const engine = new TranslationEngine(
      new StorageManager(),
      { baseUrl: 'https://api.openai.com', apiKey: 'k', model: 'gpt-4o-mini' },
      terms,
    );

    const result = await engine.translate({ text: 'hello world', to: 'zh-CN' });

    expect(result.translatedText).toBe('你好，世界');
    expect(result.matchedTerms.length).toBe(1);
  });

  it('keeps stable order for duplicate texts in batch translation', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { role: 'assistant', content: '统一译文' } }],
          usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
        }),
      }),
    );

    const engine = new TranslationEngine(
      new StorageManager(),
      { baseUrl: 'https://api.openai.com', apiKey: 'k', model: 'gpt-4o-mini' },
      [],
    );

    const results = await engine.batchTranslate({
      texts: ['dup', 'dup', 'unique'],
      to: 'zh-CN',
      concurrency: 0,
    });

    expect(results).toHaveLength(3);
    expect(results[0].originalText).toBe('dup');
    expect(results[1].originalText).toBe('dup');
    expect(results[2].originalText).toBe('unique');
  });

  it('returns empty array for empty batch input', async () => {
    const engine = new TranslationEngine(
      new StorageManager(),
      { baseUrl: 'https://api.openai.com', apiKey: 'k', model: 'gpt-4o-mini' },
      [],
    );

    const results = await engine.batchTranslate({ texts: [], to: 'zh-CN' });
    expect(results).toEqual([]);
  });
});
