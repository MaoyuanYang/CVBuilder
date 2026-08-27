# Feature UX/UI: F002 一键自动填写

## Metadata

- Spec/Issue: `specs/F002-auto-fill/spec.md`（R2）/ GitHub Issue #4
- Validated Spec revision: `R2`（SPEC READY PASS，2026-08-27）
- Upstream input manifest link/revisions: spec.md Gate Record Input Manifest；另含 `docs/UX.md`、`docs/UI.md`（main @ `7195e08`）
- UX/UI artifact revision/change-log ID: `UI-R1`
- UI Impact: `YES`
- `UI READY` Status: `NOT_READY`
- Affected platforms/devices: 桌面浏览器（Chrome/Edge）；popup + 任意第三方网申页面（高亮）
- Existing UX/UI/Design System references: `docs/UX.md`（一键填写流程）、`docs/UI.md`（反馈模式）、F001 既有样式变量

## User Goal and Flow

- User/role: 求职者
- Goal: 一键把简历填入当前网申表单，并清楚知道填了哪些、跳了哪些、还差哪些
- Entry point: 工具栏扩展图标 → popup
- Preconditions: 已安装扩展；F001 数据非空

```text
打开 popup -> idle（“自动填写”按钮）
           -> disabled（无数据：引导文案 + 打开配置页入口）
点击自动填写 -> filling（按钮禁用 + 进行中提示）
           -> result：计数（已填 N / 跳过 K / 未命中 M）+ 分组逐项列表
           -> error（消息失败：可读错误 + 重试）
页面侧：命中字段填值 + 高亮（持续至页面卸载）
用户复核页面 -> 自行提交（扩展不参与）
```

- Success exit: 查看结果后关闭 popup，转页面复核。
- Cancel/back behavior: filling 为秒级动作，不提供取消；关闭 popup 不影响已填结果。
- Permission denied/recovery: `N/A - 无权限体系`；content script 未注入时走 error + 重试。

## Page / Screen / Component Responsibilities

| Surface | Responsibility | Inputs/source | User actions | Navigation/output | Reused component |
| --- | --- | --- | --- | --- | --- |
| Popup 壳层 | 触发填写、持有 popup 状态机、展示结果 | 存储层（判空）+ content script 回报 | 点击自动填写/重试/打开配置页 | 无跳转（配置页新开标签） | F001 样式变量 |
| 结果列表 | 分组展示 已填/跳过/未命中 逐项明细 | 填写结果消息 | 滚动查看 | - | 无（新增，popup 内局部） |
| 页面高亮 | 标记已填字段 | content script 注入隔离样式 | 无（视觉提示） | - | 无 |

组件职责约束：popup 壳层持有状态；结果列表纯展示；高亮样式不暴露给页面脚本。

## UI State Matrix

| Surface | State | Trigger | Visible UI/message | Allowed action | API/data | Recovery/next |
| --- | --- | --- | --- | --- | --- | --- |
| Popup | disabled | 打开且无数据 | 引导文案（产品文案）+“去录入”入口 | 打开配置页 | 存储读取 | 录入后重开 |
| Popup | idle | 有数据 | “自动填写”按钮 | 触发 | - | filling |
| Popup | filling | 点击触发 | 按钮禁用 + 进行中提示 | 等待 | 消息往返 | result 或 error |
| Popup | result | 回报成功 | 计数 + 分组逐项列表 | 滚动、关闭 | 本次结果 | 页面复核 |
| Popup | error | 消息失败/存储失败 | 可读错误 + 重试 | 重试 | - | filling |
| 页面高亮 | applied | 填值成功 | 字段轮廓高亮 | - | - | 持续至卸载 |

其他状态评估：`Loading=filling 覆盖；Empty=disabled 覆盖（无数据）与 result 中未命中分组（无识别字段时列表全为未命中并附提示）；Submitting=filling；Unauthorized/Forbidden=N/A - 无权限体系；Offline=N/A - 零网络；Partial Failure=单字段异常计入未命中，result 正常展示`。

## Forms, Validation, and Duplicate Actions

| Input/action | Client validation | Server validation/error | Timing/focus | Duplicate protection |
| --- | --- | --- | --- | --- |
| 自动填写按钮 | 无数据禁用 | `N/A - 无服务端` | - | filling 期间禁用 |
| 重试 | - | - | - | 同上 |

## Frontend/Backend Contract

无服务端。“后端等价物”为 content script 填写引擎，经扩展消息通信：

- Request: `{ type: "autofill" }`（popup → content script）
- Response: `{ filled: [{label, value}], skipped: [{label}], unmatched: [{label, reason}] }` 或错误
- Authentication/authorization: `N/A - 无账号体系`
- Pagination/retry/timeout: `N/A - 单次同步动作；失败手动重试`
- Optimistic update/rollback: `N/A - 填值即页面可见，用户可手工改回`

### Error Mapping

