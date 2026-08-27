# F001: 简历数据录入

- Spec Revision: `R2`（R1 = coding-start DRAFT，commit `e6f508c`）
- Spec Status: `REFINED`
- Roadmap Status: `NEXT`
- Issue: https://github.com/MaoyuanYang/CVBuilder/issues/2
- Priority: `P0`
- Owner: MaoyuanYang（决策）/ opencode agent（实现）
- Fact Status rule: every material claim below uses `CONFIRMED`, `RECOMMENDED`, or `UNKNOWN`
- Last Updated: 2026-08-27

## Goal

[CONFIRMED] 用户可以在扩展配置页一次性录入并长期维护自己的全部简历数据，数据安全保存于浏览器本地。

## Business Value

[CONFIRMED] 是自动填写（F002-F004）的数据前提；同时本身就是“结构化简历存档”，对重复投递场景有独立价值。

## User Story

[CONFIRMED] As a 求职者, I want 在扩展配置页录入并随时修改我的简历信息, so that 之后在任何网申页面都能一键填写，且数据只保留在我自己的浏览器里。

## Actors / Preconditions

- [CONFIRMED] Actor：求职者（本浏览器配置的使用者）；无角色与权限区分，无账号。
- [CONFIRMED] Preconditions：扩展已安装并启用；浏览器存储能力可用。

## Scope

- [CONFIRMED] 分区表单录入，数据项集合如下（已定稿）：
  - 基本信息：姓名、性别、出生日期、手机号、邮箱、所在城市、籍贯、民族、政治面貌、照片
  - 求职意向：意向职位、期望薪资、期望城市、到岗时间
  - 教育经历[]：学校、专业、学历、开始时间、结束时间、GPA/排名（选填）
  - 工作/实习经历[]：公司、职位、开始时间、结束时间、工作描述
  - 项目经历[]：项目名、担任角色、开始时间、结束时间（选填）、技术栈（选填）、项目描述
  - 技能证书[]：名称、熟练程度/说明
  - 自我评价：长文本
  - 自定义项[]：任意键值对（兜底未建模字段）
- [CONFIRMED] 数组类条目支持添加、编辑、删除；删除需二次确认。
- [CONFIRMED] 显式“保存”按钮持久化；未保存修改在关闭/离开页面前提示确认。
- [CONFIRMED] 轻校验：姓名、手机号、邮箱必填并做基础格式校验；其余字段不校验。
- [CONFIRMED] 重新打开配置页完整回显已保存数据；首次为空态引导。
- [CONFIRMED] 保存/读取失败的可读错误提示与重试。

## Out of Scope

- [CONFIRMED] 数据导出/导入（后续候选，见 `docs/PRODUCT.md` Open Items）。
- [CONFIRMED] 多份简历档案切换。
- [CONFIRMED] 自动填写相关的一切能力（属 F002+）。
- [CONFIRMED] 从附件简历（PDF/Word）解析导入。
- [CONFIRMED] 身份证号、婚姻状况等高敏感字段建模；用户可自行用自定义项添加。

## Main Flow

1. [CONFIRMED] 用户从扩展管理页打开配置页；页面加载已保存数据并回显（首次为空态引导）。
2. [CONFIRMED] 用户逐区录入/修改，可随时增删数组条目、上传照片、添加自定义项。
3. [CONFIRMED] 用户点击“保存”：通过校验后持久化，给出成功反馈。
4. [CONFIRMED] 关闭页面前若存在未保存修改，提示确认（确认离开则丢弃未保存修改，取消则继续编辑）。

## Alternative Flows

- [CONFIRMED] 校验失败：阻止保存，错误就近展示在对应字段，焦点移至首个错误。
- [CONFIRMED] 保存失败：可读错误提示 + 重试入口；页面内已录入数据保持不丢。
- [CONFIRMED] 加载失败：可读错误提示 + 重试入口；不展示旧数据也不覆盖。
- [CONFIRMED] 删除取消：确认弹窗中选择取消，条目不变。
- [CONFIRMED] 照片不可用（格式不支持/过大且压缩失败）：可读提示，其余数据不受影响。

## Business Rules / Invariants

- [CONFIRMED] 数据仅写入本地存储；任何情况下不发起网络请求。
- [CONFIRMED] 显式保存：点击“保存”成功前，数据不持久化。
- [CONFIRMED] 删除条目/全部数据需二次确认；删除为物理删除。
- [CONFIRMED] 日志与错误提示中不得输出简历内容。
- [CONFIRMED] 校验规则：姓名/手机号/邮箱必填 + 基础格式；其余字段一律不校验，避免拦截合法特殊情况。
- [CONFIRMED] 照片在存储前压缩降采样，控制体积（参数见实现计划）。

## State Transitions

- [CONFIRMED] 页面状态机：`Loading -> Loaded(clean) -> Loaded(dirty) -> Saving -> Saved(clean) | SaveFailed(dirty)`。
- [CONFIRMED] `dirty`（存在未保存修改）时关闭/离开页面触发确认。
- [CONFIRMED] `SaveFailed` 保留全部页面数据，仅允许重试或继续编辑。

## Data Changes

- [CONFIRMED] 新增唯一一份简历档案及其子项，持久化于存储层（chrome.storage.local）；存储键与结构设计属实现计划，不在本 Spec 冻结。
- [CONFIRMED] Source of Truth：存储层；配置页只是编辑器。
- [CONFIRMED] 留存与删除：用户可删除任一条目或全部数据；物理删除，无软删除。
- [CONFIRMED] 无迁移（首个数据 Feature）。

## API Behavior

