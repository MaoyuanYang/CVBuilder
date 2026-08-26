# Frontend Architecture

## Scope and Platforms

- [CONFIRMED] Platforms: 桌面浏览器扩展（Chrome/Edge，Chromium MV3），含 options 配置页、popup、注入网申页面的页内浮层。
- [CONFIRMED] Primary device: Desktop。
- [CONFIRMED] Responsive / adaptive direction: 不做响应式断点设计；配置页在常规桌面窗口宽度内可用即可，深色模式跟随系统。

## Technology

| Concern | Choice | Status | Rationale / revisit trigger |
| --- | --- | --- | --- |
| Framework | Preact | `CONFIRMED` | 配置页数组类表单需要组件化；体积小于 React |
| Build | Vite | `CONFIRMED` | 多入口构建 |
| UI library | 无组件库 | `CONFIRMED` | 界面数量少、简洁实用方向；引入组件库收益不抵体积成本 |

## Application Structure

- [CONFIRMED] 三个互相独立的 UI 入口：options（Preact 应用）、popup（轻量页面）、页内浮层（content script 内渲染）。三者共享数据访问层与类型定义，不共享运行时状态。
- [CONFIRMED] Content script 中的填写核心（字段解析、匹配、填值）与浮层渲染分离，保证核心逻辑可在 jsdom 中单测。
- [CONFIRMED] MUST NOT define every directory or component during macro design.

## Routing and Navigation Integration

- [CONFIRMED] Routing strategy: 无路由；options 页为单页分区表单，popup 为单一视图。
- [CONFIRMED] Navigation source: 扩展自带入口（工具栏图标、扩展管理页）；页内浮层由用户点击字段唤起。
- [CONFIRMED] 不涉及 not found / unauthorized 场景（无账号体系）。

## State and Data Access

- [CONFIRMED] Local UI state: Preact 组件内状态。
- [CONFIRMED] Shared client state: 无跨界面共享运行时状态。
- [CONFIRMED] Server state / cache: 不存在（无服务端）。
- [CONFIRMED] Persistence / local storage: 一律经由存储层封装访问 chrome.storage.local；UI 层不直接触碰存储键；敏感数据不出现在日志。

## Forms and Validation

- [CONFIRMED] Form handling: 受控表单；数组类条目（教育/工作/项目）支持增删改。
- [CONFIRMED] Validation: 仅客户端轻量校验（必填项、明显格式）；无服务端校验。
- [CONFIRMED] Error display: 校验错误就近展示在字段旁。

## Components and Styling

- [CONFIRMED] Page vs shared component responsibilities: 仅当两个以上入口确实复用时才提取共享组件。
- [CONFIRMED] Component reuse: prefer existing project components and Design System.
- [CONFIRMED] Styling strategy: 纯 CSS（项目内样式表），语义化颜色变量支持浅色/深色。
- [CONFIRMED] Design token source: 无独立 Design System 文档；最小视觉方向见 `docs/UI.md`。

## Error, Loading, and Recovery

- [CONFIRMED] Loading: 存储读取完成前显示简单加载提示。
- [CONFIRMED] Error: 存储读写失败时给出可理解的错误提示与重试入口。
- [CONFIRMED] Retry, offline, and recovery: 无网络依赖，离线即可用；不涉及重试外部服务。

## Accessibility

- [CONFIRMED] Keyboard and focus: 配置页全部操作可键盘完成；浮层唤起后焦点可达。
- [CONFIRMED] Semantics and labels: 表单项必须有可关联的 label。
- [CONFIRMED] Contrast and motion: 满足基本对比度；无装饰性动效。

## Testing and Build

- [CONFIRMED] Component / interaction: 配置页关键表单行为（增删条目、保存）用组件级测试覆盖。
- [CONFIRMED] E2E: 真实网申站点以人工验证为主（见 `docs/TESTING.md`）。
- Build and test commands: Not yet established

## Constraints and Revisit Triggers

- [CONFIRMED] Content script 代码必须考虑在任意第三方页面运行：不污染全局、不依赖页面已有库、样式隔离。
- [RECOMMENDED] 若后续页面模式增多再评估引入状态管理库 - Revisit when: 跨界面共享状态出现真实需求。
