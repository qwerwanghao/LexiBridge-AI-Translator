# API 契约

> 生成时间: 2026-03-04T13:15:00+08:00

## 内部 API

### Message Dispatcher (Background)

#### `sendMessage(message)`

**描述**: Content Script 向 Background 发送消息的统一入口

**参数**:
```typescript
interface Message {
  type: MessageType;
  payload: unknown;
  id?: string;           // 消息 ID，用于追踪
  timestamp: number;
}

type MessageType =
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
```

**返回**: `Promise<Response>`
```typescript
interface Response {
  success: boolean;
  data?: unknown;
  error?: {
    code: string;
    message: string;
  };
  messageId?: string;
}
```

**异常**: 无（所有错误通过 `error` 字段返回）

**示例**:
```typescript
// Content Script
const response = await chrome.runtime.sendMessage({
  type: 'TRANSLATE',
  payload: {
    text: 'Hello, world!',
    to: 'zh-CN',
    domain: window.location.hostname,
  },
  id: generateId(),
  timestamp: Date.now(),
});

if (response.success) {
  console.log(response.data.translatedText);
} else {
  console.error(response.error.message);
}
```

---

### Translation Engine

#### `translate(options)`

**描述**: 翻译单个文本

**参数**:
```typescript
interface TranslateOptions {
  text: string;              // 待翻译文本
  from?: string;             // 源语言（可选，默认自动检测）
  to: string;                // 目标语言
  domain?: string;           // 当前域名（用于术语表选择）
  priority?: 'low' | 'normal' | 'high';  // 优先级
  useCache?: boolean;        // 是否使用缓存（默认 true）
}
```

**返回**: `Promise<TranslateResult>`
```typescript
interface TranslateResult {
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

interface TermMatch {
  original: string;
  replacement: string;
  type: 'exact' | 'prefix' | 'regex';
  position: number;
}
```

**异常**:
- `APIError`: API 调用失败（网络错误、API 错误、超时）
- `StorageError`: 存储操作失败

**示例**:
```typescript
const result = await translationEngine.translate({
  text: 'Service is running.',
  to: 'zh-CN',
  domain: 'github.com',
});

console.log(result.translatedText); // "服务正在运行。"
console.log(result.matchedTerms);
// [{ original: "Service", replacement: "服务", type: "prefix", position: 0 }]
```

---

#### `batchTranslate(options)`

**描述**: 批量翻译多个文本

**参数**:
```typescript
interface BatchTranslateOptions {
  texts: string[];
  from?: string;
  to: string;
  domain?: string;
  priority?: 'low' | 'normal' | 'high';
  useCache?: boolean;
  concurrency?: number;      // 并发请求数（默认 5）
}
```

**返回**: `Promise<TranslateResult[]>`

**异常**:
- `APIError`: 部分或全部 API 调用失败
- `StorageError`: 存储操作失败

**示例**:
```typescript
const results = await translationEngine.batchTranslate({
  texts: ['Hello', 'World', 'Service'],
  to: 'zh-CN',
  concurrency: 3,
});

results.forEach((result, index) => {
  console.log(`${results[index].originalText} → ${result.translatedText}`);
});
```

---

### API Client

#### `chatCompletion(params)`

**描述**: 调用 OpenAI Chat Completions API

**参数**:
```typescript
interface ChatCompletionParams {
  messages: ChatMessage[];
  temperature?: number;      // 默认 0.3
  maxTokens?: number;        // 默认 2000
  timeout?: number;          // 默认 5000ms
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}
```

**返回**: `Promise<ChatCompletionResponse>`
```typescript
interface ChatCompletionResponse {
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finishReason: string;
  }>;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}
```

**异常**:
- `APIError(status, statusText, data)`:
  - `status = 401`: API Key 无效
  - `status = 429`: 速率限制
  - `status >= 500`: 服务器错误
  - `status = 0`: 网络错误
- `TimeoutError`: 请求超时

**示例**:
```typescript
const response = await apiClient.chatCompletion({
  messages: [
    { role: 'system', content: 'You are a professional translator.' },
    { role: 'user', content: 'Translate "Hello" to Chinese.' },
  ],
  temperature: 0.3,
  maxTokens: 100,
});

console.log(response.choices[0].message.content); // "你好"
```

---

#### `testConnection()`

**描述**: 测试 API 连接

**参数**: 无

**返回**: `Promise<{ success: boolean; latency?: number; error?: string }>`

**异常**: 无

**示例**:
```typescript
const result = await apiClient.testConnection();
if (result.success) {
  console.log(`连接成功，延迟 ${result.latency}ms`);
} else {
  console.error(`连接失败：${result.error}`);
}
```

---

### Term Matcher

#### `match(text, options)`

**描述**: 匹配文本中的术语

