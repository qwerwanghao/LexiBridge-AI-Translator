# 架构设计文档

> 生成时间: 2026-03-04T13:15:00+08:00
> 架构师: AI Agent

## 1. 系统架构

### 1.1 架构图

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Chrome Extension Runtime                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │                    Content Scripts Layer                   │     │
│  ├────────────────────────────────────────────────────────────┤     │
│  │                                                              │     │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │     │
│  │  │ Selection    │  │   Page       │  │     PDF      │      │     │
│  │  │ Translator   │  │ Translator   │  │ Translator   │      │     │
│  │  │              │  │              │  │              │      │     │
│  │  │ - 选区捕获   │  │ - 分段翻译   │  │ - 文本提取   │      │     │
│  │  │ - 悬浮卡片   │  │ - DOM注入    │  │ - 清洗规则   │      │     │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │     │
│  │         │                  │                  │              │     │
│  │  ┌──────▼───────┐  ┌──────▼───────┐  ┌──────▼───────┐      │     │
│  │  │   YouTube    │  │    Shared    │  │   Future     │      │     │
│  │  │ Translator   │  │   Modules    │  │  Scenarios   │      │     │
│  │  │              │  │              │  │              │      │     │
│  │  │ - 字幕提取   │  │ - UI组件     │  │ - Netflix?   │      │     │
│  │  │ - 实时翻译   │  │ - 工具函数   │  │ - Bilibili?  │      │     │
│  │  └──────┬───────┘  └──────┬───────┘  └──────────────┘      │     │
│  │         │                  │                                │     │
│  └─────────┼──────────────────┼────────────────────────────────┘     │
│            │                  │                                      │
│            │ chrome.runtime.sendMessage()                           │
│            └──────────────────┼──────────────────────────────────┐   │
│                               │                                  │   │
│  ┌────────────────────────────▼──────────────────────────────────▼──┐│
│  │                  Service Worker (Background)                    ││
│  ├─────────────────────────────────────────────────────────────────┤│
│  │                                                                   ││
│  │  ┌─────────────────────────────────────────────────────────┐    ││
│  │  │              Message Dispatcher (消息路由)              │    ││
│  │  │                                                         │    ││
│  │  │  - 验证消息格式                                          │    ││
│  │  │  - 路由到对应的处理器                                    │    ││
│  │  │  - 处理错误和超时                                        │    ││
│  │  └────────────────────┬────────────────────────────────────┘    ││
│  │                       │                                          ││
│  │  ┌────────────────────▼────────────────────────────────────┐    ││
│  │  │            Translation Engine (翻译引擎)                │    ││
│  │  │                                                         │    ││
│  │  │  ┌──────────────────┐  ┌──────────────────────────┐     │    ││
│  │  │  │  API Client      │  │  Term Matcher            │     │    ││
│  │  │  │                  │  │                          │     │    ││
│  │  │  │ - OpenAI 调用    │  │ - 精确匹配               │     │    ││
│  │  │  │ - 兼容 API 支持  │  │ - 正则匹配               │     │    ││
│  │  │  │ - 错误重试       │  │ - 优先级合并             │     │    ││
│  │  │  │ - 超时控制       │  │ - 边界检测               │     │    ││
│  │  │  └──────────────────┘  └──────────────────────────┘     │    ││
│  │  │                                                         │    ││
│  │  │  ┌──────────────────┐  ┌──────────────────────────┐     │    ││
│  │  │  │  Cache Manager   │  │  Prompt Builder          │     │    ││
│  │  │  │                  │  │                          │     │    ││
│  │  │  │ - 翻译记忆库     │  │ - System Prompt 构建     │     │    ││
│  │  │  │ - LRU 淘汰       │  │ - 术语注入               │     │    ││
│  │  │  │ - 容量控制       │  │ - 上下文窗口             │     │    ││
│  │  │  └──────────────────┘  └──────────────────────────┘     │    ││
│  │  └────────────────────┬────────────────────────────────────┘    ││
│  │                       │                                          ││
│  │  ┌────────────────────▼────────────────────────────────────┐    ││
│  │  │              Storage Manager (存储管理器)               │    ││
│  │  │                                                         │    ││
│  │  │  ┌──────────────────┐  ┌──────────────────────────┐     │    ││
│  │  │  │  Config Store    │  │  Term Table Store        │     │    ││
│  │  │  │                  │  │                          │     │    ││
│  │  │  │ - API 配置       │  │ - 术语表 CRUD             │     │    ││
│  │  │  │ - 用户偏好       │  │ - 域名映射               │     │    ││
│  │  │  │ - 快捷键设置     │  │ - 导入导出               │     │    ││
│  │  │  └──────────────────┘  └──────────────────────────┘     │    ││
│  │  └────────────────────┬────────────────────────────────────┘    ││
│  └───────────────────────┼────────────────────────────────────────┘│
│                            │                                         │
│  ┌─────────────────────────▼───────────────────────────────────┐   │
│  │                   Options Page (React)                      │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │                                                             │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │   │
│  │  │   Config     │  │   Term       │  │  Statistics  │     │   │
│  │  │   Panel      │  │   Editor     │  │  Dashboard   │     │   │
│  │  │              │  │              │  │              │     │   │
│  │  │ - API 配置   │  │ - 术语编辑   │  │ - 使用量     │     │   │
│  │  │ - 模型选择   │  │ - 批量导入   │  │ - 成本估算   │     │   │
│  │  │ - 提示词设置 │  │ - 域名映射   │  │ - 缓存命中率 │     │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘     │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
                    ┌─────────────────────┐
                    │   External APIs     │
                    ├─────────────────────┤
                    │                     │
                    │  ┌─────────────┐    │
                    │  │   OpenAI    │    │
                    │  │   API       │    │
                    │  └─────────────┘    │
                    │  ┌─────────────┐    │
                    │  │ Anthropic   │    │
                    │  │   API       │    │
                    │  └─────────────┘    │
                    │  ┌─────────────┐    │
                    │  │ 其他兼容     │    │
                    │  │ OpenAI 协议  │    │
                    │  └─────────────┘    │
                    └─────────────────────┘
