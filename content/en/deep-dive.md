# Deep dive

This page follows one FlyBot from the host runtime to the browser and names the seams a plugin can use.

## Team and tree

- The host's `team()` view includes Bots that are neither `remote` nor `ephemeral`; `view()` exposes `id`, `name`, `role`, `isMain`, `createdBy`, `prompt` and plugin fields.
- A tree is the hierarchy built by `@flybot/tree`. Tree Bots can create children under themselves within depth and child limits; creation does not share a Bot.
- Run Bots are ephemeral and omitted from the team listing and sidebar; their removal is scoped to the plugin that created them.
- Team mode's multi-human authorization is planned, not shipped.

## Plugin system

- Host plugins use the scoped `flybot` API; hooks and client slots/registry are the extension surfaces, not monkey-patching DSH.
- `hooks.js` exposes Bot operations, fields, send middleware, subscriptions, transports and opt-in memory/model services. Plugins mark themselves loaded.
- Feature switches are read at startup; switching a feature does not dynamically attach it to the running host.
- Browser plugins register UI through slots and the registry; the client bundle is generated from `core/src/client/`.

## One turn: host to browser

1. The server entry creates the runtime, installs host modules in a deliberate order, then provides the FlyBot API as the `flybot` service.
2. A message is routed through host delivery/turn handling. Before plugin send middleware, the host applies the owner reach policy, which plugins cannot bypass.
3. As the DSH Session emits events, `installFeed()` folds them into FlyBot events such as `turn.start/end` and `tool.start/end`.
4. The browser polls the host's `/api/bot` channel for state and live data: activity, work/room status, approvals and plugin tool names.
5. The client renders the roster and turn state; plugin components appear through registered slots.

## Host runtime

`core/src/host` owns authorization, reach and rooms; tasks, schedules and memory; and diagnostics and observability. The reach policy is the first gate: a room and a grant decide who can see a Bot, and a plugin cannot widen that.

## Browser client

`core/client.js` and `core/src/client` render the project board, cells and header. The client bundle is generated from the same source, so plugin slots and types stay aligned.

## Plane

Plane is the instance orchestrator: the server, store and lifecycle, plus its tests and Docker backends.

## Testing

Testing layers and suites, CI gates and agent automation. The [Development](development.md) page covers the local loop; the plane's Docker backends cover the hosted shape.

## Glossary

- **Bot**: one long-lived agent with its own memory, folder, model and schedules.
- **Tree**: the hierarchy a plugin maintains over local Bots.
- **Team**: the non-remote, non-ephemeral Bots the host lists.
- **Room**: a group of Bots and people; the board says who does what.
- **Grant**: a per-Bot sharing permission; sharing is off by default.
- **Turn**: one message and the events it produces.
- **Plane**: the instance orchestrator.
