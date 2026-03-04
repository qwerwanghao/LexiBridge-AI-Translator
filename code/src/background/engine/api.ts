import { APIError, TimeoutError } from '@/background/errors';
import type { APIConfig, ChatCompletionParams, ChatCompletionResponse } from '@/background/types';

const DEFAULT_TIMEOUT = 5000;
const DEFAULT_RETRIES = 2;
const DEFAULT_RESPONSE: ChatCompletionResponse = {
  choices: [{ message: { role: 'assistant', content: '' }, finishReason: 'stop' }],
  usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
};

/**
 * APIClient 封装 OpenAI 兼容 chat completions 调用。
 */
export class APIClient {
  private readonly config: APIConfig;
  private readonly endpoint: string;

  constructor(config: APIConfig) {
    this.config = config;
    this.endpoint = this.buildEndpoint(config.baseUrl);
  }

  async chatCompletion(params: ChatCompletionParams): Promise<ChatCompletionResponse> {
    const retries = this.config.maxRetries ?? DEFAULT_RETRIES;
    let currentTry = 0;

    while (true) {
      try {
        return await this.request(params);
      } catch (error) {
        if (error instanceof APIError && error.status < 500 && error.status !== 429) {
          throw error;
        }

        if (currentTry >= retries) {
          throw error;
        }

        currentTry += 1;
        await this.sleep(150 * 2 ** currentTry);
      }
    }
  }

  async testConnection(): Promise<{ success: boolean; latency?: number; error?: string }> {
    const startedAt = Date.now();
    try {
      await this.chatCompletion({
        messages: [{ role: 'user', content: 'ping' }],
        maxTokens: 8,
      });
      return { success: true, latency: Date.now() - startedAt };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  private async request(params: ChatCompletionParams): Promise<ChatCompletionResponse> {
    const controller = new AbortController();
    const timeoutMs = params.timeout ?? this.config.timeout ?? DEFAULT_TIMEOUT;
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: params.messages,
          temperature: params.temperature ?? 0.3,
          max_tokens: params.maxTokens ?? 2000,
        }),
        signal: controller.signal,
      });

      const responseData: unknown = await response.json();
      if (!response.ok) {
        throw new APIError(response.status, response.statusText, responseData);
      }

      return this.normalizeResponse(responseData);
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        throw new TimeoutError();
      }
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(0, 'Network Error', error);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private normalizeResponse(data: unknown): ChatCompletionResponse {
    if (!this.isRecord(data)) {
      return DEFAULT_RESPONSE;
    }

    const choices = Array.isArray(data.choices) ? data.choices : DEFAULT_RESPONSE.choices;
    const usage = this.normalizeUsage(data.usage);

    return {
      choices: choices as ChatCompletionResponse['choices'],
      usage,
    };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private buildEndpoint(baseUrl: string): string {
    try {
      const url = new URL(baseUrl);
      if (url.protocol !== 'https:') {
        throw new APIError(400, 'Invalid Base URL', 'Only https protocol is allowed');
      }
      return this.normalizeEndpoint(url);
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(400, 'Invalid Base URL', error);
    }
  }

  private normalizeUsage(usageValue: unknown): ChatCompletionResponse['usage'] {
    if (!this.isRecord(usageValue)) {
      return DEFAULT_RESPONSE.usage;
    }

    return {
      promptTokens: this.readUsageNumber(usageValue, 'prompt_tokens', 'promptTokens'),
      completionTokens: this.readUsageNumber(usageValue, 'completion_tokens', 'completionTokens'),
      totalTokens: this.readUsageNumber(usageValue, 'total_tokens', 'totalTokens'),
    };
  }

  private readUsageNumber(source: Record<string, unknown>, ...keys: string[]): number {
    for (const key of keys) {
      const value = source[key];
      if (typeof value === 'number') {
        return value;
      }
    }
    return 0;
  }

  private normalizeEndpoint(url: URL): string {
    const normalizedPath = url.pathname.replace(/\/+$/, '');
    url.pathname = this.resolveEndpointPath(normalizedPath);
    url.search = '';
    url.hash = '';
    return url.toString();
  }

  private resolveEndpointPath(pathname: string): string {
    if (pathname.endsWith('/v1/chat/completions')) {
      return pathname;
    }
    if (pathname.endsWith('/v1')) {
      return `${pathname}/chat/completions`;
    }
    if (!pathname || pathname === '/') {
      return '/v1/chat/completions';
    }
    return `${pathname}/v1/chat/completions`;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }
}