```

### 1.2 架构模式

采用 **消息驱动架构 (Message-Driven Architecture)** + **分层架构 (Layered Architecture)** 混合模式。

**选择理由**:
1. **Chrome Extension 限制**：Content Script 和 Background 隔离，只能通过消息通信
2. **模块解耦**：各场景独立实现，共享翻译引擎，易于扩展新场景
3. **可测试性**：核心逻辑集中在 Service Worker，可独立单元测试
4. **可维护性**：清晰的分层结构，职责分明

### 1.3 层次结构

| 层级 | 职责 | 技术选型 | 通信方式 |
|------|------|----------|----------|
| **Presentation Layer** | 用户交互，UI 渲染 | React 18 (Options), 原生 DOM (Content) | chrome.runtime.sendMessage |
| **Application Layer** | 消息路由，业务编排 | TypeScript (Service Worker) | - |
| **Domain Layer** | 翻译引擎，术语匹配 | TypeScript (纯逻辑) | - |
| **Infrastructure Layer** | 存储封装，API 调用 | chrome.storage, Fetch API | - |

## 2. 模块设计

### 2.1 模块清单

| 模块名 | 职责 | 依赖 | 接口 |
|--------|------|------|------|
| **Message Dispatcher** | 路由 Content Script 消息到处理器 | - | `dispatch(message): Promise<Response>` |
| **Translation Engine** | 执行翻译，术语匹配，缓存管理 | API Client, Term Matcher, Cache Manager | `translate(text, options): Promise<Result>` |
| **API Client** | 调用 OpenAI 兼容 API | - | `chatCompletion(params): Promise<Completion>` |
| **Term Matcher** | 术语匹配和替换 | - | `matchTerms(text, termTable): Match[]` |
| **Cache Manager** | 翻译记忆库管理 | Storage Manager | `get(key), set(key, value), clear()` |
| **Storage Manager** | chrome.storage 封装 | - | `get(key), set(key, value), onChanged` |
| **Prompt Builder** | 构建 System Prompt | Term Matcher | `build(options): string` |
| **Selection Translator** | 划词翻译 Content Script | Shared UI | `init(), showPopup(text, position)` |
| **Page Translator** | 整页翻译 Content Script | Shared UI | `translatePage()` |
| **PDF Translator** | PDF 翻译 Content Script | Shared UI | `init(), handleSelection()` |
| **YouTube Translator** | 字幕翻译 Content Script | Shared UI | `init(), translateSubtitles()` |
| **Options Page** | 设置页 React 应用 | - | (React 组件) |

### 2.2 核心模块详解

#### 模块: Translation Engine

**职责**:
- 统一的翻译接口
- 整合 API 调用、术语匹配、缓存
- 处理翻译失败和重试

**接口**:
```typescript
interface TranslateOptions {
  text: string;
  from?: string;           // 源语言（自动检测）
  to: string;              // 目标语言
  domain?: string;         // 当前域名（用于术语表选择）
  priority?: 'low' | 'normal' | 'high';
  useCache?: boolean;
}

