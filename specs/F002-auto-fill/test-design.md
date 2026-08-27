# Test Design: F002 一键自动填写

## Inputs and Environment

- Spec/Gate/revision: `specs/F002-auto-fill/spec.md` R2，`SPEC READY PASS`（2026-08-27）
- UX/UI/Gate/revision: `specs/F002-auto-fill/ui.md` UI-R1，`UI READY PASS`（2026-08-27）
- Upstream input manifest link/revisions: spec.md / ui.md Gate Records
- Test Design revision/change-log ID: `TD-R1`
- Issue: https://github.com/MaoyuanYang/CVBuilder/issues/4
- Test strategy/conventions: `docs/TESTING.md`（Unit/Component 自动化 + 真实站点人工验证；虚构数据）
- Environment/services: 本地 Node + Vitest + jsdom；DOM fixture 模拟典型网申表单；chrome 存储/消息以测试替身注入
- Test data/fixtures: 典型网申 DOM 样本（label[for] 型、包裹 label 型、placeholder 型、表格行首 th 型）、虚构简历数据
- Known constraints: jsdom 无法代表真实站点多样性；命中率以交付前真实站点人工验证补证

## Risk Inventory

| Risk/invariant | Impact | Likelihood | Evidence | Planned coverage |
| --- | --- | --- | --- | --- |
| 标签提取单一策略漏配 | 高 | 高 | Spec 风险节 | TS-111 |
| 受控组件填值不生效 | 高 | 中 | AGENTS 持久坑 | TS-102 |
| 误覆盖用户已填内容 | 高 | 中 | 决策“非空跳过” | TS-104/TS-110 |
| 误提交 | 高 | 低 | 永久红线 | TS-106 |
| 选项匹配过松导致错选 | 中 | 中 | 决策“规范化包含” | TS-105 |
| 多段经历误配结构化字段 | 中 | 中 | 决策“仅 1 段参与” | TS-112 |
| 单字段异常中断整体 | 中 | 低 | Spec AC-008 | TS-108 |
| 隐私（网络/日志） | 高 | 低 | 零网络原则 | TS-109 |

## Acceptance Traceability

| Acceptance | Scenario IDs | Test level | Automated target/path | Status/evidence |
| --- | --- | --- | --- | --- |
| AC-001 | TS-101, TS-111 | Integration/Unit | `src/content/**` 填写引擎 + 标签提取 | DESIGNED + 真机命中率补证 |
| AC-002 | TS-102 | Unit | 填值工具（原生 setter + 事件） | DESIGNED |
| AC-003 | TS-103 | Integration | 填写引擎 | DESIGNED |
| AC-004 | TS-104, TS-110 | Integration | 填写引擎 | DESIGNED |
| AC-005 | TS-105 | Unit | 选项匹配 | DESIGNED |
| AC-006 | TS-106, TS-113 | Integration/Component | 填写引擎 + popup | DESIGNED |
| AC-007 | TS-107 | Component | popup | DESIGNED |
| AC-008 | TS-108 | Integration | 填写引擎 | DESIGNED |
| AC-009 | TS-109 | Integration（套件级） | setup 网络监视 | DESIGNED + 真机 Network 补证 |

## Test Scenarios

### TS-101: 典型表单命中字段被填入并高亮

- Protects: `AC-001`
- Risk/type: `Happy`
- Given: DOM fixture 含 label[for]“姓名”、包裹 label“手机号”、placeholder“邮箱”、表格行首“自我评价”等字段，且简历数据齐全
- When: 运行填写引擎
- Then: 各命中字段值等于对应数据项；字段带高亮标记；结果含 filled 明细
- Level: `Integration`
- Automation target/path: `src/content/fill.test.ts`
- Data/fixture/environment: 多形态标签 DOM + 虚构简历
- Result/evidence: `NOT RUN`

### TS-102: 受控组件填值被框架状态接受

- Protects: `AC-002`
- Risk/type: `Regression`（AGENTS 持久坑）
- Given: input 的 value 属性被“框架式”自定义 setter 覆盖并记录状态
- When: 填值工具写入
- Then: 使用原生 setter 写入且派发 input/change 事件；“框架状态”更新
- Level: `Unit`
- Automation target/path: `src/content/setValue.test.ts`
- Data/fixture/environment: jsdom + 属性描述符覆盖
- Result/evidence: `NOT RUN`

### TS-103: 未识别字段保持原状并计入未命中

