# Reference

## Key entry points

| Area | Entry | Notes |
| --- | --- | --- |
| Core server | `core/index.js` | Roster, store, tools and turns |
| Plugin runtime | `core/src/host/hooks.js` | FlyBot plugin hooks |
| Tree plugin | `plugins/tree/index.js` | `@flybot/tree` |
| Social plugin | `plugins/social/index.js` | `@flybot/social` |
| Arch-doc check | `core/scripts/check-arch-docs.mjs` | Enforces owned paths ↔ docs |

## Commands (in `core/`)

```sh
npm ci
npm run harness          # once: DSH packages for tests
npm run build            # src/client → client.js
npm test
npm run lint
npm run arch-docs        # owned file changes need a subsystem doc
```

A client change also runs `node scripts/build-client.mjs --check`; a host change runs the smoke bench.

## Pin and patches

- Pin: `ds-bot.pin.json`
- Patches: `patches/ds-bot/` (ordered topics; see `patches/ds-bot/README.md`)
- Regenerate: `node scripts/ds-bot-patches.mjs generate` then `check`

Never hand-edit `ds-bot/` or the generated `client.js`; change `core/`, regenerate patches and the client.

## Plugin seams

A plugin is pure by default: fields, tools, slots and message routing. A few capabilities go through a named, capped seam granted per plugin by the host:

| Seam | Capability | Host config |
| --- | --- | --- |
| `flybot.model.ask({ prompt, system?, maxTokens? })` | One short model call; resolves `{ ok: true, text }` or `{ ok: false, code }` | `flybot.modelPlugins`, optional `flybot.modelFor` |
| `flybot.memory.read(botId)` / `append(botId, text, meta?)` | Read capped memory entries and append one | `flybot.memoryPlugins` |

Both seams are metadata-safe: text only, no egress, a short `code` instead of provider text, and refused on a read-only host.

## Documentation map

- [Architecture](architecture.md): core, plugins and subsystems.
- [Sandbox](sandbox.md): file and approval policies, preflight.
- [Development](development.md): code standards, gates and the merge loop.
- [Controller](controller.md): the label-only controller and its permissions.
- Full subsystem and API reference: `docs/subsystems/` and `docs/reference.md` in the FlyBot repository.
