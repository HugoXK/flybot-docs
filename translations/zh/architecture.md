# 架构

FlyBot 是构建在 DeepSeek Harness（DSH）上的一组长期运行 Bot。发布物包括 `ds-bot` 插件（对上游打补丁）与桌面应用。

## 目录

| 路径 | 内容 |
| --- | --- |
| `ds-bot/` | 原样固定的上游版本（Fei2411/DeepSeek-Bot），不要编辑 |
| `patches/ds-bot/` | FlyBot 的有序补丁 |
| `core/` | `ds-bot/` + 补丁；发布物，测试在这里运行 |
| `plugins/social/` | `@flybot/social` 社交插件 |
| `plugins/tree/` | `@flybot/tree` 知识树插件 |
| `plugins/timeline/` | `@flybot/timeline` 团队时间与沟通视图 |
| `plugins/workflow/` | `@flybot/workflow` 群聊式任务分派与流程图 |
| `plugins/project/` | `@flybot/project` Project 状态、看板、Chief、指标与助手 |
| `app/` | DSH + 插件的桌面应用 |

## 子系统

每个子系统在 `docs/subsystems/` 下有独立页面，说明拥有的路径、不变量与测试：ds-bot-core、core-host、core-client、plugin-runtime、tree、timeline、workflow、social、install、team。多人类所有权是**计划中、尚未发布**；team 模式在授权门通过前保持关闭。Issue #16 已解决：树中的 Bot 可以在自己下面创建子 Bot（Option B）。

## 运行模型

- 每个 Bot 是一个 DSH Session，插件在 DSH Desktop、DSH Web 与桌面应用中运行。
- Bot 可以拆分任务、使用工具、在群聊中协作；管理权与合并权按角色和策略约束。
- 插件通过受控的命名 seam 访问模型与记忆，其他能力保持纯函数式。
- 集成与插件扩展见[集成](/zh/docs/integrating/)；入口与命令见[参考](/zh/docs/reference/)。

## 安全边界

DSH 的文件策略与审批策略决定 shell 与写入能力；FlyBot 不修改会话策略。插件的模型/记忆 seam 按插件授权，默认关闭；只读主机上拒绝。详细规则见[沙箱与权限](/zh/docs/sandbox/)。
