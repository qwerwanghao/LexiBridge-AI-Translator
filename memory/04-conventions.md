# 代码约定

> 生成时间: 2026-03-04T13:15:00+08:00

## 命名约定

### 文件命名

| 类型 | 约定 | 示例 |
|------|------|------|
| 组件文件 | PascalCase | `ConfigPanel.tsx`, `TermEditor.tsx` |
| 工具文件 | camelCase | `storage.ts`, `api.ts`, `utils.ts` |
| 类型定义文件 | camelCase | `types.ts`, `interfaces.ts` |
| 常量文件 | camelCase | `constants.ts`, `config.ts` |
| 样式文件 | camelCase | `styles.css`, `global.css` |
| 测试文件 | camelCase + `.test.ts` | `api.test.ts`, `storage.test.ts` |

### 目录结构约定

```
src/
├── background/              # Service Worker（只能访问 chrome API）
│   ├── index.ts            # 入口
│   ├── dispatcher.ts       # 消息路由
│   ├── engine/             # 翻译引擎
│   │   ├── index.ts
│   │   ├── api.ts
│   │   ├── cache.ts
│   │   ├── term-matcher.ts
│   │   └── prompt-builder.ts
│   └── storage/            # 存储封装
│       ├── index.ts
│       ├── config.ts
│       └── terms.ts
│
├── content/                # Content Scripts（注入到页面）
│   ├── selection.ts        # 划词翻译
│   ├── page.ts             # 整页翻译
│   ├── pdf.ts              # PDF 翻译
│   ├── youtube.ts          # YouTube 字幕
│   └── shared/             # 共享工具
│       ├── ui/             # UI 组件（原生 JS）
│       │   ├── popup.ts
│       │   └── toast.ts
│       └── utils/          # 工具函数
│           ├── dom.ts
│           └── text.ts
│
├── options/                # Options 页（React 应用）
│   ├── index.html
│   ├── main.tsx            # React 入口
│   ├── App.tsx
│   ├── components/         # React 组件
│   │   ├── ConfigPanel/
│   │   │   ├── index.tsx
│   │   │   ├── ConfigPanel.tsx
│   │   │   └── ConfigPanel.module.css
│   │   ├── TermEditor/
│   │   └── Statistics/
│   ├── store/              # Zustand 状态
│   │   └── index.ts
│   ├── hooks/              # 自定义 Hooks
│   │   └── useTranslation.ts
│   └── styles/             # 全局样式
│       └── globals.css
│
├── popup/                  # 扩展弹窗（可选）
│   ├── index.html
│   └── index.ts
│
├── types/                  # TypeScript 类型定义
│   └── index.d.ts
│
├── manifest.json           # Chrome Extension Manifest
├── vite.config.ts
└── tailwind.config.js
```

### 代码命名

#### 变量命名

- **约定**: camelCase
- **示例**:
  - ✅ `const userConfig = {}`
  - ✅ `const translatedText = ''`
  - ❌ `const user_config = {}`
  - ❌ `const translatedtext = ''`

#### 常量命名

- **约定**: UPPER_SNAKE_CASE
- **示例**:
  - ✅ `const MAX_CACHE_SIZE = 1000`
  - ✅ `const DEFAULT_TIMEOUT = 5000`
  - ❌ `const maxSize = 1000`
  - ❌ `const defaultTimeout = 5000`

#### 函数命名

- **约定**: camelCase，动词开头
- **示例**:
  - ✅ `function translateText() {}`
  - ✅ `function getCacheKey() {}`
  - ✅ `async function fetchTranslation() {}`
  - ❌ `function textTranslation() {}`
  - ❌ `function cache_key() {}`

#### 类命名

- **约定**: PascalCase
- **示例**:
  - ✅ `class TranslationEngine {}`
  - ✅ `class APIClient {}`
  - ❌ `class translationEngine {}`
  - ❌ `class api_client {}`

#### 接口/类型命名

