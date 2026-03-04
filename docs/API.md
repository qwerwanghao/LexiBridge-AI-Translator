# API 文档

## 概述

本项目是浏览器扩展，API 分为两层：

1. 扩展内部消息 API（Content Script ↔ Background）
2. 外部 OpenAI 兼容模型 API（`/v1/chat/completions`）

## 认证

- 内部消息：基于 `chrome.runtime.sendMessage`，无需额外认证
- 外部模型：`Authorization: Bearer <API_KEY>`

## 端点列表（内部消息）

### POST `TRANSLATE`

**描述**: 翻译单段文本。

**请求参数**:

| 参数 | 类型 | 必需 | 描述 |
|------|------|------|------|
| text | string | 是 | 待翻译文本 |
| to | string | 是 | 目标语言（如 `zh-CN`） |
| from | string | 否 | 源语言，默认自动检测 |
| domain | string | 否 | 当前域名（用于术语匹配） |
| useCache | boolean | 否 | 是否启用缓存（默认 `true`） |

**请求示例**:

```json
{
  "type": "TRANSLATE",
  "payload": {
    "text": "Service is running.",
    "to": "zh-CN",
    "domain": "github.com",
    "useCache": true
  },
  "timestamp": 1760000000000
}
```

**响应**:

```json
{
  "success": true,
  "data": {
    "originalText": "Service is running.",
    "translatedText": "服务正在运行。",
    "matchedTerms": [],
    "fromCache": false,
    "timestamp": 1760000000123
  }
}
```

**错误码**:

| 状态码 | 描述 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 500 | 后台翻译链路异常 |

---

### POST `TRANSLATE_BATCH`

**描述**: 批量翻译文本数组（字幕场景主要使用）。

**请求参数**:

| 参数 | 类型 | 必需 | 描述 |
|------|------|------|------|
| texts | string[] | 是 | 待翻译文本数组 |
| to | string | 是 | 目标语言 |
| domain | string | 否 | 场景域名 |
| useCache | boolean | 否 | 是否启用缓存 |

---

### 配置与存储相关消息

- `GET_CONFIG`
- `UPDATE_CONFIG`
- `GET_TERM_TABLES`
- `ADD_TERM_TABLE`
- `DELETE_TERM_TABLE`
- `GET_CACHE_STATS`
- `CLEAR_CACHE`
- `TEST_API_CONNECTION`

## 外部接口

### POST `/v1/chat/completions`

**描述**: 调用 OpenAI 兼容模型完成翻译。

**请求示例**:

```json
{
  "model": "gpt-4o-mini",
  "messages": [
    {
      "role": "system",
      "content": "You are a professional translator."
    },
    {
      "role": "user",
      "content": "Translate to Chinese: Service is running."
    }
  ],
  "temperature": 0.3,
  "max_tokens": 2000
}
```

**响应示例**:

```json
{
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "服务正在运行。"
      }
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

| 状态码 | 描述 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | API Key 无效 |
| 429 | 请求频率受限 |
| 500 | 服务端错误 |
| 503 | 服务不可用 |

## 兼容性说明

`baseUrl` 支持以下三种配置形式，系统会自动归一化：

- `https://host`
- `https://host/v1`
- `https://host/v1/chat/completions`
