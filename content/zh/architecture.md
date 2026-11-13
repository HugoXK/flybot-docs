# 架构

FlyBot 是构建在 DeepSeek Harness（DSH）上的一组长期运行 Bot。发布物包括 `ds-bot` 插件（对上游打补丁）与桌面应用。

## 目录

| 路径 | 内容 |
| --- | --- |
| `ds-bot/` | 原样固定的上游版本（Fei2411/DeepSeek-Bot），不要编辑 |
| `patches/ds-bot/` | FlyBot 的有序补丁 |
| `core/` | `ds-bot/` + 补丁；发布物，所有测试在这里运行 |
| `plugins/social/` | `@flybot/social` 社交插件 |
| `plugins/tree/` | `@flybot/tree` 知识树插件 |
| `plugins/timeline/` | `@flybot/timeline` 团队时间、沟通与利用率视图 |
| `plugins/workflow/` | `@flybot/workflow` 群聊式任务分派与流程图 |
| `plugins/project/` | `@flybot/project` Project 状态、看板、Chief、档案、指标与助手 |
| `app/` | DSH + 插件的桌面应用 |

## 子系统

每个子系统在 `docs/subsystems/` 下有独立页面，说明拥有的路径、不变量与测试：ds-bot-core、core-host、core-client、plugin-runtime、tree、timeline、workflow、social、install、team。多人类所有权是**计划中、尚未发布**；在 `docs/subsystems/team.md` 的授权门通过前，team 模式保持关闭。Issue #16 已解决：树中的 Bot 可以在自己下面创建子 Bot（Option B）。

## 执行模型

- 每个 Bot 是一个 DSH Session；插件在 DSH Desktop、DSH Web 与桌面应用中运行。
- Bot 在回合之间保留自己的记忆、工作目录、模型与计划。
- 运行中的回合可以用 `stop_bot` 停止；任何消息规则都不能阻止停止。
- 插件默认是纯的：读取字段、注册工具与槽位、路由消息。少数能力通过命名、限流的 seam（`flybot.model.ask`、记忆读取/追加）由宿主按插件授予；未在 profile 中命名时全部关闭。

## 团队权限

当前树是单所有者：一个人拥有 Bot 及其数据。计划中的多人类契约——人类所有者 ↔ 指定 Chief ↔ 专家、按所有者管理、仅 Chief 跨所有者通信与审批权——已有文档，但尚未发布。不要把计划中的 team 模式当成可用能力。

## 集成

插件是 `plugins/<name>/index.js`，加上 `plugins/README.md` 中的 `@flybot/<name>` 声明与子系统文档条目。只使用文档化的 DSH API；不要打补丁或依赖 DSH 安装目录内的文件。DSH 缺少能力时停止并报告。

## 数据与信任

控制面保存名单、会话、记忆与设置。仓库工作发生在仓库自己的环境中，受 DSH 文件策略与审批策略约束。GitHub 与模型凭据留在控制面；Bot 获得的是工具，而不是原始密钥。
