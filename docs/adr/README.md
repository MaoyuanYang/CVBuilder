# Architecture Decision Records

- [CONFIRMED] ADRs record why significant architecture or technology decisions were made. They are not used for routine implementation details.

## Naming

```text
NNNN-short-decision-title.md
```

## Status

`Proposed | Accepted | Effective | Superseded | Deprecated`

- [CONFIRMED] `Proposed` identifies a candidate and does not authorize Coding. 本项目的实现授权状态为 `Accepted`：ADR 到达 `Accepted` 且审批元数据完整后方可开始相应 Coding。

## Index

| ADR | Decision | Fact Status | ADR Status | Date |
| --- | --- | --- | --- | --- |
| `0001-tech-stack-and-local-only-storage.md` | MV3 + Vite + TypeScript + Preact + Vitest；全本地存储（chrome.storage.local） | `CONFIRMED` | Accepted | 2026-08-26 |

## When to Create an ADR

- [CONFIRMED] Create one for significant module boundaries, technology choices, Source of Truth, messaging, cache, authentication, database strategy, frontend architecture, global navigation, Design System core, API style, or consistency decisions. A named Architecture Decision Authority MUST approve an L3 decision before its ADR reaches `Accepted`.
- [CONFIRMED] MUST NOT create one for ordinary functions, DTOs, component-local choices, or visual spacing.
