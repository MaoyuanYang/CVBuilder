# Implementation Plan: F002 一键自动填写

## Ready Inputs

- Spec: `specs/F002-auto-fill/spec.md` / `SPEC READY Status: PASS` / revision: `R2`
- UX/UI: `specs/F002-auto-fill/ui.md` / `UI READY Status: PASS` / revision: `UI-R1`
- Test Design: `specs/F002-auto-fill/test-design.md` / `TEST DESIGN READY Status: PASS` / revision: `TD-R1`
- Complete controlling-input manifest: spec/ui/test-design Gate Records；F001 spec R2（DONE）；ADR-0001；ARCHITECTURE @ `e6f508c`；AGENTS @ `7195e08`
- Plan revision/change-log ID: `PLAN-R1`
- Plan Status: `CURRENT`
- Issue/work item: https://github.com/MaoyuanYang/CVBuilder/issues/4
- Stage activity (operational; not a semantic Gate input): `STAGE.md` A-003
- Applicable AGENTS/architecture docs: `AGENTS.md`、`docs/ARCHITECTURE.md`、`docs/FRONTEND.md`

## Requirement Guardrail

- Scope/Acceptance changes proposed by this Plan: `NONE`
- If not NONE: `STOP`; update Spec/Test Design through Design Change before continuing.

## Current and Target Flow

### Current

F001 已交付：存储层 + options 页；无 popup、无 content script。

### Target

```text
popup 打开 -> 存储判空 -> disabled(idle)
点击自动填写 -> tabs.sendMessage({type:"autofill"})
content script: 扫描字段 -> 提取标签 -> 别名匹配 -> 取值（含数组单段规则）
-> 非空跳过 / 空则填值（原生 setter + 事件）-> 高亮 -> 结果载荷回报
popup: result（计数 + 分组列表）| error（重试）
```

## Affected Surface

| Module/page/file | `Add/Modify/Delete` | Responsibility/change | Constraint/reuse |
| --- | --- | --- | --- |
| `public/manifest.json` | `Modify` | 增加 `action.default_popup`、`content_scripts`（`<all_urls>`，`document_idle`） | 权限不变（storage/unlimitedStorage） |
| `vite.content.config.ts` | `Add` | content script 独立 IIFE 构建至 `dist/content.js` | MV3 content script 需单文件非模块 |
| `package.json` | `Modify` | `build` = 页面构建 + content 构建 | - |
| `popup.html`, `src/popup/**` | `Add` | popup 状态机、结果列表、引导/错误态 | 复用 F001 样式变量 |
| `src/content/extractLabel.ts` | `Add` | 多策略标签提取 | Spec 标签策略顺序 |
| `src/content/normalize.ts` | `Add` | 文本规范化 | - |
| `src/content/aliasDictionary.ts` | `Add` | 数据项键 ↔ 中英别名 | 工程命名 en |
| `src/content/matchOptions.ts` | `Add` | 选项规范化包含匹配 | - |
| `src/content/setValue.ts` | `Add` | 原生 setter + input/change 派发 | AGENTS 持久坑规则 |
| `src/content/fillEngine.ts` | `Add` | 扫描→匹配→填值→高亮→结果 | 不触发提交 |
| `src/content/highlight.ts` | `Add` | 隔离命名空间样式注入 | 不污染页面 |
| `src/content/index.ts` | `Add` | 消息监听入口 | - |
| 测试（`*.test.ts(x)`） | `Add` | TS-101~114 | `docs/TESTING.md` |
| `specs/F002-auto-fill/review.md` | `Add` | Review/DONE 记录 | 交付阶段 |

## Implementation Approach

### Domain / Application

- 别名词典键（英文）与覆盖：`name, gender, birthDate, phone, email, city, hometown, ethnicity, politicalStatus, targetPosition, expectedSalary, expectedCity, availableTime, school, major, degree, gpa, company, position, projectName, role, techStack, selfEvaluation`；每键含中英别名（如 phone: 手机号/手机/电话/联系电话/mobile/phone）。
- 取值规则：基本信息/求职意向单值直取；`school/major/degree/gpa` 仅当 `education.length===1`；`company/position` 仅当 `work.length===1`；`projectName/role/techStack` 仅当 `project.length===1`；`selfEvaluation` 直取；其余（含 startDate/endDate、多段描述）不参与匹配（计入未命中）。
- 字段扫描：`input`（无 type/text/email/tel/url）、`textarea`、`select`、radio 组（按 name 归组）、checkbox 组；跳过 hidden/disabled/readonly。
- 非空判定：input/textarea 值 trim 非空；select 有选中值；radio/checkbox 组有 checked。

