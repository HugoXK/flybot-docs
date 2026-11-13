# FlyBot

FlyBot 是运行在浏览器中的本地 AI Bot 团队，构建在 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 之上。你只与一个 Bot 对话——**Chief**。它管理其余团队成员，把任务拆给合适的 Bot，最后汇总一个答案。每个 Bot 在回合之间保留自己的记忆、工作目录、模型与计划。

## 团队

- **Chief。** 入口。拆分请求，把每一部分交给下一层，并汇总答案。
- **树。** 任何 Bot 都可以为一块工作创建子 Bot。Bot 按角色分组，重复项合并，闲置 30 天的 Bot 会被归档而不是删除；每次重组都可以一键撤销。
- **群聊。** 你和若干 Bot 在同一个房间。房间看板说明谁负责什么；普通消息由合适的成员回答，`@Name` 只由该 Bot 回答。
- **社交。** 自托管 [Bot Social](https://github.com/Birfy/bot-social) 服务器连接两个家庭，让你的 Bot 与朋友的 Bot 对话。共享按单个 Bot 授权，默认关闭。
- **Workflows。** 用流程图描述 Bot 流水线；运行沿图前进并发布进度。
- **Project。** Project State、看板、Project 自己的 Chief、团队档案、指标，以及只依据 Project 记录回答的助手。
- **计划与连接器。** Bot 可以在固定时间醒来执行一个任务。GitHub 与 Composio 连接器配置一次，可按 Bot 启用。

## 为什么使用 FlyBot

- **持久工作。** 周一建立的团队周五仍在：记忆、目录、模型与计划跨回合保留。
- **本地控制。** 在自己的机器或服务器上运行，使用自己的模型 Key；没有托管账号。
- **有边界的自主。** 运行中的回合可以停止；敏感操作需要审批；合并权留在人手里。
- **可组合插件。** Tree、social、timeline、workflow、project 是同一 `ds-bot` 核心上的独立插件。

## 安装

```sh
npx -y @deepseek-ai/dsh@0.2.1-rc.2 plugin --profile web add "github:ThinkFlowLab/FlyBot#main&path:/core"
npx -y @deepseek-ai/dsh@0.2.1-rc.2 plugin --profile web add "github:ThinkFlowLab/FlyBot#main&path:/plugins/social"
npx -y @deepseek-ai/dsh@0.2.1-rc.2 plugin --profile web add "github:ThinkFlowLab/FlyBot#main&path:/plugins/tree"
```

第一行是 FlyBot 核心；后两行让它成为团队。`workflow`、`timeline` 或 `project` 用同样方式添加。需要常驻实例时，使用[快速开始](getting-started.md)中的 Docker 部署。

## 它不是什么

- 不是单个聊天机器人：它是有可见树与角色的团队。
- 不是托管服务：你来运行并提供模型 Key。
- 不是构建 agent 的框架：它是 DeepSeek Harness 之上的应用。
- 多人类所有者的团队权限是计划中、尚未发布；在授权门通过前，当前 team 模式保持关闭。

## 下一步

- [快速开始](getting-started.md)：安装、运行第一个团队，并用 Docker 部署。
- [架构](architecture.md)：核心、补丁、插件与子系统。
- [沙箱](sandbox.md)：文件策略、审批与预检。
- [开发](development.md)：代码规范、测试与贡献循环。
