# Feature UX/UI: F001 简历数据录入

## Metadata

- Spec/Issue: `specs/F001-resume-data-entry/spec.md`（R2）/ GitHub Issue #2
- Validated Spec revision: `R2`（SPEC READY PASS，2026-08-27）
- Upstream input manifest link/revisions: 见 spec.md Gate Record Input Manifest；另含 `docs/UX.md`、`docs/UI.md`（commit `e6f508c`）
- UX/UI artifact revision/change-log ID: `UI-R1`
- UI Impact: `YES`
- `UI READY` Status: `NOT_READY`
- Affected platforms/devices: 桌面浏览器（Chrome/Edge）扩展 options 页
- Existing UX/UI/Design System references: `docs/UX.md`（首次录入流程）、`docs/UI.md`（简洁实用方向、表单/反馈模式）；无独立 Design System 文档

## User Goal and Flow

- User/role: 求职者（单一角色）
- Goal: 录入/维护一份完整简历数据并可靠保存
- Entry point: 浏览器扩展管理页 → CVBuilder → 扩展选项（打开 options 页）
- Preconditions: 扩展已安装；本地存储可用

```text
打开配置页 -> Loading（读取存储）
           -> Empty（无数据：引导文案 + 可编辑表单）/ Loaded（回显数据）
-> 录入与增删条目（进入 dirty）
-> 保存 -> 校验 -> Saving -> Saved（成功反馈，回到 clean）
                  -> SaveFailed（错误提示 + 重试，保持 dirty）
-> 关闭/离开（dirty 时浏览器确认）
   -> 确认离开：丢弃未保存修改 / 取消：继续编辑
```

- Success exit: 保存成功，页面保持可继续编辑状态；成功提示自然消退。
- Cancel/back behavior: 无多步流程；关闭/离开时若有未保存修改触发浏览器原生确认。
- Permission denied/recovery: `N/A - 无账号与权限体系`。

## Page / Screen / Component Responsibilities

| Surface | Responsibility | Inputs/source | User actions | Navigation/output | Reused component |
| --- | --- | --- | --- | --- | --- |
| Options 页壳层 | 加载数据、持有页面状态（clean/dirty）、保存动作、全局错误与提示 | 存储层读取 | 触发保存、关闭页面 | 无跳转（单页） | 无（首次构建） |
| 基本信息区 | 单值字段编辑（含照片） | 壳层数据 | 输入、上传照片 | 写回壳层草稿 | 原生表单控件 |
| 求职意向区 | 单值字段编辑 | 壳层数据 | 输入 | 写回壳层草稿 | 原生表单控件 |
| 教育/工作/项目经历区 | 多段条目增删改 | 壳层数据 | 添加/编辑/删除条目 | 写回壳层草稿 | 条目卡片模式（本 Feature 内复用） |
| 技能证书区 | 多条目增删改（名称+说明） | 壳层数据 | 添加/编辑/删除 | 写回壳层草稿 | 同上 |
| 自我评价区 | 长文本编辑 | 壳层数据 | 输入 | 写回壳层草稿 | 原生 textarea |
| 自定义项区 | 键值对行式增删改 | 壳层数据 | 添加行、编辑键/值、删除行 | 写回壳层草稿 | 同上 |
| 保存栏 | 保存按钮、未保存状态指示、成功/失败反馈 | 页面状态 | 点击保存 | 触发持久化 | 无 |
| 确认弹窗 | 删除条目/全部数据的二次确认 | 触发动作 | 确认/取消 | 回调壳层 | 浏览器原生 `confirm()` |

组件职责约束：壳层持有状态与存储交互；分区表单只做受控编辑，不直接触碰存储。

## UI State Matrix