### Data / Migration

- 只读 `resumeProfile`（经存储层 `loadProfile`）；无写入、无迁移。

### API / Integration

- 消息契约：popup → `chrome.tabs.sendMessage(activeTab, { type: "autofill" })`；content 回应 `{ filled: [{label, value}], skipped: [{label}], unmatched: [{label, reason}] }`；无监听时 popup 捕获错误进入 error 态。

### Transaction / Idempotency / Concurrency / Consistency

- 幂等：重复触发时已填字段非空被跳过（TS-110）。
- 并发：filling 期间按钮禁用。

### Cache / Messaging / Retry / Timeout

- 无缓存；失败手动重试。

### Frontend State / Components / UI States

- popup 状态机按 UI-R1：`disabled | idle | filling | result | error`。
- 结果列表按 已填/跳过/未命中 分组，限高滚动。
- 高亮：注入 `<style>`，命名空间类 `.cvbuilder-filled`（2px 轮廓，语义色，深色适配）。

### Security / Validation / Error Handling

- 不点击提交按钮、不派发 submit；不向页面全局暴露对象。
- 单字段异常捕获计入未命中（reason=填写失败）。
- 错误文案不含简历内容。

### Observability

- 无遥测；不输出简历内容日志。

## Test Execution Plan

| Scenario IDs | Test target/path | When to run | Required result |
| --- | --- | --- | --- |
| TS-105, TS-111, TS-112 | `src/content/matchOptions.test.ts` / `extractLabel.test.ts` / `match.test.ts` | T2 | PASS |
| TS-102 | `src/content/setValue.test.ts` | T3 | PASS |
| TS-101, TS-103, TS-104, TS-106, TS-108, TS-110 | `src/content/fill.test.ts` | T3 | PASS |
| TS-107, TS-113, TS-114 | `src/popup/Popup.test.tsx` | T4 | PASS |
| TS-109 | 套件级监视 | 每次 | 零调用 |
| AC-001/009 真机（命中率≥70%、Network 0、高亮目视） | 真实站点人工验证 | T6 | 记录入交付证据 |

## Rollout, Compatibility, and Rollback

- Migration/backfill: `N/A - 无持久化`
- Feature flag/staged rollout: `N/A - 单用户本地扩展`
- Breaking change: `NO`
- Rollback: 撤销提交/卸载扩展。

## Risks and Decisions

| Risk/decision | Level | Mitigation/choice | Needs confirmation/ADR? |
| --- | --- | --- | --- |
| content script 需 IIFE 单文件，与页面 ESM 构建不同 | 中 | 双 vite 配置；`build` 串联 | 否（ADR-0001 范围内） |
| `<all_urls>` content_scripts 扩大注入面 | 中 | 仅监听自定义消息、零网络、样式隔离；权限不新增 | 否 |
| 别名词典初版覆盖不足 | 中 | 真机验证后迭代词典（属本 Feature 收尾） | 否 |
| radio/checkbox 组标签提取形态多样 | 中 | 组级标签策略（fieldset/legend、首项前序文本）+ 未命中兜底 | 否 |

## Interleaved Tasks

- [x] T1: manifest + 双构建管线 + popup/content 骨架 + 冒烟；完成条件：`npm run build` 产出 options/popup/content.js，骨架测试绿
- [x] T2: normalize/aliasDictionary/matchOptions/extractLabel + 单测；完成条件：TS-105/111/112 PASS
- [x] T3: setValue + fillEngine + 集成测试；完成条件：TS-101/102/103/104/106/108/110 PASS
- [x] T4: popup 状态机 + 结果列表 + 消息接线 + 组件测试；完成条件：TS-107/113/114 PASS，全套件绿
- [x] T5: typecheck + build 全绿 + 自评审准备
- [ ] T6: 真机验证（≥3 页面命中率、Network 0、高亮、popup 列表）+ review + 文档同步 + 交付

## Start Checklist

- [x] All required Gates are PASS（SPEC/UI/TEST DESIGN READY records 在对应文档）
- [x] Gate input manifests match current working-tree artifact revisions
- [x] Plan MUST NOT redefine Scope, rules, contract, or Acceptance（Guardrail: NONE）
- [x] File/module impact is consistent with project architecture（Content Script 模块边界一致）
- [x] Major dependency/architecture/migration decisions are confirmed（双构建在 ADR-0001 技术栈内；无新依赖）
- [x] Tasks interleave code, tests, and docs
- [x] Each Task has a verification point
