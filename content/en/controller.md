# Label-only controller

The controller runs `.github/scripts/controller.mjs` every 30 minutes and on demand. It uses only the built-in `GITHUB_TOKEN`: no LLM, no secrets, no GitHub App and no stored token.

## What it does

It manages **labels and nothing else**. It never merges, approves, comments on, edits or closes anything, and it never checks out or runs a PR or an issue. Issue and PR text is read as data (a regex for `Fixes #N`); a PR's changed files are read through the API and judged by the same rules as the risk gate (`.github/agent/risk-rules.json`).

| Rule | Effect |
| --- | --- |
| Every open PR (50 most recently updated, not `hold`) | `risk:T0`..`risk:T3` from the risk gate, replacing a stale label. If the files cannot be read, nothing changes. Advisory only: no merge decision reads the label |
| An agent's PR | Adds `agent-pr` when the author is in `agentAuthors`, the branch starts with an `agentBranchPrefixes` entry (`agent/`), or a branch in this repository says `Fixes #N` for an `agent-ready`/`agent-working` issue. A fork PR counts by author only. The label is never removed |
| `agent-ready` / `agent-working` issue | Removes both when the last `agent-ready` was set by a non-maintainer, or a non-maintainer edited the text after it. A maintainer re-labeling re-approves it |
| A claim (`agent-working`) | Removes it after `claimTtlHours` (6) with no open linked PR activity |
| `hold` on the issue or PR | Everything is left alone |
| A label that does not exist | The add is skipped and reported, never created; removals still happen |

Maintainers are listed in `.github/agent/controller.json`; editing it is T3. The controller can never add `agent-ready` or `agent-working`; `validatePlan` refuses it.

## Modes

| Switch | Where | Effect |
| --- | --- | --- |
| Default | nothing set | **dry run**: `plan` reads and writes the proposed changes to the job summary; `apply` does not run |
| `CONTROLLER_LIVE=true` | repository variable | live: `apply` adds and removes labels; any other value stays dry run |
| `AGENT_PAUSE=true` | repository variable | stops it completely: nothing is read, proposed or changed |
| Disable or delete the workflow | Actions | off |

## Permissions

`plan`: `contents: read`, `issues: read`, `pull-requests: read`. `apply`: `contents: read`, `issues: write`, `pull-requests: write`, only when `CONTROLLER_LIVE` is `true` and the plan has operations. Workflow-level permissions are `{}`.

The script's writes are only `POST .../issues/N/labels` and `DELETE .../issues/N/labels/NAME`; there is no merge, review, comment, close, `eval` or extra network access. The plan is passed as a job output (numbers, fixed label names and fixed reason codes); `apply` validates it again and re-reads each target before acting.
