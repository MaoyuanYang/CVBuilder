# Implementation Plan: F001 简历数据录入

## Ready Inputs

- Spec: `specs/F001-resume-data-entry/spec.md` / `SPEC READY Status: PASS` / revision: `R2`
- UX/UI: `specs/F001-resume-data-entry/ui.md` / `UI READY Status: PASS` / revision: `UI-R1`
- Test Design: `specs/F001-resume-data-entry/test-design.md` / `TEST DESIGN READY Status: PASS` / revision: `TD-R1`
- Complete controlling-input manifest: 见 spec.md Gate Record（ADR-0001 Accepted、ARCHITECTURE、DATABASE @ `e6f508c`；AGENTS.md @ `sha256:278a7053…`）；ui.md / test-design.md Gate Records
- Plan revision/change-log ID: `PLAN-R1`
- Plan Status: `CURRENT`
- Issue/work item: https://github.com/MaoyuanYang/CVBuilder/issues/2
- Stage activity (operational; not a semantic Gate input): `STAGE.md` A-002
- Applicable AGENTS/architecture docs: `AGENTS.md`、`docs/ARCHITECTURE.md`、`docs/DATABASE.md`、`docs/FRONTEND.md`

## Requirement Guardrail

- Scope/Acceptance changes proposed by this Plan: `NONE`
- If not NONE: `STOP`; update Spec/Test Design through Design Change before continuing.

## Current and Target Flow

### Current

无代码、无构建体系（仓库仅文档与规格）。

### Target

```text
用户打开 options 页（options.html）
-> App 初始化：经存储层读取档案（chrome.storage.local）
-> 渲染分区表单（受控）；空数据 -> 空态引导
-> 编辑 -> dirty；照片选择 -> 压缩降采样后入草稿
-> 保存 -> 校验 -> 存储层整体写入 -> 成功提示；失败 -> 错误+重试
-> dirty 时注册关闭确认
```

## Affected Surface

| Module/page/file | `Add/Modify/Delete` | Responsibility/change | Constraint/reuse |
| --- | --- | --- | --- |
| `package.json`, `tsconfig.json`, `vite.config.ts`, `.gitignore` 微调 | `Add` | 工程基础设施（Vite+TS+Preact+Vitest） | ADR-0001 技术栈 |
| `manifest.json`（MV3） | `Add` | 扩展清单：`options_ui`、`storage` + `unlimitedStorage` 权限 | 零网络；不含多余权限 |
| `options.html`, `src/options/**` | `Add` | 配置页 UI 与状态机 | `docs/FRONTEND.md`：壳层持状态、分区受控编辑 |
| `src/shared/types.ts` | `Add` | ResumeProfile 类型（英文标识符） | 工程语言=en |
| `src/shared/storage.ts` | `Add` | 存储层封装（唯一触碰 `chrome.storage` 的模块） | `docs/ARCHITECTURE.md` 模块边界 |
| `src/shared/validation.ts` | `Add` | 轻校验规则 | Spec 业务规则 |
| `src/options/image.ts` | `Add` | 照片压缩降采样 | 边长 ≤512、JPEG |
| 测试（与源码同域 `*.test.ts(x)`） | `Add` | TS-001~012 自动化 | `docs/TESTING.md` |
| `README.md`, `AGENTS.md`, `docs/TESTING.md` | `Modify` | 回填真实 Start/Build/Test 命令 | 工具链建立后同步（AGENTS 要求） |

## Implementation Approach

### Domain / Application

- 数据模型（键名英文，结构随本计划落地，属 Spec 授权范围）：
  - `ResumeProfile`：`basicInfo`、`intention`、`education[]`、`work[]`、`project[]`、`skills[]`、`selfEvaluation`、`customFields[]`、`updatedAt`（ISO 8601）。
  - `basicInfo`: `name, gender, birthDate, phone, email, city, hometown, ethnicity, politicalStatus, photoDataUrl`。
  - `intention`: `targetPosition, expectedSalary, expectedCity, availableTime`。
  - 经历条目字段与 Spec 数据项集合一一对应；时间用字符串（`YYYY-MM` 或 ISO，输入控件值直存）。
  - `customFields`: `{ key: string; value: string }[]`；保存时丢弃空键行（UIQ-001 决议）。
- 页面状态机按 UI-R1：`Loading / Empty / Loaded(clean|dirty) / Saving / Saved / SaveFailed / LoadError`。

### Data / Migration

- 存储键：`resumeProfile`（唯一键，整体覆盖写）。
- 无迁移（首版）；读取到损坏数据时按加载失败路径处理（可读错误+重试），不静默覆盖。

### API / Integration

- 无网络、无消息通信（F001 范围内）。

### Transaction / Idempotency / Concurrency / Consistency

- 保存 = 单键整体写入，幂等（TS-012）；多实例后写生效（Spec 已接受）。

### Cache / Messaging / Retry / Timeout

