export type MessageType =
  | 'TRANSLATE'
  | 'TRANSLATE_BATCH'
  | 'GET_CONFIG'
  | 'UPDATE_CONFIG'
  | 'GET_TERM_TABLES'
  | 'ADD_TERM_TABLE'
  | 'DELETE_TERM_TABLE'
  | 'GET_CACHE_STATS'
  | 'CLEAR_CACHE'
  | 'TEST_API_CONNECTION';

export interface RuntimeMessage {
  type: MessageType | string;
  payload: unknown;
  id?: string;
  timestamp: number;
}

export interface RuntimeResponse {
  success: boolean;
  data?: unknown;
  error?: {
    code: string;
    message: string;
  };
  messageId?: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionParams {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
}

export interface ChatCompletionResponse {
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finishReason?: string;
    finish_reason?: string;
  }>;
  usage: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

export interface APIConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
  timeout?: number;
  maxRetries?: number;
}

export interface TranslateOptions {
  text: string;
  from?: string;
  to: string;
  domain?: string;
  priority?: 'low' | 'normal' | 'high';
  useCache?: boolean;
  cacheKey?: string;
}

export interface BatchTranslateOptions {
  texts: string[];
  from?: string;
  to: string;
  domain?: string;
  priority?: 'low' | 'normal' | 'high';
  useCache?: boolean;
  concurrency?: number;
}

export interface Term {
  source: string;
  target: string;
  type: 'exact' | 'prefix' | 'regex';
  priority: number;
  caseSensitive?: boolean;
}

export interface TermTable {
  id: string;
  name: string;
  terms: Term[];
  domainMappings?: Record<string, boolean>;
  createdAt: number;
  updatedAt: number;
}

export interface TermMatch {
  original: string;
  replacement: string;
  type: 'exact' | 'prefix' | 'regex';
  position: number;
  length: number;
}

export interface TranslateResult {
  originalText: string;
  translatedText: string;
  detectedLanguage?: string;
  matchedTerms: TermMatch[];
  fromCache: boolean;
  timestamp: number;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface CacheStats {
  size: number;
  maxSize: number;
  hitRate: number;
  totalRequests: number;
  totalHits: number;
}

export interface CacheOptions {
  maxSize?: number;
  maxAge?: number;
  storageArea?: 'local' | 'sync';
}

export interface TermMatcherOptions {
  enableBoundaryDetection?: boolean;
  maxMatches?: number;
  domain?: string;
}
