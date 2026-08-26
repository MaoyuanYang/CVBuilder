# F002: 一键自动填写

- Spec Status: `DRAFT`
- Roadmap Status: `DRAFT`
- Fact Status rule: every material claim below uses `CONFIRMED`, `RECOMMENDED`, or `UNKNOWN`
- Priority: `P0`
- Owner: Unassigned until Feature development starts
- Last Updated: 2026-08-26

> This is a macro-level DRAFT created during `coding-start`. It is not `SPEC READY`, does not authorize Coding, and MUST be refined by `feature-dev`.

## Goal

[CONFIRMED] 用户在任意网申页面点击一次“自动填写”，命中的字段被正确填入并以高亮提示；未命中项明确计数，用户知道还差什么。

## Business Value

[CONFIRMED] 产品核心价值载体；同时验证“标签启发式 + 别名匹配”这一最高风险假设（成功标准要求 ≥3 个真实页面命中率 ≥70%）。

## User Story

[CONFIRMED] As a 求职者, I want 在网申页面一键把简历填进表单, so that 省去逐项手工输入，只需复核后自行提交。

## Scope

- [CONFIRMED] popup 触发填写；简历数据为空时禁用并引导先录入。
- [CONFIRMED] 字段扫描与标签提取：label/placeholder/aria/前序文本等多策略。
- [CONFIRMED] 别名词典匹配（中英），覆盖文本输入框、多行文本、原生下拉框、单选、复选（按选项文本匹配）。
- [CONFIRMED] 兼容 React/Vue 受控组件的填值方式（原生 setter + 事件派发）。
- [CONFIRMED] 已填字段高亮；结果摘要（已填 N 项 / 未命中 M 项）回报 popup。
- [CONFIRMED] 单字段失败不中断整体流程。

## Out of Scope

- [CONFIRMED] 手动兜底浮层（F003）。
- [CONFIRMED] 域名规则记忆与优先应用（F004）。
- [CONFIRMED] 日期选择器、级联选择等复杂自定义组件。
- [CONFIRMED] 任何提交动作（永久红线）。

## Main Flow

1. [CONFIRMED] 用户在网申页面点击扩展图标，点击“自动填写”。
2. [CONFIRMED] Content script 扫描页面表单字段并提取标签。
3. [CONFIRMED] 按别名词典匹配简历数据项（不确定即留空）。
4. [CONFIRMED] 对命中字段填值并派发事件，高亮已填字段。
5. [CONFIRMED] popup 展示结果摘要；用户人工复核，自行提交。

## Core Business Rules

- [CONFIRMED] 绝不触发或模拟表单提交。
- [CONFIRMED] 匹配不确定的字段保持原状（宁可漏填不可错填）。
- [CONFIRMED] 对页面已有内容的字段的默认策略待细化（跳过或显式确认后覆盖）。
- [CONFIRMED] 不在页面全局注入可被页面脚本访问的对象；样式隔离。
- MUST NOT translate these rules into classes, tables, or internal methods yet.

## Main Entities / Concepts

| Concept | Role in this Feature | Source of Truth / owner | Fact Status |
| --- | --- | --- | --- |
| 页面字段 | 扫描到的可填写控件及其标签 | 网申页面 DOM | `CONFIRMED` |
| 别名词典 | 标签文本 ↔ 数据项的映射规则集 | 扩展内置 | `CONFIRMED` |
| 填写结果 | 已填/未命中计数与明细 | 本次运行产物，不持久化 | `CONFIRMED` |

## Major API / Integration Impact

- [CONFIRMED] popup → content script 的扩展消息触发；无外部接口。

Record only the likely contract boundary. Request/response DTOs, event payloads and endpoint details wait for refinement.

## UI Impact

- UI involved: `YES`
- Fact Status: `CONFIRMED`
- Affected screens: Popup、网申页面（高亮样式）
- Primary user flow: 一键填写（见 `docs/UX.md`）
- Major UI states: Empty（无数据禁用）、Error（无可识别字段）、Success（高亮+计数）；Loading 视耗时决定

Keep this at macro level. Detailed UX Flow, UI State Matrix and component design belong to the selected Feature lifecycle.

## Dependencies

- Feature dependencies: `[CONFIRMED]` F001（需要已录入数据与存储层）。
- External dependencies: `[CONFIRMED]` 无。

## Initial Acceptance Criteria

These are refinement inputs, not a complete Test Design.

- [ ] [CONFIRMED] Given 已录入数据且页面为典型网申表单, when 点击自动填写, then 命中的文本框/多行/下拉/单选/复选被填入且高亮。
- [ ] [CONFIRMED] Given 受控组件框架页面（React 样本）, when 自动填写, then 填入值被框架状态正确接受（单测证据）。
- [ ] [CONFIRMED] Given 无法识别的字段, when 自动填写, then 该字段保持原状并计入未命中。
- [ ] [CONFIRMED] Given 任意填写结果, when 流程结束, then 表单未被提交，且 popup 展示已填/未命中计数。

## Risks and Assumptions

- [CONFIRMED] 标签形态多样，单一提取策略命中率不足 —— 多策略组合。
- [RECOMMENDED] 以 Moka 类与自建官网表格型页面作为首批验证样本 - Revisit when: 用户反馈集中于其他形态。
- [UNKNOWN, NON_BLOCKING] 高亮的呈现形式与持续时间 - Resolve during: Feature refinement。

## Open Questions

- [ ] [UNKNOWN, NON_BLOCKING] 非空字段的默认策略（跳过 / 确认后覆盖）？
- [ ] [UNKNOWN, NON_BLOCKING] radio/checkbox 按选项文本匹配的容差规则（完全一致 / 包含 / 同义词）？
- [ ] [UNKNOWN, NON_BLOCKING] 结果摘要是否需要逐项列表而不仅是计数？

## Deliberately Deferred Detail

- DTOs and concrete request/response schemas
- Database fields, indexes and migrations
- Classes, packages, components and internal functions
- Cache keys, message topics and deployment minutiae
- Pixel-level UI and complete Test Design
