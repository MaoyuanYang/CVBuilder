# F004: 按域名规则记忆

- Spec Status: `DRAFT`
- Roadmap Status: `DRAFT`
- Fact Status rule: every material claim below uses `CONFIRMED`, `RECOMMENDED`, or `UNKNOWN`
- Priority: `P0`
- Owner: Unassigned until Feature development starts
- Last Updated: 2026-08-26

> This is a macro-level DRAFT created during `coding-start`. It is not `SPEC READY`, does not authorize Coding, and MUST be refined by `feature-dev`.

## Goal

[CONFIRMED] 用户手动纠正或补填的“页面字段 → 简历数据项”映射被按域名记住；同一域名再次填写时优先应用，越用越准。

## Business Value

[CONFIRMED] 同一公司/平台体系往往重复投递；规则记忆把一次性人工纠正变成长期收益，显著提高二次以后的命中率与体验。

## User Story

[CONFIRMED] As a 求职者, I want 我在某个网申站点纠正过的字段映射被记住, so that 下次填同站点时不用再纠正一遍。

## Scope

- [CONFIRMED] 手动兜底选择与手动纠正触发规则回写（字段标识 → 数据项，按当前域名归档）。
- [CONFIRMED] 自动填写时：域名规则优先于别名词典匹配。
- [CONFIRMED] 规则数据持久化于本地存储，用户可查看与删除（最小管理界面）。
- [CONFIRMED] 规则失效（字段不存在/数据项已删）时静默回退词典匹配，不报错。

## Out of Scope

- [CONFIRMED] 跨域名规则迁移/复制。
- [CONFIRMED] 复杂的规则编辑器（批量改、正则、条件规则）。
- [CONFIRMED] 云端同步。

## Main Flow

1. [CONFIRMED] 用户在某域名下通过兜底/纠正完成一次非自动映射。
2. [CONFIRMED] 该映射按域名写入规则存储。
3. [CONFIRMED] 下次在该域名自动填写时，规则命中的字段直接按规则填值。
4. [CONFIRMED] 用户可在规则管理界面删除错误规则。

## Core Business Rules

- [CONFIRMED] 规则优先级：域名规则 > 别名词典；词典不确定即留空的原则不变。
- [CONFIRMED] 规则引用的数据项被删除后，规则视为失效并回退。
- [CONFIRMED] 规则仅本地存储，按域名隔离，不跨站共享。
- MUST NOT translate these rules into classes, tables, or internal methods yet.

## Main Entities / Concepts

| Concept | Role in this Feature | Source of Truth / owner | Fact Status |
| --- | --- | --- | --- |
| 域名映射规则 | 字段 → 数据项的记忆条目 | 存储层（按域名归档） | `CONFIRMED` |
| 字段标识 | 页面上可复用的字段定位方式 | 由字段结构派生（细化决定） | `UNKNOWN` |

## Major API / Integration Impact

- [CONFIRMED] 无外部接口；扩展存储层新增规则读写能力。

Record only the likely contract boundary. Request/response DTOs, event payloads and endpoint details wait for refinement.

## UI Impact

- UI involved: `YES`
- Fact Status: `CONFIRMED`
- Affected screens: 规则管理（配置页内分区或独立区，细化决定）、填写流程（无感应用）
- Primary user flow: 手动兜底与记忆的“记忆”环节（见 `docs/UX.md`）
- Major UI states: Empty（无规则）、Success（回写成功可无感）、Error（写入失败提示）

Keep this at macro level. Detailed UX Flow, UI State Matrix and component design belong to the selected Feature lifecycle.

## Dependencies

- Feature dependencies: `[CONFIRMED]` F003（纠正行为是规则来源）；间接依赖 F001/F002。
- External dependencies: `[CONFIRMED]` 无。

## Initial Acceptance Criteria

These are refinement inputs, not a complete Test Design.

- [ ] [CONFIRMED] Given 用户在域名 A 手动补填某字段, when 再次在域名 A 自动填写, then 该字段按记忆规则填入。
- [ ] [CONFIRMED] Given 域名 A 有规则, when 在域名 B 自动填写, then A 的规则不影响 B。
- [ ] [CONFIRMED] Given 规则引用的数据项已被删除, when 自动填写, then 回退词典匹配且不报错。
- [ ] [CONFIRMED] Given 存在错误规则, when 用户在管理界面删除, then 下次填写不再应用该规则。

## Risks and Assumptions

- [CONFIRMED] 字段跨会话可复定位是规则生效前提：网申页面改版会使规则失效，需容忍并回退。
- [UNKNOWN, NON_BLOCKING] 域名粒度（仅 host vs host+路径）与字段标识策略 - Resolve during: Feature refinement。

## Open Questions

- [ ] [UNKNOWN, NON_BLOCKING] 字段标识采用何种稳定策略（名称属性 / 标签文本 / 位置组合）？
- [ ] [UNKNOWN, NON_BLOCKING] 规则冲突（同字段多次不同纠正）以最新为准即可，还是需要提示？
- [ ] [UNKNOWN, NON_BLOCKING] 管理界面的最小形态（列表+删除是否足够）？

## Deliberately Deferred Detail

- DTOs and concrete request/response schemas
- Database fields, indexes and migrations
- Classes, packages, components and internal functions
- Cache keys, message topics and deployment minutiae
- Pixel-level UI and complete Test Design
