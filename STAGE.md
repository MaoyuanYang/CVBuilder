# Project Stage

项目协调快照。仅记录宏观状态与权威链接，不替代 Specs、Roadmap、Gate 记录、`AGENTS.md` 持久规则或交付历史。

## Project Snapshot

| Field | Value |
| --- | --- |
| Snapshot Revision | `STAGE-004` |
| Parent Snapshot | `STAGE-003 + sha256:e6c611ab9ce7fe654368c9f898b8eedb1594cf3895c002626413014b395c2c2a` |
| Last Reconciled At | `2026-08-27T15:43:52+08:00` |
| Reconciled By | `opencode agent (feature-dev)` |
| Repository Ref | `feature/f001-resume-data-entry @ working tree (uncommitted F001 implementation + docs)` |
| Write Coordination | `SINGLE_WRITER:opencode agent (feature-dev session)` |
| Lifecycle Path | `GREENFIELD` |
| Project Phase | `DELIVERY` |
| Overall State | `WAITING` |
| Current Milestone | `F001 简历数据录入：实现与自评审完成，READY FOR PR，待人工验证与交付授权` |
| Tracking Mode | `REMOTE` |

## Lifecycle Progress

| Area / Milestone | State | Authoritative Evidence | Next Condition |
| --- | --- | --- | --- |
| Greenfield 初始化（Discovery → Gate → 文档 → Feature Map） | `COMPLETE` | 本文件 Handoffs；`specs/ROADMAP.md` Handoff Branch A；commit `e6f508c` | （已完成） |
| F001 简历数据录入（MVP 第一个 Feature） | `ACTIVE` | GitHub Issue #2（Work Status 权威）；`specs/F001-resume-data-entry/review.md` | 真机人工验证 + 交付授权 + PR 合并 |

## Active Work

| Activity ID | Work Item | Member | Type | Skill | Skill Stage | Activity State | Work Status | Branch / Worktree | Status Authority | Next Checkpoint | Updated At |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `A-002` | `F001 简历数据录入` | `opencode agent` | `AGENT` | `feature-dev` | `DELIVERY` | `WAITING` | `REVIEW` | `feature/f001-resume-data-entry` | `https://github.com/MaoyuanYang/CVBuilder/issues/2` | `用户真机验证清单 + commit/push/PR/merge 授权` | `2026-08-27T15:43:52+08:00` |

## Gate Snapshot

| Work Item | Gate | Projection | Authoritative Record / Revision |
| --- | --- | --- | --- |
| `F001` | `SPEC READY` | `PASS` | `specs/F001-resume-data-entry/spec.md` Gate Record（Spec R2，2026-08-27） |
| `F001` | `UI READY` | `PASS` | `specs/F001-resume-data-entry/ui.md` UI READY Record（UI-R1，2026-08-27） |
| `F001` | `TEST DESIGN READY` | `PASS` | `specs/F001-resume-data-entry/test-design.md` Gate Record（TD-R1，2026-08-27） |
| `F001` | `DONE` | `NOT_READY` | `specs/F001-resume-data-entry/review.md` Final State（待真机验证与交付） |

## Blockers and Conflicts

| ID | Affected Activity / Work Item | Type | Evidence | Owner | Unblock / Resolution Condition |
| --- | --- | --- | --- | --- | --- |
| `B-001` | `A-002 / F001` | 交付待决：真机人工验证未执行，且 commit/push/PR/merge 未获授权 | `review.md` Verification Results / Delivery Authorization | MaoyuanYang | 用户执行真机验证清单并授权交付动作 |

## Handoffs

| From | To | Work Item | Resume From | Required Inputs | Authority Transfer | Status |
| --- | --- | --- | --- | --- | --- | --- |
| `coding-start (A-001)` | `feature-dev (A-002)` | `F001 简历数据录入` | `Spec Clarification and Refinement` | `specs/ROADMAP.md` Handoff Branch A；`specs/F001-resume-data-entry/spec.md`；`docs/`；`AGENTS.md` | `N/A - project workflow activity -> GitHub Issue #2（F001 Work Status 权威）` | `COMPLETE` |

## Recently Completed

| Activity ID | Work Item | Member | Outcome | Final Work Status | Final Status Authority | Delivery Evidence | Completed At |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `A-001` | `coding-start：Greenfield 初始化` | `opencode agent` | `MACRO DESIGN READY；全部项目文档与 Feature Map（F001 NEXT）生成` | `N/A` | `N/A - project workflow activity` | `commit e6f508c；specs/ROADMAP.md` | `2026-08-27T14:50:45+08:00` |

## Authority and Update Rules

1. `STAGE.md` 拥有当前项目阶段、活跃成员视图、协调阻塞、交接与恢复点。
2. Feature 绑定前，`specs/ROADMAP.md` 拥有其初始 `DRAFT/NEXT/BLOCKED` 状态；绑定后由远端跟踪器拥有，本文件行为投影。未绑定远端时使用 `STAGE_LOCAL:<Activity ID>`。
3. `specs/ROADMAP.md` 拥有 Feature 排序与依赖；Feature Spec 拥有正确性；Gate 产物拥有 Gate 决定；`AGENTS.md` 拥有持久规则；PR/交付记录拥有已交付变更。
4. Stage 写入通过单一写者串行化：写入前比对 revision 与 SHA-256，变化即中止并对账；同一守卫下分配下一个 `A-xxx`，写后重读，遇重复 ID 或异常即停止。
5. 更新前读取最新文件与全部适用状态权威；保留无关成员行与用户修改，不得按模板整文件替换；将上一 revision/hash 记为 `Parent Snapshot`。
6. 每个成员/代理只修改自己的活动行及直接相关的阻塞/交接行；项目级字段仅在证据支持时变更。
7. 两名成员引用同一工作项须记录明确协作与责任边界，否则记 `CONFLICT` 并停止。
8. Stage-local 权威在同一写入守卫下原子转移：建立/确认接收行、保留 Work Status、权威改为 `STAGE_LOCAL:<接收方>`、发送方标记转移并在同一更新中接受交接。发送方行在转移成功前保持活跃。
9. 仅在分派、有意义的 Skill 阶段迁移、阻塞、恢复、交接、完成时更新；不记录命令、聊天、调试细节。
10. 远端权威与本文件不一致时以远端为准；绑定/新鲜度/revision/身份/权威不确定时记 `CONFLICT` 并停止，只读调查可继续。
11. 活动仅在 Work Status 终结或权威转移后移入 `Recently Completed`，保留最终状态与权威；20 条窗口之外的历史由 Git 与跟踪器/交付记录保留。
12. 正文遵循 Documentation Language（zh），保留上述 ASCII 状态令牌原样；不记录密钥、凭据或敏感操作输出。
