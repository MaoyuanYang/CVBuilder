# AGENTS.md

## Project Context

- Product purpose: 浏览器扩展，自动填写招聘官网/网申系统的在线简历表单；数据全本地，绝不代提交。
- Architecture style: Chromium MV3 扩展；三个 UI 面（options / popup / 页内浮层）+ 共享本地存储层；上下文间消息通信。
- Primary runtime boundaries: Options 页、Popup、Content Script、存储层（可选最小 Background）。
- Project documentation: `README.md`, `STAGE.md`, `docs/`, `specs/ROADMAP.md`

## Language Policy

```text
documentation_language = zh
engineering_language = en
product_content_language = zh-CN
```

The key lines above are repository-wide fallbacks.

| Policy Key | Effective Value / State | Exact Scope | Named Authority / Approval | Source / Date |
| --- | --- | --- | --- | --- |
| `documentation_language` | `zh` | repository-wide fallback（全部正式文档正文） | MaoyuanYang（仓库 owner / 语言政策决策人），显式批准 | coding-start Discovery 会话，2026-08-26 |
| `engineering_language` | `en` | repository-wide fallback | default policy | 默认，2026-08-26 |
| `product_content_language` | `zh-CN` | 扩展全部用户可见文案（options / popup / 页内浮层）；MVP 仅中文 | 产品需求（用户 = 中文求职者） | coding-start Discovery 会话，2026-08-26 |

- 英文界面文案属后续版本范围；引入时需在本表追加经批准的范围行。
- Documentation Language governs formal artifact prose in README, STAGE, AGENTS, project docs, Roadmaps, ADRs, Specs, Baseline and Knowledge Gap reports, Test Design documents, Implementation Plans, Review documents, Done Checklists, and Delivery Records.
- Engineering Language governs new class, method, variable, package, and module names; database tables and columns; API paths and definitions; configuration keys but not arbitrary values; environment variables; infrastructure names; branch names; commit messages; Issue/PR titles and descriptions; code comments; executable test names and descriptions; and developer-facing log messages.
- Product Content Language follows product requirements. Localized resource/configuration values, exact product copy quoted in clearly labeled formal docs, and exact-copy assertions MAY use it.
- Surrounding formal prose remains under Documentation Language. Executable test names/descriptions, assertion code, comments, and other engineering text remain under Engineering Language even when they contain an exact Product Content assertion value.
- Conversation MAY follow the user's language, but conversation language MUST NOT silently override any dimension.
- Every override MUST be explicitly requested and approved by a named `Maintainer Decision Authority` empowered for project language policy. The requester is not automatically that authority.

## Architecture Constraints

- 零后端、零上报：禁止网络请求、第三方运行时 SDK、遥测；简历数据不得出现在日志。
- 绝不触发或代替用户提交网申表单（永久红线）。
- Content script 运行于任意第三方页面：不污染全局、不依赖页面已有库、样式与事件隔离。
- 持久化一律经由存储层封装访问，UI 层不直接触碰存储键。
- Respect module ownership and dependency direction documented in `docs/ARCHITECTURE.md`.
- MUST NOT introduce a new service, database, cache, queue, framework, or cross-module dependency without impact analysis.
- Concrete Feature implementation MUST follow its Spec and MUST NOT silently redefine project-level architecture.

## Module Rules

| Module / boundary | Owns | May depend on | MUST NOT own / depend on |
| --- | --- | --- | --- |
| Options 页 | 简历数据录入/编辑/删除界面 | 存储层 | 填写逻辑、页面 DOM 操作 |
| Popup | 填写触发与结果摘要 | 存储层、消息（至 content script） | 直接 DOM 操作 |
| Content Script | 字段扫描、标签提取、匹配、填值、高亮、兜底浮层、纠正回写 | 存储层、消息 | 持久化结构定义、网络 |
| 存储层 | 简历数据与域名规则读写 | chrome.storage API | 网络、UI |

## Build and Test

```text
Start: npm install && npm run build  (load dist/ via chrome://extensions -> Load unpacked)
Build: npm run build
Test:  npm test
```

- An unavailable command MUST be written exactly as `Not yet established`; commands MUST NOT be invented. When tooling changes, update this file, README, and `docs/TESTING.md` together.
- Run the smallest relevant checks during development and the project-required verification before completion.
- Test observable behavior and contracts, not private implementation structure.
- Add a regression test for a bug fix when practical.

## Stable Coding Conventions

