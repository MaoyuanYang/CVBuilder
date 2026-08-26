# User Experience

## User Goals

| User / role | Goal | Success signal | Status |
| --- | --- | --- | --- |
| 求职者 | 一次录入简历，网申时一键填写 | 网申页面文本类字段自动命中率 ≥70%，其余可手动补齐 | `CONFIRMED` |
| 求职者 | 确保提交内容正确 | 已填字段高亮可见，提交动作始终由本人完成 | `CONFIRMED` |
| 求职者 | 重复投递同一公司体系时不重复劳动 | 同域名二次填写时历史映射被优先应用 | `CONFIRMED` |

## Primary User Flows

### 首次录入

- [CONFIRMED] Flow definition

```text
打开扩展配置页
-> 依次录入基本信息 / 教育 / 工作 / 项目 / 技能 / 自我评价 / 自定义项
-> 保存
-> 数据持久化于浏览器本地，随时可改
```

- [CONFIRMED] Failure path: 保存失败时提示原因并可重试；数据不丢失。
- [CONFIRMED] Interruption / return: 随时关闭，下次继续编辑已保存内容。

### 一键填写

- [CONFIRMED] Flow definition

```text
打开网申页面
-> 点击扩展图标，点击“自动填写”
-> 扩展扫描并填写命中字段，高亮已填字段
-> popup 展示：已填 N 项 / 未命中 M 项
-> 用户逐项复核（含未命中项），自行提交
```

- [CONFIRMED] Failure path: 无可识别字段时明确告知，并提示使用手动兜底。
- [CONFIRMED] Interruption / return: 填写是一次性动作；重新触发前不改变页面已有人工输入。
- [CONFIRMED] Permission boundary: 不涉及（无账号）。

### 手动兜底与记忆

- [CONFIRMED] Flow definition

```text
点击未命中字段
-> 页内浮层列出可选简历数据项
-> 选择一项填入
-> 该“字段→数据项”映射按当前域名记忆
-> 下次同域名自动填写时优先应用
```

- [CONFIRMED] Failure path: 浮层中无合适数据项时，用户可直接手工输入，扩展不干预。

## Information Architecture

| Area | Responsibility | Primary users | Entry / relation | Status |
| --- | --- | --- | --- | --- |
| Options 配置页 | 简历数据的唯一编辑入口 | 求职者 | 扩展详情页/右键菜单 | `CONFIRMED` |
| Popup | 填写触发与结果摘要 | 求职者 | 工具栏图标 | `CONFIRMED` |
| 页内浮层 | 单字段手动兜底 | 求职者 | 点击网申页字段 | `CONFIRMED` |

## Page / Screen Map

| Screen | User task | Key information / action | Related flow | Status |
| --- | --- | --- | --- | --- |
| Options 配置页 | 录入/维护简历数据 | 分区表单：基本信息、教育[]、工作[]、项目[]、技能、自我评价、自定义项；保存 | 首次录入 | `CONFIRMED` |
| Popup | 触发并了解填写结果 | “自动填写”按钮；已填/未命中计数；配置页入口 | 一键填写 | `CONFIRMED` |
| 页内浮层 | 为单个字段选值 | 数据项列表；填入动作 | 手动兜底与记忆 | `CONFIRMED` |

## Navigation

- [CONFIRMED] Primary navigation: 浏览器扩展原生入口（工具栏图标 → popup；扩展管理 → 配置页）。
- [CONFIRMED] Secondary / contextual navigation: popup 内提供跳转配置页入口。
- [CONFIRMED] Back, cancel, and deep-link behavior: 浮层可随时关闭取消，不产生副作用（未选值则不写字段、不记规则）。

## Interaction Principles

- [CONFIRMED] 扩展只填表不提交；任何界面都不提供“提交”按钮。
- [CONFIRMED] 填写前若目标字段已有内容，覆盖行为需谨慎 —— 默认策略在 F002 细化（候选：跳过非空字段或显式确认后覆盖）。
- [CONFIRMED] Dangerous actions: 配置页“删除全部数据”需二次确认。
- [CONFIRMED] Long-running actions: 填写为秒级一次性动作，无长任务；无需进度恢复。

## State and Feedback Principles

| State | Project-level behavior | Status |
| --- | --- | --- |
| Loading | 配置页加载存储期间显示轻量提示 | `CONFIRMED` |
| Empty | 简历数据为空时，填写入口引导用户先录入 | `CONFIRMED` |
| Error | 存储失败、页面无可填字段等均给出可读原因与下一步 | `CONFIRMED` |
| Success | 填写完成：已填字段高亮 + popup 计数摘要 | `CONFIRMED` |
| Disabled | 简历数据为空时禁用“自动填写”并说明原因 | `CONFIRMED` |

## Accessibility

- [CONFIRMED] Keyboard path: 配置页表单全程键盘可操作。
- [CONFIRMED] Focus management: 浮层打开时焦点移入，关闭时归还原字段。
- [CONFIRMED] Screen reader / semantics: 表单控件具备可读标签与错误描述。
- [CONFIRMED] Reduced motion: 不依赖动效传达状态。

## Responsive UX

- [CONFIRMED] 仅桌面场景；配置页在常见桌面窗口宽度内保持可用，不为移动端优化。

## Internationalization and Theme

- [CONFIRMED] Product Content Language: `zh-CN`（MVP 仅中文；英文界面为后续版本）。
- [CONFIRMED] Light / dark / system theme: 跟随系统 `prefers-color-scheme`。

- [CONFIRMED] Localized values and clearly labeled exact product-copy quotations MAY use Product Content Language; surrounding UX prose remains under Documentation Language.

## Open UX Questions

- [UNKNOWN, NON_BLOCKING] 填写时对非空字段的默认策略（跳过 / 确认后覆盖） - Resolve during: F002 细化。
- [UNKNOWN, NON_BLOCKING] 高亮呈现形式与持续时间 - Resolve during: F002 细化。
