# Test Design: F001 简历数据录入

## Inputs and Environment

- Spec/Gate/revision: `specs/F001-resume-data-entry/spec.md` R2，`SPEC READY PASS`（2026-08-27）
- UX/UI/Gate/revision: `specs/F001-resume-data-entry/ui.md` UI-R1，`UI READY PASS`（2026-08-27）
- Upstream input manifest link/revisions: spec.md Gate Record Input Manifest + ui.md UI READY Record manifest
- Test Design revision/change-log ID: `TD-R1`
- Issue: https://github.com/MaoyuanYang/CVBuilder/issues/2
- Test strategy/conventions: `docs/TESTING.md`（Unit + Component/Interaction 自动化，真实环境人工验证；虚构数据）
- Environment/services: 本地 Node + Vitest + jsdom；`chrome.storage` 以测试替身注入；无网络、无外部服务
- Test data/fixtures: 虚构简历数据 fixture（禁止真实简历）；图片以生成的测试位图构造
- Known constraints: 单测无法运行真实 Chrome 存储/真实浏览器行为；相应部分以“存储层接口契约测试 + 真实浏览器人工验证”覆盖

## Risk Inventory

| Risk/invariant | Impact | Likelihood | Evidence | Planned coverage |
| --- | --- | --- | --- | --- |
| 保存失败导致数据丢失 | 高 | 低 | Spec AC-004 | TS-005 |
| 回显不完整（数组/照片/自定义项） | 高 | 中 | Spec AC-002 | TS-002/003 |
| 删除误伤其他条目 | 中 | 低 | Spec AC-003 | TS-004 |
| 未保存修改被静默丢弃 | 中 | 中 | Spec AC-005 | TS-006 |
| 校验缺失导致脏数据写入 | 中 | 中 | Spec AC-006 | TS-007/008 |
| 意外发起网络请求（隐私红线） | 高 | 低 | Spec AC-008、AGENTS 约束 | TS-010 + 人工验证 |
| 照片过大撑爆存储配额 | 中 | 中 | Spec 业务规则（压缩降采样） | TS-011 |
| 重复保存产生不一致写入 | 低 | 低 | Spec 幂等规则 | TS-012 |

## Acceptance Traceability

| Acceptance | Scenario IDs | Test level | Automated target/path | Status/evidence |
| --- | --- | --- | --- | --- |
| AC-001 | TS-001 | Component | `src/options/**`（Vitest + Testing Library） | DESIGNED |
| AC-002 | TS-002, TS-003 | Component / Interaction | 同上 | DESIGNED |
| AC-003 | TS-004 | Component | 同上 | DESIGNED |
| AC-004 | TS-005 | Component | 同上 | DESIGNED |
| AC-005 | TS-006 | Component | 同上 | DESIGNED |
| AC-006 | TS-007, TS-008 | Unit / Component | 校验逻辑单测 + 表单组件测试 | DESIGNED |
| AC-007 | TS-009 | Component | 同上 | DESIGNED |
| AC-008 | TS-010 + 人工 | Integration（套件级）+ 人工 | 网络调用监视断言 + 真实浏览器 Network 面板 | DESIGNED |

## Test Scenarios

### TS-001: 首次打开展示空态引导并可录入

- Protects: `AC-001`
- Risk/type: `Happy`
- Given: 存储替身返回空数据
- When: 渲染配置页
- Then: 展示空态引导文案；表单可编辑
- Level: `Component`
- Automation target/path: options 页渲染测试
- Data/fixture/environment: 空档案 fixture
- Result/evidence: `NOT RUN`

### TS-002: 保存时全量数据正确写入存储

- Protects: `AC-002`（写入侧）
- Risk/type: `Happy`
- Given: 用户在表单中录入各分区数据（含多段经历、照片、自定义项）
- When: 点击保存
- Then: 存储替身收到与表单一致的完整档案；展示成功反馈
- Level: `Interaction`
- Automation target/path: options 页保存流程测试
- Data/fixture/environment: 全分区虚构数据
- Result/evidence: `NOT RUN`

### TS-003: 重新打开完整回显

- Protects: `AC-002`（回显侧）
- Risk/type: `Happy`
- Given: 存储替身返回已保存的完整档案
- When: 渲染配置页
- Then: 各分区字段、数组条目数量与内容、照片、自定义项全部回显
- Level: `Component`
- Automation target/path: options 页回显测试
- Data/fixture/environment: 全分区档案 fixture
- Result/evidence: `NOT RUN`