| Surface | State | Trigger | Visible UI/message | Allowed action | API/data | Recovery/next |
| --- | --- | --- | --- | --- | --- | --- |
| Options 页 | Loading | 打开页面 | 轻量加载提示 | 等待 | 存储读取中 | 成功→Empty/Loaded；失败→Error |
| Options 页 | Empty | 加载成功且无数据 | 引导文案（确认为产品文案）+ 空白表单 | 开始录入 | 无数据 | 录入后保存 |
| Options 页 | Loaded(clean) | 加载成功/保存成功 | 完整表单 | 编辑 | 已有数据 | - |
| Options 页 | Loaded(dirty) | 任一修改 | 表单 + 保存栏未保存指示 | 编辑、保存 | 草稿未持久化 | 保存或关闭确认 |
| Options 页 | Saving | 点击保存且校验通过 | 保存按钮进行中态（禁用） | 等待 | 存储写入中 | Saved 或 SaveFailed |
| Options 页 | Saved | 写入成功 | 成功提示（数秒消退） | 继续编辑 | 已持久化 | - |
| Options 页 | SaveFailed | 写入失败 | 可读错误 + 重试入口（不展示简历内容） | 重试、继续编辑 | 草稿保留 | 重试保存 |
| Options 页 | Error(加载) | 读取失败 | 可读错误 + 重试入口 | 重试 | 未加载 | 重试加载 |

其他状态评估：`Initial=Empty 合并处理；Submitting=Saving 已覆盖；Disabled=仅保存按钮在 Saving 期间禁用；Unauthorized/Forbidden=N/A - 无权限体系；Offline=N/A - 零网络依赖；Partial Failure=N/A - 单一保存动作整体成败`。

## Forms, Validation, and Duplicate Actions

| Input/action | Client validation | Server validation/error | Timing/focus | Duplicate protection |
| --- | --- | --- | --- | --- |
| 姓名/手机号/邮箱 | 必填 + 基础格式（手机号位数、邮箱形态） | `N/A - 无服务端` | 保存时统一校验；焦点移至首个错误；错误紧邻字段展示 | - |
| 其余字段 | 不校验 | `N/A - 无服务端` | - | - |
| 保存按钮 | - | - | - | Saving 期间禁用，防止重复写入 |
| 删除条目/全部 | - | - | 原生确认弹窗 | 确认后才执行 |

## Frontend/Backend Contract

本 Feature 无服务端；“后端等价物”为存储层异步接口（加载全量简历 / 保存全量简历）。

- Request/response: 页面加载时读取一次全量数据；保存时写入全量数据（整体覆盖）。
- Authentication/authorization: `N/A - 无账号体系`。
- Pagination/retry/timeout: `N/A - 本地单次读写，失败由用户手动重试`。
- Optimistic update/rollback: `N/A - 保存为显式动作，成功前不宣称已保存`。

### Error Mapping

| 存储层错误 | User-visible state/message | Enabled action | Recovery | Sensitive detail hidden? |
| --- | --- | --- | --- | --- |
| 读取失败 | Error(加载)：可读错误 + 重试入口 | 重试 | 重试加载 | 是（仅提示失败，不含数据） |
| 写入失败 | SaveFailed：可读错误 + 重试入口 | 重试、继续编辑 | 重试保存 | 是 |
| 照片不可用 | 照片字段就地提示（格式/大小问题） | 更换照片或跳过 | 跳过不影响其余保存 | 是 |

## Responsive Behavior

| Viewport/device | Layout/information priority | Navigation/input changes | Overflow/touch behavior |
| --- | --- | --- | --- |
| 桌面 ≥1024px | 单列居中表单（限宽），分区标题清晰 | 无导航 | - |
| 桌面 <1024px | 单列拉伸至窗口宽度 | 无导航 | 内容自然折行；表格类控件横向滚动兜底 |

不为移动端优化（`docs/UX.md` 已确认仅桌面场景）。

## Accessibility

- Semantic structure/labels: 每个控件有可关联 `label`；分区使用标题层级；经历条目使用语义分组。
- Keyboard and focus order/recovery: 全部操作键盘可达；焦点顺序随表单流；校验失败焦点移至首个错误；删除确认后焦点归还原触发按钮。
- Error association and live announcements: 错误与字段关联；保存结果以状态提示呈现（可被辅助技术感知）。
- Contrast/non-color cues: 错误除颜色外有文案；状态不依赖颜色单独传达。
- Motion/touch target considerations: 无动效；控件尺寸满足鼠标操作。
- Verification approach: 键盘走查 + 语义检查（人工）；见 `docs/TESTING.md`。