**参数**:
```typescript
interface TermMatcherOptions {
  enableBoundaryDetection?: boolean;  // 术语边界检测（默认 true）
  maxMatches?: number;                // 最大匹配数（默认无限制）
  domain?: string;                    // 域名（用于选择术语表）
}
```

**返回**: `TermMatch[]`
```typescript
interface TermMatch {
  original: string;
  replacement: string;
  type: 'exact' | 'prefix' | 'regex';
  position: number;
  length: number;
}
```

**异常**: 无

**示例**:
```typescript
const matches = termMatcher.match('Service is running.', {
  domain: 'github.com',
});

console.log(matches);
// [
//   { original: "Service", replacement: "服务", type: "prefix", position: 0, length: 7 }
// ]
```

---

#### `addTermTable(table)`

**描述**: 添加术语表

**参数**:
```typescript
interface TermTable {
  id?: string;              // 可选，自动生成
  name: string;
  terms: Term[];
  domainMappings?: Record<string, boolean>;
}

interface Term {
  source: string;
  target: string;
  type: 'exact' | 'prefix' | 'regex';
  priority: number;         // 数字越大越优先
  caseSensitive?: boolean;
}
```

**返回**: `string` (术语表 ID)

**异常**: 无

**示例**:
```typescript
const tableId = termMatcher.addTermTable({
  name: '技术术语',
  terms: [
    { source: 'service', target: '服务器', type: 'exact', priority: 1 },
    { source: 'Service', target: '服务', type: 'prefix', priority: 2 },
  ],
  domainMappings: {
    'github.com': true,
  },
});
```

---

#### `removeTermTable(id)`

**描述**: 删除术语表

**参数**: `id: string`

**返回**: `void`

**异常**: 无

**示例**:
```typescript
termMatcher.removeTermTable('tech-terms');
```

---

### Cache Manager

#### `get(key)`

**描述**: 获取缓存

**参数**: `key: string` (MD5 hash)

**返回**: `Promise<TranslateResult | null>`

**异常**: `StorageError`

**示例**:
```typescript
const result = await cacheManager.get('abc123def456');
if (result) {
  console.log('缓存命中：', result.translatedText);
}
```

---

#### `set(key, value)`

**描述**: 设置缓存

**参数**:
```typescript
key: string;
value: TranslateResult;
```

**返回**: `Promise<void>`

**异常**: `StorageError`

**示例**:
```typescript
await cacheManager.set('abc123def456', {
  originalText: 'Hello',
  translatedText: '你好',
  matchedTerms: [],
  fromCache: false,
  timestamp: Date.now(),
});
```

---

#### `clear()`

**描述**: 清空缓存

**参数**: 无

**返回**: `Promise<void>`

**异常**: `StorageError`

**示例**:
```typescript
await cacheManager.clear();
console.log('缓存已清空');
```

---

#### `getStats()`

**描述**: 获取缓存统计

**参数**: 无

**返回**: `Promise<CacheStats>`
```typescript
interface CacheStats {
  size: number;             // 当前缓存条目数
  maxSize: number;          // 最大缓存条目数
  hitRate: number;          // 命中率 (0-1)
  totalRequests: number;
  totalHits: number;
}
```

**异常**: `StorageError`

**示例**:
```typescript
const stats = await cacheManager.getStats();
console.log(`缓存命中率：${(stats.hitRate * 100).toFixed(2)}%`);
```

---

### Storage Manager

#### `get(key)`

**描述**: 从 chrome.storage 读取数据

**参数**: `key: string | string[]`

**返回**: `Promise<Record<string, unknown>>`

**异常**: `StorageError`

**示例**:
```typescript
const config = await storageManager.get('config');
console.log(config.api.baseUrl);
```

---

#### `set(key, value)`

**描述**: 向 chrome.storage 写入数据

**参数**:
```typescript
key: string;
value: unknown;
```

**返回**: `Promise<void>`

**异常**: `StorageError`

**示例**:
```typescript
await storageManager.set('config.api.apiKey', 'sk-xxx');
```

---

#### `onChanged(callback)`

**描述**: 监听存储变化

**参数**:
```typescript
callback: (changes: Record<string, StorageChange>) => void;

interface StorageChange {
  oldValue?: unknown;
  newValue?: unknown;
}
```

**返回**: `() => void` (取消监听函数)

**异常**: 无

**示例**:
```typescript
const unsubscribe = storageManager.onChanged((changes) => {
  if (changes.config) {
    console.log('配置已更新');
  }
});

// 取消监听
unsubscribe();
```

---

## 外部 API

### OpenAI Chat Completions API

#### POST /v1/chat/completions

**描述**: 调用 AI 模型进行翻译

**请求头**:
```
Content-Type: application/json
Authorization: Bearer <API_KEY>
```

