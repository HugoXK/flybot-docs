# 沙箱与 Bot 会话权限

每个 Bot 会话都在 DSH 的**文件策略**（`read-only`、`workspace-write`、`danger-full-access`）与**审批策略**（`ask` 或关闭）下运行。两者共同决定 `bash` 调用能做什么、是否需要主机上的隔离后端。FlyBot 不安装或修改策略；策略由会话设置。

## 权限层级

| 文件策略 | 需要隔离后端 | Shell | 写入 | 无后端时的行为 |
| --- | --- | --- | --- | --- |
| `read-only` | 是（只读 profile） | 受限运行 | 无 | 每次调用以 `SANDBOX_UNAVAILABLE` 拒绝 |
| `workspace-write` | 是（Linux 的 `bubblewrap` 或强制 Landlock；macOS 的 `sandbox-exec`） | 受限运行 | 工作区根、后端临时区与 `/tmp` | 每次调用以 `SANDBOX_UNAVAILABLE` 拒绝 |
| `danger-full-access` | 否 | 不受限 | 进程可写的任何位置 | 无；这是无后端时的回退 |

审批策略在文件策略之上：

| 审批策略 | 效果 |
| --- | --- |
| `ask`（审批开启） | DSH 可以请求把一次调用从 `workspace-write` 升级到 `danger-full-access`；FlyBot 显示卡片，standing approval 可代 Bot 或房间回答 |
| 关闭 | 不升级；无后端时 `workspace-write` 调用保持拒绝 |

拒绝是结构化的 `SANDBOX_UNAVAILABLE`，不是命令失败：它表示会话无法隔离命令，而不是命令本身有错。

## 预检

没有可用后端时，`workspace-write` 是会话级阻塞：会话看起来空闲，但每次 `bash` 都被拒绝。启动时或第一次遇到 `SANDBOX_UNAVAILABLE` 时运行一次预检：

```sh
node .github/scripts/sandbox-preflight.mjs --mode workspace-write
node .github/scripts/sandbox-preflight.mjs --mode danger-full-access
node .github/scripts/sandbox-preflight.mjs --mode workspace-write --json
```

退出码：`0` 可用，`3` 确认被阻塞，`4` 无法判断（**不是阻塞**），`2` 用法错误。文件策略是会话设置，预检无法读回，因此必须用 `--mode` 或 `FLYBOT_SANDBOX_MODE` 告知；`--mode` 优先。`danger-full-access` 不需要后端；`read-only`/`workspace-write` 需要可用后端；未指定 mode 时只报告是否能找到后端。

## 被阻塞时

1. 用会话策略运行一次预检；`4` 不要停止，shell 仍可能可用。
2. 确认阻塞时只报告一行：`blocked: no usable sandbox backend`，并附上预检给出的解锁方式。
3. 不要反复重试同一面墙，也不要把阻塞说成命令失败。文件工具与 GitHub API 仍可用，代码与 PR 工作可以继续。
