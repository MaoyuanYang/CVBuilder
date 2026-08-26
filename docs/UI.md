# User Interface

## Interface Direction

- [CONFIRMED] 简洁实用：表单式布局、信息密度优先、浏览器原生观感；不追求品牌化视觉。
- [CONFIRMED] 行为目标：用户一眼看懂“填了哪些、还差哪些、下一步做什么”。

## Layout Principles

- [CONFIRMED] Global layout: 配置页为单列分区表单；popup 为紧凑单视图；页内浮层为贴近目标字段的小面板。
- [CONFIRMED] Content hierarchy: 每个分区一个明确标题；操作按钮语义直接（保存 / 自动填写 / 删除）。
- [CONFIRMED] Density and whitespace: 表单密度适中，控件间距统一。
- [CONFIRMED] Responsive layout: 不做断点；仅在桌面宽度范围内自然伸缩。

## Global Regions

| Region | Responsibility | Behavior | Status |
| --- | --- | --- | --- |
| 配置页分区标题 | 分隔基本信息/教育/工作/项目等区块 | 静态锚点 | `CONFIRMED` |
| Popup 主区 | 触发填写与结果摘要 | 点击触发，展示计数 | `CONFIRMED` |
| 页内浮层 | 单字段选值 | 随字段定位，可关闭 | `CONFIRMED` |

## Page Patterns

### Forms

- [CONFIRMED] 标签在控件上方或左侧；必填项有标识；校验错误紧邻字段展示；数组条目提供“添加/删除”操作且删除需确认。

### Modal and Drawer

- [CONFIRMED] 页内浮层是唯一的覆盖式 UI：靠近目标字段定位；Escape 或点击外部关闭；关闭即取消，不产生副作用；焦点移入、关闭归还。

## Feedback and UI States

- [CONFIRMED] Loading: 轻量提示，不阻塞阅读。
- [CONFIRMED] Empty: 无数据时给出明确引导文案与入口。
- [CONFIRMED] Error: 可读原因 + 下一步动作；不出现裸异常。
- [CONFIRMED] Success: 已填字段高亮；popup 展示“已填 N 项 / 未命中 M 项”。
- [CONFIRMED] Disabled: 禁用态附原因说明。

## Content and Iconography

- [CONFIRMED] Product Content Language / tone: `zh-CN`，语气直接、简洁、无营销腔。
- [CONFIRMED] Labels and calls to action: 使用动词短语（如“自动填写”“保存”“添加一段经历”）；最终文案以 Feature 细化为准。
- [CONFIRMED] Icons: 最小集合（如有），单色线性风格，不为装饰而引入。

- [CONFIRMED] Exact labels or calls to action MAY use Product Content Language only when clearly identified as exact product copy. Surrounding UI guidance remains under Documentation Language.

## Boundary with Design System

- [CONFIRMED] 本项目不单独设 `docs/DESIGN_SYSTEM.md`（界面数量少、无品牌要求）；最小共享视觉方向（语义色变量、深色跟随系统、统一间距）由本文约束。若后续界面显著增多，再拆出独立 Design System 文档。

## Feature-Level Detail

- [CONFIRMED] Concrete screens, states, and interactions are refined by the owning Feature after `SPEC READY`; MUST NOT freeze them here.
