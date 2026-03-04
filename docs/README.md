# LexiBridge AI Translator

LexiBridge AI Translator 是一个基于 Chrome Extension Manifest V3 的 AI 翻译插件，聚焦技术内容阅读场景，核心能力包括划词翻译、YouTube 字幕双语翻译与可配置 OpenAI 兼容模型接入。

## 功能特性

- 网页划词翻译（悬浮卡片、快捷键触发、术语命中显示）
- YouTube 字幕实时双语翻译（批处理队列 + 本地缓存）
- OpenAI 兼容 API 配置（Base URL / API Key / Model）
- 术语表管理与翻译缓存统计

## 快速开始

### 环境要求

- Node.js 20+
- npm 10+
- Chrome 122+ 或 Edge 122+

### 安装

```bash
cd code
npm install
```

### 使用

```bash
cd code
npm run build
# 打开 chrome://extensions 或 edge://extensions
# 开启开发者模式后，加载已解压扩展：code/dist
```

## 文档

- [API文档](API.md)
- [使用指南](GUIDE.md)
- [开发指南](DEVELOPMENT.md)
- [部署指南](DEPLOYMENT.md)
- [变更日志](CHANGELOG.md)

## 开发

### 项目结构

```text
code/
├── src/
│   ├── background/         # Service Worker、翻译引擎、存储封装
│   ├── content/            # selection/youtube/page/pdf 内容脚本
│   ├── options/            # React 设置页
│   ├── popup/
│   └── manifest.json
├── tests/unit/             # 单元测试
├── docs/                   # 工程内文档（安装/使用/API）
├── package.json
└── vite.config.ts
```

### 运行测试

```bash
cd code
npm run lint
npm run typecheck
npm run test
npx vitest run --coverage
```

### 代码规范

参见 [开发指南](DEVELOPMENT.md)。

## 许可证

项目采用 MIT 许可证（仓库根目录 `LICENSE`）。