- 无。失败重试为用户手动动作。

### Frontend State / Components / UI States

- 壳层 `App`：持有草稿状态、状态机、加载/保存调用、关闭确认注册。
- 分区组件为受控组件，仅接收值与回调；不直接访问存储。
- 数组条目统一“条目卡片 + 添加/删除（原生确认）”模式；自定义项为行式键值输入。
- 保存栏：保存按钮（Saving 期禁用）、未保存指示、成功/失败提示。
- 样式：单列限宽居中；CSS 变量语义色；`prefers-color-scheme` 深色。

### Security / Validation / Error Handling

- 校验：`name/phone/email` 必填+基础格式（手机号 11 位数字形态；邮箱基本形态）；其余不校验；保存时统一校验、焦点定位首个错误。
- 错误信息只描述失败动作，不含简历内容（评审检查项 + TS-005 断言）。
- 照片：`createImageBitmap`/`canvas` 降采样至边长 ≤512，JPEG q≈0.85 存 `data:` URL；失败/不支持格式 -> 就地提示、不阻塞其余保存。

### Observability

- 无遥测；不输出简历内容到日志（评审检查项）。

## Test Execution Plan

| Scenario IDs | Test target/path | When to run | Required result |
| --- | --- | --- | --- |
| TS-007, TS-012 | `src/shared/validation.test.ts`, `src/shared/storage.test.ts` | T2/T3 | PASS |
| TS-011 | `src/options/image.test.ts` | T3 | PASS |
| TS-001, TS-003, TS-004, TS-006, TS-009 | `src/options/App.*.test.tsx`（渲染/回显/删除/关闭确认） | T4 | PASS |
| TS-002, TS-005, TS-008 | `src/options/App.save.test.tsx` | T5 | PASS |
| TS-010 | Vitest setup 全局网络监视（全部套件） | 每次运行 | 零调用 |
| AC-002/008 真实环境 + 响应式 + a11y 走查 | 真实浏览器人工验证记录 | T6 | 记录入交付证据 |

## Rollout, Compatibility, and Rollback

- Migration/backfill: `N/A - 首版无既有数据`
- Feature flag/staged rollout: `N/A - 单用户本地扩展`
- Breaking change: `NO`
- Rollback: 卸载扩展即回到无数据状态；代码回滚即撤销提交。

## Risks and Decisions

| Risk/decision | Level | Mitigation/choice | Needs confirmation/ADR? |
| --- | --- | --- | --- |
| jsdom 无真实 `chrome.storage` | 中 | 存储层接口化 + 测试替身；真实行为人工验证（TQ-001 已决议） | 否 |
| jsdom 缺 `canvas`/`createImageBitmap` | 中 | 图片处理以可注入的解码/缩放缝隔离，测试用桩 | 否 |
| `beforeunload` 在测试环境行为差异 | 低 | 以“dirty 时注册/触发后 preventDefault”为断言口径 | 否 |
| `unlimitedStorage` 权限引入 | 低 | 仅用于照片体积余量；清单权限最小化评审 | 否（ADR-0001 范围内） |
| `@testing-library/preact` 与 Vitest 适配 | 低 | T1 冒烟验证，不匹配则降级为手工渲染断言 | 否 |

## Interleaved Tasks

- [x] T1: 脚手架（package/manifest/vite/tsconfig/test runner）+ 冒烟测试；完成条件：`npm test`、`npm run build` 通过，命令回填 README/AGENTS/TESTING
- [x] T2: `types.ts` + `storage.ts` + 存储层测试（含幂等、网络监视 setup）；完成条件：TS-010/012 PASS
- [x] T3: `validation.ts` + `image.ts` + 单测；完成条件：TS-007/011 PASS
- [x] T4: options 页壳层与分区组件 + 状态机 + 交互测试；完成条件：TS-001/003/004/006/009 PASS
- [x] T5: 保存/校验/错误路径完整闭环；完成条件：TS-002/005/008 PASS，全套件绿
- [x] T6: 真实浏览器人工验证（加载、回显、零网络、响应式、a11y 走查）+ `LICENSE` + 文档同步 + 评审；完成条件：人工验证记录 + Review 完成（2026-08-27 用户真机验证通过；期间发现并修复加载死循环）

## Start Checklist

- [x] All required Gates are PASS（SPEC READY / UI READY / TEST DESIGN READY，records 在对应文档）
- [x] Gate input manifests match current working-tree artifact revisions（spec/ui/test-design 哈希均为工作树实测）
- [x] Plan MUST NOT redefine Scope, rules, contract, or Acceptance（Guardrail: NONE）
- [x] File/module impact is consistent with project architecture（模块边界与 `docs/ARCHITECTURE.md` 一致）
- [x] Major dependency/architecture/migration decisions are confirmed（均在 ADR-0001 与 Spec 范围内；无迁移）
- [x] Tasks interleave code, tests, and docs
- [x] Each Task has a verification point