| 错误 | User-visible state/message | Enabled action | Recovery | Sensitive detail hidden? |
| --- | --- | --- | --- | --- |
| 存储读取失败 | error：可读错误 + 重试 | 重试 | 重试 | 是 |
| content script 未就绪 | error：提示刷新页面后重试 | 重试 | 刷新页面 | 是 |
| 单字段填值异常 | result：该字段计入未命中（reason=填写失败） | 关闭/复核 | 手工填写或 F003 | 是 |

## Responsive Behavior

| Viewport/device | Layout/information priority | Navigation/input changes | Overflow/touch behavior |
| --- | --- | --- | --- |
| 桌面（popup 固定宽约 360px） | 计数优先，列表限高滚动 | 无导航 | 列表内滚动 |

不为移动端优化（`docs/UX.md` 仅桌面场景）。

## Accessibility

- Semantic structure/labels: 按钮与列表使用语义元素；分组用标题层级。
- Keyboard and focus order/recovery: popup 打开焦点在“自动填写”；列表可键盘滚动。
- Error association and live announcements: 结果与错误以 `role="status"/"alert"` 呈现。
- Contrast/non-color cues: 计数与分组标题为文本；高亮除轮廓色外不承载必需信息（页面值本身可见）。
- Motion/touch target considerations: 无动效；按钮满足最小尺寸。
- Verification approach: 人工键盘走查 + 语义检查。

## Design System Reuse

| Need | Existing token/component | `Reuse/Compose/Extend` | Reason | Project-level update |
| --- | --- | --- | --- | --- |
| 语义色变量/深色模式 | F001 `styles.css` 变量 | `Reuse` | 同源扩展页面 | `N/A - 未达独立 Design System 阈值` |
| 高亮轮廓色 | 新增隔离样式 | `Compose` | 注入第三方页面，须独立命名空间 | `N/A` |
| 按钮/列表 | 原生元素 + 既有样式 | `Reuse` | 简洁实用方向 | `N/A` |

## UI Acceptance Links

- `AC-001`/`AC-005`: 填值与高亮
- `AC-003`/`AC-004`: 未命中/跳过分组展示
- `AC-006`: 计数 + 逐项列表
- `AC-007`: disabled 引导
- `AC-008`: 未命中 reason 展示

## Open Questions

| ID | Question | `Critical/Non-critical` | Owner | Resolution | Status |
| --- | --- | --- | --- | --- | --- |
| UIQ-001 | 高亮轮廓具体颜色值 | `Non-critical` | Implementation | 复用 `--accent` 语义色，隔离命名空间 | `RESOLVED`（假设） |

## `UI READY` Evidence

| ID | Requirement | Result | Evidence/reason |
| --- | --- | --- | --- |
| UR-01 | User Goal, Entry, Exit, and the complete User Flow are explicit. | `YES` | User Goal and Flow 节 |
| UR-02 | Each affected Page, Screen, and Component has an explicit responsibility. | `YES` | Responsibilities 表 |
| UR-03 | The UI State Matrix covers applicable states. | `YES` | 6 状态 + 其余逐项评估 |
| UR-04 | Permission, validation, duplicate submit, cancel, back, recovery explicit. | `YES` | Forms 表 + Alternative Flows；权限 `N/A` |
| UR-05 | Frontend/Backend contract and error mapping explicit. | `YES` | 消息契约 + Error Mapping 表 |
| UR-06 | Responsive behavior is verifiable. | `YES` | popup 固定宽 + 列表滚动 |
| UR-07 | Accessibility behavior is verifiable. | `YES` | Accessibility 节含验证方式 |
| UR-08 | Existing components and the Design System were checked, with an explicit reuse/extension decision. | `YES` | Reuse 表 |
| UR-09 | UI Acceptance in Spec or linked to `AC-*`. | `YES` | UI Acceptance Links |
| UR-10 | No Critical UI Open Question OPEN/DEFERRED. | `YES` | UIQ-001 Non-critical 且 RESOLVED |

## `UI READY` Record

- Status: `PASS`
- Input manifest: Spec R2 Gate manifest + 本文档 `UI-R1`（`sha256:2559e5043805bab8c03b17d91af1439ca2af51b753f1d01844c1d8c51f0b07f2`，不含本记录节）+ `docs/UX.md`、`docs/UI.md`（main @ `7195e08`）
- Evidence checklist result: `ALL YES`
- Critical UI Open Questions at `OPEN` or `DEFERRED`: `NONE`
- Validated Spec revision: `R2`
- Validated UX/UI revision: `UI-R1`
- Validated at: 2026-08-27T17:12:00+08:00
- Decision Authority (named human + role): MaoyuanYang（Feature 决策人 / 仓库 owner）
- Approval source: feature-dev 会话内显式批准（2026-08-27）
- Approval scope: F002 popup 与高亮 UX/UI 方案全部范围
