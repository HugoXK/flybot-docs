# Sandbox and permissions

Every Bot session runs under a DSH **file policy** (`read-only`, `workspace-write`, `danger-full-access`) and an **approval policy** (`ask` or never, meaning approvals closed). Together they decide what a `bash` call may do and whether it needs a confinement backend on the host. FlyBot does not install or change either; the session does.

## Permission tiers

| File policy | Confinement backend needed | Shell | Writes | Failure on a host without a backend |
| --- | --- | --- | --- | --- |
| `read-only` | yes (read-only profile) | runs confined | none | every call refused with `SANDBOX_UNAVAILABLE` |
| `workspace-write` | yes (`bubblewrap` or an enforcing Landlock kernel on Linux; `sandbox-exec` on macOS) | runs confined | the workspace root, a backend temp area and `/tmp` | every call refused with `SANDBOX_UNAVAILABLE` |
| `danger-full-access` | no backend | runs unconfined | anything the process may write | none; this is the fallback |

Approvals sit on top:

| Approval policy | Effect |
| --- | --- |
| `ask` (open) | DSH may ask to escalate one call from `workspace-write` to `danger-full-access`; FlyBot shows the card, and a standing approval can answer it for the Bot or the room |
| never / closed | no escalation; a `workspace-write` call on a host without a backend stays refused |

The refusal is a structured `SANDBOX_UNAVAILABLE` error, not a command failure: it means the session cannot confine commands, not that the command was wrong.

## Preflight

`workspace-write` on a host with no usable backend is a session-level block: the session looks idle while every `bash` call is refused. Run the preflight once at session start, or on the first `SANDBOX_UNAVAILABLE`:

```sh
node .github/scripts/sandbox-preflight.mjs --mode workspace-write
node .github/scripts/sandbox-preflight.mjs --mode danger-full-access
node .github/scripts/sandbox-preflight.mjs --mode workspace-write --json
```

Exit codes: `0` usable, `3` proven blocked, `4` cannot tell, `2` usage. The file policy is a session setting the preflight cannot read back, so pass `--mode` or `FLYBOT_SANDBOX_MODE`; the flag wins. `danger-full-access` needs no backend; `read-only` and `workspace-write` need a usable backend; with no mode the preflight only reports whether a backend exists.

## What a blocked Bot does

1. Run the preflight once, with `--mode` set to the session policy if you know it.
2. On exit `4` (cannot tell) do not stop: shell work may still be fine.
3. Report one line, `blocked: no usable sandbox backend`, with the unlock the preflight printed.
4. Do not retry shell calls into the same wall, and do not present the block as a failed command. File tools and the GitHub API still work, so code and PR work can continue where it does not need a local shell.
