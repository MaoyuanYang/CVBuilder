# F003: 手动兜底填写

- Spec Status: `DRAFT`
- Roadmap Status: `DRAFT`
- Fact Status rule: every material claim below uses `CONFIRMED`, `RECOMMENDED`, or `UNKNOWN`
- Priority: `P0`
- Owner: Unassigned until Feature development starts
- Last Updated: 2026-08-26

> This is a macro-level DRAFT created during `coding-start`. It is not `SPEC READY`, does not authorize Coding, and MUST be refined by `feature-dev`.

## Goal

[CONFIRMED] 任何未被自动命中的字段，用户都能通过“点击字段 → 选择数据项 → 填入”在数秒内完成，保证 100% 字段可达。

## Business Value

[CONFIRMED] 兜住自建官网结构差异，是成功率下限的保障；没有它，低命中率直接等于产品失败。

## User Story

[CONFIRMED] As a 求职者, I want 点击没被填上的字段并从我的简历数据里选一项填入, so that 即使扩展没认出来，我也几乎不用打字。

## Scope

- [CONFIRMED] 在网申页面点击目标字段唤起页内浮层。
- [CONFIRMED] 浮层列出可选简历数据项（含分区来源），选择后填入该字段。
- [CONFIRMED] 支持文本框、多行、原生下拉、单选、复选字段。
- [CONFIRMED] 浮层可关闭取消，取消不产生任何副作用。
- [CONFIRMED] 与页面样式/事件隔离，不污染第三方页面。

## Out of Scope

- [CONFIRMED] 复杂自定义组件（日期/级联）的代填 —— 用户手工输入，扩展不干预。
- [CONFIRMED] 映射规则的持久化（F004 负责）。
- [CONFIRMED] 拖拽、批量选择等高级交互。

## Main Flow

1. [CONFIRMED] 用户点击未填字段（或自动填写后的任意字段）。
2. [CONFIRMED] 页内浮层在该字段附近打开，列出数据项。
3. [CONFIRMED] 用户选择一项，值写入字段（受控组件兼容方式）。
4. [CONFIRMED] 浮层关闭；字段纳入已填高亮。

## Core Business Rules

- [CONFIRMED] 取消（Escape/点击外部）不写字段、不记规则。
- [CONFIRMED] 覆盖已有内容前遵循与 F002 一致的默认策略。
- [CONFIRMED] 绝不触发提交。
- MUST NOT translate these rules into classes, tables, or internal methods yet.

## Main Entities / Concepts

| Concept | Role in this Feature | Source of Truth / owner | Fact Status |
| --- | --- | --- | --- |
| 页内浮层 | 单字段选值面板 | Content Script | `CONFIRMED` |
| 数据项列表 | 来自存储层的简历数据投影 | 存储层 | `CONFIRMED` |

## Major API / Integration Impact

- [CONFIRMED] 无外部接口；读取存储层数据经由存储层封装。

Record only the likely contract boundary. Request/response DTOs, event payloads and endpoint details wait for refinement.

## UI Impact

- UI involved: `YES`
- Fact Status: `CONFIRMED`
- Affected screens: 页内浮层（新增）、网申页面
- Primary user flow: 手动兜底与记忆（见 `docs/UX.md`）
- Major UI states: Empty（无可选数据项）、Error（写入失败）、Success（填入完成）；焦点管理为关键项

Keep this at macro level. Detailed UX Flow, UI State Matrix and component design belong to the selected Feature lifecycle.

## Dependencies

- Feature dependencies: `[CONFIRMED]` F002（复用字段识别与填值能力）；间接依赖 F001 数据。
- External dependencies: `[CONFIRMED]` 无。

## Initial Acceptance Criteria

These are refinement inputs, not a complete Test Design.

- [ ] [CONFIRMED] Given 一个未命中字段, when 点击该字段, then 浮层打开并列出可选数据项。
- [ ] [CONFIRMED] Given 浮层已打开, when 选择一个数据项, then 值被正确填入且浮层关闭。
- [ ] [CONFIRMED] Given 浮层已打开, when 按 Escape 或点击外部, then 浮层关闭且字段内容不变。
- [ ] [CONFIRMED] Given 数据项列表为空, when 打开浮层, then 展示空态说明且不影响手工输入。

## Risks and Assumptions

- [CONFIRMED] 第三方页面上渲染浮层需处理样式隔离与定位（滚动/缩放）。
- [UNKNOWN, NON_BLOCKING] 数据项列表是否需要搜索/过滤（条目多时） - Resolve during: Feature refinement。

## Open Questions

- [ ] [UNKNOWN, NON_BLOCKING] 浮层唤起方式：仅点击字段，还是也提供键盘/右键入口？
- [ ] [UNKNOWN, NON_BLOCKING] 列表排序策略（按分区 / 按使用频率）？

## Deliberately Deferred Detail

- DTOs and concrete request/response schemas
- Database fields, indexes and migrations
- Classes, packages, components and internal functions
- Cache keys, message topics and deployment minutiae
- Pixel-level UI and complete Test Design
