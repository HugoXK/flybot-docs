# 只负责标签的 Controller

Controller 每 30 分钟及按需运行 `.github/scripts/controller.mjs`；只使用内置 `GITHUB_TOKEN`，没有 LLM、密钥、GitHub App 或保存的 token。

## 职责

它只管理**标签**，从不合并、批准、评论、编辑或关闭任何东西，也不 checkout 或运行 PR/issue。issue/PR 文本只作为数据读取（用正则找 `Fixes #N`）；PR 的变更文件通过 API 读取，并按与风险门相同的规则判断（`.github/agent/risk-rules.json`）。

| 规则 | 效果 |
| --- | --- |
| 每个开放 PR（最近更新 50 个，排除 `hold`） | 由风险门设置 `risk:T0`..`risk:T3`，替换过时标签；文件读不到时不做任何变更。仅供参考：标签不参与合并决策 |
| Agent 的 PR | 作者在 `agentAuthors`、分支以 `agent/` 开头、或本仓库分支对 `agent-ready`/`agent-working` issue 写 `Fixes #N` 时添加 `agent-pr`。fork PR 只按作者判断；标签不删除 |
| `agent-ready` / `agent-working` issue | 最后一次 `agent-ready` 由非维护者设置，或非维护者在批准后编辑正文时，移除两个标签；维护者重新打标签即重新批准 |
| `agent-working` claim | 超过 `claimTtlHours`（6 小时）且没有开放关联 PR 活动时移除 |
| issue/PR 上的 `hold` | 全部跳过 |
| 仓库中不存在的标签 | 跳过添加并报告，绝不创建；移除仍然执行 |

维护者列表在 `.github/agent/controller.json`；编辑它是 T3。Controller 永远不能添加 `agent-ready` 或 `agent-working`；`validatePlan` 会拒绝。

## 模式

| 开关 | 位置 | 效果 |
| --- | --- | --- |
| 默认 | 未设置 | **dry run**：`plan` 只读，把计划写进 job summary；`apply` 不运行 |
| `CONTROLLER_LIVE=true` | 仓库变量 | live：`apply` 添加/移除标签；其他值仍是 dry run |
| `AGENT_PAUSE=true` | 仓库变量 | 完全停止：不读、不计划、不修改 |
| 禁用/删除 workflow | Actions | 关闭 |

## 权限

`plan`：`contents: read`、`issues: read`、`pull-requests: read`。`apply`：`contents: read`、`issues: write`、`pull-requests: write`，且只在 `CONTROLLER_LIVE=true` 且有操作时运行。workflow 级权限为 `{}`。

脚本只写入 `POST .../issues/N/labels` 与 `DELETE .../issues/N/labels/NAME`；没有 merge、review、comment、close、`eval` 或额外网络访问。计划以 job output 传递（数字、固定标签名与固定原因码）；`apply` 再次校验并重新读取目标。
