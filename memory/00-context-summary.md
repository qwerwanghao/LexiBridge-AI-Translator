# 上下文摘要

> 自动生成于: 2026-03-04T13:02:07+08:00

## 项目概述
# 项目概述

> AI 驱动的 Chrome 翻译扩展，支持划词翻译、网页翻译、PDF 翻译、YouTube 字幕翻译，并可配置多家模型 API。

## 项目名称
LexiBridge AI Translator（暂定）

## 项目类型
- [x] Web 应用
- [ ] 移动应用
- [ ] 桌面应用
- [ ] CLI 工具
- [ ] 库/SDK
- [ ] API 服务
- [x] 其他：Chrome 浏览器扩展（Manifest V3）

## 项目描述
目标是做一个更适合技术/专业内容场景的翻译插件，避免“专有名词被误译”的问题。核心思路是：以 LLM 翻译链路替代纯统计翻译，支持术语表、上下文提示词、以及可配置翻译模型。

插件提供四大能力：网页划词翻译、整页翻译、PDF 内容翻译、YouTube 字幕实时双语翻译。用户可在设置页配置 OpenAI/兼容 OpenAI 协议的 API（含 base URL、model、system prompt、术语表），并按场景切换策略。

## 目标用户
- 需要阅读英文技术资料的开发者、产品、研究人员
- 频繁观看 YouTube 技术视频的用户
- 需要处理 PDF 论文/文档的学习者与从业者

## 核心价值
- 专有名词翻译可控：支持术语表、提示词、上下文窗口
- 多场景统一：网页、PDF、视频字幕共用同一翻译引擎与术语配置
- 模型与服务可切换：避免单一平台质量或可用性限制

## 项目状态
- [x] 从零开始
- [ ] 已有代码，需要添加功能
- [ ] 已有代码，需要修复bug
- [ ] 已有代码，需要重构

## 现有代码路径（如果适用）
```
N/A（新建扩展项目）
```

## 技术偏好（如果有）
- 语言/框架：TypeScript + React（设置页）
- 工具链：Vite + Chrome Extension MV3 + pnpm
- 部署环境：Chrome Web Store（首发），兼容 Edge

## GitHub 调研结果（2026-03-04）

调研范围：开源 Chrome 翻译扩展，重点检查“划词/整页/PDF/YouTube 字幕/API 可配置”覆盖情况。

| 项目 | Stars* | 覆盖能力 | 对本项目启发 |
|---|---:|---|---|
| https://github.com/nextai-translator/nextai-translator | 24,840 | 划词、截图、AI API Key | API 配置与多模型抽象做得成熟，可参考设置项设计 |
| https://github.com/immersive-translate/immersive-translate | 17,049 | 网页、PDF、字幕（仓库为发布仓） | 功能覆盖完整，但源码不开放；可借鉴产品分层与能力边界 |
| https://github.com/crimx/ext-saladict | 12,994 | 划词、整页、PDF 选词 | 词典/翻译源插件化值得参考 |
| https://github.com/hcfyapp/crx-selection-translate | 4,127 | 划词、截图、网页全文、音视频 AI（描述） | 老牌方案，交互路径与快捷键体系可借鉴 |
| https://github.com/ttop32/MouseTooltipTranslator | 1,126 | 划词、PDF、YouTube 双字幕 | 多场景注入策略可参考，尤其 PDF.js/字幕层注入 |
| https://github.com/translate-tools/linguist | 948 | 整页、划词、字幕、多翻译服务 | 多服务路由与自动翻译策略设计可参考 |
| https://github.com/orange2ai/youtube-subtitle-translator | 24 | YouTube 字幕实时翻译 | 字幕实时处理与双语展示实现可快速借鉴 |
| https://github.com/yoshinobc/PDF-Translator | 50 | PDF 选词翻译（DeepL） | PDF 选区文本清洗规则可复用 |

\* Stars 为 2026-03-04 抓取快照。

## 调研结论
- 目前未发现单个“完全开源 + 高活跃 + 同时覆盖四大场景且 AI API 高可配”的项目。
- 最可行策略是“组合式借鉴”：
  - 交互与注入策略参考 `MouseTooltipTranslator` / `Linguist`
  - API 配置与模型抽象参考 `nextai-translator`
  - PDF 文本处理参考 `PDF-Translator` 和 PDF.js 生态实践
  - YouTube 字幕实时处理参考 `orange2ai/youtube-subtitle-translator`

## 核心需求
# 需求文档

> 基于 2026-03-04 的 GitHub 调研结果，定义 AI 翻译 Chrome 扩展的可实现范围。

## 功能需求

### 核心功能（必须有）

