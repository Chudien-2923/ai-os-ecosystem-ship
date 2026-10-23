# Claude Code Skill adapters

Folder này chỉ giữ Claude Code discovery adapters. Canonical Skill content nằm tại `../../.agents/skills/`.

Với mỗi canonical Skill, tạo một relative symlink:

```text
.claude/skills/<skill-name> -> ../../.agents/skills/<skill-name>
```

Không đặt `SKILL.md` độc lập tại đây. Sửa canonical Skill rồi kiểm tra symlink resolve về cùng real path.