- **约定**: PascalCase，接口可选 `I` 前缀（不推荐）
- **示例**:
  - ✅ `interface TranslateOptions {}`
  - ✅ `type TermMatch = {}`
  - ⚠️ `interface ITranslateOptions {}`（不推荐）
  - ❌ `interface translateOptions {}`

#### 私有成员命名

- **约定**: camelCase，无下划线前缀（TypeScript private 访问修饰符）
- **示例**:
  - ✅ `private cacheKey = ''`
  - ✅ `private readonly maxSize = 1000`
  - ❌ `private _cacheKey = ''`（不推荐，除非必要）

#### 枚举命名

- **约定**: PascalCase（枚举类型），UPPER_SNAKE_CASE（枚举值）
- **示例**:
  - ✅ `enum TranslationType { SELECTION, PAGE, PDF, YOUTUBE }`
  - ❌ `enum translationType { selection, page, pdf, youtube }`

## 代码风格

### 格式化

- **缩进**: 2 空格（不使用 TAB）
- **引号**: 单引号（JSX 中双引号用于属性）
- **分号**: 必须使用
- **换行**: 100 字符限制（Prettier 默认）
- **尾随逗号**: 对象/数组末尾加逗号（Git diff 友好）
- **空行**: 函数间空 1 行，逻辑块间空 1 行

**示例**:
```typescript
// ✅ 正确
const config = {
  baseUrl: 'https://api.openai.com',
  apiKey: 'sk-xxx',
  model: 'gpt-4o-mini',
  timeout: 5000,
};

async function translate(text: string): Promise<string> {
  const result = await api.chatCompletion({
    messages: [{ role: 'user', content: text }],
  });

  return result.choices[0].message.content;
}
```

### 注释规范

#### 文件注释
- **规范**: 使用 JSDoc 风格，描述文件职责
- **示例**:
```typescript
/**
 * Translation Engine - 翻译引擎
 *
 * 负责统一处理所有翻译请求，整合 API 调用、术语匹配和缓存管理。
 */
```

#### 函数注释
- **规范**: 使用 JSDoc，描述功能、参数、返回值、异常
- **示例**:
```typescript
/**
 * 翻译单个文本
 *
 * @param options - 翻译选项
 * @param options.text - 待翻译文本
 * @param options.from - 源语言（可选，默认自动检测）
 * @param options.to - 目标语言
 * @returns 翻译结果
 * @throws {APIError} 当 API 调用失败时
 * @example
 * ```ts
 * const result = await translate({
 *   text: 'Hello, world!',
 *   to: 'zh-CN'
 * });
 * ```
 */
async function translate(options: TranslateOptions): Promise<TranslateResult> {
  // ...
}
```

#### 行内注释
- **规范**: 解释"为什么"，而非"是什么"
- **示例**:
```typescript
// ✅ 好的注释（解释为什么）
// 使用 LRU 淘汰策略，避免缓存无限增长
if (cache.size >= MAX_SIZE) {
  cache.delete(cache.keys().next().value);
}

// ❌ 差的注释（重复代码）
// 删除第一个键
if (cache.size >= MAX_SIZE) {
  cache.delete(cache.keys().next().value);
}
```

#### TODO 注释
- **规范**: `TODO:` + 作者 + 描述
- **示例**:
```typescript
// TODO(qwerwanghao): 实现 PDF OCR 支持
// TODO(qwerwanghao): 优化术语匹配性能
```

### 组织规范

#### 每个文件
- **约定**: 一个文件一个主要导出（类/函数/组件）
- **示例**:
  - ✅ `api.ts` 导出 `APIClient` 类
  - ✅ `utils.ts` 导出多个工具函数（相关的）
  - ❌ `index.ts` 导出 10 个不相关的类

#### 导入顺序
- **约定**: 分组导入，每组内按字母排序
1. TypeScript/Node 内置
2. 外部依赖（react, chrome）
3. 内部模块（@/...）
4. 类型导入（仅类型）
5. 样式文件

