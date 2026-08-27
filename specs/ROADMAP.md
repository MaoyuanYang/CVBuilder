# Feature Roadmap

## Product Milestone

[CONFIRMED] Phase 1（MVP）：求职者可在配置页一次性录入简历数据，在任意网申页面一键自动填写（文本框/多行文本/原生下拉/单选/复选），未命中字段手动兜底，手动纠正按域名记忆；已填字段高亮待人工复核，绝不代提交。范围：Chrome/Edge、中文界面、全本地存储。

## Status Contract

| Status | Meaning |
| --- | --- |
| `DRAFT` | Feature is mapped at macro level and remains intentionally shallow. |
| `NEXT` | The sole Feature selected for refinement by `feature-dev`. |
| `READY` | `SPEC READY`, `UI READY` or an explicit UI skip, `TEST DESIGN READY`, and a valid current Plan and Tasks; `coding-start` MUST NOT set it. |
| `IN_PROGRESS` | Implementation is active. |
| `REVIEW` | Implementation and evidence are under review. |
| `DONE` | Delivery and documentation sync are complete. |
| `BLOCKED` | A named blocker prevents progress. |

## Feature Map

| ID | Name | Goal | Business Value | Priority | Dependencies | Roadmap Status | Fact Status | Summary / Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `F001` | 简历数据录入 | 用户在配置页录入并本地持久化全部简历数据 | 一切填写能力的前提；本身即结构化简历存档 | `P0` | 无 | `DONE` | `CONFIRMED` | 已交付：PR #3 squash 合并（main @ `12af027`，2026-08-27）；23 项自动化测试 + 真机验证通过；review.md DONE PASS |
| `F002` | 一键自动填写 | 网申页面一键填写命中字段并高亮汇报 | 产品核心价值；验证“标签识别+别名匹配”关键假设 | `P0` | `F001` | `DRAFT` | `CONFIRMED` | popup 触发；扫描字段→提取标签→匹配→填值（含 radio/checkbox）→高亮+计数 |
| `F003` | 手动兜底填写 | 未命中字段点击选值填入 | 保证 100% 字段可达，兜住结构差异 | `P0` | `F002` | `DRAFT` | `CONFIRMED` | 点击字段唤起页内浮层，列出数据项选择填入 |
| `F004` | 按域名规则记忆 | 手动纠正映射按域名记忆并优先应用 | 重复投递同站点时不重复劳动，越用越准 | `P0` | `F003` | `DRAFT` | `CONFIRMED` | 纠正/补填回写域名规则；填写时规则优先于词典 |

Use only `DRAFT/NEXT/READY/IN_PROGRESS/REVIEW/DONE/BLOCKED`.

## Dependency View

```text
[CONFIRMED] F002 -> F001  # 自动填写依赖已录入的简历数据
[CONFIRMED] F003 -> F002  # 兜底复用 F002 的字段识别与填值能力
[CONFIRMED] F004 -> F003  # 记忆源自兜底/纠正行为，并在填写时优先应用
```

## Handoff

### Branch A: Confirmed NEXT

- Feature: `F001 简历数据录入`
- Selection: `[CONFIRMED]` by MaoyuanYang（仓库 owner / Roadmap 决策人），2026-08-26
- Why now: `[CONFIRMED]` 最小的端到端闭环（录入→存储→回读），零第三方页面不确定性；建立后续全部 Feature 依赖的数据模型与存储边界。
- Dependencies satisfied: `[CONFIRMED]` 无前置 Feature 依赖。
- Expected learning: `[RECOMMENDED]` 简历数据存储结构形态与 Preact 分区表单的编辑体验；验证“存储层封装”边界是否顺手。
- Refinement still required: `[UNKNOWN, NON_BLOCKING]` 具体数据项集合与校验规则；删除确认交互；存储容量边界处理。

## Sequencing Notes

- [RECOMMENDED] F002 紧随 F001：命中率是本项目最高风险假设，应尽早用真实站点验证，不被低优先级事项推迟。
- [RECOMMENDED] F003/F004 顺序不可颠倒：规则记忆的数据来源依赖兜底行为。

## Roadmap Risks

- [CONFIRMED] 真实网申站点结构差异导致 F002 命中率不达标 - Mitigation / decision point: 手动兜底 + 域名记忆保底；MVP 验收按成功标准实测，<70% 时回到匹配策略迭代。
- [CONFIRMED] 复杂自定义组件（日期/级联）短期无法自动化 - Mitigation / decision point: MVP 明确排除并依赖人工输入；后续版本再评估。
- [RECOMMENDED] 单人维护的开源项目进度风险 - Mitigation / decision point: 按 P0 顺序小步交付；Revisit when: 任一 Feature 停滞超过预期。
