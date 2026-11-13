# Getting started

This tutorial installs FlyBot, creates the first team and shows the always-on Docker deployment.

## Requirements

- **Node.js 22.19+** and **pnpm** (`npm install -g pnpm`, or `corepack enable`).
- **Git** to install from GitHub.
- An API key for at least one model provider, for example DeepSeek.
- Docker with the compose plugin on Linux for the always-on deployment. Docker Desktop on macOS and Windows does not route host networking; use the plugin install for local use.

## 1. Add FlyBot to DeepSeek Harness

```sh
npx -y @deepseek-ai/dsh@0.2.1-rc.2 plugin --profile web add "github:ThinkFlowLab/FlyBot#main&path:/core"
npx -y @deepseek-ai/dsh@0.2.1-rc.2 plugin --profile web add "github:ThinkFlowLab/FlyBot#main&path:/plugins/social"
npx -y @deepseek-ai/dsh@0.2.1-rc.2 plugin --profile web add "github:ThinkFlowLab/FlyBot#main&path:/plugins/tree"
```

The first line is the FlyBot core (`ds-bot`). The other two turn it into a team. Add `/plugins/workflow`, `/plugins/timeline` or `/plugins/project` the same way if you want them.

On DSH Desktop, use **Plugins → Add plugin**, paste one `github:` address at a time, then **Install** and **Enable now**.

## 2. First run

Start DeepSeek Harness with the `web` profile and open the printed link. The first visit asks for a model key if none is configured. Set it once in the app, or provide `DEEPSEEK_API_KEY` in the environment of the process (an environment key wins and cannot be changed in the app).

## 3. Create the first team

1. Open the sidebar and create a **Main Bot** — the Chief. Give it a name and a short role.
2. Ask the Chief for a small task, for example: *Plan a two-day trip and split the work.*
3. The Chief creates child Bots for the parts (Travel, Food, Budget) and asks each one. The tree is visible in the sidebar; each Bot has its own chat, memory and working folder.
4. Any Bot can create a child under itself for a slice of work. Group Bots by role; duplicates can be merged, and archived Bots are never deleted.

## 4. Groups, tasks and schedules

- **Group chats.** Create a room with you and several Bots. A plain line is answered by the member it fits; `@Name` is answered by that Bot alone.
- **Task board.** One card per piece of work, with an owner and a column. A card can be handed to a Bot or to a Workflow.
- **Schedules.** A Bot can wake at a fixed time to do one job, then sleep again.
- **Connectors.** GitHub and Composio are configured once in Settings and enabled per Bot.

## 5. Always-on Docker deployment

The Docker image adds a persistent `/data` volume (DSH home, Bot workspace, pnpm store), a normal non-root user and a health check. It binds the web server to `127.0.0.1` only.

```sh
git clone https://github.com/ThinkFlowLab/FlyBot && cd FlyBot
git checkout vX.Y.Z                # a release tag; main also works
FLYBOT_TAG=$(git describe --tags) docker compose up -d --build
docker compose logs flybot | grep token=
```

Open the printed `http://127.0.0.1:3080/?token=…` link. The token changes on every start; the browser stays signed in after the first visit. For another host port set `FLYBOT_PORT`.

- **DeepSeek key.** Enter it in the app (saved on the data volume), or put `DEEPSEEK_API_KEY=sk-…` in a `.env` next to `compose.yaml` and run `docker compose up -d` again. Never commit the file.
- **Access from another machine.** Use an SSH tunnel (`ssh -N -L 3080:127.0.0.1:3080 you@server`) or your own HTTPS reverse proxy. Never publish the port on a public address: whoever reaches it with the sign-in link controls your Bots and can run commands.
- **Bot Social.** Add the server under `flybot-social` in `/data/profiles/web/cordis.patch.yml`, then restart the container. Only a self-hosted Bot Social server connects two homes.
- **More people on one machine.** Give each one its own project name, port and volume: `FLYBOT_PORT=3081 docker compose -p alice up -d --build`.

## 6. Stop, upgrade and back up

```sh
docker compose stop        # stop; start again with: docker compose start
docker compose down        # remove the container; the data volume stays
```

`docker compose down -v` deletes the data volume and every Bot. Back up first:

```sh
docker compose stop
docker compose run --rm -T --no-deps --entrypoint tar flybot -czf - -C /data . > flybot-backup.tgz
docker compose start
```

To upgrade, back up, check out the new tag and rebuild:

```sh
git fetch --tags && git checkout vX.Y.Z
FLYBOT_TAG=$(git describe --tags) docker compose up -d --build
```

The previous image stays under its tag for a rollback. If the newer version changed data on the volume, restore the backup before rolling back.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| The web page does not open | The token in the log, the port, and `docker compose ps` health |
| A model request fails | The key, the model in Settings, and the provider status |
| A Bot does not answer | The Bot is running, the group mention, and the schedule |
| `network_mode: host` does not work | Docker Desktop does not route host networking; use Linux or the plugin install |

## Next

Read [Architecture](architecture.md) for the core and plugins, [Sandbox](sandbox.md) for permissions, and [Development](development.md) for the contribution loop.
