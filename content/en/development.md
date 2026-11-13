# Development

This page is the acceptance contract for a FlyBot change. Hard DSH rules live in `AGENTS.md` and `CONTRIBUTING.md`; dated lessons live in `LESSONS.md` and are promoted here after at least three days.

## Verifier honesty

When you report status on a change:

1. **Tip SHA** — name the exact commit (`git rev-parse HEAD`).
2. **Ran** — list each command you personally ran at that tip, with pass/fail.
3. **Not run** — list material checks you did not run (smoke, Desktop, real-model). Missing evidence is a gap, not a PASS.
4. **No borrowed credit** — the author's claims and stale CI on another SHA are not your result.
5. **PASS wording** — say only what the evidence supports, for example "unit + lint green at `abc1234`; smoke not run".

## Fail without change

- Add the regression test first and run it **red** on the unbroken tip, then fix and run it green.
- Keep both halves of the evidence; a reviewer re-verifies them.
- Test the class, not one sample. State whether the red test is a **defect test** (red on base, green with the fix) or a **guardrail** (green on base too). A claimed fix needs a defect test.

## Fix the class, not the sample

If review finds one escape path, fix the shared helper and cover the sibling markers (`untrusted-message`, `untrusted-file`, trusted headers). Same-class findings tighten this page or `LESSONS.md`; do not paper over them with a special case.

## List sync

A change that keeps a membership, roster or presence list in sync handles four traps explicitly:

- **Leaving marks, it does not remove.** Keep the record and set `leftSeq`/`leftAt`; a live view filters it out. Never `filter()` the entry out of the array.
- **A rejoin clears the mark.** Match the old record, drop the stray `left` line, clear `leftSeq`/`leftAt`, refresh `joinedSeq`; do not add a second record.
- **The same delivery lands once.** A repeated event must not add a line or a membership change; replay the fixture twice to verify idempotency.
- **A missing field is not a cleared field.** Diff only the fields the message explicitly carries; clearing is an explicit value.

## Silent catches and fences

- A `catch` that swallows an error says why in a comment inside the block or handles it; `check-empty-catch` rejects a bare one.
- A fire-and-forget promise whose result is dropped needs `void` or a one-line reason.
- Untrusted bodies stay inside fences; closing markers must not reconstitute after a single strip. Peer-controlled display names, handles and file names are sanitized before they enter model-visible trusted text.

## The loop

```
issue → claim → branch/worktree → red test → fix → gates → PR
      → review at the tip → risk tier → merge queue → release
```

1. **Issue.** Start from a reproducible defect or a concrete maintenance need. Search open and closed issues first. Include expected/actual behaviour, a minimal reproduction, `file:line` and the environment.
2. **Claim.** Skip an issue with a human assignee or a live claim. Assign the maintainer account, add `agent-working`, comment the branch and a one-line plan.
3. **Branch and red test.** Branch from the latest `main`; one issue, one branch, one PR. Test the class.
4. **Gates.** At the exact tip you will link, run in `core/`:

```sh
npm ci
npm run harness          # once: DSH packages for tests
npm run build
npm test
npm run lint
npm run arch-docs
```

A client change also runs `node scripts/build-client.mjs --check`; a host change runs the smoke bench. A user-visible change needs a changelog fragment.

## Merge rules

- **T0/T1** merge on green required checks when the PR is mergeable and conforms to the design rules.
- **T2/T3** need a **PASS at the same tip** and green checks. A new commit voids the PASS.
- The author-login review is an attestation: when the conclusion's GitHub login is the PR author, a `Verdict:` comment does not count; the header carries `Attestation: <full 40-char sha> role=<Bot>`.
- One conclusion per tip; a correction reads `Correction from <Bot>: …`.
- The merge queue rebuilds the merge with the current `main`; that run decides.
