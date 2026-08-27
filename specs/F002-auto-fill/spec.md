# F002: 一键自动填写

- Spec Revision: `R2`（R1 = coding-start DRAFT，commit `e6f508c`）
- Spec Status: `REFINED`
- Roadmap Status: `DONE`
- Issue: https://github.com/MaoyuanYang/CVBuilder/issues/4
- Priority: `P0`
- Owner: MaoyuanYang（决策）/ opencode agent（实现）
- Fact Status rule: every material claim below uses `CONFIRMED`, `RECOMMENDED`, or `UNKNOWN`
- Last Updated: 2026-08-27

## Goal

[CONFIRMED] 用户在任意网申页面点击一次“自动填写”，命中的字段被正确填入并以高亮提示；未命中与跳过项明确计数并可逐项查看，用户知道还差什么。

## Business Value

[CONFIRMED] 产品核心价值载体；验证“标签启发式 + 别名匹配”这一最高风险假设（成功标准要求 ≥3 个真实页面命中率 ≥70%）。

## User Story

[CONFIRMED] As a 求职者, I want 在网申页面一键把简历填进表单, so that 省去逐项手工输入，只需复核后自行提交。

## Actors / Preconditions

- [CONFIRMED] Actor：求职者；无角色/权限区分。
- [CONFIRMED] Preconditions：扩展已安装；F001 已录入简历数据（为空则 popup 禁用并引导）。

## Scope

- [CONFIRMED] popup 触发填写；简历数据为空时禁用并引导先录入。
- [CONFIRMED] 字段扫描：`input`（text/email/tel/url/number 及无 type）、`textarea`、`select`、`radio` 组、`checkbox` 组；跳过 `hidden`/`disabled`/`readonly` 字段。
- [CONFIRMED] 标签提取多策略，按优先级：`label[for]` → 包裹 `label` → `aria-label` → `placeholder` → 前序/邻近可见文本（含表格行首 `th`、前序 `div/span`）。
- [CONFIRMED] 别名词典匹配（中英）：标签规范化后与词典别名精确匹配；不确定即留空计入未命中。
- [CONFIRMED] 选项类控件（select/radio/checkbox）按“规范化包含匹配”命中选项文本（去空白、全半角、大小写规范化后相等或互相包含）；同义词仅经词典扩展，不做模糊猜测。
- [CONFIRMED] 非空字段一律跳过，原值不变，计入“跳过 K 项”。
- [CONFIRMED] 数组类数据匹配规则：教育/工作/项目等经历条目仅在恰好 1 段时参与结构化字段匹配（学校/专业/公司/职位等）；多于 1 段时相关标签计入未命中。长文本“自我评价/个人总结”类标签始终匹配自我评价。
- [CONFIRMED] 兼容 React/Vue 受控组件的填值方式（原生 setter + 派发 `input`/`change` 事件）。
- [CONFIRMED] 已填字段高亮（样式隔离，持续到页面卸载）。
- [CONFIRMED] 结果摘要：popup 展示计数（已填 N / 未命中 M / 跳过 K）+ 逐项列表（字段标签 → 填入值或未填原因）。
- [CONFIRMED] 单字段填写异常被捕获并计入未命中，不中断整体流程。

## Out of Scope

- [CONFIRMED] 手动兜底浮层（F003）。
- [CONFIRMED] 域名规则记忆与优先应用（F004）。
- [CONFIRMED] 日期选择器、级联选择等复杂自定义组件。
- [CONFIRMED] 任何提交动作（永久红线）。

## Main Flow

1. [CONFIRMED] 用户在网申页面点击扩展图标，点击“自动填写”。
2. [CONFIRMED] Content script 扫描页面表单字段并提取标签。
3. [CONFIRMED] 按别名词典匹配简历数据项（不确定即留空）。
4. [CONFIRMED] 对命中且为空的字段填值并派发事件，高亮已填字段；非空字段跳过计数。
5. [CONFIRMED] popup 展示计数与逐项列表；用户人工复核，自行提交。

## Alternative Flows

- [CONFIRMED] 简历数据为空：popup 禁用“自动填写”，展示引导文案与配置页入口。
- [CONFIRMED] 页面无可识别字段：popup 展示“未识别到可填写字段”提示与未命中列表。
- [CONFIRMED] 单字段填值异常：捕获，计入未命中，其余字段继续。
- [CONFIRMED] 消息发送失败（如页面未注入 content script）：popup 展示可读错误与重试入口。

## Business Rules / Invariants

- [CONFIRMED] 绝不触发或模拟表单提交（不点击提交按钮、不派发 submit 事件）。
- [CONFIRMED] 匹配不确定的字段保持原状（宁可漏填不可错填）。
- [CONFIRMED] 非空字段只跳过不覆盖。
- [CONFIRMED] 不在页面全局注入可被页面脚本访问的对象；高亮样式以隔离方式注入。
- [CONFIRMED] 填写结果不持久化（本次运行产物）。
- MUST NOT translate these rules into classes, tables, or internal methods yet.

## State Transitions

- [CONFIRMED] popup 状态：`idle -> filling -> result(counts+list) | error`；无数据时为 `disabled`。
- [CONFIRMED] content script 填写为一次性同步动作；重复触发等价于重新执行（幂等：已填字段因非空被跳过，不产生叠加）。

## Data Changes

- [CONFIRMED] 只读简历数据（经存储层）；不写入任何持久化数据。

## API Behavior

- [CONFIRMED] popup → content script 扩展消息：触发填写、回报结果。消息载荷结构在实现计划定义。