- TypeScript 严格模式；新增工程命名（标识符、文件名、存储键、分支名、提交信息）使用英文。
- 填写受控组件必须使用原生 setter + 派发 `input`/`change` 事件；禁止假设直接赋值生效。
- 匹配策略遵循“域名规则优先，别名词典兜底；不确定即留空”。
- Prefer the smallest design that preserves documented boundaries and testability.

## Spec Lifecycle and Roadmap Status

Allowed Roadmap statuses:

```text
DRAFT -> NEXT -> READY -> IN_PROGRESS -> REVIEW -> DONE
Any non-DONE state -> BLOCKED -> prior valid state
```

- `DRAFT`: macro intent only; open questions and change are expected.
- `NEXT`: the sole selected Feature awaiting refinement.
- `READY`: `SPEC READY`, `UI READY` or an explicit UI skip, `TEST DESIGN READY`, and a valid current Plan and Tasks; `coding-start` MUST NOT set it.
- `IN_PROGRESS`: implementation is active.
- `REVIEW`: implementation and evidence are under review.
- `DONE`: behavior, tests, review and documentation sync are complete.
- `BLOCKED`: a named blocker prevents progress; record the blocker in the Issue/Roadmap.

Only deepen the selected `NEXT` Spec. MUST NOT prematurely finalize unrelated DRAFT Specs.

## Work Tracking and Delivery

- Tracking mode: `REMOTE`（F001 于 2026-08-27 绑定 GitHub Issue 为 Work Status 权威；后续 Feature 默认沿用，例外需记录）。
- `STAGE.md` owns the current project phase, active-member coordination, blockers, handoffs, and resume points. It links to controlling artifacts and MUST NOT copy their content.
- Before `feature-dev`, `specs/ROADMAP.md` owns only initial `DRAFT/NEXT/BLOCKED`; `BLOCKED` requires a named blocker and unblock condition. Once a work item is bound, its remote tracker is the writable Work Status authority. When no remote is bound, the activity row identified by `STAGE_LOCAL:<Activity ID>` in `STAGE.md` is the local Work Status authority. Roadmap is a synchronized projection in either mode.
- Update `STAGE.md` only at assignment, meaningful workflow transition, block/resume, handoff, and completion. Preserve unrelated member rows and record conflicts instead of silently overwriting them.
- A bound remote remains authoritative when authorization, tooling, authentication, availability, or writing temporarily fails; preserve status and stop. Use `STAGE_LOCAL:<Activity ID>` only when no remote is bound or after an explicitly approved durable migration.
- Serialize Stage writes through a repository lock or designated canonical writer. Otherwise compare the revision and SHA-256 immediately before writing and abort/reconcile on change; allocate `A-xxx` under the same guard. Divergent worktree copies are not live Stage state until canonical reconciliation.
- Transfer Stage-local authority atomically to the receiver's activity before the sender leaves Active Work. Preserve final status and authority when archiving completed activities.
- Delivery mode: `PR_OR_MR`（开源仓库；MaoyuanYang 于 2026-08-26 决定：变更经分支 + PR 评审后合并）。
- A remote Issue, commit, push, PR/MR, merge, or close MUST occur only after the user explicitly authorizes that action class.

## Complete Feature Workflow

```text
Macro Design
-> Feature DRAFT Spec
-> Feature Selected (`NEXT`)
-> Work item bound (remote Issue or Stage-local authority) and linked to Spec
-> Spec Clarification and Refinement
-> SPEC READY
-> if UI:
     UX Refinement
     -> UI State Design
     -> Frontend/Backend Contract
     -> UI READY
-> Acceptance Test Design
-> TEST DESIGN READY
-> Implementation Plan
-> Tasks
-> Coding
-> Testing
-> Review
-> Documentation Sync
-> PR/MR or the explicitly adopted no-PR delivery record
-> DONE
```

- MUST NOT start Coding before the Feature's applicable Gates pass.
- Every Gate record MUST bind the artifact revision it validated. Spec behavior changes invalidate `SPEC READY` and downstream UI/Test/Plan; UI changes invalidate `UI READY` and Test/Plan; Test Design changes invalidate `TEST DESIGN READY` and Plan. Resume only after every stale Gate is revalidated.
- Critical requirements MUST have observable Acceptance Criteria and planned evidence.
- Implementation Plan defines how to build only the current Feature; it MUST NOT become global architecture by accident.

## UI/UX Long-Term Rules

