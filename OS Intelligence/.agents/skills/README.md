# OS Intelligence Skills

`.agents/skills/` là canonical source duy nhất cho procedural skills của OS Intelligence. Codex discover trực tiếp; Oh My Pi hỗ trợ Agents provider; Claude Code dùng symlink từng Skill tại `.claude/skills/`.

## Active skills

- `skill-creator` — exact upstream `anthropics/skills@skill-creator`; provenance/hash ở root `skills-lock.json`.
- `pre-compact` — reconcile durable state trước `/compact`.
- `close` — reconcile state, runtime và handoff trước `/new` hoặc exit.

## Contract

1. Tạo Skill mới hoặc đổi behavior/trigger MUST invoke `skill-creator` trước.
2. Skill Intelligence ở `.agents/skills/<name>/SKILL.md`; skill chuyên môn ở Staff; brand procedure ở Project.
3. Mỗi Skill có symlink `.claude/skills/<name>` → `../../.agents/skills/<name>`; không tạo mirror `.omp/skills/` hoặc `.codex/skills/`.
4. Eval theo rủi ro: realistic prompts và baseline cho thay đổi high-impact; focused smoke cho metadata/path.
5. Fresh OMP/Codex session dùng để kiểm chứng discovery/activation khi thay đổi behavior. Claude runtime chỉ bắt buộc khi provider khả dụng hoặc được yêu cầu.
6. Không sửa trực tiếp package upstream `skill-creator`; update qua package source rồi đối chiếu lock/hash/license.

Viewer upstream chỉ mở với output trusted/local hoặc sau review/sandbox vì cảnh báo LOW về HTML/data URI không tin cậy.