# AI OS Ecosystem Ship

Clean, versioned teaching starter for building a personal AI operating system with three layers: **OS Intelligence**, role-based **OS Staff**, and brand/workspace **OS Projects**.

## Current release

- Ship: **V0.1.1**
- OS Intelligence contract: **V0.2.1**
- OS Staff contract: **V0.2.3**
- OS Projects contract: **V0.1.3**

Release changes are recorded in [CHANGELOG.md](CHANGELOG.md). Detailed component and migration contracts live in [`OS Intelligence/11-factory/`](OS%20Intelligence/11-factory/).

## Structure

```text
AI OS Ecosystem/
├── OS Intelligence/   # Chief of Staff, research, Factory, Playbook and Skills
├── OS Staff/          # Empty until Intelligence creates role-based Staff
└── OS Projects/       # Empty until Intelligence creates brand/project workspaces
```

`OS Staff` and `OS Projects` contain only `.gitkeep` in a fresh Git clone so the empty product folders remain present.

## Start here

1. Clone or download the repository.
2. Open `OS Intelligence` with Oh My Pi, Codex, Claude Code, or another compatible coding-agent harness.
3. Start a fresh session. The agent reads `AGENTS.md`, `IDENTITY.md`, `SOUL.md`, and the clean `USER.md`.
4. Ask naturally, for example:
   - `Hãy tạo cho tôi một AI Staff Video Editor.`
   - `Hãy tạo Project cho brand của tôi.`
5. Intelligence uses the Factory specs to create Staff under `OS Staff/` or Projects under `OS Projects/`, then validates structure, links and runtime behavior.

## Clean-distribution boundary

The repository ships without the publisher's personal profile, private work, research, runtime IDs, Staff/Project instances, brand data, assets or production outputs. Learner data is added only during use and remains owned by that learner's instance.

## Versioning and upgrades

Ship releases use SemVer independently from the three component specs:

- **Major:** breaking layout, ownership or migration changes.
- **Minor:** backward-compatible capabilities, specs or Skills.
- **Patch:** packaging, security, compatibility, link or documentation fixes.

A source-system upgrade does not automatically overwrite this distribution or an existing learner instance. Migration must preserve learner `USER`, context, work, Staff, Projects, assets and outputs. See [`release.md`](OS%20Intelligence/11-factory/release.md).

## Skills and licensing

The bundled Anthropic `skill-creator` package retains its upstream Apache-2.0 license at `OS Intelligence/.agents/skills/skill-creator/LICENSE.txt`. No separate repository-wide license is declared in this release.