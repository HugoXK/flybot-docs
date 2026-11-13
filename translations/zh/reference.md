# 参考

指向代码树中的关键入口。所有权与不变量见[架构](/zh/docs/architecture/)与[子系统](/docs/subsystems/)。

## 关键入口

| 区域 | 入口 | 说明 |
| --- | --- | --- |
| 核心服务 | `core/index.js` | 名单、存储、工具、回合 |
| 插件运行时 | `core/src/host/hooks.js` | FlyBot 插件钩子 |
| Tree 插件 | `plugins/tree/index.js` | `@flybot/tree` |
| Social 插件 | `plugins/social/index.js` | `@flybot/social` |
| 架构文档检查 | `core/scripts/check-arch-docs.mjs` | 强制 owned_paths ↔ 文档 |

## 命令（在 `core/`）

```sh
npm ci
npm run harness          # 一次性安装测试用的 DSH 包
npm run build            # src/client → client.js
npm test
npm run lint
npm run arch-docs        # 拥有的文件变更需要子系统文档
```

## Pin 与补丁

- Pin：`ds-bot.pin.json`
- 补丁：`patches/ds-bot/`（按主题排序；见 `patches/ds-bot/README.md`）
- 重新生成：`node scripts/ds-bot-patches.mjs generate`，然后 `check`

## 相关入口

- [集成](/zh/docs/integrating/)：插件模型、DSH 边界与 seam。
- [沙箱与权限](/zh/docs/sandbox/)：文件策略、审批与预检。
- [已知问题](/zh/docs/known-issues/)：当前限制与故障。
- 英文完整参考：[reference](/docs/reference/)、[subsystems](/docs/subsystems/)。
