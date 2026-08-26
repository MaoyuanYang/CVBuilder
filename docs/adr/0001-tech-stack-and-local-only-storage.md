# 0001: 技术栈与全本地存储

- Status: Accepted
- Date: 2026-08-26
- Owners: MaoyuanYang
- Architecture Decision Authority: MaoyuanYang（仓库 owner / 架构决策人）
- Approval Source: coding-start Discovery 会话（2026-08-26，用户显式确认技术栈与隐私边界）
- Approval Time: 2026-08-26
- Approval Scope: 运行平台（Chromium MV3）、构建与语言（Vite + TypeScript）、UI 框架（Preact）、测试（Vitest + jsdom）、存储（chrome.storage.local 全本地）
- Input Revision: Greenfield 宏观设计（`MACRO DESIGN READY`，2026-08-26）
- Supersedes / Superseded by: 无

- [CONFIRMED] Approval MUST bind the stated Input Revision and Approval Scope. Before Coding begins or resumes, approval metadata MUST be complete and this ADR MUST reach the project's implementation-authorizing state.

## Context

- [CONFIRMED] 目标：通用型网申表单自动填写扩展，面向不确定的第三方页面结构；简历数据为敏感个人信息。
- [CONFIRMED] 约束：无后端、无网络传输；需兼容 React/Vue 受控组件；团队为个人开发者，维护成本要低。
- [CONFIRMED] 配置页含大量数组类表单（教育/工作/项目经历），纯原生 DOM 实现维护成本高。

## Decision

- [CONFIRMED] 采用 Chromium MV3 浏览器扩展形态：Vite 构建、TypeScript、Preact 渲染配置页、Vitest + jsdom 单测、chrome.storage.local 全本地存储。

## Alternatives

| Alternative | Benefits | Costs / reason not chosen | Status |
| --- | --- | --- | --- |
| React | 生态更大 | 包体积更大；对本项目规模收益不明显 | `CONFIRMED`（未选） |
| 原生 TS（无框架） | 体积最小 | 数组类表单编辑体验与维护成本高 | `CONFIRMED`（未选） |
| 油猴脚本 | 安装简单 | 存储与多入口（配置页/浮层）能力受限 | `CONFIRMED`（未选） |
| 本地脚本（Playwright 等） | 可应对复杂流程 | 需要常驻进程，使用门槛高，偏离“浏览器内一键”体验 | `CONFIRMED`（未选） |
| 远端存储 / 云同步 | 多设备可用 | 违背隐私原则，引入后端与安全成本 | `CONFIRMED`（未选） |

## Reasoning

- [CONFIRMED] 扩展形态直接满足“在网申页面内一键填写”的核心体验；MV3 是 Chromium 现行标准。
- [CONFIRMED] Preact 以极小体积满足配置页组件化需求；Vitest + jsdom 能覆盖匹配与填值这类核心逻辑。
- [CONFIRMED] chrome.storage.local 是平台内置能力，最贴合“全本地零上报”的隐私边界。

## Consequences

- [CONFIRMED] Positive: 无服务端成本；隐私边界清晰；开发与分发链路简单。
- [CONFIRMED] Negative / tradeoff: 不支持 Firefox（后续评估）；数据随浏览器配置文件，清除数据会丢失（导出/导入已列为后续候选）。
- [CONFIRMED] Follow-up: MVP 达标后评估是否上架 Chrome Web Store（见 `docs/ARCHITECTURE.md` Deployment Direction）。
