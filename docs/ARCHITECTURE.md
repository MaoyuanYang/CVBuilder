# Architecture

## Goals and Constraints

- [CONFIRMED] 零后端、零上报：不发起任何网络请求，不引入第三方运行时 SDK，不做遥测。
- [CONFIRMED] 通用填写：不依赖任何特定网申站点的 DOM 结构或私有接口。
- [CONFIRMED] 安全：绝不代替用户触发表单提交。
- [CONFIRMED] 运行环境：Chrome/Edge（Chromium MV3 扩展）。

## Overall Architecture

- [CONFIRMED] 单一浏览器扩展，三个 UI 面（options 配置页、popup、页内兜底浮层）加共享本地存储；上下文间通过 Chrome Extension 消息通信。

```text
┌──────────────┐   ┌──────────────┐   ┌──────────────────────────────────────┐
│ Options 页    │   │ Popup        │   │ Content Script（注入网申页面）          │
│ 简历数据录入   │   │ 触发填写      │   │ 扫描字段→提取标签→匹配→填写→高亮        │
│              │   │ 展示结果摘要   │   │ 手动兜底浮层（点击字段选值填入）          │
└──────┬───────┘   └──────┬───────┘   └──────────────────┬───────────────────┘
       │                  │                              │
       ▼                  ▼                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 存储层（chrome.storage.local）：简历数据 + 按域名映射规则               │
└─────────────────────────────────────────────────────────────────────┘
```

## Tech Stack

| Concern | Choice | Status | Rationale / constraint |
| --- | --- | --- | --- |
| 运行平台 | Chromium MV3 | `CONFIRMED` | 目标用户主流浏览器；Firefox 不在 MVP |
| 构建 | Vite | `CONFIRMED` | 多入口（options/popup/content）构建成熟 |
| 语言 | TypeScript | `CONFIRMED` | 数据映射与匹配逻辑的类型安全 |
| UI 框架 | Preact | `CONFIRMED` | 配置页含大量数组类表单，需组件化；体积小 |
| 测试 | Vitest + jsdom | `CONFIRMED` | 匹配/填值逻辑可在 DOM 环境单测 |
| 存储 | chrome.storage.local | `CONFIRMED` | 平台内置，符合全本地原则 |

## Modules and Responsibilities

| Module / Boundary | Responsibility | Owns | MUST NOT own / depend on | Status |
| --- | --- | --- | --- | --- |
| Options 页 | 简历数据的录入、编辑、删除 | 简历数据编辑界面 | 填写逻辑、页面 DOM 操作 | `CONFIRMED` |
| Popup | 触发填写、展示结果摘要、提供入口 | 触发指令与结果展示 | DOM 直接操作、数据持久化细节 | `CONFIRMED` |
| Content Script | 字段扫描、标签提取、匹配、填值、高亮、手动兜底浮层、纠正回写 | 网申页面 DOM 读写与规则应用 | 数据持久化结构定义、网络请求 | `CONFIRMED` |
| 存储层 | 简历数据与域名规则的读写封装 | 本地持久化 | 任何网络请求 | `CONFIRMED` |
| Background service worker | 仅在需要时承担最小消息路由/入口 | 最小路由 | 业务逻辑 | `RECOMMENDED` |

## Dependencies

- [CONFIRMED] `Popup -> Content Script`：通过扩展消息下发填写触发。
- [CONFIRMED] `Popup / Options / Content Script -> 存储层`：读写简历数据与域名规则；仅允许经由存储层访问持久化数据。
- [CONFIRMED] 全部模块只依赖 Chrome Extension 平台 API；禁止依赖任何第三方运行时服务。

## Main Data and Request Flows

1. [CONFIRMED] 录入流：options 页表单 → 存储层持久化。
2. [CONFIRMED] 填写流：popup 触发 → content script 扫描页面字段并提取标签 → 按域名规则优先、别名词典兜底进行匹配 → 逐项填值并派发事件 → 高亮已填字段，向 popup 回报成功/未命中数量。
3. [CONFIRMED] 兜底流：用户点击未填字段 → 页内浮层列出可选数据项 → 选择后填值 → 该映射按域名回写。
4. [CONFIRMED] 记忆流：任何手动纠正/补填都沉淀为该域名的映射规则，下次优先于词典匹配。

## Sync / Async Strategy

- [CONFIRMED] 同步：页面内的字段扫描与填写在用户触发时一次性同步完成。
- [CONFIRMED] 异步：存储读写与跨上下文消息使用 Chrome API 的异步接口。
- [CONFIRMED] 失败方向：单个字段填写失败不中断整体流程，计入结果摘要。

## Consistency and Transactions

- [CONFIRMED] Source of Truth：简历数据与映射规则以 chrome.storage.local 为准；“填写是否正确”以用户人工判断为准。
- [CONFIRMED] 强一致：同一界面内写入后立即读回（配置页保存）。
- [CONFIRMED] 最终一致可接受：跨界面（配置页编辑后到网申页触发），单用户场景冲突概率极低，后写生效。

## Cache and Messaging

- [CONFIRMED] Cache：不规划；数据单份存储，无派生缓存。
- [CONFIRMED] Messaging：仅 Chrome Extension 内部消息（runtime/tabs），无外部消息系统。
- [CONFIRMED] 具体存储键、消息载荷等实现细节不在此冻结。

## External Services

- [CONFIRMED] 无。本项目不依赖任何外部服务，也不发起任何网络请求。

## Security and Observability

- [CONFIRMED] 认证/授权：无账号体系，不涉及。
- [CONFIRMED] 敏感数据边界：简历 PII 仅存于 chrome.storage.local；日志不输出简历内容；不上传任何数据。
- [CONFIRMED] 可观测：无遥测；排障依赖浏览器开发者工具本地日志。

## Deployment Direction

- [CONFIRMED] 开发：构建后以“加载已解压的扩展程序”方式安装。
- [RECOMMENDED] 分发：先提供构建产物与安装说明；是否上架 Chrome Web Store 后续评估 - Reason: MVP 未验证；Revisit when: MVP 达标后。

## Architectural Risks and Revisit Triggers

- [CONFIRMED] 自建官网结构差异大可能导致命中率不足 —— 缓解：手动兜底 + 规则记忆；Revisit when: 实测命中率 <70%。
- [CONFIRMED] React/Vue 受控组件差异可能使填值不触发状态更新 —— 缓解：原生 setter + 派发事件，并在多站点人工验证；Revisit when: 真实站点验证发现问题。
- [CONFIRMED] 网申站点可能检测/限制脚本行为 —— 缓解：仅本地 DOM 操作，无网络行为；Revisit when: 真实站点验证发现拦截。

## Related ADRs

- [CONFIRMED] `docs/adr/0001-tech-stack-and-local-only-storage.md`：MV3 + Vite + TypeScript + Preact + Vitest 与全本地存储（Accepted）。
