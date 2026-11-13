# Architecture

FlyBot is a team of long-lived Bots built on DeepSeek Harness (DSH). Two parts ship: the `ds-bot` plugin (patched upstream) and the desktop app.

## Layout

| Path | What it is |
| --- | --- |
| `ds-bot/` | Pristine upstream pin (Fei2411/DeepSeek-Bot). Never edit. |
| `patches/ds-bot/` | Ordered FlyBot patches on the pin. |
| `core/` | `ds-bot/` + patches. Ships; all tests run here. |
| `plugins/social/` | `@flybot/social` — social posting plugin. |
| `plugins/tree/` | `@flybot/tree` — knowledge-tree plugin. |
| `plugins/timeline/` | `@flybot/timeline` — time, communication and utilization across the local team. |
| `plugins/workflow/` | `@flybot/workflow` — a group-shaped chat of local Bots with a flowchart and task assignment. |
| `plugins/project/` | `@flybot/project` — Project State, its board, the Project's Chief, the dossier, metrics and the assistant. |
| `app/` | Desktop app (Windows/macOS) for DSH + the plugins. |

## Subsystems

Each subsystem has a detail page under `docs/subsystems/` with owned paths, invariants and tests: ds-bot-core, core-host, core-client, plugin-runtime, tree, timeline, workflow, social, install and team. Multi-human ownership is **planned, not shipped**; team mode stays disabled until the authorization gates on `docs/subsystems/team.md` pass. Issue #16 is resolved: a tree Bot may create children under itself (Option B).

## Execution model

- Every Bot is a DSH Session. The plugin runs in DSH Desktop, DSH Web and the desktop app.
- A Bot keeps its own memory, working folder, model and schedules between turns.
- A turn can be stopped with `stop_bot`; no message rule blocks a stop.
- Plugins are otherwise pure: they read fields, register tools and slots, and route messages. A few capabilities go through a named, capped seam (`flybot.model.ask`, memory read/append) that the host grants per plugin; all are off unless the host names the plugin in the profile.

## Team authority

The current tree is single-owner: one person owns the Bots and their data. The planned multi-human contract — human owner ↔ designated Chief ↔ specialists, owner-scoped management, Chief-only cross-owner traffic and approval authority — is documented but not shipped. Do not treat the planned team mode as available.

## Integrating

A plugin is `plugins/<name>/index.js` plus a `@flybot/<name>` declaration in `plugins/README.md` and an entry in the subsystem docs. Use documented DSH APIs only; never patch DSH or depend on files inside a DSH install. If DSH lacks a capability, stop and report it.

## Data and trust

The control plane stores the roster, sessions, memory and settings. Repository work happens in the repository's own environment under the DSH file and approval policies. GitHub and model credentials stay in the control plane; a Bot receives tools, not the raw keys.
