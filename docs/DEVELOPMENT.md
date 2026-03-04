# 开发指南

## 开发环境设置

1. 安装 Node.js 20+、npm 10+
2. 安装依赖：

```bash
cd code
npm install
```

3. 本地开发：

```bash
npm run dev
```

## 项目结构

- `src/background/`：消息分发、翻译引擎、存储封装
- `src/content/`：selection/youtube/page/pdf 内容脚本
- `src/options/`：React 设置页
- `tests/unit/`：Vitest 单元测试

## 开发流程

1. 在对应模块实现功能
2. 运行质量命令：`npm run lint && npm run typecheck && npm run test`
3. 打包后加载 `code/dist` 进行浏览器手动验证

## 提交规范

采用 Conventional Commits：

- `feat:` 新功能
- `fix:` 修复问题
- `docs:` 文档更新
- `refactor:` 重构
- `test:` 测试相关

## 测试

```bash
npm run test
npx vitest run --coverage
```

当前覆盖率基线：`85.38%`（2026-03-04 实测）。