**请求体**:
```json
{
  "model": "gpt-4o-mini",
  "messages": [
    {
      "role": "system",
      "content": "You are a professional translator. Translate the following text to Chinese."
    },
    {
      "role": "user",
      "content": "Hello, world!"
    }
  ],
  "temperature": 0.3,
  "max_tokens": 2000
}
```

**响应**:
```json
{
  "id": "chatcmpl-xxx",
  "object": "chat.completion",
  "created": 1234567890,
  "model": "gpt-4o-mini",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "你好，世界！"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 30,
    "completion_tokens": 10,
    "total_tokens": 40
  }
}
```

**错误码**:
| 状态码 | 含义 | 处理方式 |
|--------|------|----------|
| 200 | 成功 | 返回翻译结果 |
| 400 | 请求参数错误 | 不重试，提示用户检查配置 |
| 401 | API Key 无效 | 不重试，提示用户检查 API Key |
| 429 | 速率限制 | 延迟重试（指数退避） |
| 500 | 服务器错误 | 重试 3 次 |
| 503 | 服务不可用 | 提示用户切换模型或稍后重试 |

**示例**:
```typescript
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  },
  body: JSON.stringify({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a professional translator.',
      },
      {
        role: 'user',
        content: `Translate to Chinese: ${text}`,
      },
    ],
    temperature: 0.3,
  }),
});

const data = await response.json();
if (response.ok) {
  return data.choices[0].message.content;
} else {
  throw new APIError(response.status, data.error?.message || 'Unknown error');
}
```

---

## 数据格式约定

### TranslateOptions

**描述**: 翻译选项

**Schema**:
```typescript
interface TranslateOptions {
  // 必需字段
  text: string;              // 待翻译文本
  to: string;                // 目标语言（ISO 639-1 代码，如 'zh-CN'）

  // 可选字段
  from?: string;             // 源语言（默认 'auto' 自动检测）
  domain?: string;           // 当前域名（用于术语表选择）
  priority?: 'low' | 'normal' | 'high';  // 优先级（默认 'normal'）
  useCache?: boolean;        // 是否使用缓存（默认 true）
}
```

**验证规则**:
- `text`: 非空字符串，长度 <= 5000 字符
- `to`: 有效的语言代码（支持的语言列表）
- `from`: 有效语言代码或 'auto'
- `priority`: 枚举值之一

---

### TranslateResult

**描述**: 翻译结果

**Schema**:
```typescript
interface TranslateResult {
  originalText: string;      // 原文
  translatedText: string;    // 译文
  detectedLanguage?: string; // 检测到的源语言
  matchedTerms: TermMatch[]; // 匹配的术语
  fromCache: boolean;        // 是否来自缓存
  timestamp: number;         // 翻译时间戳
  usage?: {                  // Token 使用量
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}
```

**验证规则**:
- `translatedText`: 非空字符串
- `timestamp`: 有效的时间戳

---

### TermTable

**描述**: 术语表

**Schema**:
```typescript
interface TermTable {
  id: string;                // 唯一标识
  name: string;              // 术语表名称
  terms: Term[];             // 术语列表
  domainMappings?: Record<string, boolean>;  // 域名映射
  createdAt: number;         // 创建时间
  updatedAt: number;         // 更新时间
}

interface Term {
  source: string;            // 原术语
  target: string;            // 译文
  type: 'exact' | 'prefix' | 'regex';  // 匹配类型
  priority: number;          // 优先级
  caseSensitive?: boolean;   // 是否区分大小写（默认 false）
}
```

**验证规则**:
- `id`: 唯一字符串
- `name`: 非空字符串
- `terms`: 非空数组，每个 `term` 必须有 `source` 和 `target`
- `priority`: 数字，越大越优先

---

### Config

**描述**: 用户配置

**Schema**:
```typescript
interface Config {
  api: {
    baseUrl: string;         // API Base URL
    apiKey: string;          // API Key（加密存储）
    model: string;           // 模型名称
    timeout: number;         // 超时时间（毫秒）
  };
  translation: {
    defaultTargetLang: string;  // 默认目标语言
    autoTranslate: boolean;     // 是否自动翻译
    systemPrompt: string;       // System Prompt
  };
  ui: {
    theme: 'light' | 'dark';    // 主题
    popupPosition: 'auto' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    fontSize: number;           // 字体大小
  };
  keyboard: {
    toggleTranslation: string;   // 切换翻译快捷键
    translatePage: string;       // 翻译整页快捷键
  };
}
```

**验证规则**:
- `api.baseUrl`: 有效的 HTTPS URL
- `api.apiKey`: 非空字符串
- `api.timeout`: 正整数，>= 1000
- `translation.defaultTargetLang`: 有效语言代码
- `ui.fontSize`: 正整数，10 <= size <= 24

---

**API 契约状态**: 🟢 已完成
**下一步**: 执行计划 (memory/06-progress.md)
