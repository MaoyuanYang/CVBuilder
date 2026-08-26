# Product

## Vision

- [CONFIRMED] 求职应该把时间花在匹配岗位上，而不是重复填表。CVBuilder 让求职者只维护一份简历数据，在任意网申页面一键填写。

## Problem

- [CONFIRMED] 国内公司官网与网申系统（自建或第三方）普遍要求逐项填写在线简历表单：基本信息、教育经历、工作/实习经历、项目经历、技能、自我评价等。每次投递都要重复手工输入数分钟到数十分钟，枯燥且容易填错；直接投递附件简历通常不被接受。

## Target Users

| User / Role | Need | Relevant permissions or boundary | Status |
| --- | --- | --- | --- |
| 求职者（主要用户） | 一次录入简历，网申页面一键填写 | 只能操作自己浏览器内的数据；提交动作始终由本人完成 | `CONFIRMED` |
| 开源社区参与者 | 使用、定制、改进扩展 | MIT 许可；不接触其他用户数据（无服务端） | `CONFIRMED` |

## Primary Scenarios

1. [CONFIRMED] 首次设置：用户打开扩展配置页，录入基本信息与各段经历，保存到本地。
2. [CONFIRMED] 网申填写：用户打开网申页面，点击 popup 的“自动填写”；扩展识别字段并填入，高亮已填字段并汇报结果；用户人工检查后自行提交。
3. [CONFIRMED] 手动兜底：对未命中的字段，用户点击该字段，在页内浮层选择数据项填入。
4. [CONFIRMED] 规则记忆：用户手动纠正/补填的“字段→数据项”映射按域名记忆，下次同域名优先使用。

## Core Value

- [CONFIRMED] 通用性：不依赖任何网申站点的接口或固定结构，用“标签识别 + 别名匹配 + 手动兜底”组合应对千差万别的自建官网。
- [CONFIRMED] 隐私安全：简历这类敏感个人数据全程不出浏览器。

## MVP

- [CONFIRMED] 配置页录入并本地持久化：基本信息、教育经历[]、工作/实习经历[]、项目经历[]、技能证书、自我评价、自定义键值项。
- [CONFIRMED] 一键自动填写：文本输入框、多行文本、原生下拉框、单选、复选（按选项文本匹配）。
- [CONFIRMED] 兼容 React/Vue 受控组件的填值方式。
- [CONFIRMED] 未命中字段的手动兜底填写。
- [CONFIRMED] 已填字段高亮；绝不触发提交。
- [CONFIRMED] 按域名的映射规则记忆与优先应用。

## Phase 1 Scope

- [CONFIRMED] Chrome 与 Edge（Chromium MV3）。
- [CONFIRMED] 中文界面（产品内容语言 zh-CN）。
- [CONFIRMED] MIT 开源，附安装说明与隐私声明。

## Out of Scope

- [CONFIRMED] 日期选择器、级联选择等复杂自定义组件的自动填写 —— 形态繁多成本高，MVP 由用户手动输入。
- [CONFIRMED] 多份简历档案 —— 先验证单份闭环。
- [CONFIRMED] Firefox 支持 —— WebExtension API 差异，后续版本再评估。
- [CONFIRMED] 英文界面 —— 后续版本。
- [CONFIRMED] 云同步、账号体系 —— 与全本地隐私原则冲突。
- [CONFIRMED] 自动提交表单 —— 安全红线，永久排除。

## Product Principles

- [CONFIRMED] 人始终做最终决定：扩展只填表不提交；填写结果必须可见、可复核。
- [CONFIRMED] 数据不出浏览器：无后端、无第三方 SDK、无遥测。
- [CONFIRMED] 宁可漏填不可错填：匹配不确定时留空交给人工，不做激进猜测。

## Success Criteria

| Criterion | Signal / measure | Evaluation point | Status |
| --- | --- | --- | --- |
| 自动命中覆盖 | ≥3 个真实网申页面（含至少 1 个自建官网）文本类字段自动命中率 ≥70% | MVP 完成时 | `CONFIRMED` |
| 兜底可用 | 所有未命中字段都能通过手动兜底完成填写 | MVP 完成时 | `CONFIRMED` |
| 零误提交 | 扩展从不触发提交动作；填写后均有高亮提示 | MVP 完成时 | `CONFIRMED` |

## Validated Assumptions

| Assumption | Challenge / counterexample | Resolution | Status | Revisit trigger |
| --- | --- | --- | --- | --- |
| 标签启发式 + 别名匹配能覆盖多数网申字段 | 自建官网结构差异大，命中率可能不足 | `RETAINED`：手动兜底 + 规则记忆保底；命中率用成功标准实测 | `CONFIRMED` | MVP 实测命中率 <70% |
| 手动兜底能覆盖复杂组件 | 自定义日期/级联组件无法直接填值 | `RETAINED`：MVP 由用户手动输入，后续版本再自动化 | `CONFIRMED` | 用户反馈集中出现 |
| 全本地存储满足需求 | 部分用户可能期望多设备同步 | `RETAINED`：隐私优先；同步明确排除 | `CONFIRMED` | 出现明确需求且存在隐私安全方案 |
| 单选/复选属于 MVP | 性别、政治面貌、婚否等为网申高频字段，遗漏会显著降低价值 | `REVISED`：MVP 填写范围加入原生 radio/checkbox | `CONFIRMED` | 无 |

## Rejected Scope

| Item / assumption | Why rejected | Reconsider when | Status |
| --- | --- | --- | --- |
| 自动提交表单 | 误提交不可逆，违背“人做最终决定”原则 | 不再重新考虑（永久红线） | `CONFIRMED` |
| 云同步 / 账号体系 | 与隐私原则冲突且引入后端成本 | 有隐私安全的同步方案与明确需求时 | `CONFIRMED` |
| MVP 英文界面 | 增加工作量，首批用户为中文求职者 | 开源推广需要时 | `CONFIRMED` |

## Open Items

- [RECOMMENDED] 配置页提供数据导出/导入（本地文件备份） - Reason: 开源用户可能清除浏览器数据导致丢失；Revisit when: MVP 完成后。
- [UNKNOWN, NON_BLOCKING] 高亮的具体呈现形式（轮廓/背景色/角标） - Resolve by: F002 细化。
