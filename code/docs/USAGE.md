# 使用指南

## 1. 配置 API

1. 打开扩展 Options 页。
2. 填写 `Base URL`（必须 `https://`）、`API Key`、`Model`。
3. 点击 `Save` 保存到本地 `chrome.storage.local`。

## 2. 划词翻译

1. 在任意网页选中文本。
2. 等待悬浮卡片显示翻译结果。
3. 或使用快捷键（默认 `Alt+T`）触发翻译。

## 3. YouTube 双语字幕

1. 打开 YouTube 视频并启用字幕。
2. 插件会在底部显示原文 + 译文。
3. 字幕翻译使用分段批处理，并对已翻译片段做缓存复用。

## 4. 术语表管理

1. 在 `Term Editor` 输入 `Source` 与 `Target`。
2. 点击 `Add Term`。
3. 术语会保存到默认术语表（`default-terms`）。

## 当前实现边界

- `src/content/page.ts`（整页翻译）和 `src/content/pdf.ts`（PDF 翻译）当前仍是占位实现。