### TS-004: 删除单段经历仅移除目标条目

- Protects: `AC-003`
- Risk/type: `Boundary`
- Given: 已有 3 段教育经历
- When: 删除第 2 段并确认
- Then: 仅第 2 段被移除，其余顺序与内容不变
- Level: `Component`
- Automation target/path: 数组条目删除测试
- Data/fixture/environment: 3 段经历 fixture
- Result/evidence: `NOT RUN`

### TS-005: 保存失败展示可读错误且数据不丢

- Protects: `AC-004`
- Risk/type: `Error`
- Given: 存储替身写入被设为失败
- When: 点击保存
- Then: 展示可读错误与重试入口（不含简历内容）；表单数据保持；重试成功后正常保存
- Level: `Component`
- Automation target/path: options 页错误路径测试
- Data/fixture/environment: 可切换成败的存储替身
- Result/evidence: `NOT RUN`

### TS-006: 未保存修改关闭页面触发确认

- Protects: `AC-005`
- Risk/type: `UI`
- Given: 表单处于 dirty 状态
- When: 触发页面关闭/离开事件
- Then: 阻止默认行为并请求确认；clean 状态下不触发
- Level: `Component`
- Automation target/path: beforeunload 行为测试
- Data/fixture/environment: dirty/clean 两种状态
- Result/evidence: `NOT RUN`

### TS-007: 校验规则（必填+格式）

- Protects: `AC-006`（规则侧）
- Risk/type: `Boundary`
- Given: 校验函数
- When: 输入缺失姓名/非法手机号/非法邮箱/合法全量
- Then: 前三者分别报对应错误；合法数据通过；其余字段永不报错
- Level: `Unit`
- Automation target/path: 校验逻辑单测
- Data/fixture/environment: 边界值样本
- Result/evidence: `NOT RUN`

### TS-008: 校验失败阻止保存并定位错误

- Protects: `AC-006`（交互侧）
- Risk/type: `UI`
- Given: 必填字段为空
- When: 点击保存
- Then: 不发生存储写入；错误就近展示；焦点移至首个错误字段
- Level: `Component`
- Automation target/path: options 页校验交互测试
- Data/fixture/environment: 缺必填项表单
- Result/evidence: `NOT RUN`

### TS-009: 删除确认取消后数据不变

- Protects: `AC-007`
- Risk/type: `UI`
- Given: 已有多段经历
- When: 触发删除后选择取消
- Then: 条目与数据完全不变
- Level: `Component`
- Automation target/path: 删除取消测试（confirm 替身返回取消）
- Data/fixture/environment: confirm 测试替身
- Result/evidence: `NOT RUN`

### TS-010: 全流程零网络请求

- Protects: `AC-008`、隐私不变式
- Risk/type: `Auth`（隐私）
- Given: 测试环境对 `fetch`/`XMLHttpRequest` 安装监视
- When: 运行全部 options 页与存储层测试
- Then: 网络调用计数为 0
- Level: `Integration`（套件级断言）
- Automation target/path: 测试环境 setup 全局监视
- Data/fixture/environment: Vitest setup 文件
- Result/evidence: `NOT RUN`
- 补充：真实浏览器人工验证（DevTools Network 面板，录入/保存/重开全流程无请求）作为交付证据。

### TS-011: 照片压缩与不可用处理

- Protects: 业务规则（照片压缩降采样）、错误路径
- Risk/type: `Boundary / Error`
- Given: 超大图片 / 不支持格式
- When: 选择照片
- Then: 超大图被压缩降采样至约束内后纳入草稿；不可用格式给出可读提示且不影响其余数据
- Level: `Unit`
- Automation target/path: 图片处理单测（OffscreenCanvas/降级路径替身）
- Data/fixture/environment: 生成测试位图
- Result/evidence: `NOT RUN`

### TS-012: 保存幂等

- Protects: 幂等不变式
- Risk/type: `Concurrency`（重复动作）
- Given: 同一草稿
- When: 连续保存两次
- Then: 两次写入内容一致；无叠加/重复副作用
- Level: `Unit`
- Automation target/path: 存储层写入测试
- Data/fixture/environment: 存储替身
- Result/evidence: `NOT RUN`

## Non-functional and Compatibility Coverage