interface TranslateResult {
  originalText: string;
  translatedText: string;
  detectedLanguage?: string;
  matchedTerms: TermMatch[];
  fromCache: boolean;
  timestamp: number;
}

class TranslationEngine {
  async translate(options: TranslateOptions): Promise<TranslateResult>;
  async batchTranslate(options: TranslateOptions[]): Promise<TranslateResult[]>;
}
```

**依赖**:
- 内部: API Client, Term Matcher, Cache Manager, Storage Manager
- 外部: OpenAI Compatible API

**数据结构**:
```typescript
interface TermMatch {
  original: string;        // 原术语
  replacement: string;     // 译文
  type: 'exact' | 'prefix' | 'regex';
  position: number;        // 在文本中的位置
}

interface CacheEntry {
  key: string;             // hash(sourceText + options)
  value: TranslateResult;
  createdAt: number;
  accessCount: number;
}
```

#### 模块: API Client

**职责**:
- 封装 OpenAI Chat Completions API
- 支持自定义 Base URL（兼容供应商）
- 错误处理和重试逻辑
- 超时控制

**接口**:
```typescript
interface APIConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
  timeout?: number;
  maxRetries?: number;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatCompletionParams {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
}

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

class APIClient {
  constructor(config: APIConfig);
  async chatCompletion(params: ChatCompletionParams): Promise<ChatCompletionResponse>;
  async testConnection(): Promise<boolean>;
}
```

**依赖**:
- 外部: Fetch API

**错误处理**:
- 网络错误: 重试 3 次，指数退避
- API 错误 (4xx/5xx): 解析错误信息，返回友好提示
- 超时: 返回超时错误，建议用户重试或切换模型

#### 模块: Term Matcher

**职责**:
- 术语表匹配（精确、前缀、正则）
- 优先级合并（域名级 > 全局）
- 术语边界检测

**接口**:
```typescript
interface Term {
  source: string;          // 原术语
  target: string;          // 译文
  type: 'exact' | 'prefix' | 'regex';
  priority: number;        // 优先级（数字越大越优先）
  caseSensitive?: boolean;
}

interface TermTable {
  id: string;
  name: string;
  terms: Term[];
  domainMappings?: Record<string, boolean>;  // 域名 -> 是否启用
}

interface TermMatcherOptions {
  enableBoundaryDetection?: boolean;  // 术语边界检测
  maxMatches?: number;
}

class TermMatcher {
  constructor(termTables: TermTable[]);
  match(text: string, options?: TermMatcherOptions): TermMatch[];
  addTermTable(table: TermTable): void;
  removeTermTable(id: string): void;
}
```

**依赖**:
- 无（纯逻辑模块）

**匹配规则**:
1. **精确匹配**: `service` → `服务器`
2. **前缀匹配**: `Service` (开头大写) → `服务`
3. **正则匹配**: `/\w+Service/` → `XXX服务`
4. **优先级**: 域名级术语 > 全局术语，精确匹配 > 前缀匹配 > 正则匹配

#### 模块: Cache Manager

**职责**:
- 翻译记忆库管理
- LRU 淘汰策略
- 容量控制

**接口**:
```typescript
interface CacheOptions {
  maxSize?: number;        // 最大缓存条目数（默认 1000）
  maxAge?: number;         // 最大缓存时间（默认 7 天，毫秒）
  storageArea?: 'local' | 'sync';
}

interface CacheStats {
  size: number;
  hitRate: number;
  totalRequests: number;
  totalHits: number;
}