## Error Cases

- [CONFIRMED] 存储读取失败：popup 可读错误 + 重试。
- [CONFIRMED] content script 未就绪：popup 可读错误 + 重试。
- [CONFIRMED] 单字段异常：计入未命中，不中断。

## Idempotency / Concurrency / Consistency

- [CONFIRMED] 重复触发：第二轮中已填字段非空被跳过，结果一致（幂等）。
- [CONFIRMED] 并发：单 popup 单触发；按钮在 filling 期间禁用。
- [CONFIRMED] 一致性：只读存储，无跨写冲突。

## Security / Privacy

- [CONFIRMED] 零网络：不发起任何请求；简历数据仅在扩展内部流转。
- [CONFIRMED] 不向页面控制台/日志输出简历内容。

## Non-functional

- [RECOMMENDED] 常规网申页（≤200 可填字段）填写动作 <2s - Reason: 纯本地 DOM 操作；Revisit when: 实现后实测。

## Acceptance Criteria

- [CONFIRMED] AC-001: Given 已录入数据且页面为典型网申表单, when 点击自动填写, then 命中的文本框/多行/下拉/单选/复选被填入且高亮。
- [CONFIRMED] AC-002: Given 受控组件框架页面（React 样本）, when 自动填写, then 填入值被框架状态正确接受（单测证据）。
- [CONFIRMED] AC-003: Given 无法识别的字段, when 自动填写, then 该字段保持原状并计入未命中。
- [CONFIRMED] AC-004: Given 已有内容的字段, when 自动填写, then 原值不变并计入跳过。
- [CONFIRMED] AC-005: Given 选项文本与数据值规范化后相等或包含, when 自动填写, then 对应 select/radio/checkbox 被选中。
- [CONFIRMED] AC-006: Given 任意填写结果, when 流程结束, then 表单未被提交，popup 展示计数与逐项列表。
- [CONFIRMED] AC-007: Given 简历数据为空, when 打开 popup, then “自动填写”禁用并引导先录入。
- [CONFIRMED] AC-008: Given 某字段填值抛异常, when 自动填写, then 其余字段正常填写，该字段计入未命中。
- [CONFIRMED] AC-009: Given 本 Feature 任意操作, when 观察网络行为, then 零网络请求。

## Open Questions

| Question | Severity | Owner | Status | Resolution |
| --- | --- | --- | --- | --- |
| 高亮呈现形式（轮廓颜色/角标） | Non-critical | UI Refinement | `RESOLVED`（假设） | 2px 轮廓 + 语义色，随深色模式；UI 阶段定稿 |
| popup 逐项列表的滚动/折叠交互 | Non-critical | UI Refinement | `RESOLVED`（假设） | 列表限高滚动，按 已填/跳过/未命中 分组 |

无 Critical 级 Open Question 处于 `OPEN` 或 `DEFERRED`。

## Deliberately Deferred Detail

- 消息载荷与内部模块结构（实现计划）
- Classes, packages, components and internal functions（实现计划）
- Pixel-level UI（UI Refinement）
- Complete Test Design（Test Design 阶段）

## Gate Record: SPEC READY

- Status: `PASS`
- Spec Revision: `R2`（正文哈希 `sha256:a8f0b3aca498d0c433d158d369836230f951566dceaa44e1649632fe5f8f07ff`，不含本 Gate Record 节）
- Validation Time: 2026-08-27T17:06:04+08:00
- Decision Authority: MaoyuanYang（Feature 决策人 / 仓库 owner）
- Approval Source: feature-dev 会话内显式批准（2026-08-27）
- Approval Scope: F002 Spec R2 全部范围与验收标准（含“非空跳过”“规范化包含匹配”“数组条目仅 1 段参与匹配”决策）

### Input Manifest

| Artifact | Revision / Evidence |
| --- | --- |
| `specs/F002-auto-fill/spec.md` | `R2`，`sha256:a8f0b3ac…07ff` |
| Dependency Specs | `specs/F001-resume-data-entry/spec.md` R2（DONE，main @ `12af027`） |
| `docs/adr/0001-tech-stack-and-local-only-storage.md` | Accepted，commit `e6f508c` |
| `docs/ARCHITECTURE.md` | commit `e6f508c` |
| `AGENTS.md` | main @ `7195e08` |

### Checklist Evidence

| # | Item | Result |
| --- | --- | --- |
| 1 | Goal/Scope/Out of Scope | YES：扫描范围、匹配规则、摘要形式定稿；Out of Scope 4 项 |
| 2 | Actors/Preconditions/Flows | YES：Main Flow 5 步 + Alternative Flows 4 支 |
| 3 | Business Rules/State Transitions | YES：5 条不变式；popup 状态机与幂等说明 |
| 4 | Data/API behavior | YES：只读数据；popup↔content 消息边界已记录 |
| 5 | Error/security/privacy | YES：三类错误路径；零网络；日志脱敏 |
| 6 | Idempotency/Concurrency/Consistency | YES：重复触发幂等；filling 期间禁用 |
| 7 | Dependencies/migration/NFR | YES：F001 DONE；无迁移；<2s 为 RECOMMENDED |
| 8 | AC 唯一可验证 | YES：AC-001~AC-009 |
| 9 | Brownfield AS-IS | YES（N/A：Greenfield） |
| 10 | Code/Docs/Tests/UI conflicts | YES（N/A：无冲突源） |
| 11 | Critical Open Questions | YES：0 项 OPEN/DEFERRED |