- Idempotency/duplicate: TS-012；保存按钮 Saving 期间禁用（UI-R1）
- Concurrency/transaction/consistency: `N/A - 单用户本地单写入面；多实例后写生效已在 Spec 接受`
- Retry/timeout/recovery: TS-005 覆盖手动重试；无超时概念（本地操作）
- Migration/backward compatibility: `N/A - 首个数据 Feature，无既有数据迁移`
- Performance/capacity: `N/A - 常规数据量极小；<1s 目标为 RECOMMENDED，实现后实测记录`
- Security/privacy: TS-010 + 错误信息脱敏断言（TS-005 中“不含简历内容”）
- Observability: `N/A - 无遥测；本地日志不含简历内容（代码评审检查项）`

## UI Coverage (If Applicable)

- Interaction/navigation: TS-002/004/006/008/009
- Loading/Empty/Error/Success: TS-001（Empty）、TS-005（Error）、TS-002（Success）；Loading 为瞬时态，组件测试中以存储替身延迟覆盖渲染分支
- Permission/validation: TS-007/008；权限 `N/A - 无权限体系`
- Responsive: 人工验证（桌面两档窗口宽度目视检查）——自动化收益低
- Accessibility: 人工键盘走查 + 语义检查（控件 label、错误关联、焦点顺序）；作为交付检查项记录证据
- E2E/visual regression: `N/A - 单页工具界面，无路由与视觉回归风险；真实浏览器人工验证替代`

## Open Test Questions

| ID | Question/blocker | `Critical/Non-critical` | Owner | Resolution/unblock condition | Status |
| --- | --- | --- | --- | --- | --- |
| TQ-001 | jsdom 环境无法覆盖真实 `chrome.storage` 行为 | `Non-critical` | Implementation | 存储层以接口隔离 + 替身单测；真实行为由交付前人工验证记录 | `RESOLVED`（替代验证已确认） |

## `TEST DESIGN READY` Evidence

| ID | Requirement | Result | Evidence/reason |
| --- | --- | --- | --- |
| TR-01 | Every core `AC-*` maps to at least one `TS-*`. | `YES` | Acceptance Traceability 表（AC-001~008 全覆盖） |
| TR-02 | Happy Path, major Alternative Flows, boundaries covered. | `YES` | TS-001/002/003（Happy）；TS-004/007（Boundary）；备选流对应 TS-005/006/009 |
| TR-03 | Error, Security, Regression risks covered. | `YES` | TS-005（Error）、TS-010（隐私/安全）、TS-012（回归性重复写入） |
| TR-04 | Idempotency/Concurrency/Consistency covered or N/A. | `YES` | TS-012；并发 N/A 理由已记录 |
| TR-05 | Retry/Migration/performance covered or N/A. | `YES` | TS-005 重试；迁移/性能 N/A 理由已记录 |
| TR-06 | UI interaction/state, Accessibility, E2E per risk. | `YES` | UI Coverage 节；a11y 与响应式为人工验证（理由已记录） |
| TR-07 | Levels target external behavior. | `YES` | 全部场景断言用户可见/存储可观测行为，不断言私有实现 |
| TR-08 | Environment/data/fixtures available. | `YES` | Vitest+jsdom+测试替身；虚构数据；无外部依赖 |
| TR-09 | Bug branch. | `YES`（N/A：新 Feature，非 Bug） | 无缺陷复现义务 |
| TR-10 | No Critical unverifiable / OPEN / DEFERRED. | `YES` | TQ-001 为 Non-critical 且 RESOLVED |

## `TEST DESIGN READY` Record

- Status: `PASS`
- Input manifest: Spec R2 Gate manifest + UI-R1 Gate manifest + 本文档 `TD-R1`（`sha256:5c2fb644552e37124884aa53902a14bad7503c7f32f4a0927f4e3356dff62c33`，不含本记录节）
- Evidence checklist result: `ALL YES`
- Critical Test Questions at `OPEN` or `DEFERRED`: `NONE`
- Validated Spec revision: `R2`
- Validated UI revision or complete skip-decision link: `UI-R1`
- Validated Test Design revision: `TD-R1`
- Validated at: 2026-08-27T15:05:00+08:00
- Decision Authority (named human + role): MaoyuanYang（Feature 决策人 / 仓库 owner）
- Approval source: feature-dev 会话内显式批准（2026-08-27）
- Approval scope: F001 测试设计全部范围与验证策略
