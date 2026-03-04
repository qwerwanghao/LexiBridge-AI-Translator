import { APIClient } from '@/background/engine/api';
import { CacheManager } from '@/background/engine/cache';
import { PromptBuilder } from '@/background/engine/prompt-builder';
import { TermMatcher } from '@/background/engine/term-matcher';
import type {
  APIConfig,
  BatchTranslateOptions,
  ChatCompletionResponse,
  TermTable,
  TranslateOptions,
  TranslateResult,
} from '@/background/types';
import { StorageManager } from '@/background/storage';

/**
 * TranslationEngine 统一整合术语匹配、缓存和 API 调用。
 */
export class TranslationEngine {
  private readonly apiClient: APIClient;

  readonly cacheManager: CacheManager;

  private readonly termMatcher: TermMatcher;

  private readonly promptBuilder: PromptBuilder;

  constructor(storageManager: StorageManager, apiConfig: APIConfig, termTables: TermTable[]) {
    this.apiClient = new APIClient(apiConfig);
    this.cacheManager = new CacheManager(storageManager);
    this.termMatcher = new TermMatcher(termTables);
    this.promptBuilder = new PromptBuilder();
  }

  async translate(options: TranslateOptions): Promise<TranslateResult> {
    const cacheKey = this.resolveCacheKey(options);
    const cached = await this.readFromCache(cacheKey, options.useCache);
    if (cached) {
      return cached;
    }

    const matchedTerms = this.termMatcher.match(options.text, { domain: options.domain });
    const systemPrompt = this.promptBuilder.build(options, matchedTerms);
    const completion = await this.apiClient.chatCompletion({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: options.text },
      ],
    });

    const result = this.buildTranslateResult(options.text, completion, matchedTerms);

    await this.cacheManager.set(cacheKey, result);
    return result;
  }

  async testConnection(): Promise<{ success: boolean; latency?: number; error?: string }> {
    return this.apiClient.testConnection();
  }

  async batchTranslate(options: BatchTranslateOptions): Promise<TranslateResult[]> {
    if (options.texts.length === 0) {
      return [];
    }

    const requestedConcurrency = options.concurrency ?? 5;
    const safeConcurrency = Math.max(1, Math.floor(requestedConcurrency));
    const concurrency = Math.min(safeConcurrency, options.texts.length);
    const queue = options.texts.map((text, index) => ({ text, index }));
    const results = new Array<TranslateResult>(options.texts.length);

    const workers = Array.from({ length: concurrency }).map(async () => {
      while (queue.length > 0) {
        const task = queue.shift();
        if (!task) {
          return;
        }

        results[task.index] = await this.translate({
          text: task.text,
          from: options.from,
          to: options.to,
          domain: options.domain,
          priority: options.priority,
          useCache: options.useCache,
        });
      }
    });

    await Promise.all(workers);
    return results;
  }

  private resolveCacheKey(options: TranslateOptions): string {
    if (options.cacheKey) {
      return options.cacheKey;
    }

    return this.cacheManager.buildCacheKey(
      `${options.text}:${options.from ?? 'auto'}:${options.to}:${options.domain ?? ''}`,
    );
  }

  private async readFromCache(
    cacheKey: string,
    useCache: boolean | undefined,
  ): Promise<TranslateResult | null> {
    if (useCache === false) {
      return null;
    }

    return this.cacheManager.get(cacheKey);
  }

  private buildTranslateResult(
    originalText: string,
    completion: ChatCompletionResponse,
    matchedTerms: TranslateResult['matchedTerms'],
  ): TranslateResult {
    const usage = completion.usage as Record<string, unknown>;
    return {
      originalText,
      translatedText: completion.choices[0]?.message?.content ?? '',
      matchedTerms,
      fromCache: false,
      timestamp: Date.now(),
      usage: {
        promptTokens: this.readUsage(usage, 'promptTokens', 'prompt_tokens'),
        completionTokens: this.readUsage(usage, 'completionTokens', 'completion_tokens'),
        totalTokens: this.readUsage(usage, 'totalTokens', 'total_tokens'),
      },
    };
  }

  private readUsage(usage: Record<string, unknown>, ...keys: string[]): number {
    for (const key of keys) {
      const value = usage[key];
      if (typeof value === 'number') {
        return value;
      }
    }
    return 0;
  }
}
