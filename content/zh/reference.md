# 参考

## 关键入口

| 区域 | 入口 | 说明 |
| --- | --- | --- |
| 核心服务 | `core/index.js` | 名单、存储、工具与回合 |
| 插件运行时 | `core/src/host/hooks.js` | FlyBot 插件钩子 |
| Tree 插件 | `plugins/tree/index.js` | `@flybot/tree` |
| Social 插件 | `plugins/social/index.js` | `@flybot/social` |
| 架构文档检查 | `core/scripts/check-arch-docs.mjs` | 强制 owned paths ↔ 文档 |

## 命令（在 `core/`）

```sh
npm ci
npm run harness          # 一次性安装测试用的 DSH 包
npm run build            # src/client → client.js
npm test
npm run lint
npm run arch-docs        # 拥有的文件变更需要子系统文档
```

客户端变更还要运行 `node scripts/build-client.mjs --check`；host 变更运行 smoke bench。

## Pin 与补丁

- Pin：`ds-bot.pin.json`
- 补丁：`patches/ds-bot/`（按主题排序；见 `patches/ds-bot/README.md`）
- 重新生成：`node scripts/ds-bot-patches.mjs generate`，然后 `check`

不要手改 `ds-bot/` 或生成的 `client.js`；修改 `core/`，重新生成补丁与 client。

## 插件 seam

插件默认是纯的：字段、工具、槽位与消息路由。少数能力通过宿主按插件授予的命名、限流 seam 提供：

| Seam | 能力 | 宿主配置 |
| --- | --- | --- |
| `flybot.model.ask({ prompt, system?, maxTokens? })` | 一次短模型调用；返回 `{ ok: true, text }` 或 `{ ok: false, code }` | `flybot.modelPlugins`，可选 `flybot.modelFor` |
| `flybot.memory.read(botId)` / `append(botId, text, meta?)` | 读取有限记忆条目并追加一条 | `flybot.memoryPlugins` |

两个 seam 都只传文本、不产生出站请求、拒绝时返回短 `code`，只读主机上拒绝。

## 文档地图

- [架构](architecture.md)：核心、插件与子系统。
- [沙箱](sandbox.md)：文件与审批策略、预检。
- [开发](development.md)：代码规范、门禁与合并循环。
- [Controller](controller.md)：只负责标签的 controller 与权限。
- 完整子系统与 API 参考：FlyBot 仓库中的 `docs/subsystems/` 与 `docs/reference.md`。
