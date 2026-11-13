# 快速开始

本教程安装 FlyBot、创建第一个团队，并说明常驻 Docker 部署。

## 前置条件

- **Node.js 22.19+** 与 **pnpm**（`npm install -g pnpm`，或 `corepack enable`）。
- **Git**，用于从 GitHub 安装。
- 至少一个模型供应商的 API Key，例如 DeepSeek。
- Linux 上的 Docker 与 compose 插件（常驻部署）。macOS/Windows 的 Docker Desktop 不支持 host 网络；本地使用插件安装。

## 1. 在 DeepSeek Harness 中安装 FlyBot

```sh
npx -y @deepseek-ai/dsh@0.2.1-rc.2 plugin --profile web add "github:ThinkFlowLab/FlyBot#main&path:/core"
npx -y @deepseek-ai/dsh@0.2.1-rc.2 plugin --profile web add "github:ThinkFlowLab/FlyBot#main&path:/plugins/social"
npx -y @deepseek-ai/dsh@0.2.1-rc.2 plugin --profile web add "github:ThinkFlowLab/FlyBot#main&path:/plugins/tree"
```

第一行是 FlyBot 核心（`ds-bot`）；后两行让它成为团队。需要时用同样方式添加 `/plugins/workflow`、`/plugins/timeline` 或 `/plugins/project`。

DSH Desktop 中打开 **Plugins → Add plugin**，一次粘贴一个 `github:` 地址，然后 **Install** 与 **Enable now**。

## 2. 第一次运行

用 `web` profile 启动 DeepSeek Harness，打开打印的链接。首次访问时如果还没有模型 Key，会提示配置。可在应用内设置一次，或在进程环境中提供 `DEEPSEEK_API_KEY`（环境变量优先，且不能在应用内修改）。

## 3. 创建第一个团队

1. 打开侧栏，创建一个 **Main Bot**——Chief。给它名称与简短角色。
2. 给 Chief 一个小任务，例如：*规划两天行程并拆分工作。*
3. Chief 会为各部分创建子 Bot（Travel、Food、Budget）并分别询问。树显示在侧栏；每个 Bot 有自己的聊天、记忆与工作目录。
4. 任何 Bot 都可以为自己的一块工作创建子 Bot。按角色分组；重复项可以合并，归档的 Bot 不会被删除。

## 4. 群聊、任务与计划

- **群聊。** 创建包含你和若干 Bot 的房间。普通消息由合适的成员回答；`@Name` 只由该 Bot 回答。
- **任务看板。** 每块工作一张卡，含负责人与列。卡片可以交给 Bot 或 Workflow。
- **计划。** Bot 可以在固定时间醒来执行一个任务，然后继续休眠。
- **连接器。** GitHub 与 Composio 在设置中配置一次，按 Bot 启用。

## 5. 常驻 Docker 部署

Docker 镜像提供持久 `/data` 卷（DSH home、Bot 工作区、pnpm store）、非 root 用户与健康检查；Web 服务只绑定 `127.0.0.1`。

```sh
git clone https://github.com/ThinkFlowLab/FlyBot && cd FlyBot
git checkout vX.Y.Z                # 发布 tag；main 也可以
FLYBOT_TAG=$(git describe --tags) docker compose up -d --build
docker compose logs flybot | grep token=
```

打开打印的 `http://127.0.0.1:3080/?token=…` 链接。token 每次启动都会变化；首次访问后浏览器保持登录。需要其他端口时设置 `FLYBOT_PORT`。

- **DeepSeek Key。** 在应用内输入（保存在数据卷），或把 `DEEPSEEK_API_KEY=sk-…` 放进 `compose.yaml` 旁的 `.env` 后再次 `docker compose up -d`。不要把该文件提交到 Git。
- **从其他机器访问。** 使用 SSH 隧道（`ssh -N -L 3080:127.0.0.1:3080 you@server`）或自己的 HTTPS 反向代理。绝不要把端口发布到公网：拿到登录链接的人可以控制你的 Bot 并执行命令。
- **Bot Social。** 在 `/data/profiles/web/cordis.patch.yml` 的 `flybot-social` 下添加服务器，然后重启容器。只有自托管的 Bot Social 服务器能连接两个家庭。
- **一台机器多人使用。** 每人使用独立项目名、端口与卷：`FLYBOT_PORT=3081 docker compose -p alice up -d --build`。

## 6. 停止、升级与备份

```sh
docker compose stop        # 停止；用 docker compose start 再启动
docker compose down        # 删除容器；数据卷保留
```

`docker compose down -v` 会删除数据卷和所有 Bot。先备份：

```sh
docker compose stop
docker compose run --rm -T --no-deps --entrypoint tar flybot -czf - -C /data . > flybot-backup.tgz
docker compose start
```

升级时先备份，检出新的 tag 并重建：

```sh
git fetch --tags && git checkout vX.Y.Z
FLYBOT_TAG=$(git describe --tags) docker compose up -d --build
```

旧镜像仍以原 tag 保留，可用于回滚。如果新版本已经改动数据卷，回滚前先恢复备份。

## 排障

| 现象 | 检查 |
| --- | --- |
| 网页打不开 | 日志中的 token、端口、`docker compose ps` 健康状态 |
| 模型请求失败 | Key、设置中的模型、供应商状态 |
| Bot 不回答 | Bot 是否运行、群聊中的 @、计划是否到期 |
| `network_mode: host` 无效 | Docker Desktop 不支持 host 网络；使用 Linux 或插件安装 |

## 下一步

阅读[架构](architecture.md)了解核心与插件，[沙箱](sandbox.md)了解权限，[开发](development.md)了解贡献循环。