**示例**:
```typescript
// 1. TypeScript/Node 内置
import { type FC, useEffect, useState } from 'react';
import { chrome } from 'chrome';

// 2. 外部依赖
import { create } from 'zustand';
import { Button } from '@radix-ui/react-button';

// 3. 内部模块
import { useTranslationStore } from '@/store';
import { Button } from '@/components/ui/button';

// 4. 类型导入
import type { TranslateOptions } from '@/types';

// 5. 样式文件
import './ConfigPanel.module.css';
```

## 错误处理

### 错误类型

| 类型 | 处理方式 | 示例 |
|------|----------|------|
| **网络错误** | 重试 3 次，指数退避 | API 调用失败 |
| **API 错误 (4xx)** | 不重试，返回友好提示 | API Key 无效 |
| **API 错误 (5xx)** | 重试 3 次，失败后提示用户 | 服务器内部错误 |
| **超时错误** | 不重试，提示用户重试或切换模型 | API 响应 > 5s |
| **存储错误** | 降级到内存缓存，记录日志 | chrome.storage 失败 |
| **解析错误** | 返回默认值，记录日志 | JSON 解析失败 |

### 错误传播

**原则**: 在边界层处理错误，内部层抛出类型化错误

```typescript
// ✅ 正确：内部层抛出错误
class APIClient {
  async chatCompletion(params: ChatCompletionParams): Promise<ChatCompletionResponse> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new APIError(response.status, response.statusText);
    }

    return response.json();
  }
}

// ✅ 正确：边界层捕获并处理错误
async function translate(text: string): Promise<string> {
  try {
    const result = await apiClient.chatCompletion({ messages: [...] });
    return result.choices[0].message.content;
  } catch (error) {
    if (error instanceof APIError) {
      if (error.status === 401) {
        return 'Error: API Key 无效，请检查配置';
      }
      if (error.status >= 500) {
        // 重试逻辑
        return await this.retry(() => this.translate(text));
      }
    }
    throw error;
  }
}
```

**错误类型定义**:
```typescript
class APIError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: unknown
  ) {
    super(`API Error: ${status} ${statusText}`);
    this.name = 'APIError';
  }
}

class StorageError extends Error {
  constructor(message: string, public key?: string) {
    super(`Storage Error: ${message}`);
    this.name = 'StorageError';
  }
}
```

## 测试约定

### 测试文件组织

- **约定**: 与源文件同名，加 `.test.ts` 后缀
- **示例**:
  - `src/background/engine/api.ts` → `src/background/engine/api.test.ts`
  - `src/options/components/ConfigPanel.tsx` → `src/options/components/ConfigPanel.test.tsx`

### 测试命名

- **约定**: `describe('模块名', () => { it('应该做某事', () => {}) })`
- **示例**:
```typescript
describe('APIClient', () => {
  describe('chatCompletion', () => {
    it('应该成功返回翻译结果', async () => {
      // ...
    });

    it('应该在 API Key 无效时抛出 401 错误', async () => {
      // ...
    });

    it('应该在网络错误时重试 3 次', async () => {
      // ...
    });
  });
});
```

### 测试覆盖要求

- **最低覆盖率**: 70%
- **必须覆盖**:
  - 核心翻译逻辑（`TranslationEngine`, `APIClient`, `TermMatcher`）
  - 存储操作（`StorageManager`）
  - 错误处理路径
- **不需要覆盖**:
  - 简单的 React 组件（仅 UI）
  - 类型定义文件

**测试工具**:
```typescript
// Vitest + Testing Library
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock Chrome API
global.chrome = {
  storage: {
    local: {
      get: vi.fn(),
      set: vi.fn(),
    },
  },
} as unknown typeof chrome;
```

## Git 约定

### 分支命名

- **约定**: `<type>/<short-description>`
- **类型**:
  - `feat/` - 新功能
  - `fix/` - 问题修复
  - `refactor/` - 重构
  - `docs/` - 文档更新
  - `test/` - 测试相关
- **示例**:
  - ✅ `feat/selection-translation`
  - ✅ `fix/api-timeout`
  - ✅ `refactor/storage-layer`
  - ❌ `selection-translation`（缺少类型前缀）
  - ❌ `feature/add-selection-translation`（太冗长）

