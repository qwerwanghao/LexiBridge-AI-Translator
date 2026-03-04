import { MessageDispatcher } from '@/background/dispatcher';
import { TranslationEngine } from '@/background/engine';
import { getConfig } from '@/background/storage/config';
import { setConfig } from '@/background/storage/config';
import { StorageManager } from '@/background/storage';
import { getTermTables, setTermTables } from '@/background/storage/terms';
import type { APIConfig, RuntimeMessage, TermTable } from '@/background/types';

const storageManager = new StorageManager();
const DEFAULT_API_CONFIG: APIConfig = {
    baseUrl: 'https://api.openai.com',
    apiKey: '',
    model: 'gpt-4o-mini',
};

let engine = new TranslationEngine(storageManager, DEFAULT_API_CONFIG, []);

function resolveApiConfig(config: Record<string, unknown>): APIConfig {
    const candidate =
        config.api && typeof config.api === 'object'
            ? (config.api as Record<string, unknown>)
            : config;

    const baseUrl =
        typeof candidate.baseUrl === 'string' && candidate.baseUrl.trim().length > 0
            ? candidate.baseUrl.trim()
            : DEFAULT_API_CONFIG.baseUrl;
    const apiKey = typeof candidate.apiKey === 'string' ? candidate.apiKey.trim() : '';
    const model =
        typeof candidate.model === 'string' && candidate.model.trim().length > 0
            ? candidate.model.trim()
            : DEFAULT_API_CONFIG.model;

    return { baseUrl, apiKey, model };
}

async function reloadEngine(): Promise<void> {
    const rawConfig = await getConfig(storageManager);
    const termTables = await getTermTables(storageManager);
    const apiConfig = resolveApiConfig(rawConfig);
    engine = new TranslationEngine(storageManager, apiConfig, termTables);
}

void reloadEngine();

const dispatcher = new MessageDispatcher({
    TRANSLATE: async (payload) => {
        return engine.translate(payload as { text: string; to: string; domain?: string });
    },
    TRANSLATE_BATCH: async (payload) => {
        const input = payload as {
            texts: string[];
            to: string;
            domain?: string;
            concurrency?: number;
        };
        return engine.batchTranslate(input);
    },
    GET_CACHE_STATS: async () => engine.cacheManager.getStats(),
    GET_CONFIG: async () => getConfig(storageManager),
    UPDATE_CONFIG: async (payload) => {
        const config = (payload ?? {}) as Record<string, unknown>;
        await setConfig(storageManager, config);
        await reloadEngine();
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
        await reloadEngine();
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
        await reloadEngine();
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