class CacheManager {
  constructor(options: CacheOptions);
  async get(key: string): Promise<TranslateResult | null>;
  async set(key: string, value: TranslateResult): Promise<void>;
  async clear(): Promise<void>;
  async getStats(): Promise<CacheStats>;
  private evictIfNeeded(): Promise<void>;  // LRU 淘汰
}
```

**依赖**:
- 内部: Storage Manager

**缓存键设计**:
```
hash = md5(text + from + to + domain + systemPrompt)
```

#### 模块: Content Script (Selection Translator)

**职责**:
- 监听文本选择事件
- 显示/隐藏悬浮卡片
- 与 Background 通信

**接口**:
```typescript
class SelectionTranslator {
  init(): void;                              // 初始化
  destroy(): void;                           // 清理
  showPopup(text: string, position: {x, y}): void;
  hidePopup(): void;
}
```

**依赖**:
- Shared UI (悬浮卡片组件)

**交互流程**:
1. 用户选中文本 → `document.getSelection()`
2. 计算 Popup 位置（避免超出视口）
3. 发送消息到 Background 请求翻译
4. 收到结果 → 渲染 Popup
5. 用户点击关闭/点击外部 → 隐藏 Popup

## 3. 数据设计

### 3.1 数据模型

```
┌─────────────────────────────────────────────────────────────────┐
│                        Chrome Storage                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  config (用户配置)                                      │     │
│  │  {                                                      │     │
│  │    api: {                                              │     │
│  │      baseUrl: string,                                  │     │
│  │      apiKey: string (encrypted),                       │     │
│  │      model: string,                                    │     │
│  │      timeout: number                                   │     │
│  │    },                                                  │     │
│  │    translation: {                                      │     │
│  │      defaultTargetLang: string,                        │     │
│  │      autoTranslate: boolean,                           │     │
│  │      systemPrompt: string                              │     │
│  │    },                                                  │     │
│  │    ui: {                                               │     │
│  │      theme: 'light' | 'dark',                          │     │
│  │      popupPosition: 'auto' | 'top-left' | ...,         │     │
│  │      fontSize: number                                  │     │
│  │    },                                                  │     │
│  │    keyboard: {                                         │     │
│  │      toggleTranslation: string,                        │     │
│  │      translatePage: string                             │     │
│  │    }                                                   │     │
│  │  }                                                      │     │
│  └────────────────────────────────────────────────────────┘     │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  termTables (术语表)                                    │     │
│  │  [                                                      │     │
│  │    {                                                    │     │
│  │      id: string,                                       │     │
│  │      name: string,                                     │     │
│  │      terms: [                                          │     │
│  │        { source: "service", target: "服务器", ... }    │     │
│  │      ],                                                │     │
│  │      domainMappings: { "github.com": true, ... }       │     │
│  │    }                                                   │     │
│  │  ]                                                     │     │
│  └────────────────────────────────────────────────────────┘     │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  translationCache (翻译记忆库)                          │     │
│  │  {                                                      │     │
│  │    "hash1": {                                          │     │
│  │      originalText: string,                             │     │
│  │      translatedText: string,                           │     │
│  │      timestamp: number,                                │     │
│  │      accessCount: number                               │     │
│  │    },                                                  │     │
│  │    "hash2": { ... }                                    │     │
│  │  }                                                     │     │
│  └────────────────────────────────────────────────────────┘     │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  sitePreferences (站点级偏好)                            │     │
│  │  {                                                      │     │
│  │    "github.com": {                                     │     │
│  │      autoTranslate: false,                             │     │
│  │      termTableId: "tech-terms",                        │     │
│  │      targetLang: "zh-CN"                               │     │
│  │    }                                                   │     │
│  │  }                                                     │     │
│  └────────────────────────────────────────────────────────┘     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 数据存储

| 数据类型 | 存储方式 | 格式 | 容量限制 |
|----------|----------|------|----------|
| 用户配置 | chrome.storage.local | JSON | 5MB |
| 术语表 | chrome.storage.local | JSON 数组 | 50MB |
| 翻译缓存 | chrome.storage.local | JSON 对象 | 50MB |
| 站点偏好 | chrome.storage.sync | JSON 对象 | 100KB (sync) |

### 3.3 数据流

#### 划词翻译流程

```
用户选中文本
    │
    ▼
Selection Content Script
    │
    │ chrome.runtime.sendMessage({
    │   type: 'TRANSLATE',
    │   text: '...',
    │   domain: 'github.com'
    │ })
    ▼
Background Service Worker
    │
    ▼
Message Dispatcher
    │
    ▼
Translation Engine
    │
    ├─► Cache Manager.get(hash) ──► 命中? ──► 返回缓存结果
    │                           │
    │                           └─► 未命中
    │                               │
    ▼                               │
Prompt Builder (注入术语表)         │
    │                               │
    ▼                               │
API Client.chatCompletion() ◄───────┘
    │
    ▼
Term Matcher (后处理术语)
    │
    ▼
Cache Manager.set(hash, result)
    │
    ▼
返回结果到 Content Script
    │
    ▼
渲染悬浮卡片
```

#### YouTube 字幕翻译流程

```
YouTube 页面加载
    │
    ▼
YouTube Content Script 注入
    │
    ├─► 监听字幕容器 DOM 变化
    │   │
    │   ▼
    │   提取字幕文本
    │   │
    │   ▼
    └─► 批量调用 Translation Engine
        │
        ▼
    创建双语字幕层
        │
        ▼
    覆盖原字幕
```

## 4. 接口设计

### 4.1 内部接口 (Content Script ↔ Background)