- Protects: `AC-003`
- Risk/type: `Boundary`
- Given: 标签为无意义文本的字段
- When: 运行填写引擎
- Then: 字段值不变；结果 unmatched 含该标签
- Level: `Integration`
- Automation target/path: `src/content/fill.test.ts`
- Data/fixture/environment: 同 TS-101 fixture 加噪声字段
- Result/evidence: `NOT RUN`

### TS-104: 非空字段跳过且计数

- Protects: `AC-004`
- Risk/type: `Happy/Boundary`
- Given: “姓名”字段已有值“王五”
- When: 运行填写引擎
- Then: 原值不变；skipped 含“姓名”；filled 不含
- Level: `Integration`
- Automation target/path: `src/content/fill.test.ts`
- Data/fixture/environment: 预填值 fixture
- Result/evidence: `NOT RUN`

### TS-105: 选项类控件规范化包含匹配

- Protects: `AC-005`
- Risk/type: `Boundary`
- Given: select 选项“本科 ”、radio“上海市”、数据值“本科”“上海”
- When: 匹配
- Then: 选中对应选项；完全无关选项不选中
- Level: `Unit`
- Automation target/path: `src/content/matchOptions.test.ts`
- Data/fixture/environment: 选项 DOM 样本
- Result/evidence: `NOT RUN`

### TS-106: 流程不触发提交且结果含计数与列表

- Protects: `AC-006`、永久红线
- Risk/type: `Auth`（安全）
- Given: fixture 含 form 与 submit 按钮，监视 submit 事件与 form.submit
- When: 运行填写引擎
- Then: 无 submit 触发；结果含 filled/skipped/unmatched 计数与逐项明细
- Level: `Integration`
- Automation target/path: `src/content/fill.test.ts`
- Data/fixture/environment: 含 form 的 fixture
- Result/evidence: `NOT RUN`

### TS-107: 无数据时 popup 禁用并引导

- Protects: `AC-007`
- Risk/type: `UI`
- Given: 存储替身返回空
- When: 渲染 popup
- Then: “自动填写”禁用；展示引导与配置页入口
- Level: `Component`
- Automation target/path: `src/popup/Popup.test.tsx`
- Data/fixture/environment: 空存储替身
- Result/evidence: `NOT RUN`

### TS-108: 单字段异常不中断整体

- Protects: `AC-008`
- Risk/type: `Error`
- Given: 某字段 setter 抛异常（描述符覆盖 throw）
- When: 运行填写引擎
- Then: 其余字段正常填写；该字段计入未命中（reason=填写失败）
- Level: `Integration`
- Automation target/path: `src/content/fill.test.ts`
- Data/fixture/environment: 异常字段 fixture
- Result/evidence: `NOT RUN`

### TS-109: 零网络请求

- Protects: `AC-009`
- Risk/type: `Auth`（隐私）
- Given: 套件级网络监视
- When: 运行全部 F002 测试
- Then: 网络调用为 0
- Level: `Integration`（套件级）
- Automation target/path: `src/test/setup.ts` 既有监视
- Data/fixture/environment: Vitest setup
- Result/evidence: `NOT RUN`
- 补充：真机 DevTools Network 人工验证。

### TS-110: 重复触发幂等

- Protects: `AC-004`、幂等不变式
- Risk/type: `Concurrency`（重复动作）
- Given: 已运行一次填写
- When: 再次运行
- Then: 已填字段进入 skipped；页面无叠加变化；结果计数自洽
- Level: `Integration`
- Automation target/path: `src/content/fill.test.ts`
- Data/fixture/environment: 同 TS-101
- Result/evidence: `NOT RUN`

### TS-111: 标签提取策略优先级

- Protects: `AC-001`（提取侧）
- Risk/type: `Boundary`
- Given: 同一字段同时存在 label[for]、placeholder、aria-label 且文本不同
- When: 提取标签
- Then: 取 label[for] 文本；缺 label 时依次回退包裹 label → aria → placeholder → 前序文本
- Level: `Unit`
- Automation target/path: `src/content/extractLabel.test.ts`
- Data/fixture/environment: 组合标签 fixture
- Result/evidence: `NOT RUN`

### TS-112: 数组条目匹配规则

- Protects: 业务规则（仅 1 段参与匹配）
- Risk/type: `Boundary`
- Given: 1 段教育经历时“学校”字段；2 段时同字段
- When: 匹配
- Then: 1 段命中填入；2 段计入未命中
- Level: `Unit`
- Automation target/path: `src/content/match.test.ts`
- Data/fixture/environment: 两种简历样本
- Result/evidence: `NOT RUN`

### TS-113: popup 展示计数与分组列表

