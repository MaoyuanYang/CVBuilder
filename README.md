# CVBuilder

- [CONFIRMED] CVBuilder 是一个开源浏览器扩展（Chrome/Edge，MV3），用于自动填写招聘官网与网申系统的在线简历表单：用户一次性录入简历数据，在任意网申页面一键填写，未命中字段手动兜底，填写结果高亮待人工复核，绝不代替用户提交。全部数据仅存于浏览器本地，无任何网络传输。

## Core Capabilities

- [CONFIRMED] 简历数据一次录入（基本信息、教育、工作、项目、技能证书、自我评价、自定义项），本地持久保存。
- [CONFIRMED] 通用自动填写：标签启发式提取 + 中英别名词典匹配，覆盖文本框、多行文本、原生下拉框、单选、复选，不依赖特定站点结构。
- [CONFIRMED] 手动兜底：点击未命中字段，选择数据项填入；已填字段高亮，提交始终由人工完成。
- [CONFIRMED] 按域名记忆手动纠正的字段映射，同一站点越用越准。
- [CONFIRMED] 隐私安全：无后端、无第三方 SDK、无遥测。

## Tech Stack

| Area | Choice | Status | Notes |
| --- | --- | --- | --- |
| 运行平台 | Chromium MV3（Chrome/Edge） | `CONFIRMED` | Firefox 不在 MVP |
| 构建 | Vite | `CONFIRMED` | |
| 语言 | TypeScript | `CONFIRMED` | |
| UI 框架 | Preact | `CONFIRMED` | 配置页表单编辑 |
| 测试 | Vitest + jsdom | `CONFIRMED` | 核心逻辑单测 |
| 存储 | chrome.storage.local | `CONFIRMED` | 全本地 |

## Current Stage

- [CONFIRMED] Live project and member status: [`STAGE.md`](STAGE.md)
- [CONFIRMED] Macro design: `MACRO DESIGN READY`
- [CONFIRMED] Business implementation: Not started
- [CONFIRMED] Feature planning: DRAFT Specs generated; `F001` is the sole `NEXT`
- [CONFIRMED] Handoff: Ready for `feature-dev` refinement

## Start

```text
npm install
npm run build
```

然后在 Chrome/Edge 打开 `chrome://extensions`，开启开发者模式，选择“加载已解压的扩展程序”，加载 `dist/` 目录；在扩展卡片上点击“选项”打开配置页。

## Build

```text
npm run build
```

## Test

```text
npm test
```

## Documentation

- Product: `docs/PRODUCT.md`
- Architecture: `docs/ARCHITECTURE.md`
- Data: `docs/DATABASE.md`
- Frontend: `docs/FRONTEND.md`
- UX: `docs/UX.md`
- UI: `docs/UI.md`
- Testing: `docs/TESTING.md`
- ADR: `docs/adr/README.md`
- Feature roadmap: `specs/ROADMAP.md`
- AI development rules: `AGENTS.md`

## Decision Status

- `[CONFIRMED]` means a fact was evidenced/confirmed, or a decision was approved by the named Decision Authority.
- `[RECOMMENDED]` means a proposed default with a revisit trigger.
- `[UNKNOWN, NON_BLOCKING]` means unresolved and MUST include when it will be resolved.

## License

- [CONFIRMED] MIT（见 [`LICENSE`](LICENSE)）。
