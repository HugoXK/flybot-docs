# 自主开发（Phase 0：只报告）

状态：**Phase 0，加一份 Phase 1 报告。** 当前不阻塞、不打标签、不评论、不合并。它提供 agent 任务表单、标签集合、PR 模板、报告风险等级（T0–T3）的工作流，以及报告 tip 是否被审查的工作流。

## 约束

1. **不使用 GitHub App**：确定性 controller 在 GitHub Actions 中用内置 `GITHUB_TOKEN` 运行，按任务最小权限；没有 LLM，也没有密钥。
2. **不使用 Cursor cloud agent**：LLM agent（分诊、实现、审查）在 Actions 之外运行，是团队机器上的 Chief 工作站；审查由 Reviewer Bot 完成（acting as `Birfy`，self-review）；OpenCode/Codex 已不使用。
3. **只处理 `agent-ready` issue**：标签由维护者或 owner 的维护 routine 在分诊后设置；没有 LLM 开发其他 issue。
4. **按 tier 合并**：T0/T1 在 CI 绿色、PR 可合并且符合设计规则后经 merge queue 合并，不需要 PASS；T2/T3 需要 tip 的 PASS 与绿色 CI，然后由 gating agent 自己入队——T2/T3 不需要维护者点击批准。self-PASS 只在 Bot 之间成立；实现者不审查自己的 PR。
5. **预算**：尚未设置；未来的成本上限将集中在一个配置文件（开放 PR 数、每 PR 尝试数、每日 PR 数、每次尝试分钟数）。

## 角色

| 角色 | 运行位置 | 凭据 | 可以做什么 |
| --- | --- | --- | --- |
| Controller：tier、标签、auto-merge、watchdog | Actions，base 分支代码，不运行 PR 代码 | `GITHUB_TOKEN`，按 job 最小权限 | 打标签、评论、`gh pr merge --auto --squash` |
| Agents：实现、审查 | 团队机器上的 Chief 工作站（维护 routine 以 `Birfy` 运行） | 维护者账号自己的 `gh` 登录 | 分诊并设置 `agent-ready`、推分支/fork、开 PR、评论、审查、入队 |
| Merge | `main` 的必需 merge queue | 无 | 仅 squash（由队列设置） |
| Maintainers（`Birfy`、`hsliuustc0106`） | GitHub | 自己的账号 | `hold`（仅人类）、设置 `agent-ready`、暂停；不做 T2/T3 approve |

## 限制

`GITHUB_TOKEN` 触发的事件不会启动其他 workflow；fork PR 的 `pull_request` 是只读且无密钥；Action 不能 approve PR 或修改 `.github/workflows/**`。因此：决策在一个 job 内完成，用 `schedule` 轮询或显式 `workflow_dispatch`；写入者在 `schedule` 或 `pull_request_target` 中运行 base 分支代码，只通过 API 读取 PR；auto-merge 用 agent 自己的凭据，不用 `GITHUB_TOKEN`。

完整流程、合并门与限制见英文 [autonomous-dev](/docs/autonomous-dev/)。