- Protects: `AC-006`（展示侧）
- Risk/type: `UI`
- Given: 填写结果含 filled/skipped/unmatched 各若干
- When: 渲染 popup result 态
- Then: 展示三类计数与分组逐项列表
- Level: `Component`
- Automation target/path: `src/popup/Popup.test.tsx`
- Data/fixture/environment: 结果 fixture + 消息替身
- Result/evidence: `NOT RUN`

### TS-114: popup 错误态与重试

- Protects: Alternative Flow（消息失败）
- Risk/type: `Error`
- Given: 消息替身首次失败
- When: 触发填写
- Then: 展示可读错误 + 重试；重试成功后进入 result
- Level: `Component`
- Automation target/path: `src/popup/Popup.test.tsx`
- Data/fixture/environment: 可切换成败的消息替身
- Result/evidence: `NOT RUN`

## Non-functional and Compatibility Coverage

- Idempotency/duplicate: TS-110
- Concurrency/transaction/consistency: `N/A - 只读存储、单触发禁用并发`
- Retry/timeout/recovery: TS-114 手动重试；无超时概念
- Migration/backward compatibility: `N/A - 无持久化`
- Performance/capacity: `N/A - <2s 目标为 RECOMMENDED，实现后实测记录`
- Security/privacy: TS-109 + 不输出简历内容（评审检查项）
- Observability: `N/A - 无遥测`

## UI Coverage (If Applicable)

- Interaction/navigation: TS-107/113/114
- Loading/Empty/Error/Success: filling/disabled/error/result 四态覆盖
- Permission/validation: `N/A - 无权限体系、无表单校验`
- Responsive: 人工目视（popup 固定宽）
- Accessibility: 人工键盘走查 + 语义检查（交付检查项）
- E2E/visual regression: `N/A - 真实站点以人工验证替代（命中率/Network/高亮目视）`

## Open Test Questions

| ID | Question/blocker | `Critical/Non-critical` | Owner | Resolution/unblock condition | Status |
| --- | --- | --- | --- | --- | --- |
| TQ-001 | jsdom 无法代表真实站点多样性 | `Non-critical` | Implementation | 交付前真机 ≥3 页面人工验证（MVP 成功标准） | `RESOLVED`（替代验证已确认） |

## `TEST DESIGN READY` Evidence

| ID | Requirement | Result | Evidence/reason |
| --- | --- | --- | --- |
| TR-01 | Every core `AC-*` maps to at least one `TS-*`. | `YES` | Traceability 表（AC-001~009） |
| TR-02 | Happy Path, major Alternative Flows, boundaries covered. | `YES` | TS-101/104/110（Happy）；TS-103/105/111/112（Boundary）；TS-107/114（Alternative） |
| TR-03 | Error, Security, Regression risks covered. | `YES` | TS-108/114（Error）、TS-106/109（安全）、TS-102（Regression） |
| TR-04 | Idempotency/Concurrency/Consistency covered or N/A. | `YES` | TS-110；并发 N/A 理由已记录 |
| TR-05 | Retry/Migration/performance covered or N/A. | `YES` | TS-114；其余 N/A 理由已记录 |
| TR-06 | UI interaction/state, Accessibility, E2E per risk. | `YES` | UI Coverage 节 |
| TR-07 | Levels target external behavior. | `YES` | 断言页面值/选中态/结果载荷，不断言私有实现 |
| TR-08 | Environment/data/fixtures available. | `YES` | jsdom + DOM fixture + 替身 |
| TR-09 | Bug branch. | `YES`（N/A：新 Feature） | 无 |
| TR-10 | No Critical unverifiable / OPEN / DEFERRED. | `YES` | TQ-001 Non-critical 且 RESOLVED |

## `TEST DESIGN READY` Record

- Status: `PASS`
- Input manifest: Spec R2 Gate manifest + UI-R1 Gate manifest + 本文档 `TD-R1`（`sha256:f7f20dc3b4e0cbba77a40e9011d8667cf214e0f050e9e2523f66045325851e05`，不含本记录节）
- Evidence checklist result: `ALL YES`
- Critical Test Questions at `OPEN` or `DEFERRED`: `NONE`
- Validated Spec revision: `R2`
- Validated UI revision: `UI-R1`
- Validated Test Design revision: `TD-R1`
- Validated at: 2026-08-27T17:20:00+08:00
- Decision Authority (named human + role): MaoyuanYang（Feature 决策人 / 仓库 owner）
- Approval source: feature-dev 会话内显式批准（2026-08-27）
- Approval scope: F002 测试设计全部范围与验证策略
