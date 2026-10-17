# AI OS Ecosystem Registry

- Ship release: V0.1.0
- Last reconciled: 2026-10-17
- Root convention: sibling folders `OS Intelligence`, `OS Staff`, `OS Projects`

## Component contracts

| Component | Version | Source | Status |
| --- | --- | --- | --- |
| Intelligence | V0.2.1 | [[11-factory/specs/os-intelligence-starter-spec]] | Clean starter installed |
| Staff | V0.2.3 | [[11-factory/specs/os-staff-starter-spec]] | Factory-ready; no instance yet |
| Projects | V0.1.3 | [[11-factory/specs/os-projects-starter-spec]] | Factory-ready; no instance yet |

## Instances

| Type | ID | Locator from Intelligence root | Version | Last verification |
| --- | --- | --- | --- | --- |
| Staff | — | `../OS Staff/` | — | Parent folder empty at release |
| Project | — | `../OS Projects/` | — | Parent folder empty at release |

Version metadata không chứng minh runtime. Sau khi tạo hoặc nâng instance, mở repo thật, chạy scenario liên quan rồi cập nhật bảng; không ghi `passed` từ file existence đơn thuần.

## Ship verification

- Fresh-install inventory, privacy scan và 97 active wikilinks/headings: pass.
- Skill trees khớp source; lock cùng bytes; ba Claude adapters cùng realpath; official validator pass cho ba Skills.
- Fresh OMP 18.11.3 read-only creation prompts cho Staff và Project: pass; no mutation.
- Staff/Project production runtime: chưa có instance nên chưa kiểm chứng, không bị ghi giả là pass.