#### 功能 1: 划词翻译（网页通用）
- **描述**: 用户选中文本后显示悬浮翻译卡片，支持快捷键触发与自动触发两种模式。
- **用户场景**: 阅读英文技术文档时快速查看精准释义，不打断阅读流。
- **验收标准**:
  - [x] 在常见站点（Docs、Medium、GitHub）可稳定捕获选区文本
  - [x] 悬浮卡片显示原文、译文、术语命中结果
  - [x] 支持复制译文、重新翻译、切换模型

#### 功能 2: 网页整页翻译
- **描述**: 对当前页面正文进行分段翻译，支持原文+译文双语对照/仅译文模式。
- **用户场景**: 阅读长文时一次性翻译整页并保留页面结构。
- **验收标准**:
  - [x] 自动分块翻译，不阻塞页面交互
  - [x] 对代码块、链接、行内公式不破坏 DOM 结构
  - [x] 支持恢复原文与忽略特定选择器

#### 功能 3: PDF 翻译
- **描述**: 在浏览器 PDF 阅读场景中支持选区翻译和段落翻译。
- **用户场景**: 阅读论文、技术白皮书时翻译选中段落，保留术语一致性。
- **验收标准**:
  - [x] 支持 Chrome 内置 PDF 页面（基于内容脚本注入）
  - [x] 选区文本清洗后再翻译（断行、连字符、异常空格修复）
  - [x] 翻译卡片可固定/拖动，便于对照阅读

#### 功能 4: YouTube 字幕翻译
- **描述**: 实时获取 YouTube 字幕并翻译，支持双语同显。
- **用户场景**: 看技术视频时同时看原字幕与目标语言字幕。
- **验收标准**:
  - [x] 对自动字幕和手动字幕都可工作
  - [x] 双语显示可调整字体、透明度、位置
  - [x] 实时翻译平均延迟控制在 1.5 秒内（网络正常）

#### 功能 5: AI 翻译引擎与 API 配置
- **描述**: 在设置页配置 API Key、Base URL、模型名、系统提示词、术语表。
- **用户场景**: 用户按预算/质量切换供应商，并优化专有名词翻译效果。
- **验收标准**:
  - [x] 支持 OpenAI 兼容接口（至少 1 个官方 + 1 个兼容供应商）
  - [x] API 配置可导入/导出（脱敏）
  - [x] 单独支持“术语表强制映射”并可按域名启用

### 扩展功能（可选，但希望有）

#### 功能 A: 翻译记忆库（TM）
- **描述**: 对历史翻译片段做缓存与复用，优先命中已有翻译。
- **优先级**: 高

#### 功能 B: 术语表共享
- **描述**: 支持导入 CSV/JSON 术语表，团队统一术语翻译。
- **优先级**: 高

#### 功能 C: 上下文增强模式
- **描述**: 翻译时附带前后文窗口，减少孤立短句误译。
- **优先级**: 中

#### 功能 D: 翻译质量反馈
- **描述**: 用户可对译文点赞/点踩，驱动提示词与术语优化。
- **优先级**: 中

### 未来功能（暂不需要，但可能在V2考虑）

- 图片/截图 OCR 翻译（网页与 PDF）
- Bilibili/Netflix 字幕翻译扩展
- 团队词库云同步（账号体系）

## 非功能需求

### 性能要求
- [x] 响应时间 < 1200 ms（短文本划词翻译）
- [x] 并发用户 > N/A（本地浏览器插件）
- [x] 数据处理速度 > 20 段/分钟（整页翻译）

### 可用性要求
- [x] 需要图形界面
- [ ] 需要命令行界面
- [ ] 需要API接口
- [ ] 需要移动端适配

### 安全要求
- [ ] 需要用户认证
- [x] 需要数据加密（本地敏感配置加密存储）
- [x] 需要权限控制（最小权限申请）

### 可维护性要求
- [x] 需要单元测试覆盖 > 70%
- [x] 需要API文档（配置项文档）
- [x] 需要用户手册

## 集成需求

### 需要集成的第三方服务
- [x] OpenAI 兼容 Chat Completions/Responses API - AI 翻译
- [x] YouTube 字幕 DOM/Track - 字幕提取
- [x] Chrome Storage API - 本地配置与缓存

### 需要支持的文件格式
- [x] PDF
- [x] JSON（术语表/配置）
- [x] CSV（术语导入）

### 需要兼容的平台/浏览器
- [x] Chrome（稳定版）
- [x] Edge（Chromium）

## 数据需求

### 需要存储的数据类型
- [x] 用户数据（本地配置）
- [x] 业务数据（术语表、翻译记忆）
- [x] 日志数据（可选，本地调试日志）
- [x] 其他：站点级翻译偏好

### 数据持久化方式（偏好）
- [x] 文件系统
- [ ] SQLite
- [ ] MySQL/PostgreSQL
- [ ] MongoDB
- [x] 其他：Chrome `storage.local` / `storage.sync`

## 交付要求

