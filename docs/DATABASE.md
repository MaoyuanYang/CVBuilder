# Database

## Scope

- [CONFIRMED] 本文约束扩展的本地持久化数据：简历数据、按域名映射规则。无服务端数据库。

## Database Selection

- [CONFIRMED] Choice: chrome.storage.local。
- [CONFIRMED] Rationale and constraints: 平台内置、无额外依赖、对简历量级数据容量充足、随浏览器配置文件隔离，符合“全本地零上报”原则。

## Source of Truth Assignments

| Data concept | Owning boundary / system | Authority rule | Status |
| --- | --- | --- | --- |
| 简历数据 | 存储层（chrome.storage.local） | 单用户后写生效 | `CONFIRMED` |
| 按域名映射规则 | 存储层（chrome.storage.local） | 单用户后写生效 | `CONFIRMED` |
| 填写正确性判断 | 用户人工复核 | 扩展不得替代用户确认 | `CONFIRMED` |

## Core Entities and Relationships

| Entity / concept | Business meaning | Key relationships | Status |
| --- | --- | --- | --- |
| 简历档案 | 基本信息 + 多段教育/工作/项目经历 + 技能证书 + 自我评价 + 自定义项 | 与各类经历条目一对多 | `CONFIRMED` |
| 域名映射规则 | 某域名下“页面字段 → 简历数据项”的记忆映射 | 引用简历数据项 | `CONFIRMED` |

- [CONFIRMED] MUST NOT freeze all tables or fields during project initialization. 具体存储结构随 Feature Spec 演进。

## Project-Level Conventions

- [CONFIRMED] Time: 一律以 ISO 8601 字符串存储；展示使用用户本地格式。
- [CONFIRMED] IDs: 仅用于存储内部引用的稳定标识，绝不对外暴露（不存在外部系统）。

## Delete, Retention and Audit

- [CONFIRMED] Delete strategy: 用户可在配置页删除任一条目或全部数据；物理删除，无软删除。
- [CONFIRMED] Retention / privacy: 数据仅存于浏览器配置文件；卸载扩展或清除浏览器数据即删除；不留存任何副本于外部。
- [CONFIRMED] Audit requirements: 无（单用户本地工具）。

## Evolution Rules

- [CONFIRMED] Concrete Schema evolves with Feature Specs and migrations.
- [CONFIRMED] A Feature MUST NOT silently change Source of Truth or shared conventions.
- [CONFIRMED] L2/L3 changes require impact analysis, named-authority approval, and documentation sync.
