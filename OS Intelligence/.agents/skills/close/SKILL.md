---
name: close
description: Reconciles and closes the current OS Intelligence work session without losing durable state. Use whenever the user says they are ending, closing, wrapping up, moving to a new session, wants a final omission check, or asks for a resumable handoff before `/new` or exiting the harness.
---

# Close

## Outcome

Make the current session safe to leave by running the `pre-compact` reconciliation core, settling or checkpointing session-owned runtime state, and producing a minimal next-session handoff. Session closure must not be confused with work completion.

## Invocation

On Oh My Pi, the user invokes `/skill:close`, reviews the receipt, then runs `/new` or exits only when the status is `READY TO CLOSE`. A portable Skill cannot register exact `/close` or call OMP session APIs; do not switch sessions automatically.

## Required dependency

Load the discovered `pre-compact` Skill before proceeding. Prefer the harness-native Skill mechanism; when direct loading is needed, read `skill://pre-compact` on OMP or `.agents/skills/pre-compact/SKILL.md` from the repository root. If the dependency cannot be loaded, return `BLOCKED` and do not improvise a competing reconciliation checklist.

Use the complete `pre-compact` scope, ledger, ownership, safe-write, lifecycle and validation workflow. Defer its final receipt and emit only the close receipt below.

## Closure layer

After reconciliation:

1. **Inspect ephemeral task state.** Ensure every active or blocked task that must survive has a durable WORK/checkpoint, owner, evidence or blocker, and one next action.
2. **Inspect session-owned runtime state conditionally.** If this session started a process, watcher, Orca Run/Task/Dispatch or worker, read its current state. Settle/release/retain it according to the governing runtime contract. Never infer success from heartbeat, timeout or silence; never kill or release without authority.
3. **Separate lifecycles.** Record independently:
   - session: ready to close or blocked;
   - work: active, paused, completed or cancelled only when evidence supports it;
   - runtime: none, settled, retained with owner, or blocked;
   - approval: granted, absent or still required.
4. **Build a minimal handoff.** Name the repository/cwd, durable work locator, first files to read, one concrete next action and an optional suggested prompt. Do not create a second session-summary document when existing canonical sources are sufficient.
5. **Decide readiness.** Return `READY TO CLOSE` when durable state is reconciled, affected paths validate, and session-owned runtime is safe. Open work may remain. Return `BLOCKED` only when state cannot be safely persisted/validated or owned runtime would be orphaned.

## Receipt

Use this structure and keep it concise:

```text
Session close: READY TO CLOSE | BLOCKED
Already current:
- <durable item already stored, or none>
Open work:
- <work — status — owner, or none>
Runtime:
- <none | settled | retained with owner | blocker>
Next session:
- Start in: <repo/cwd>
- Read first: <locator(s)>
- Next action: <one concrete action>
- Suggested prompt: <optional or omit>
Safe action: open a new session | do not close yet

Markdown đã cập nhật
- <path> — <short durable delta>
```

Omit `Markdown đã cập nhật` when no Markdown file changed. Keep it as the final section when present, satisfying the user's per-prompt Markdown mutation report.

## Boundaries

- Be idempotent: an immediate second invocation with unchanged context/files produces no new mutation.
- Do not mark work completed merely because the user is ending the session.
- Do not run `/new`, exit the harness, close the terminal or invoke session-control APIs.
- Do not duplicate the `pre-compact` checklist or create a generic transcript summary.
- Do not commit/push, publish, spend money, send messages, stop workers or expand permissions unless separately authorized by the governing runtime contract.