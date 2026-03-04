# 部署指南

## 环境要求

- Node.js 20+
- npm 10+
- Chrome 122+ 或 Edge 122+

## 部署步骤

1. 安装依赖并构建：

```bash
cd code
npm install
npm run build
```

2. 加载扩展：

- Chrome：`chrome://extensions`
- Edge：`edge://extensions`

开启开发者模式后，点击“加载已解压扩展程序”，选择 `code/dist`。

3. 首次配置：

- 打开扩展 Options 页
- 填写 `Base URL`、`API Key`、`Model`
- 点击保存并执行连接测试

## 配置说明

运行时不依赖 `.env`，核心配置写入 `chrome.storage.local`：

- `api.baseUrl`
- `api.apiKey`
- `api.model`
- `translation.defaultTargetLang`

## 验证部署

1. 打开任意网页执行划词翻译，确认悬浮卡片出现译文
2. 打开 YouTube 视频并启用字幕，确认双语字幕层出现
3. 在 Options 页执行 API 连接测试并返回成功
