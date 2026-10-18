# AI OS Ecosystem Registry

- Ship source: V0.2.0; tagged public release gần nhất: V0.1.2.
- Last reconciled: 2026-10-18
- Root convention: sibling folders `OS Intelligence`, `OS Staff`, `OS Projects`

## Component contracts

| Component | Version | Source | Status |
| --- | --- | --- | --- |
| Intelligence | V0.2.2 | [[11-factory/specs/os-intelligence-starter-spec]] | Clean starter installed; session locator contract included |
| Staff | V0.2.4 | [[11-factory/specs/os-staff-starter-spec]] | Factory-ready; no instance yet; session locator mandatory |
| Projects | V0.1.4 | [[11-factory/specs/os-projects-starter-spec]] | Factory-ready; no instance yet; session locator mandatory |

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
- Session locator fresh-smoke: clean Intelligence trả đúng JSONL path/exact resume command; terminal mới tải lại đúng thread. Fresh read-only Factory prompt cũng route Staff V0.2.4/Projects V0.1.4 tới mandatory first-response contract và không mutation.
- Staff/Project production runtime: clean Ship chưa có instance; source Athena/Personal Branding smoke pass không được ghi thành learner-instance evidence.
- Source V0.2.0 ở GitHub `main`; tagged public release gần nhất vẫn là V0.1.2.
- Public documentation: Vietnamese-first cho học viên Việt Nam; English technical terms MAY giữ nguyên khi rõ nghĩa hơn.