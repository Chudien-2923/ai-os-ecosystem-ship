---
name: repo-reconcile
description: Audits a whole repository and its relevant Git/runtime history to reconcile stale facts, contradictory status, dead locators, inactive work, and obsolete files. Use whenever the user asks to scan, audit, refresh, reconcile, clean up, or reduce conflicts in a repo; mentions outdated context or work; or wants to find unused files/work for removal. Updates only evidence-backed current-state content and always requires explicit approval before deleting or moving anything.
---

# Repo Reconcile

## Outcome

Bring current-state repository content back into agreement with its canonical sources and verified history, while preserving records that are intentionally historical. Produce an evidence-backed cleanup proposal for obsolete files or work; never delete or move a candidate during the audit pass.

## Scope contract

Default to the current repository. Treat “scan the whole repo” as:

- enumerate every in-scope path, including tracked files, visible untracked files, symlinks, indexes and work folders;
- inspect every human-authored text file, in batches where needed;
- classify generated, vendored, binary, cache and ignored paths without loading their contents blindly;
- traverse complete Git commit/path metadata, then inspect diffs, blame or deleted content only where a current claim, status or candidate needs provenance;
- inspect repository logs and repo-scoped runtime/session history when available, using targeted searches for entities, decisions, corrections and superseding facts rather than importing transcripts wholesale.

State exclusions and unavailable history explicitly. A complete inventory with justified exclusions is a full audit; reading every binary byte or every historical blob is not.

Do not silently expand into linked Staff, Project, app or distribution repositories. Read an external canonical source when a current file points to it and access is available, but mutate that repository only when the user included it in scope and its ownership rules allow the change.

## Evidence model

Build a temporary ledger of claims before editing. For each potentially stale item, record:

- entity or subject;
- current claim and file/heading;
- candidate replacement or lifecycle state;
- canonical owner;
- evidence locator and date/version when relevant;
- confidence: `confirmed`, `conflicting`, `unknown` or `historical-only`;
- affected links, indexes, work entries and callers.

Use this precedence, while respecting scope and ownership:

1. explicit current user decision or approval;
2. current canonical owner named by repository contracts;
3. verified current runtime/provider/repository state;
4. active WORK/spec/registry/index that owns the state;
5. Git history, repository log and repo-scoped session history as provenance.

Newer is not automatically truer. Resolve by subject ownership, decision authority, scope and evidence. Modification time, commit age, file age, inactivity or a word such as “old” is only a lead, never proof.

## Workflow

### 1. Establish boundaries and safety

1. Read the repository instructions and the smallest routing/index files needed to identify canonical owners.
2. Inspect current working-tree changes. Treat existing changes as user-owned; do not overwrite, revert or delete them.
3. Record the audit root, included repositories, history sources, exclusions and unavailable tools.
4. If another session is changing the same shared content, stop mutation on that surface and report the reconciliation owner needed.

### 2. Inventory the repository

1. Enumerate all in-scope paths and group them by role: active source, current-state docs, indexes/routes, WORK/checkpoints, history/log/decision, source evidence, generated/vendor/cache, binary/media and unknown.
2. Resolve symlinks and active internal links. Record missing targets, duplicate active owners and stale locators.
3. Inspect indexes against actual children. A folder absent from an index is a discovery signal, not proof it should be removed.
4. Read human-authored text in coherent batches. For large logs or specs, use headings, searches and relevant ranges, then expand wherever a claim or dependency requires it.

### 3. Reconcile with history

1. Traverse Git history across all refs for commit metadata, changed paths, renames and deletions.
2. For each stale-looking claim or cleanup candidate, inspect the introducing and superseding commits or blame range needed to establish intent.
3. Search durable repo logs and WORK checkpoints for explicit supersession, completion, cancellation, migration or retained evidence.
4. Search repo-scoped runtime/session history only for unresolved claims, user corrections or decisions missing from durable state. Runtime history can prove that a statement was made; it does not outrank the canonical owner automatically.
5. Mark unresolved contradictions instead of choosing a convenient value.

### 4. Apply safe reconciliation

