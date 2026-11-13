# 与 FlyBot 集成

FlyBot 通过 `ds-bot` 插件和可选的 FlyBot 插件（`@flybot/social`、`@flybot/tree`）扩展 DeepSeek Harness（DSH）。

## 插件模型

每个 Bot 是一个 DSH Session。插件在 DSH Desktop、DSH Web 与桌面应用中运行，通过 FlyBot 插件运行时挂载（见 `subsystems/plugin-runtime.md`）。

## 新增插件

1. 创建 `plugins/<name>/`，入口为 `index.js`。
2. 在 `plugins/README.md` 声明 `@flybot/<name>`。
3. 在[子系统文档](subsystems/README.md)登记所有权，并在 `core/` 运行 `npm run arch-docs`。

## 建立在 DSH 上

只使用文档化的插件 API；不要打补丁或依赖 DSH 安装目录内的文件。DSH 缺少能力时停止并报告，不要绕过。

## 插件 seam

插件默认是纯的：读取字段、注册工具与槽位、路由消息。少数需要的能力通过宿主按插件授予的**命名、限流 seam** 提供；未在 profile 配置中命名时全部关闭。

| Seam | 能力 | 宿主配置 | 文档 |
| --- | --- | --- | --- |
| `flybot.model.ask({ prompt, system?, maxTokens? })` | 一次短模型调用（分类、标题、一行摘要），返回 `{ ok: true, text }` 或 `{ ok: false, code }` | `flybot.modelPlugins: [<plugin>, …]`，可选 `flybot.modelFor` | plugin-runtime |
| `flybot.memory.read(botId)` / `append(...)` | 读取 Bot 自己的记忆条目并追加一条 | `flybot.memoryPlugins: [<plugin>, …]` | plugin-runtime |

两个 seam 都只传文本、不产生出站请求、拒绝时返回短 `code`，只读主机上拒绝。不需要这些能力的插件只使用字段与活动 feed。

## Core 与插件

| 层 | 拥有的路径 | 编辑规则 |
| --- | --- | --- |
| ds-bot-core、core-host、core-client | `core/index.js`、`core/src/`、`core/client.js`、`patches/ds-bot/` | 修改 `core/`，重新生成补丁 |
| plugin-runtime | `core/src/host/hooks.js`、槽位、注册表 | FlyBot 插件 API 表面 |
| tree / social / timeline / workflow | `plugins/*` | 独立插件 |
| install | `core/scripts/`、arch-doc 检查 | 仅工具 |
