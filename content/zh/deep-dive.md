# 深入实现

这一页跟着一个 FlyBot 从 host 运行时走到浏览器，并标出插件可以使用的接缝。

## 团队与树

- host 的 `team()` 视图包含既不是 `remote` 也不是 `ephemeral` 的 Bot；`view()` 暴露 `id`、`name`、`role`、`isMain`、`createdBy`、`prompt` 和插件字段。
- 树由 `@flybot/tree` 维护。树上的 Bot 可以在自己下面创建子 Bot，受深度和子节点数量限制；创建本身不会分享 Bot。
- Run Bot 是临时的，不出现在团队列表和侧栏；删除范围限定在创建它的插件。
- 团队模式的多人类授权是计划中，尚未发布。

## 插件系统

- host 插件使用按插件名收紧的 `flybot` API；hooks 和客户端 slots/registry 是扩展面，而不是 monkey-patch DSH。
- `hooks.js` 暴露 Bot 操作、字段、发送中间件、订阅、传输，以及可选的记忆/模型服务。插件会标记自己已加载。
- 功能开关在启动时读取；切换功能不会动态挂到正在运行的 host 上。
- 浏览器插件通过 slots 和 registry 注册 UI；客户端 bundle 由 `core/src/client/` 生成。

## 一个回合：host 到浏览器

1. 服务入口创建运行时，按既定顺序安装 host 模块，然后把 FlyBot API 作为 `flybot` 服务提供出去。
2. 消息经过 host 的投递/回合处理。在插件发送中间件之前，host 先应用 owner reach 策略，插件不能绕过。
3. DSH Session 发出事件时，`installFeed()` 把它们折叠成 FlyBot 事件，例如 `turn.start/end`、`tool.start/end`。
4. 浏览器轮询 host 的 `/api/bot` 通道，拿到状态和实时数据：活动、工作/房间状态、审批和插件工具名。
5. 客户端渲染名单和回合状态；插件组件通过注册的 slots 出现。

## Host 运行时

`core/src/host` 负责授权、reach 和房间；任务、计划与记忆；以及诊断和可观测性。reach 策略是第一道门：房间和 grant 决定谁能看见一个 Bot，插件不能扩大它。

## 浏览器客户端

`core/client.js` 和 `core/src/client` 渲染项目看板、cells 和 header。客户端 bundle 来自同一份源码，所以插件 slots 和类型保持一致。

## Plane

Plane 是实例编排器：server、store 和生命周期，以及它的测试和 Docker 后端。

## 测试

测试分层与套件、CI 门禁和 agent 自动化。[开发](development.md) 页讲本地循环；Plane 的 Docker 后端覆盖托管形态。

## 术语

- **Bot**：一个有自己记忆、文件夹、模型和计划的长期 agent。
- **Tree**：插件维护的本地 Bot 层级。
- **Team**：host 列出的非 remote、非 ephemeral Bot。
- **Room**：一组 Bot 和人；看板说明谁做什么。
- **Grant**：按 Bot 的分享许可；默认关闭。
- **Turn**：一条消息及它产生的事件。
- **Plane**：实例编排器。
