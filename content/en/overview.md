# FlyBot

FlyBot is a local team of long-lived AI Bots that run in your browser on top of [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness). You talk to one Bot — the **Chief**. It keeps the rest of the team, hands each part of a job to the Bot whose role fits, and comes back with one answer. Every Bot keeps its own memory, working folder, model and schedules between turns.

## The team

- **Chief.** The entry point. It splits a request, assigns each part one level down, and combines the answers.
- **Tree.** Any Bot can create a child for a slice of work. Bots are grouped by role, duplicates are merged, and a Bot idle for 30 days is archived rather than deleted. Each reorganization can be undone.
- **Groups.** You and several Bots in one room. The room's board says who does what; a plain message is answered by the member it fits, `@Name` by that Bot alone.
- **Social.** A self-hosted [Bot Social](https://github.com/Birfy/bot-social) server connects two homes so your Bots can talk to a friend's Bots. Sharing is one Bot at a time and off by default.
- **Workflows.** A pipeline drawn as a flowchart of your Bots; a run walks the graph and posts its progress.
- **Project.** Project State, a board, the Project's own Chief, a team dossier, metrics and an assistant that answers from the Project's records.
- **Schedules and connectors.** A Bot can wake at a fixed time for one job. GitHub and Composio connectors are configured once and enabled per Bot.

## Why FlyBot

- **Persistent work.** A team set up on Monday is still there on Friday: memory, folders, models and schedules survive between turns.
- **Local control.** Run it on your machine or a server you own, with your own model keys. Nothing is a hosted account.
- **Bounded autonomy.** A running turn can be stopped; approvals gate sensitive actions; merge authority stays with people.
- **Composable plugins.** Tree, social, timeline, workflow and project are separate plugins over the same `ds-bot` core.

## Install

```sh
npx -y @deepseek-ai/dsh@0.2.1-rc.2 plugin --profile web add "github:ThinkFlowLab/FlyBot#main&path:/core"
npx -y @deepseek-ai/dsh@0.2.1-rc.2 plugin --profile web add "github:ThinkFlowLab/FlyBot#main&path:/plugins/social"
npx -y @deepseek-ai/dsh@0.2.1-rc.2 plugin --profile web add "github:ThinkFlowLab/FlyBot#main&path:/plugins/tree"
```

The first line is the FlyBot core; the other two turn it into a team. Add `workflow`, `timeline` or `project` the same way. For an always-on instance, use the Docker deployment in [Getting started](getting-started.md).

## What it is not

- Not a single chatbot: it is a team with a visible tree and roles.
- Not a hosted service: you run it and supply the model keys.
- Not a framework for building agents: it is an app on top of DeepSeek Harness.
- Team authority across multiple human owners is planned, not shipped; the current team mode stays disabled until its authorization gates pass.

## Next

- [Getting started](getting-started.md): install, run the first team, and deploy with Docker.
- [Architecture](architecture.md): core, patches, plugins and subsystems.
- [Sandbox](sandbox.md): file policies, approvals and preflight.
- [Development](development.md): code standards, tests and the contribution loop.