- [CONFIRMED] 无外部接口；本 Feature 不涉及与其他扩展上下文的消息通信。

## Error Cases

- [CONFIRMED] 存储读取失败 / 写入失败 / 照片处理失败：见 Alternative Flows；所有错误提示可读、不含简历内容。

## Idempotency / Concurrency / Consistency

- [CONFIRMED] 保存幂等：重复保存等价于一次保存（整体覆盖写，后写生效）。
- [CONFIRMED] 并发：单用户场景；若多个配置页实例同时打开，后写生效（已接受，记录在此）。
- [CONFIRMED] 一致性：同一界面保存成功后立即回读校验；无跨系统事务。

## Security / Privacy

- [CONFIRMED] 零网络：无请求、无遥测、无第三方依赖。
- [CONFIRMED] 简历 PII（含照片）仅存浏览器本地；卸载或清除浏览器数据即删除。
- [CONFIRMED] 日志与界面错误信息不得包含简历内容。

## Non-functional

- [RECOMMENDED] 配置页加载与保存响应在常规数据量下 <1s - Reason: 数据量小、本地操作；Revisit when: 实现后实测。

## Acceptance Criteria

- [CONFIRMED] AC-001: Given 首次安装且无数据, when 打开配置页, then 展示空态引导且可开始录入。
- [CONFIRMED] AC-002: Given 用户录入各分区数据（含多段经历、照片、自定义项）, when 保存并重新打开配置页, then 全部数据完整回显。
- [CONFIRMED] AC-003: Given 已有多段经历, when 删除其中一段并确认, then 仅该段被移除，其余不变。
- [CONFIRMED] AC-004: Given 存储写入失败, when 保存, then 展示可读错误与重试入口，且页面已有数据不丢失。
- [CONFIRMED] AC-005: Given 存在未保存修改, when 关闭/离开页面, then 触发确认提示；取消后仍可继续编辑。
- [CONFIRMED] AC-006: Given 姓名/手机号/邮箱缺失或格式错误, when 保存, then 保存被阻止，错误就近展示。
- [CONFIRMED] AC-007: Given 删除确认弹窗, when 选择取消, then 数据不变。
- [CONFIRMED] AC-008: Given 本 Feature 任意操作, when 观察网络行为, then 零网络请求。

## Open Questions

| Question | Severity | Owner | Status | Resolution |
| --- | --- | --- | --- | --- |
| 自定义键值项的增删改交互形态 | Non-critical | UI Refinement | `RESOLVED`（假设） | 采用“键+值”行式列表 + 添加/删除按钮；交互细节在 `UI_REFINEMENT` 定稿（可逆选择） |
| 照片压缩参数（尺寸/格式/上限） | Non-critical | Implementation Plan | `RESOLVED`（假设） | 降采样至边长 ≤512px 的 JPEG；最终值在实现计划确认（可逆选择） |

无 Critical 级 Open Question 处于 `OPEN` 或 `DEFERRED`。

## Deliberately Deferred Detail

- 存储键与数据结构（实现计划）
- Classes, packages, components and internal functions（实现计划）
- Pixel-level UI（UI Refinement）
- Complete Test Design（Test Design 阶段）

## Gate Record: SPEC READY

- Status: `PASS`
- Spec Revision: `R2`（正文哈希 `sha256:a8dc44aafbae61bce75945b1afc6cc4e0945699f2e7109c7664009d58c493797`，不含本 Gate Record 节）
- Validation Time: 2026-08-27T14:58:41+08:00
- Decision Authority: MaoyuanYang（Feature 决策人 / 仓库 owner）
- Approval Source: feature-dev 会话内显式批准（2026-08-27）
- Approval Scope: F001 Spec R2 全部范围与验收标准

### Input Manifest

| Artifact | Revision / Evidence |
| --- | --- |
| `specs/F001-resume-data-entry/spec.md` | `R2`，`sha256:a8dc44aa…c493797` |
| Dependency Specs | 无（F001 无 Feature 依赖） |
| `docs/adr/0001-tech-stack-and-local-only-storage.md` | Accepted，commit `e6f508c` |
| `docs/ARCHITECTURE.md` | commit `e6f508c` |
| `docs/DATABASE.md` | commit `e6f508c` |
| `AGENTS.md` | working tree，`sha256:278a7053bc65767682c2959aaef42a96bfc48301b86854c34f40f0a5a1c1f0c8` |

### Checklist Evidence

| # | Item | Result |
| --- | --- | --- |
| 1 | Goal/Scope/Out of Scope | YES：Scope 含定稿数据项集合；Out of Scope 明确 5 项排除 |
| 2 | Actors/Preconditions/Flows | YES：单角色；Main Flow 4 步 + Alternative Flows 5 支 |
| 3 | Business Rules/State Transitions | YES：6 条不变式；页面状态机显式定义 |
| 4 | Data/API behavior | YES：无外部接口；存储读写与留存语义已评估 |
| 5 | Error/security/privacy | YES：零网络、日志脱敏、错误可读 |
| 6 | Idempotency/Concurrency/Consistency | YES：保存幂等、多实例后写生效已明示 |
| 7 | Dependencies/migration/NFR | YES：无依赖、无迁移、无遥测；性能目标为 RECOMMENDED |
| 8 | AC 唯一可验证 | YES：AC-001~AC-008 |
| 9 | Brownfield AS-IS | YES（N/A：Greenfield，无 AS-IS 需重建） |
| 10 | Code/Docs/Tests/UI conflicts | YES（N/A：无既有代码，无冲突源） |
| 11 | Critical Open Questions | YES：0 项 OPEN/DEFERRED；2 项 Non-critical 均 RESOLVED（假设） |
