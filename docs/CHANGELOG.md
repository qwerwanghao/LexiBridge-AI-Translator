# 变更日志

## 0.1.0 - 2026-03-04

### 新增

- Chrome MV3 扩展基础架构（background/content/options）
- 划词翻译能力（选区捕获、悬浮卡片、快捷键）
- YouTube 字幕实时翻译与双语叠加
- OpenAI 兼容 API 配置与连接测试
- 术语表编辑、翻译缓存与统计面板

### 修复

- 修复 Base URL 含 `/v1` 时 endpoint 重复拼接问题
- 修复 ConfigPanel 测试中 `chrome` 全局依赖导致的顺序敏感问题

### 质量

- `lint`、`typecheck`、`test` 全部通过
- 覆盖率保持 `85.38%`

### 已知限制

- `src/content/page.ts` 与 `src/content/pdf.ts` 仍为占位实现
