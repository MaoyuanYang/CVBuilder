# F001: 简历数据录入

- Spec Status: `DRAFT`
- Roadmap Status: `NEXT`
- Fact Status rule: every material claim below uses `CONFIRMED`, `RECOMMENDED`, or `UNKNOWN`
- Priority: `P0`
- Owner: Unassigned until Feature development starts
- Last Updated: 2026-08-26

> This is a macro-level DRAFT created during `coding-start`. It is not `SPEC READY`, does not authorize Coding, and MUST be refined by `feature-dev`.

## Goal

[CONFIRMED] 用户可以在扩展配置页一次性录入并长期维护自己的全部简历数据，数据安全保存于浏览器本地。

## Business Value

[CONFIRMED] 是自动填写（F002-F004）的数据前提；同时本身就是“结构化简历存档”，对重复投递场景有独立价值。

## User Story

[CONFIRMED] As a 求职者, I want 在扩展配置页录入并随时修改我的简历信息, so that 之后在任何网申页面都能一键填写，且数据只保留在我自己的浏览器里。

## Scope

- [CONFIRMED] 分区表单录入：基本信息、教育经历（多段）、工作/实习经历（多段）、项目经历（多段）、技能证书、自我评价、自定义键值项。
- [CONFIRMED] 数组类条目支持添加、编辑、删除（删除需确认）。
- [CONFIRMED] 保存后持久化到本地存储；重新打开可回显。
- [CONFIRMED] 数据为空时的空态引导。
- [CONFIRMED] 保存/读取失败的可读错误提示与重试。

## Out of Scope

- [CONFIRMED] 数据导出/导入（后续候选，见 `docs/PRODUCT.md` Open Items）。
- [CONFIRMED] 多份简历档案切换。
- [CONFIRMED] 自动填写相关的一切能力（属 F002+）。
- [CONFIRMED] 从附件简历（PDF/Word）解析导入。

## Main Flow

1. [CONFIRMED] 用户从扩展管理页打开配置页。
2. [CONFIRMED] 页面加载已保存数据并回显（首次为空态）。
3. [CONFIRMED] 用户逐区录入/修改，可随时增删数组条目。
4. [CONFIRMED] 保存成功：数据持久化，给出成功反馈。

## Core Business Rules

- [CONFIRMED] 数据仅写入本地存储；任何情况下不发起网络请求。
- [CONFIRMED] 保存采用用户显式动作；不做静默自动保存到远端（本地草稿行为在细化时决定）。
- [CONFIRMED] 删除条目/全部数据需二次确认；删除为物理删除。
- [CONFIRMED] 日志与错误提示中不得输出简历内容。
- MUST NOT translate these rules into classes, tables, or internal methods yet.

## Main Entities / Concepts

| Concept | Role in this Feature | Source of Truth / owner | Fact Status |
| --- | --- | --- | --- |
| 简历档案 | 用户唯一一份简历数据聚合 | 存储层（chrome.storage.local） | `CONFIRMED` |
| 经历条目（教育/工作/项目） | 数组类子项，支持增删改 | 从属于简历档案 | `CONFIRMED` |
| 自定义键值项 | 覆盖未建模字段（如政治面貌、籍贯） | 从属于简历档案 | `CONFIRMED` |

## Major API / Integration Impact

- [CONFIRMED] 无外部接口。仅使用 chrome.storage 平台 API，并经由存储层封装。

Record only the likely contract boundary. Request/response DTOs, event payloads and endpoint details wait for refinement.

## UI Impact

- UI involved: `YES`
- Fact Status: `CONFIRMED`
- Affected screens: Options 配置页
- Primary user flow: 首次录入（见 `docs/UX.md`）
- Major UI states: Loading（读取存储）、Empty（无数据引导）、Error（保存/读取失败）、Success（保存成功）；Disabled 不适用

Keep this at macro level. Detailed UX Flow, UI State Matrix and component design belong to the selected Feature lifecycle.

## Dependencies

- Feature dependencies: `[CONFIRMED]` 无。
- External dependencies: `[CONFIRMED]` 无（零网络）。

## Initial Acceptance Criteria

These are refinement inputs, not a complete Test Design.

- [ ] [CONFIRMED] Given 首次安装且无数据, when 打开配置页, then 展示空态引导且可开始录入。
- [ ] [CONFIRMED] Given 用户录入基本信息与多段经历, when 保存并重新打开配置页, then 全部数据完整回显。
- [ ] [CONFIRMED] Given 已有多段经历, when 删除其中一段并确认, then 仅该段被移除，其余不变。
- [ ] [CONFIRMED] Given 存储写入失败, when 保存, then 展示可读错误且已有数据不丢失。

## Risks and Assumptions

- [CONFIRMED] 单份简历数据量远小于 chrome.storage.local 容量上限。
- [RECOMMENDED] 表单校验仅做必填与明显格式检查 - Revisit when: 细化阶段确认数据项集合。
- [UNKNOWN, NON_BLOCKING] 是否需要“未保存离开提示” - Resolve during: Feature refinement。

## Open Questions

- [ ] [UNKNOWN, NON_BLOCKING] 各分区的具体数据项集合（如基本信息是否含政治面貌/籍贯等）？
- [ ] [UNKNOWN, NON_BLOCKING] 保存模式：显式保存按钮 vs 自动保存？
- [ ] [UNKNOWN, NON_BLOCKING] 自定义键值项的增删改交互形态？

## Deliberately Deferred Detail

- DTOs and concrete request/response schemas
- Database fields, indexes and migrations（存储键与数据结构细节）
- Classes, packages, components and internal functions
- Cache keys, message topics and deployment minutiae
- Pixel-level UI and complete Test Design