1. UX precedes UI; determine user goal and flow before visual detail.
2. A Feature MUST design more than the Happy Path.
3. Consider Loading, Empty, Error and Success as formal states.
4. Explicitly decide whether Disabled, Permission Denied, Offline, interruption and recovery states apply.
5. Prefer existing components and project patterns.
6. Follow the Design System before extending it.
7. A Feature MUST NOT introduce an independent visual language.
8. Map API errors to explicit user-visible behavior and recovery.
9. Design UI around user behavior and decisions, not data fields alone.
10. Meet the documented Accessibility requirements, including keyboard and focus behavior where applicable.
11. Meet the documented Responsive requirements for target devices.
12. If a UI change affects shared tokens or components, update UI/Design System docs and affected tests.

## Design Change Policy

Design MAY change, but MUST NOT change through an undocumented code-only shortcut.

```text
Discover problem
-> classify Requirement / Design / Implementation
-> analyze impact
-> assign L1 / L2 / L3
-> identify affected artifacts
-> update Spec / Design and Acceptance Criteria
-> update UX/UI and Test Design when applicable
-> change Code and Tests
-> Verify
-> Review
-> sync Issue / PR
```

### L1: Feature-local

Use when only the current Feature changes. Update the current Spec, Acceptance Criteria/Test Design, and only the necessary API, Database, or UI documentation. Any change to approved Scope, Acceptance Criteria, an external contract, observable behavior, or user-visible product copy requires explicit approval by a named Decision Authority empowered for that Feature.

### L2: Cross-Feature

Use when multiple Features or a shared contract change. A named Decision Authority empowered for all affected Features or the shared contract MUST approve the change. Update related Specs, API, Database, UX/UI, Design System if relevant, Roadmap, Tests, and Architecture only where affected.

### L3: Architectural

Use for changes to module boundaries, major technology choices, Source of Truth, messaging, cache, authentication, database strategy, frontend architecture, global navigation, Design System core, API style, or consistency model. A named Architecture Decision Authority MUST approve the change. Update every truly affected project document, related Specs, AGENTS, and Tests; create or update an ADR with the approval source/time/scope and input revision. Before Coding begins or resumes, the ADR MUST reach `Accepted`.

Code MUST NOT remain ahead of its controlling documentation. MUST NOT update unaffected files merely to make the change look comprehensive.

## Artifact Relationships

- Spec is the Source of Truth for what makes a Feature correct.
- A bound remote Issue tracks where the work is, who owns it, and what blocks it. With no bound remote, the identified Stage-local row owns Work Status. Any Issue or auxiliary checklist links the Spec and MUST NOT copy it or maintain a second writable status.
- `STAGE.md` shows where the project and all active members stand. It projects linked authorities, or supplies the local Work Status authority when explicitly identified, without copying requirements or Gate evidence.
- Task / Sub-Issue records concrete implementation steps when coordination needs them.
- PR/MR or the explicitly adopted no-PR Delivery Record explains what code changed, links the Issue and Spec, includes verification evidence, and reports documentation sync.
- ADR explains why a significant architecture or technology decision was made, identifies its named Architecture Decision Authority and approval evidence, and does not track implementation progress.

## Documentation Rules

- `README.md` is the quick entry, not the full design.
- `STAGE.md` is the current project and member coordination snapshot, not a Roadmap, Spec, Plan, or event log.
- `docs/PRODUCT.md` owns product intent and scope.
- `docs/ARCHITECTURE.md` owns system boundaries and collaboration.
- `docs/DATABASE.md` owns 本地数据原则与 Source of Truth；Feature 细节随 Spec 演进。
- `docs/FRONTEND.md`, `docs/UX.md`, `docs/UI.md` have distinct engineering, flow, interface and shared visual responsibilities.
- `docs/TESTING.md` owns project testing strategy; Feature Test Design owns Feature scenarios.
- Update only affected documents, but complete Documentation Sync before DONE.

## Repeated Pitfalls

- 对 React/Vue 受控组件直接 `el.value = x` 不会触发框架状态更新：必须使用原生 setter（`Object.getOwnPropertyDescriptor(...).set`）并派发 `input`/`change` 事件，且需在真实站点验证。
- 网申页面标签形态多样（label/placeholder/aria/前序文本/表格行）：标签提取必须多策略尝试，任何单一策略都会显著降低命中率。
- 扩展运行在第三方页面：样式与事件处理必须隔离，禁止依赖或污染页面全局对象。
- 组件默认参数若是对象（如注入的依赖），每次渲染都会重建新实例：不得将其放入 effect 依赖，须用 `useRef`/`useState` 固定，否则触发加载循环；jsdom 单测可能掩盖此类问题，真实环境验证不可省。
