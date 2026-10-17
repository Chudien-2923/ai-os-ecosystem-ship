---
name: pre-compact
description: Reconciles the current OS Intelligence session into durable Markdown before context compaction. Use whenever the user says they are about to compact, asks to run pre-compact, wants to preserve session context before `/compact`, or worries that decisions, corrections, artifacts, tasks, or next steps have not been saved.
---

# Pre-compact

## Outcome

Make the current session safe to compact by persisting durable deltas to their canonical owners and proving the resulting resume path. Do not copy the transcript or claim visibility into context that is no longer present.

## Invocation

On Oh My Pi, the user invokes `/skill:pre-compact`, reviews the receipt, then runs `/compact` only when the status is `READY TO COMPACT`. Never execute `/compact` on the user's behalf.

## Scope

Audit only the current conversation, its selected work, Project/Staff binding when present, files touched or referenced in this session, and runtime evidence available to the Agent. Do not scan unrelated work or concurrent sessions.

## Reconciliation workflow

1. **Identify the current work.** Resolve the active WORK/checkpoint from the user's request and current session. Never choose the newest unrelated work as a default.
2. **Build a temporary ledger from visible evidence.** Include:
   - confirmed decisions, preferences, corrections and commitments;
   - approvals granted and permissions still absent;
   - artifacts/files created or changed;
   - commands, tool outcomes, runtime evidence and failures;
   - completed, active, pending, blocked or cancelled tasks;
   - unresolved questions and the next concrete action.
3. **Map each durable item to one canonical owner.** Follow `LEARNING.md` and repository ownership:
   - current-work state/evidence/blockers → its WORK;
   - brand facts, shared Project state, deliverables and approval → Project;
   - Staff capability/learning and Staff assignment checkpoint → Staff;
   - collaboration preference or user context → `USER.md`/`10-context/`;
   - cross-system decision → Decisions or Factory spec/registry when applicable;
   - significant historical milestone → `log.md`, not every tool call.
4. **Read every target file again before editing.** Preserve newer or concurrent changes. If ownership is ambiguous, content conflicts, or a destructive replacement would be required, stop that write and mark the receipt `BLOCKED`.
5. **Apply safe Markdown deltas automatically.** Write only missing durable state. Do not create daily, decision, learning, wiki or log entries unless their normal trigger is satisfied. Do not copy Project/Staff state into Intelligence.
6. **Reconcile lifecycle precisely.** Compaction does not complete or pause work, grant approval, clear a blocker, or settle a worker. Keep statuses supported by evidence.
7. **Protect ephemeral task state.** Ensure every task that must survive compaction is represented in a durable WORK/checkpoint with owner, status, evidence/blocker and next step. Do not persist trivial scratch steps.
8. **Validate the affected surface.** Open changed files and verify relevant wikilinks, headings, locators and resume paths. Do not substitute a full-repo audit.
9. **Decide readiness.** Return `READY TO COMPACT` when every visible durable delta is persisted and affected paths validate. Return `BLOCKED` when a durable delta cannot be safely written or validated. Open questions do not block if they are accurately checkpointed.

## Receipt

Use this structure and keep it concise:

```text
Continuity check: READY TO COMPACT | BLOCKED
Already current:
- <durable item already stored, or none>
Open / intentionally not persisted:
- <item> — <reason and canonical owner, or none>
Resume:
- Work: <locator or none>
- Next step: <one concrete action or none>
Safe action: run /compact | do not compact yet

Markdown đã cập nhật
- <path> — <short durable delta>
```

Omit `Markdown đã cập nhật` when no Markdown file changed. Keep it as the final section when present, satisfying the user's per-prompt Markdown mutation report.

## Boundaries

- Be idempotent: an immediate second invocation with unchanged context/files produces no new mutation.
- Do not run `/compact`, create a new session, close the terminal or invoke session-control APIs.
- Do not commit/push, publish, spend money, send messages, stop workers or expand permissions unless separately authorized by the governing runtime contract.
- Do not call the check complete solely because files exist; verify that current-session durable deltas are represented.
- Do not promise zero information loss beyond the visible context and evidence.