Automatically update a current-state file only when the replacement is confirmed and ownership is clear. Typical safe updates:

- stale status, next action, version, date, locator or index summary;
- active guidance superseded by a later approved rule;
- duplicate current-state wording that points at the wrong owner;
- broken links whose intended target is unambiguous.

Before each write, re-read the target and preserve newer changes. Update all affected active callsites, indexes and summaries in the same pass.

Do not rewrite logs, decisions, completed WORK, meeting notes, raw sources or historical evidence merely because their facts are no longer current. Preserve the record and, only when readers could mistake it for active guidance, add or repair a concise supersession locator in the owning current-state surface.

Do not invent a replacement when the current truth is missing. Report the gap and the owner/source needed.

### 5. Classify cleanup candidates

Classify every suspected unused file or work folder as one of:

- `retain` — active owner, required evidence, referenced source, contract-mandated path or intentional history;
- `archive/move candidate` — no longer active but may belong in an established archive location;
- `delete candidate` — demonstrably obsolete or duplicated, no active dependency, and recoverable through an accepted source or Git history;
- `needs decision` — ownership, dependency, retention value or current truth is unclear.

A completed, closed or old WORK is not automatically disposable. Logs, decisions, source provenance, accepted receipts, licenses, lockfiles, migrations and contract-required empty directories have retention value unless repository policy says otherwise.

For each archive/delete candidate, verify:

- what the path contains and its short purpose;
- why it is no longer active;
- inbound links, references, imports, adapters and index entries;
- whether unique evidence or user-authored material would be lost;
- recovery path after removal;
- companion edits required if approved;
- risk level.

### 6. Stop at the destructive gate

During the audit pass, do not delete, move, archive, rename, truncate, or replace a candidate with a placeholder.

Present candidates in a numbered table with:

| ID | Path | Short description | Evidence it is inactive/obsolete | Dependencies and loss risk | Proposed action |
| --- | --- | --- | --- | --- | --- |

Then ask the user to approve exact IDs. “Clean it up,” “remove old things,” or invocation of this Skill authorizes the audit and safe current-state updates, not deletion. Approval may be partial.

After explicit approval:

1. re-read each approved path and re-check working-tree state, inbound references and dependencies;
2. exclude any path changed since the proposal and report why;
3. remove or move only exact approved IDs;
4. update companion links/indexes in the same operation;
5. run repository-specific validation plus an affected-path smoke;
6. report exact removals and retained candidates.

Never infer approval from silence, prior cleanup approvals, completion status or Git recoverability.

## Receipt

Use this structure, omitting empty sections:

```text
Repo reconciliation: CURRENT | UPDATED | NEEDS DECISION | BLOCKED
Scope:
- Root/history/exclusions

Updated safely:
- <path — confirmed change — evidence>

Conflicts or missing truth:
- <claim — competing evidence — decision/source needed>

Cleanup proposal (no deletion performed):
| ID | Path | Short description | Evidence | Dependencies / risk | Proposed action |
| ... |

Retained intentionally:
- <path/class — reason>

Verification:
- <inventory/history/link/smoke evidence actually observed>

Approval needed:
- Approve exact cleanup IDs, or `none`
```

If Markdown changed, keep the repository-required `Markdown đã cập nhật` section last.

## Completion criteria

The audit is complete only when:

- every in-scope path is inventoried or explicitly excluded by class;
- every confirmed stale current-state claim found in scope is updated across affected active surfaces;
- historical records remain distinguishable from current guidance;
- unresolved contradictions name their evidence and owner;
- every cleanup candidate has dependency/loss analysis;
- no destructive action occurred without exact approval;
- changed surfaces pass repository-specific validation and a real smoke scenario.

Be idempotent: an immediate second audit against unchanged files/history should produce no new mutation and the same unresolved candidates.

## Boundaries

- Do not commit, push, publish, spend, contact external parties or expand permissions without separate authority.
- Do not use deletion as a substitute for resolving contradictory active sources.
- Do not create a second source of truth, generic archive folder or parallel index just to make the audit look organized.
- Do not claim the repository is conflict-free; report the scope, evidence and remaining uncertainty precisely.
