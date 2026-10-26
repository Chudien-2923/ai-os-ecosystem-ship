---
name: merge-worktrees-into-main
description: Integrates completed Git worktree changes into the repository's local main branch. Use whenever the user asks to commit and merge worktrees, merge selected or completed worktrees into main, or run the shorthand “merge worktrees into main”. Produces one approval packet for required commits/merges, resolves conflicts on the owning worktree when safe, verifies each slice, and never pushes.
---

# Merge Worktrees Into Main

## Outcome

Integrate selected or completed worktree branches into local `main` in a controlled sequence. This is a one-way operation: worktrees → `main`. Worktrees that are still active, ambiguous, unverified, or outside the requested scope remain untouched.

## Invocation

On Oh My Pi, invoke `/skill:merge-worktrees-into-main`. The invocation selects this mode; the user does not need to restate the workflow.

## Required contract

Read `../sync-main-with-worktrees/references/worktree-safety.md` before inspection or mutation. If the shared contract cannot be loaded, return `BLOCKED`; do not improvise a second worktree policy.

When worktrees are Orca-managed, load the discovered `orca-cli` Skill and its version-matched guide before using Orca commands. Use Orca for managed ownership/runtime state and Git for branch/status/commit facts.

## Mode boundary

- Destination: current local `main`.
- Sources: worktrees explicitly named by the user, or worktrees whose durable owner marks the slice completed and ready to integrate.
- Do not update unrelated worktrees from final `main`; use `sync-main-with-worktrees` for two-way reconciliation.
- Do not fetch, pull, push, delete worktrees, or remove branches unless separately requested.

## Workflow

1. Run the shared inventory. Resolve each source's work/checkpoint owner, completion evidence, verification, branch, HEAD, dirty state, and relation to current local `main`.
2. Exclude active/draft, blocked, ambiguous, detached, unrelated, or concurrently owned worktrees. Age and a clean tree do not prove readiness.
3. For completed dirty worktrees, review the diff as the owner would. Include only coherent in-scope changes; never absorb unrelated user changes. Run required verification before proposing a commit.
4. Build one approval packet before creating commits. For each source, list exact paths/scope, proposed commit message, verification, conflict risk, merge order, and whether a merge commit may be created. Invocation authorizes inspection and planning, not unspecified commits.
5. After approval, process one source at a time against the latest local `main`:
   - commit only the exact approved coherent change when needed;
   - merge current `main` into the source branch when it has diverged;
   - resolve conflicts on the source worktree, where its owner/context is available;
   - rerun the source's changed-path verification;
   - merge or fast-forward the verified source branch into local `main` according to repository policy;
   - run the relevant main-surface smoke before starting the next source.
6. If another source changes `main`, recompute the next source's relation and integration plan. Never reuse stale conflict or approval assumptions.
7. Stop when a conflict crosses ownership, expected behavior is unclear, verification fails, or the approved scope changes. Preserve already accepted merges and report the exact blocker; do not hide failure with reset/revert unless separately approved.
8. At the end, verify local `main`, list merged and excluded worktrees, and confirm no remote push occurred.

## Receipt

```text
Worktrees into main: READY FOR APPROVAL | MERGED | PARTIAL | BLOCKED
Destination main:
- <path — start HEAD → final HEAD — clean state>

Merged:
- <worktree — branch — commit(s) — verification>

Excluded / preserved:
- <worktree — lifecycle or ownership reason>

Conflicts or failures:
- <source — files/check — owner/decision needed, or none>

Approval packet:
| ID | Worktree / branch | Commit scope and message | Verification | Conflict risk | Merge order |
| ... |

Remote:
- not pushed

Safe next action:
- <approve exact IDs | fix blocker | none>
```

If Markdown changed, keep the repository-required `Markdown đã cập nhật` section last.

## Completion criteria

- Every candidate source is classified by lifecycle, ownership and evidence.
- Only exact approved coherent changes are committed.
- Each source is reconciled with the latest local `main` before integration.
- Conflicts are resolved on the owning worktree or explicitly blocked.
- Local `main` passes affected-path smoke after the final merge.
- Unrelated worktrees are untouched and no push occurred.
