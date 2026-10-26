# Shared Worktree Safety Contract

Use this contract for all three local worktree synchronization modes. Operation-specific mode boundaries override broader capabilities; safeguards never weaken.

## Terms

- **Local main:** the checked-out local primary branch selected by repository policy, normally `main`. Do not assume its name when Git metadata says otherwise.
- **Worktree:** a Git linked worktree plus its checked-out branch/HEAD and durable work owner.
- **Eligible:** ownership, lifecycle, branch relation, working-tree state and verification are all sufficient for the proposed direction.
- **Dirty:** tracked, staged, untracked or conflicted changes exist. Existing changes belong to the user/current owner.
- **Approved packet:** the exact current set of commit and merge actions the user authorized after inventory.

## Discovery and ownership

1. Read repository instructions and current WORK/index routes before changing Git state.
2. For Orca-managed worktrees, load `skill://orca-cli`, resolve the correct executable once, load its version-matched guide, and use current Orca state for worktree/runtime/owner facts.
3. Use Git's worktree porcelain/status/commit graph as the source for paths, branches, HEADs and ahead/behind/diverged relations.
4. Do not infer readiness from worktree age, branch name, clean state, completed-looking filenames or silence from a worker.
5. Existing uncommitted changes are user-owned. Do not overwrite, discard, stash, stage or commit them until scope/owner/readiness are established.
6. If a session/worker still owns a worktree, read its durable Run/Task/Dispatch checkpoint. Do not race it or release it as part of sync.

## Required inventory

Create a temporary matrix before proposing mutation:

| ID | Path | Branch / HEAD | Work owner / lifecycle | Dirty paths | Relation to local main | Runtime / concurrent owner | Proposed direction | Verification |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |

Include the main worktree. Detect:

- detached HEADs, locked/prunable/missing worktrees and unrelated histories;
- branches checked out elsewhere;
- staged, unstaged, untracked and conflicted paths;
- commits unique to each side;
- overlapping files across candidate branches;
- active workers or sessions;
- repository-specific merge, test and commit policy.

## Approval packet

The user prefers one operation, not repeated Git choreography. Batch materially related decisions into one packet with 2–5 clear choices when a decision is needed.

Before creating any new commit or merge commit, state:

- exact worktree ID/path and branch;
- included paths and excluded unrelated changes;
- proposed commit message;
- source/destination HEADs and direction;
- merge order and likely conflict surfaces;
- verification already passed and verification to run afterward;
- whether local main, remote refs or other worktrees will change.

Invocation authorizes inspection and preparation in the selected mode. It does not authorize unspecified commits, history rewrites, force operations, remote push, deletion, or absorbing unrelated changes. A packet row expires when its diff, HEAD, ownership or dependency changes.

## Integration policy

1. Default to non-rewriting integration. Use merge/fast-forward; rebase only for a private branch when repository policy or the user explicitly permits rewriting.
2. Process branches sequentially. Recompute the next branch against the latest local main after every accepted integration.
3. Resolve conflicts on the source/owning worktree before integrating into main when possible. That preserves the context needed to decide intended behavior.
4. Never choose conflict sides mechanically. Resolve from current contracts, tests and owner evidence. Cross-owner or unclear semantic conflicts are blockers.
5. A conflict resolution is part of the approved source scope only when it preserves both established intents. New product/design decisions require the user or canonical owner.
6. Do not continue from a half-resolved index. Either complete and verify that source or safely abort only its in-progress integration.

## Verification

- Run the changed surface, not just static tests. Use repository-specific checks plus an actual CLI/UI/API smoke when behavior changed.
- Verify the source branch after conflict resolution and local main after each integration.
- Before completion, re-read every scoped status and relation; report observed HEADs and clean/dirty state.
- Never report a worktree aligned because a command exited zero without checking the resulting graph/status.

## Prohibited without separate authority

- `push`, force-push, publish or remote branch deletion;
- hard reset, destructive checkout/restore, cleaning untracked files or dropping stashes;
- deleting/pruning worktrees or branches;
- committing unrelated/draft changes merely to obtain a clean tree;
- rewriting shared branch history;
- killing/releasing workers or terminals;
- changing repository ownership, permissions or deployment state.

## Failure behavior

Return `PARTIAL` when independent approved integrations succeeded but another source blocked. Preserve accepted commits and state; do not hide the partial result with rollback. Return `BLOCKED` before mutation when main is unsafe, ownership is unresolved, the approval packet is stale, or required verification cannot run.