## Design System Reuse

| Need | Existing token/component | `Reuse/Compose/Extend` | Reason | Project-level update |
| --- | --- | --- | --- | --- |
| 语义色变量（含深色模式） | `docs/UI.md` 最小视觉方向 | `Compose` | 项目尚无组件库；以 CSS 变量落地最小集合 | `N/A - 未达独立 Design System 文档阈值` |
| 表单控件 | 原生控件 | `Reuse` | 简洁实用方向，避免引入组件库 | `N/A - 同上` |
| 确认弹窗 | 浏览器原生 `confirm()` | `Reuse` | 删除为低频动作，原生即可达且无障碍 | `N/A - 同上` |

## UI Acceptance Links

- `AC-001`: Empty 状态与引导
- `AC-002`: 回显完整性（含各分区）
- `AC-003` / `AC-007`: 删除流程与取消
- `AC-004`: SaveFailed 提示与重试
- `AC-005`: dirty 关闭确认
- `AC-006`: 校验错误展示与焦点

## Open Questions

| ID | Question | `Critical/Non-critical` | Owner | Resolution | Status |
| --- | --- | --- | --- | --- | --- |
| UIQ-001 | 自定义项行式交互细节（键/值输入宽度、空键处理） | `Non-critical` | Implementation | 空键行在保存时忽略；宽度各半 | `RESOLVED`（假设，可逆） |

## `UI READY` Evidence

| ID | Requirement | Result | Evidence/reason |
| --- | --- | --- | --- |
| UR-01 | User Goal, Entry, Exit, and the complete User Flow are explicit. | `YES` | User Goal and Flow 节（含失败/取消分支） |
| UR-02 | Each affected Page, Screen, and Component has an explicit responsibility. | `YES` | Page / Screen / Component Responsibilities 表 |
| UR-03 | The UI State Matrix covers applicable states. | `YES` | 8 状态 + 其余状态逐项评估 |
| UR-04 | Permission, validation, duplicate submit, cancel, back, recovery explicit. | `YES` | Forms 表 + 状态矩阵；权限 `N/A - 无权限体系` |
| UR-05 | Frontend/Backend contract and error mapping explicit. | `YES` | 存储层契约 + Error Mapping 表 |
| UR-06 | Responsive behavior is verifiable. | `YES` | 桌面两档布局表；非移动场景有依据 |
| UR-07 | Accessibility behavior is verifiable. | `YES` | Accessibility 节含验证方式 |
| UR-08 | Existing components/Design System checked, reuse decision explicit. | `YES` | Design System Reuse 表（无组件库，Compose 决策） |
| UR-09 | UI Acceptance in Spec or linked to `AC-*`. | `YES` | UI Acceptance Links |
| UR-10 | No Critical UI Open Question OPEN/DEFERRED. | `YES` | 仅 UIQ-001，Non-critical 且 RESOLVED |

## `UI READY` Record

- Status: `PASS`
- Input manifest: Spec R2 Gate Record manifest + 本文档 `UI-R1`（`sha256:15c27a9e8303a330da17605b21b769fd51c6baf5185c079a2d8595662e72819f`，不含本记录节）+ `docs/UX.md`、`docs/UI.md`（commit `e6f508c`）
- Evidence checklist result: `ALL YES`
- Critical UI Open Questions at `OPEN` or `DEFERRED`: `NONE`
- Validated Spec revision: `R2`
- Validated UX/UI revision: `UI-R1`
- Validated at: 2026-08-27T15:01:01+08:00
- Decision Authority (named human + role): MaoyuanYang（Feature 决策人 / 仓库 owner）
- Approval source: feature-dev 会话内显式批准（2026-08-27）
- Approval scope: F001 options 页 UX/UI 方案全部范围