| 接口 | 方法 | 参数 | 返回 |
|------|------|------|------|
| `TRANSLATE` | POST | `{ text, from, to, domain }` | `{ translatedText, matchedTerms, fromCache }` |
| `TRANSLATE_BATCH` | POST | `{ texts[], from, to, domain }` | `{ results[] }` |
| `GET_CONFIG` | GET | - | `{ config }` |
| `UPDATE_CONFIG` | POST | `{ config: Partial<Config> }` | `{ success }` |
| `GET_TERM_TABLES` | GET | - | `{ termTables[] }` |
| `ADD_TERM_TABLE` | POST | `{ termTable }` | `{ id }` |
| `DELETE_TERM_TABLE` | POST | `{ id }` | `{ success }` |
| `GET_CACHE_STATS` | GET | - | `{ stats }` |
| `CLEAR_CACHE` | POST | - | `{ success }` |
| `TEST_API_CONNECTION` | POST | - | `{ success, latency }` |

### 4.2 外部接口 (OpenAI Compatible API)

#### POST /chat/completions

**描述**: 调用 AI 模型进行翻译

**请求**:
```json
{
  "model": "gpt-4o-mini",
  "messages": [
    {
      "role": "system",
      "content": "You are a professional translator..."
    },
    {
      "role": "user",
      "content": "Translate the following text..."
    }
  ],
  "temperature": 0.3,
  "max_tokens": 2000
}
```

**响应**:
```json
{
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "翻译结果..."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 50,
    "completion_tokens": 30,
    "total_tokens": 80
  }
}
```

**错误码**:
| 状态码 | 含义 | 处理方式 |
|--------|------|----------|
| 200 | 成功 | 返回翻译结果 |
| 401 | API Key 无效 | 提示用户检查配置 |
| 429 | 速率限制 | 延迟重试 |
| 500 | 服务器错误 | 重试 3 次 |
| 503 | 服务不可用 | 提示用户切换模型 |

## 5. 安全设计

### 5.1 安全措施

- **API Key 加密存储**: 使用 `chrome.storage.local` + 简单混淆（Base64 + Salt）
- **HTTPS 强制**: 所有 API 调用强制使用 HTTPS
- **内容安全策略 (CSP)**: 在 manifest.json 中配置严格的 CSP
- **权限最小化**: 仅申请必要权限（`activeTab`, `storage`, `scripting`）
- **输入验证**: 所有用户输入进行验证和清洗
- **XSS 防护**: Content Script 中避免直接插入 HTML（使用 `textContent` 或 DOM API）

### 5.2 验证和授权

- **无账号系统**: 所有配置本地存储，无需用户登录
- **API Key 管理**: 用户自行管理 API Key，插件不存储到云端
- **隐私保护**: 翻译内容仅发送到用户配置的 API，不经过第三方服务器

## 6. 性能考虑

### 6.1 性能目标

- **划词翻译响应时间**: < 1200ms (P50), < 2000ms (P95)
- **YouTube 字幕翻译延迟**: < 1500ms (平均)
- **整页翻译吞吐量**: > 20 段/分钟
- **内存占用**: < 250MB (常规页面)
- **CPU 占用**: < 15% (前台页面)

### 6.2 优化策略

- **翻译缓存**: 优先使用本地缓存，减少 API 调用
- **批量请求**: 整页翻译时合并多个短句，减少请求次数
- **懒加载**: YouTube 字幕按需翻译（仅当前显示的字幕）
- **Web Worker**: 考虑将术语匹配移至 Web Worker（如果性能瓶颈）
- **LRU 淘汰**: 缓存容量控制，避免存储膨胀
- **请求去重**: 相同文本并发请求时，只调用一次 API

## 7. 可扩展性

### 7.1 扩展点

| 扩展点 | 实现方式 |
|--------|----------|
| **新增翻译场景** | 添加新的 Content Script，复用 Translation Engine |
| **新增 AI 供应商** | 在 APIClient 中添加适配器（如需特殊处理） |
| **新增术语源** | 在 TermMatcher 中添加新的匹配类型 |
| **自定义 UI 组件** | Shared UI 模块提供组件库 |
| **新存储后端** | 在 Storage Manager 中添加适配器 |

### 7.2 未来扩展方向

- **V2.0**: 图片 OCR 翻译（集成 Tesseract.js 或云 OCR API）
- **V2.1**: 更多视频平台（Bilibili, Netflix）
- **V2.2**: 团队词库云同步（自建服务或使用 Firebase）
- **V2.3**: 翻译质量反馈循环（用户点赞/点踩，优化 Prompt）
- **V2.4**: 翻译历史记录与搜索
- **V2.5**: 离线翻译模式（集成轻量级本地模型）

---

**架构状态**: 🟢 已完成
**下一步**: 技术决策记录 (memory/03-decisions.md)
