---
name: sync-worktrees-from-main
description: Updates eligible Git worktree branches from the repository's current local main branch without merging those worktrees back into main. Use whenever the user asks to sync, refresh, update, or bring worktrees up to date from main, including the shorthand “sync worktrees from main”. Preserves dirty or ambiguous worktrees, avoids history rewriting by default, and never pushes.
---

# Sync Worktrees From Main

## Outcome

Bring eligible local worktree branches up to date with the current local `main` while leaving `main` unchanged by worktree content. This is a one-way operation: `main` → worktrees.

## Invocation

On Oh My Pi, invoke `/skill:sync-worktrees-from-main`. The invocation selects this mode; the user does not need to restate the workflow.

## Required contract

Read `../sync-main-with-worktrees/references/worktree-safety.md` before inspection or mutation. If the shared contract cannot be loaded, return `BLOCKED`; do not improvise a second worktree policy.

When worktrees are Orca-managed, also load the discovered `orca-cli` Skill and its version-matched guide before using Orca commands. Use Orca for managed worktree/runtime discovery and Git for commit-graph facts. Do not guess Orca commands.

## Mode boundary

- Source of truth: current local `main` HEAD.
- Targets: explicitly selected worktrees, or all eligible worktrees for the current repository when no subset is named.
- Do not update local `main` from a remote unless the user separately asks for remote synchronization.
- Do not merge any worktree branch into `main`.
- Do not commit dirty worktree content merely to make synchronization possible.

## Workflow

1. Run the shared inventory and classify every target as `ready`, `already current`, `dirty`, `detached`, `conflicting owner`, or `unavailable`.
2. Require local `main` to be clean and identify its exact HEAD. If `main` has uncommitted changes, return `BLOCKED`.
3. For each target, calculate its relation to `main`: ahead, behind, diverged, equal, or unrelated.
4. Preserve dirty, detached, unrelated, ambiguous, or concurrently owned worktrees. Never stash, reset, clean, switch their branch, or absorb their content.
5. Build one execution packet listing exact worktree IDs/paths, branch, current HEAD, relation to `main`, proposed integration method, expected commit creation, conflict risk, and verification. Ask once when any operation can create a commit or when repository policy requires mutation approval.
6. Update approved eligible branches sequentially:
   - fast-forward when the branch is only behind and policy permits;
   - otherwise merge current `main` into the worktree branch by default;
   - rebase only when repository policy or explicit user direction establishes that the branch is private and history rewriting is acceptable.
7. If a conflict occurs, stop on that worktree. Resolve only when ownership and intended behavior are clear; otherwise abort that in-progress integration safely and report the exact files/owner needed. Do not continue with a half-resolved tree.
8. Run the worktree's changed-path smoke after each successful update. Re-read HEAD/status; then continue to the next independent target.
9. Confirm that local `main` stayed at its original HEAD and that no worktree content was merged back into it.

## Receipt

```text
Worktrees from main: CURRENT | UPDATED | PARTIAL | BLOCKED
Source main:
- <path — HEAD — clean state>

Updated:
- <worktree ID/path — branch — old HEAD → new HEAD — method — verification>

Preserved / skipped:
- <worktree — reason>

Conflicts:
- <worktree — files — owner/decision needed, or none>

Main unchanged:
- <original HEAD = final HEAD>

Approval needed:
- <exact packet or none>

Safe next action:
- <one concrete action or none>
```

If Markdown changed, keep the repository-required `Markdown đã cập nhật` section last.

## Completion criteria

- Every target worktree is classified.
- Every eligible approved target is current with local `main` or has an explicit blocker.
- Dirty/ambiguous worktrees are preserved byte-for-byte.
- Local `main` HEAD is unchanged.
- No worktree branch was merged into `main`; no push occurred.
- Verification reflects commands and scenarios actually observed.
