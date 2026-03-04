import { MessageDispatcher } from '@/background/dispatcher';
import { TranslationEngine } from '@/background/engine';
import { getConfig } from '@/background/storage/config';
import { setConfig } from '@/background/storage/config';
import { StorageManager } from '@/background/storage';
import { getTermTables, setTermTables } from '@/background/storage/terms';
import type { RuntimeMessage, TermTable } from '@/background/types';

const storageManager = new StorageManager();

const engine = new TranslationEngine(
  storageManager,
  {
    baseUrl: 'https://api.openai.com',
    apiKey: '',
    model: 'gpt-4o-mini',
  },
  [],
);

const dispatcher = new MessageDispatcher({
  TRANSLATE: async (payload) => {
    return engine.translate(payload as { text: string; to: string; domain?: string });
  },
  TRANSLATE_BATCH: async (payload) => {
    const input = payload as { texts: string[]; to: string; domain?: string; concurrency?: number };
    return engine.batchTranslate(input);
  },
  GET_CACHE_STATS: async () => engine.cacheManager.getStats(),
  GET_CONFIG: async () => getConfig(storageManager),
  UPDATE_CONFIG: async (payload) => {
    const config = (payload ?? {}) as Record<string, unknown>;
    await setConfig(storageManager, config);
    return { success: true };
  },
  GET_TERM_TABLES: async () => getTermTables(storageManager),
  ADD_TERM_TABLE: async (payload) => {
    const table = payload as Record<string, unknown>;
    const existing = await getTermTables(storageManager);
    const id =
      typeof table.id === 'string' && table.id.length > 0
        ? table.id
        : `table-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
    const now = Date.now();
    const domainMappings =
      table.domainMappings && typeof table.domainMappings === 'object'
        ? (table.domainMappings as Record<string, boolean>)
        : {};
    const next: TermTable[] = [
      ...existing,
      {
        id,
        name: typeof table.name === 'string' ? table.name : 'default',
        terms: Array.isArray(table.terms) ? table.terms : [],
        domainMappings,
        createdAt: typeof table.createdAt === 'number' ? table.createdAt : now,
        updatedAt: now,
      },
    ];
    await setTermTables(storageManager, next);
    return { id };
  },
  DELETE_TERM_TABLE: async (payload) => {
    const id = (payload as { id?: string })?.id;
    if (!id) {
      return { success: false };
    }
    const existing = await getTermTables(storageManager);
    await setTermTables(
      storageManager,
      existing.filter((table) => table.id !== id),
    );
    return { success: true };
  },
  TEST_API_CONNECTION: async () => engine.testConnection(),
  CLEAR_CACHE: async () => {
    await engine.cacheManager.clear();
    return { success: true };
  },
});

chrome.runtime.onMessage.addListener((message: RuntimeMessage, _sender, sendResponse) => {
  void dispatcher.dispatch(message).then(sendResponse);
  return true;
});
