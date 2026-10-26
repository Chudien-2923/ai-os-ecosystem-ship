# AI OS Ecosystem Registry

- Ship source/public release: V0.5.0.
- Last reconciled: 2026-10-26
- Root convention: sibling `OS Intelligence`, non-Git containers `OS Staff`/`OS Projects`, child standalone repositories

## Component contracts

| Component | Version | Source | Status |
| --- | --- | --- | --- |
| Intelligence | V0.2.2 | [[11-factory/specs/os-intelligence-starter-spec]] | Clean starter installed; session locator, event-based Inbox/Daily, repository reconciliation, worktree operations và Skill integration guidance included |
| Staff | V0.2.4 | [[11-factory/specs/os-staff-starter-spec]] | Factory-ready; no instance yet; repository metadata, standalone Git và session locator mandatory |
| Projects | V0.1.4 | [[11-factory/specs/os-projects-starter-spec]] | Factory-ready; no instance yet; repository metadata, standalone Git và session locator mandatory |

## Instances

| Type | ID | Locator from Intelligence root | Version | Last verification |
| --- | --- | --- | --- | --- |
| Staff | — | `../OS Staff/` | — | Container chỉ có `.gitkeep`; child directories bị parent Ship ignore |
| Project | — | `../OS Projects/` | — | Container chỉ có `.gitkeep`; child directories bị parent Ship ignore |

Version metadata không chứng minh runtime. Sau khi tạo hoặc nâng instance, mở repo thật, chạy scenario liên quan rồi cập nhật bảng; không ghi `passed` từ file existence đơn thuần.

## Ship verification

- V0.5.0 candidate mandatory inventory/version, privacy/credential scan và active wikilinks/headings: pass.
- Bảy canonical Skill trees, eval JSON và Claude adapter realpaths: pass; official validator pass cho cả bảy Skills.
- Fresh OMP 18.12.6 read-only smokes: repo cleanup destructive gate, `main → worktrees`, worktrees → `main` và full two-way ordering/ownership preservation đúng; no mutation.
- Parent ignore smoke giữ `.gitkeep`, ignore child Staff/Project paths và không ignore distribution files.
- Clean Ship chưa có Staff/Project production instance; source-instance identity/evidence không nằm trong distribution.
- V0.5.0 source, tag và GitHub Release đã publish; remote clean-clone pass VERSION, clean status, mandatory files, privacy, links, Skills/adapters và parent ignore boundary.
- Public documentation: Vietnamese-first cho học viên Việt Nam; English technical terms MAY giữ nguyên khi rõ nghĩa hơn.