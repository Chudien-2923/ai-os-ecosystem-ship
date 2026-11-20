# Project runtime — bộ khởi tạo/nâng cấp OS Project

Nguồn duy nhất của các file Factory cài vào mỗi Project theo [[11-factory/specs/os-projects-starter-spec]] V0.2.3 (§4, §4.2, §9.2, §15–16). Spec không chép lại danh sách này. Hook/Skill của Staff ở `11-factory/staff-runtime/`, hook danh bạ và test của `io-map` ở `11-factory/shared-runtime/`.

## Nguồn → đích trong Project

| Nguồn (từ root Intelligence) | Đích (từ root Project) | Cách cài |
|---|---|---|
| `11-factory/project-runtime/project-health.ts` | `.omp/hooks/pre/project-health.ts` | Copy nguyên file (không re-export: Project là repo độc lập) |
| `11-factory/project-runtime/skills/brand-curation/SKILL.md` | `.agents/skills/brand-curation/SKILL.md` | Copy nguyên file |
| — | `.claude/skills/brand-curation` | Symlink tương đối `../../.agents/skills/brand-curation` |
| `11-factory/project-runtime/template/brand/feedback.md` | `brand/feedback.md` | Copy, thay `<Brand>`; Project V0.2.0: `git mv brand/pending-rules.md brand/feedback.md` trước rồi thay nội dung |
| `11-factory/project-runtime/template/AGENTS-team-lead.md` | `AGENTS.md` | Dán khối `## Team Lead`, `## Công cụ nền` và "OS Intelligence và Staff" theo hướng dẫn đầu file template |
| `11-factory/shared-runtime/ecosystem-catalog.ts` | `.omp/hooks/pre/ecosystem-catalog.ts` | Copy nguyên file (v0.1.1 trở lên để bỏ dòng của chính Project) |
| `.agents/skills/skill-creator/` (Intelligence, exact upstream) | `.agents/skills/skill-creator/` | Copy nguyên package (`cp -R`), giữ `LICENSE.txt` |
| — | `.claude/skills/skill-creator` | Symlink tương đối `../../.agents/skills/skill-creator` |
| `skills-lock.json` (Intelligence) | `skills-lock.json` | Copy nguyên file (source/hash Skill Creator) |
| `.agents/skills/io-map/` (Intelligence, canonical) | `.agents/skills/io-map/` | Copy nguyên thư mục (`cp -R`): `SKILL.md` + `scripts/io-map.ts` |
| — | `.claude/skills/io-map` | Symlink tương đối `../../.agents/skills/io-map` |
| marketplace OMP | `.omp/plugins/installed_plugins.json`, `.omp/plugins/omp-plugins.lock.json` | Từ root Project: `omp plugin install impeccable@impeccable --scope project` và `omp plugin install superpowers@superpowers-marketplace --scope project` |
| — | `.gitignore` | Thêm khối plugin bên dưới |

Khối `.gitignore` (Project commit cả `.omp/hooks/`, nên chỉ chặn runtime plugin):

```gitignore
# OMP plugin (OS Projects V0.2.2): chỉ giữ registration + lock
.omp/plugins/*
!.omp/plugins/installed_plugins.json
!.omp/plugins/omp-plugins.lock.json
.superpowers/
```

Browser Use không cài vào Project: Skill global `~/.agents/skills/browser-use`, CLI `browser-use` và wrapper `~/.local/bin/bu-headless` của máy; chỉ kiểm có sẵn (`command -v browser-use bu-headless`). Hai hook không ghi state; `.omp/hooks/`, `.agents/`, `.claude/` của Project được commit cùng repo.

## Sửa và nâng cấp

- Sửa bản gốc ở đây, chạy `bun test 11-factory/project-runtime`, rồi copy lại vào từng Project theo yêu cầu được duyệt; không sửa riêng bản trong Project.
- Đổi Skill `brand-curation`: dùng Skill Creator (AGENTS.md Intelligence), eval trên sổ mẫu trước khi copy.
- Dòng đầu `project-health.ts` ghi version; registry ghi version đã cài cho từng Project.

## Kiểm chứng sau khi cài

1. `ls -la .claude/skills/brand-curation/SKILL.md .claude/skills/skill-creator/SKILL.md` resolve; `diff -q` file copy với nguồn (`diff -rq` cho `skill-creator`) không khác.
2. `omp` tại root Project: Skill `brand-curation` có trong catalog; sổ trống → hook im lặng; thêm tạm một dòng `dứt khoát` cuối `brand/feedback.md` → đầu session có đề xuất tổng hợp nhắc `brand-curation`; xóa dòng thử.
3. `rg -n "pending-rules|qua OS Intelligence|project-curation"` trong Project (trừ CHANGELOG, `log.md`) không còn kết quả.
4. Bộ nền (spec §4.2, §14.13): `omp plugin list --json` thấy hai plugin scope project; fresh `omp -p` tại root Project có `impeccable`, `using-superpowers`, `brainstorming`, `skill-creator`, `browser-use`, `brand-curation`, `io-map`; danh bạ không có dòng của chính Project; `git status --porcelain --ignored .omp` cho thấy `node_modules/` bị ignore. `diff -rq .agents/skills/io-map <Intelligence>/.agents/skills/io-map` không khác.
