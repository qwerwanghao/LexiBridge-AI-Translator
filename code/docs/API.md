# API 文档（内部消息协议）

内容脚本与后台 Service Worker 通过 `chrome.runtime.sendMessage` 通信。

## 消息类型

- `TRANSLATE`：翻译单段文本
- `TRANSLATE_BATCH`：批量翻译文本数组
- `GET_CONFIG`：读取配置
- `UPDATE_CONFIG`：更新配置
- `GET_TERM_TABLES`：读取术语表
- `ADD_TERM_TABLE`：新增术语表
- `DELETE_TERM_TABLE`：删除术语表
- `GET_CACHE_STATS`：读取缓存统计
- `CLEAR_CACHE`：清空缓存
- `TEST_API_CONNECTION`：测试 API 连接

## 消息结构

```ts
interface RuntimeMessage {
  type: string;
  payload: unknown;
  id?: string;
  timestamp: number;
}

interface RuntimeResponse {
  success: boolean;
  data?: unknown;
  error?: {
    code: string;
    message: string;
  };
  messageId?: string;
}
```

完整类型定义见：`src/background/types.ts`。
