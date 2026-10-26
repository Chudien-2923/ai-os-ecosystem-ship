---
name: sync-main-with-worktrees
description: >-
  Reconciles local main with all relevant Git worktrees end to end: inventories
  branches and ownership, prepares approved coherent commits, integrates completed
  worktrees into main sequentially, resolves conflicts safely, then updates remaining
  eligible worktrees from the final main. Use whenever the user asks to fully sync
  main with worktrees or wants one command to coordinate both directions. Never
  pushes or touches draft/ambiguous work without explicit scope.
---

# Sync Main With Worktrees

## Outcome

Produce a consistent local repository checkpoint across `main` and all relevant worktrees without flattening ownership or committing unfinished work. This is the full two-way mode:

1. eligible completed worktrees → local `main`;
2. final local `main` → remaining eligible worktrees.

## Invocation

On Oh My Pi, invoke `/skill:sync-main-with-worktrees`. The invocation selects the full mode; the user does not need to remember or restate the individual Git steps.

## Required contract

Read `references/worktree-safety.md` before inspection or mutation. If it cannot be loaded, return `BLOCKED`.

When worktrees are Orca-managed, load the discovered `orca-cli` Skill and its version-matched guide before using Orca commands. Use Orca for managed worktree/runtime/owner state and Git for commit-graph facts. Do not guess Orca subcommands.

## Mode boundary

- Default scope: local `main` and all worktrees belonging to the current repository.
- Remote fetch/pull/push is outside scope unless separately requested.
- Draft, blocked, ambiguous, detached, unrelated or concurrently owned worktrees are preserved and reported, not forced into alignment.
- Deleting worktrees or branches is outside scope.

## Workflow

### 1. Build the reconciliation ledger

1. Run the shared inventory for `main` and every worktree.
2. Map each worktree to its durable WORK/checkpoint, owner and lifecycle: completed/ready, active/draft, blocked, abandoned with explicit decision, or unknown.
3. Record dirty paths, branch/HEAD, ahead/behind/diverged relation, unique commits, verification evidence, active runtime and concurrent session ownership.
4. Classify each worktree:
   - `integrate into main` — coherent completed slice with evidence;
   - `update from final main` — active/retained clean branch that should receive integrated changes;
   - `already aligned`;
   - `preserve/exclude` — dirty draft, blocker, ambiguity, detached/unrelated history or concurrent ownership;
   - `needs decision`.

### 2. Prepare one approval packet

1. Review each completed dirty diff as the owner would and run changed-path verification.
2. Propose exact commits only for coherent completed slices. Never bundle unrelated changes or commit merely to clean a worktree.
3. Order integrations by dependency; otherwise use the conservative order that minimizes shared-surface conflicts.
4. Present one packet containing exact worktree IDs/paths, branches, commit scopes/messages, merge order, expected conflict surfaces, verification and excluded worktrees.
5. Ask once for the exact packet before creating commits or merge commits. Any changed diff/HEAD/ownership invalidates that row and requires a refreshed packet.

### 3. Integrate completed worktrees into main

For each approved source, sequentially:

1. re-read status, HEAD and ownership;
2. create only the approved commit when needed;
3. bring the latest local `main` into the source branch;
4. resolve conflicts on the owning worktree only when intent is clear;
5. run source verification;
6. merge or fast-forward the source into local `main` according to repository policy;
7. run the affected main-surface smoke;
8. recompute every remaining source against the new `main`.

Stop that source on ambiguous conflict or failed verification. Preserve successful prior integrations and report partial state; never erase them with an unapproved reset/revert.

### 4. Propagate final main to remaining worktrees

1. Freeze the verified final local `main` HEAD as the source.
2. Update every approved clean `update from final main` worktree sequentially using fast-forward or merge by default.
3. Do not stash, commit or rewrite dirty active worktrees. Report exactly what remains behind and why.
4. Verify each updated worktree and confirm final `main` did not change during propagation.

### 5. Close the local checkpoint

Re-read all scoped statuses and commit relations. Report final alignment, excluded worktrees, conflicts, verification and the absence of remote push. A partial result is not failure if preserved worktrees and exact blockers are explicit.

## Receipt

```text
Main/worktrees sync: READY FOR APPROVAL | SYNCED | PARTIAL | BLOCKED
Local main:
- <path — start HEAD → final HEAD — clean state>

Integrated into main:
- <worktree — branch — commit(s) — verification>

Updated from final main:
- <worktree — branch — method — verification>

Preserved / excluded:
- <worktree — owner/lifecycle/dirty-state reason>

Conflicts or failures:
- <worktree — files/check — decision or owner needed, or none>

Approval packet:
| ID | Direction | Worktree / branch | Commit/merge action | Verification | Risk / order |
| ... |

Remote:
- not fetched/pulled/pushed unless separately authorized

Safe next action:
- <approve exact IDs | resolve blocker | none>
```

If Markdown changed, keep the repository-required `Markdown đã cập nhật` section last.

## Completion criteria

- Every repository worktree is inventoried and classified.
- Only completed, coherent, approved work is integrated into `main`.
- Every integration uses the latest local `main` and passes changed-path verification.
- Every eligible clean retained worktree receives the final `main`.
- Dirty/draft/ambiguous/concurrently owned worktrees remain untouched with explicit blockers.
- Final local `main` and updated worktrees have observed clean/expected status; no remote push or worktree deletion occurred.
