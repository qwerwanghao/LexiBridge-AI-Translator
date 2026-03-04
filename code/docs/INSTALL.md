# 安装指南

## 环境要求

- Node.js 20+
- npm 10+
- Chrome 或 Edge（Chromium 内核，支持 Manifest V3）

## 安装依赖

```bash
npm install
```

## 本地开发构建

```bash
npm run build
```

构建产物在 `dist/` 目录。

## 浏览器加载扩展

1. 打开 `chrome://extensions`（Edge 为 `edge://extensions`）。
2. 打开 `Developer mode`（开发者模式）。
3. 点击 `Load unpacked`（加载已解压的扩展程序）。
4. 选择项目下的 `dist/` 目录。

## 常用质量命令

```bash
npm run lint
npm run typecheck
npm run test -- --coverage
```