### 提交信息

- **格式**: Conventional Commits
- **类型**:
  - `feat:` - 新功能
  - `fix:` - 问题修复
  - `docs:` - 文档更新
  - `style:` - 代码风格（不影响功能）
  - `refactor:` - 重构
  - `perf:` - 性能优化
  - `test:` - 测试相关
  - `chore:` - 构建/工具相关

- **示例**:
```bash
✅ feat(selection): add selection translator content script
✅ fix(api): add timeout retry logic for API calls
✅ docs(readme): update installation instructions
✅ refactor(storage): extract storage manager to separate module
✅ test(translation): add unit tests for term matcher
❌ add selection translation
❌ fix bug
```

**提交信息模板**:
```
<type>(<scope>): <subject>

<body>

<footer>
```

**完整示例**:
```
feat(selection): add selection translator content script

- Implement text selection listener
- Add floating popup component
- Integrate with translation engine

Closes #123
```

### Pull Request 标题

- **约定**: 与提交信息相同格式
- **示例**:
  - ✅ `feat(selection): add selection translator`
  - ✅ `fix(api): handle API rate limit errors`
  - ❌ `Add selection translator`（缺少类型前缀）

## TypeScript 规范

### 类型定义

- **约定**: 优先使用 `interface`，需要联合类型时使用 `type`
- **示例**:
```typescript
// ✅ 对象类型使用 interface
interface TranslateOptions {
  text: string;
  from?: string;
  to: string;
}

// ✅ 联合类型使用 type
type TranslationType = 'selection' | 'page' | 'pdf' | 'youtube';

// ✅ 函数类型使用 type
type TranslateFunction = (options: TranslateOptions) => Promise<TranslateResult>;
```

### 严格模式

- **约定**: 启用 `strict: true`，禁止 `any`
- **示例**:
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}

// ❌ 避免 any
const data: any = await response.json();

// ✅ 使用 unknown 或具体类型
const data: unknown = await response.json();
if (isTranslationResult(data)) {
  return data;
}
```

### 类型守卫

- **约定**: 使用类型守卫验证运行时类型
- **示例**:
```typescript
// ✅ 定义类型守卫
function isTranslationResult(data: unknown): data is TranslateResult {
  return (
    typeof data === 'object' &&
    data !== null &&
    'translatedText' in data &&
    'originalText' in data
  );
}

// 使用
const result = await storage.get('cache');
if (isTranslationResult(result)) {
  console.log(result.translatedText);
}
```

## CSS 规范

### Tailwind CSS 约定

- **约定**: 优先使用 Tailwind 工具类，复杂组件使用 CSS Modules
- **示例**:
```tsx
// ✅ 简单布局使用 Tailwind
<div className="flex items-center gap-4 p-4">
  <Button>翻译</Button>
</div>

// ✅ 复杂组件使用 CSS Modules
<div className={styles.popupContainer}>
  <div className={styles.popupContent}>
    {/* ... */}
  </div>
</div>
```

### 样式命名（CSS Modules）

- **约定**: camelCase
- **示例**:
```css
/* ✅ 正确 */
.popupContainer { }
.popupContent { }
.closeButton { }

/* ❌ 错误 */
.popup-container { }
.popup_content { }
```

## 性能约定

### 代码分割

- **约定**: 按路由/功能动态导入
- **示例**:
```typescript
// ✅ Options 页按需加载
const ConfigPanel = lazy(() => import('@/components/ConfigPanel'));
const TermEditor = lazy(() => import('@/components/TermEditor'));

// Content Script 保持轻量
// 避免导入大型依赖
```

### 优化清单

- [ ] 避免不必要的重渲染（React.memo, useMemo, useCallback）
- [ ] 长列表虚拟化（如果需要）
- [ ] 图片懒加载（如果需要）
- [ ] 代码分割和动态导入
- [ ] 避免频繁的 chrome.storage 读写（批量操作）
- [ ] Content Script 最小化（< 50KB）

---

**约定状态**: 🟢 已完成
**下一步**: API 契约定义 (memory/05-api-contract.md)
