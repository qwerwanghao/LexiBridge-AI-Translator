# 技术决策记录

> 重建时间: 2026-03-04T15:16:00+08:00
> 说明: 基于 `02-architecture.md`、`04-conventions.md`、`05-api-contract.md`、`06-progress.md` 重建。

## 决策总览

| ID | 决策 | 状态 | 时间 |
|---|---|---|---|
| D-001 | 采用 Chrome Extension Manifest V3 | 已确定 | 2026-03-04 |
| D-002 | 架构采用“消息驱动 + 分层架构” | 已确定 | 2026-03-04 |
| D-003 | 核心逻辑集中在 Background Service Worker | 已确定 | 2026-03-04 |
| D-004 | Content Script 保持轻量、按场景分模块 | 已确定 | 2026-03-04 |
| D-005 | 设置页使用 React + Zustand | 已确定 | 2026-03-04 |
| D-006 | 翻译 API 采用 OpenAI 兼容协议 | 已确定 | 2026-03-04 |
| D-007 | API Key 等配置存储在 chrome.storage | 已确定 | 2026-03-04 |
| D-008 | 翻译引擎采用 APIClient + TermMatcher + CacheManager | 已确定 | 2026-03-04 |
| D-009 | 翻译链路默认启用缓存与超时控制 | 已确定 | 2026-03-04 |
| D-010 | 术语匹配支持 exact/prefix/regex | 已确定 | 2026-03-04 |
| D-011 | 测试框架采用 Vitest（单元测试优先） | 已确定 | 2026-03-04 |
| D-012 | 代码规范采用 TypeScript strict + ESLint + Prettier | 已确定 | 2026-03-04 |
| D-013 | 构建工具采用 Vite（扩展工程） | 已确定 | 2026-03-04 |
| D-014 | 依赖管理当前使用 npm（非 pnpm） | 已确定（临时） | 2026-03-04 |
| D-015 | workflow 脚本内 memory 文件使用绝对路径 | 已确定 | 2026-03-04 |

## 详细决策

### D-001 Manifest V3
- 决策: 使用 MV3，Background 运行在 Service Worker。
- 理由: Chrome 上架与长期兼容要求；权限模型更清晰。
- 影响: 需要通过消息机制连接 Content Script 与后台逻辑。

### D-002 消息驱动 + 分层架构
- 决策: 采用消息驱动通信，结合 Presentation/Application/Domain/Infrastructure 分层。
- 理由: 扩展天然多上下文，分层可降低耦合与维护成本。
- 影响: Dispatcher 成为核心入口，需要统一消息协议。

### D-003 核心逻辑集中在 Background
- 决策: 翻译引擎、配置读写、缓存管理放在 Background。
- 理由: 便于复用、测试、权限控制；避免在页面侧散落业务逻辑。
- 影响: Content Script 主要负责采集文本和渲染 UI。

### D-004 Content Script 场景模块化
- 决策: 以 `selection/page/pdf/youtube` 分文件实现。
- 理由: 场景边界清晰，后续扩展 Netflix/Bilibili 风险更低。
- 影响: 各场景需共享统一消息契约与错误处理。

### D-005 设置页技术栈
- 决策: Options 页面采用 React + Zustand。
- 理由: 配置界面状态复杂，Zustand 较轻且上手快。
- 影响: 仅 Options 使用 React，避免把 Content Script 也变重。

### D-006 OpenAI 兼容 API 协议
- 决策: 对接 Chat Completions 兼容接口，支持自定义 Base URL/Model。
- 理由: 供应商可替换，避免锁定单一平台。
- 影响: APIClient 需处理 endpoint 归一化、超时、重试、错误映射。

### D-007 存储策略
- 决策: 使用 `chrome.storage.local/sync` 保存配置与术语。
- 理由: 扩展原生能力，部署简单，不引入数据库复杂度。
- 影响: 需要 schema 版本迁移与写入节流。

### D-008 翻译引擎分模块
- 决策: Engine 由 APIClient / TermMatcher / CacheManager / PromptBuilder 组成。
- 理由: 单一职责，便于测试与替换实现。
- 影响: 需要统一 `TranslateOptions` 与 `TranslateResult` 类型。

### D-009 缓存与超时默认开启
- 决策: 默认使用缓存，API 请求超时控制（5s）。
- 理由: 降低延迟、控制成本、避免请求悬挂。
- 影响: 需提供清理缓存与统计能力。

### D-010 术语匹配策略
- 决策: 支持 `exact / prefix / regex` 三种匹配。
- 理由: 覆盖专有名词、词形变化和规则类术语场景。
- 影响: 需控制 regex 性能与误匹配边界。

### D-011 测试策略
- 决策: 以单元测试为主，核心模块覆盖率目标 >= 70%。
- 理由: 迭代快、回归风险高，先保证核心稳定。
- 影响: 需对 DOM 与 chrome API 做 mock。

### D-012 代码质量基线
- 决策: TypeScript strict + ESLint + Prettier 强制执行。
- 理由: 减少隐式类型错误，统一代码风格。
- 影响: 初期开发速度略受影响，但长期维护收益大。

### D-013 构建工具
- 决策: 使用 Vite 作为构建工具。
- 理由: 开发与构建速度快，适配 TypeScript/React 生态。
- 影响: 需约束 bundle 体积，避免 Content Script 过重。

### D-014 依赖管理（临时）
- 决策: 当前使用 npm（原计划 pnpm）。
- 理由: 运行环境未预装 pnpm，先保证流水线可执行。
- 影响: 后续可迁回 pnpm，但 lockfile/脚本需同步调整。

### D-015 workflow memory 路径策略
- 决策: `build/polish` 阶段写 memory 文件时使用绝对路径。
- 理由: `codex -C deliver/code` 会导致相对路径误写到 `deliver/code/memory`。
- 影响: 已在 workflow 增加回填兜底，避免“阶段成功但 memory 空文件”。

## 待定决策

| ID | 主题 | 当前建议 | 确认时机 |
|---|---|---|---|
| P-001 | MVP 是否包含整页翻译 | 建议 v1.0 再完整落地 | Build 后半段 |
| P-002 | MVP 是否包含 PDF 深度翻译 | 建议先选区翻译，OCR 放 v2 | Build 后半段 |
| P-003 | 术语表 regex 默认开关 | 建议默认关闭，仅高级选项启用 | Options 联调前 |
| P-004 | API 降级策略 | 建议失败时显示原文 + 错误提示，不自动切换供应商 | 稳定性测试前 |
| P-005 | 前端 UI 依赖（Radix/Tailwind）深度 | 建议 MVP 维持轻量实现，减少样式系统复杂度 | Polish 阶段 |

## 已知偏差与接受理由

1. 偏差: `deliver/code` 文件数过大（包含 `node_modules`、`coverage`）。
- 接受理由: 当前以快速交付和验证流程为主。
- 后续动作: 在 deliver 阶段整理产物并排除不应交付目录。

2. 偏差: `07-issues.md` 在 build 中持续累积问题项。
- 接受理由: 有利于阶段化追踪。
- 后续动作: deliver 阶段输出“已解决/未解决”清单。

## 下一步

- 继续执行 `deliver` 阶段生成交付文档。
- 在最终交付中明确 P0 完成度（特别是 page/pdf 场景是否仅占位）。
