# Testing

## Testing Philosophy

- [CONFIRMED] Define correct behavior and observable evidence before implementation.
- [CONFIRMED] Test behavior and contracts, not internal implementation structure.
- [CONFIRMED] Choose depth by risk; MUST NOT optimize for test count.
- [CONFIRMED] Bug fixes should include a regression test when practical.
- [CONFIRMED] Exact-copy assertions MAY contain Product Content Language; executable test names/descriptions and assertion code remain under Engineering Language.

## Risk Map

| Risk / behavior | Impact | Preferred evidence | Status |
| --- | --- | --- | --- |
| React/Vue 受控组件填值不生效 | 核心功能失效 | Unit（jsdom 模拟框架行为）+ 真实站点人工验证 | `CONFIRMED` |
| 标签提取/别名匹配误配或漏配 | 填错或漏填 | Unit（覆盖典型网申 DOM 样本与中英别名） | `CONFIRMED` |
| 误触发提交 | 不可逆事故 | 代码约束（无提交调用）+ 人工验证清单 | `CONFIRMED` |
| 存储读写失败/数据丢失 | 用户数据受损 | Unit（存储封装）+ 配置页组件级测试 | `CONFIRMED` |
| 域名规则错误覆盖正确匹配 | 越用越错 | Unit（规则优先级与回写条件） | `CONFIRMED` |
| 复杂组件/特殊站点无法识别 | 体验缺口（可接受） | 人工验证记录，手动兜底兜住 | `CONFIRMED` |

## Test Layers

| Layer | Use for | Avoid | Status |
| --- | --- | --- | --- |
| Unit | 标签提取、别名匹配、填值事件派发、规则优先级、存储封装 | 框架内部实现细节 | `CONFIRMED` |
| Component / Interaction | 配置页数组表单增删改、保存；浮层选择填入 | 视觉细节 | `CONFIRMED` |
| 人工 E2E（真实站点） | 一键填写主流程、命中率统计、零误提交确认 | 用自动化覆盖全部真实站点 | `CONFIRMED` |

## Environments and Test Data

- [CONFIRMED] Environments: 本地开发环境（jsdom）+ 真实网申站点人工验证；无 CI 前置要求（后续可加）。
- [CONFIRMED] Isolation: 单测使用独立 DOM fixture 与存储 mock，互不污染。
- [CONFIRMED] Test data: 以 fixture 构造典型网申 DOM（Moka 类表单、自建官网表格型表单等）与简历数据样本；测试数据必须为虚构内容，禁止使用真实简历。
- [CONFIRMED] External services: 无（零网络依赖）。

## Commands

```text
Not yet established
```

## Feature Test Design Rule

- [CONFIRMED] Each Feature MUST progress from Acceptance Criteria to Test Scenarios before Coding. DRAFT Specs contain only initial acceptance direction; detailed Test Design belongs to `feature-dev`.

## Definition of Done

- [CONFIRMED] Required behavior and important failure paths are verified.
- [CONFIRMED] Relevant regression, integration, and UI checks pass.
- [CONFIRMED] Build/lint/static checks required by the project pass.
- [CONFIRMED] Documentation, Spec, Issue, and the project's adopted PR/MR or equivalent Delivery Record are synchronized.
- [CONFIRMED] 涉及真实站点的 Feature 需附人工验证记录（站点类型、命中率、问题）。