### 期望的交付物
- [x] 源代码
- [ ] 可执行文件
- [x] 部署脚本（打包发布脚本）
- [x] 用户文档
- [x] API文档
- [x] 测试用例

### 期望的交付时间
MVP：2~3 周（先覆盖划词 + YouTube 字幕 + API 配置），随后 1~2 周补齐整页与 PDF 深度优化。

## 调研附录（GitHub）
- nextai-translator/nextai-translator: https://github.com/nextai-translator/nextai-translator
- immersive-translate/immersive-translate: https://github.com/immersive-translate/immersive-translate
- crimx/ext-saladict: https://github.com/crimx/ext-saladict
- hcfyapp/crx-selection-translate: https://github.com/hcfyapp/crx-selection-translate
- ttop32/MouseTooltipTranslator: https://github.com/ttop32/MouseTooltipTranslator
- translate-tools/linguist: https://github.com/translate-tools/linguist
- orange2ai/youtube-subtitle-translator: https://github.com/orange2ai/youtube-subtitle-translator
- yoshinobc/PDF-Translator: https://github.com/yoshinobc/PDF-Translator

## 约束条件
# 约束条件

> 面向 Chrome AI 翻译扩展（划词/整页/PDF/YouTube 字幕）定义实现约束。

## 技术约束

### 必须使用的技术/框架
- [x] Manifest V3 - Chrome 商店发布硬约束
- [x] TypeScript - 降低内容脚本与消息通信错误率
- [x] 浏览器原生存储 API - 避免引入本地数据库复杂度

### 不能使用的技术/框架
- [x] Manifest V2 - 已淘汰，不满足上架要求
- [x] 依赖远程执行代码（remote code execution） - Chrome 商店合规风险

### 技术栈限制
- 编程语言：[建议是] TypeScript
- 框架：[建议是] React（仅 options 页）+ 原生内容脚本
- 数据库：[建议是] 不使用外部数据库，采用 `chrome.storage`

## 资源约束

### 硬件限制
- 内存：不超过 250MB（常规页面）
- 存储：不超过 50MB（本地缓存 + 术语表）
- CPU：前台页面额外占用建议 < 15%

### 网络限制
- [ ] 离线运行
- [x] 限制网络请求频率
- [x] 特定网络环境（需支持 API Base URL 自定义，兼容代理）

### 第三方服务限制
- [ ] 不能使用付费服务
- [ ] 不能使用需要注册的服务
- [x] 服务必须可替换（不可绑定单一 API 厂商）

## 平台约束

### 目标平台
- [ ] Windows
- [ ] macOS
- [ ] Linux
- [x] Web浏览器（需兼容：Chrome 122+、Edge 122+）
- [ ] 移动平台（iOS/Android）

### 部署环境
- [x] 本地运行
- [ ] 云服务（指定：____________）
- [ ] 自己的服务器
- [ ] Docker容器

## 法律/合规约束

### 开源协议
- [ ] 必须使用特定协议（____________）
- [x] 不能使用某些协议（直接复制 AGPL 代码）
- [x] 需要商业化友好（建议 MIT/Apache-2.0）

### 数据隐私
- [ ] 需要遵守GDPR
- [ ] 需要遵守CCPA
- [ ] 不能收集用户数据
- [x] 数据必须本地存储（API Key、术语表默认本地）

### 内容限制
- [x] 不包含成人内容
- [x] 不包含暴力内容
- [x] 其他：遵守 Chrome Web Store Program Policies

## 设计约束

### UI/UX要求
- [x] 需要遵循设计规范（轻量悬浮卡片 + 最小打扰）
- [ ] 需要支持主题切换
- [x] 需要支持无障碍访问
- [x] 必须响应式设计

### 代码风格
- [x] 需要遵循特定编码规范（ESLint + Prettier + TypeScript strict）
- [x] 需要特定注释风格（复杂逻辑写简短注释）
- [x] 需要特定命名约定（camelCase/PascalCase + 文件语义命名）

## 兼容性约束

### 向后兼容
- [ ] 需要与现有系统兼容
- [ ] 需要与现有API兼容
- [x] 需要支持旧版本数据格式（配置 schema 迁移）

### 依赖限制
- [x] 最大依赖数量：<= 30（生产依赖）
- [x] 不能使用某些依赖（长期无人维护依赖）
- [x] 依赖版本限制：优先近 12 个月内活跃维护版本

## 其他约束
- YouTube 字幕翻译仅处理用户可见字幕层，不破解 DRM 或抓取受限流媒体数据。
- PDF 翻译优先支持浏览器内 PDF 查看器，对扫描版 PDF（纯图片）不承诺 OCR 准确率。
- 术语表优先级必须高于模型自由发挥，保证专有名词稳定输出。
- 调研中 `immersive-translate` 当前仓库为发布仓、非源码仓；参考其产品能力时需避免把“可用能力”误判为“可直接复用代码”。

## 其他上下文
