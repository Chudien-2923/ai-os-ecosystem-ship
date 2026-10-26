# AI OS Ecosystem Registry

- Ship source: V0.4.0 candidate trên GitHub `main`; latest tagged public release: V0.3.0.
- Last reconciled: 2026-10-26
- Root convention: sibling `OS Intelligence`, non-Git containers `OS Staff`/`OS Projects`, child standalone repositories

## Component contracts

| Component | Version | Source | Status |
| --- | --- | --- | --- |
| Intelligence | V0.2.2 | [[11-factory/specs/os-intelligence-starter-spec]] | Clean starter installed; session locator, learner-data boundary và current Skill integration guidance included |
| Staff | V0.2.4 | [[11-factory/specs/os-staff-starter-spec]] | Factory-ready; no instance yet; repository metadata, standalone Git và session locator mandatory |
| Projects | V0.1.4 | [[11-factory/specs/os-projects-starter-spec]] | Factory-ready; no instance yet; repository metadata, standalone Git và session locator mandatory |

## Instances

| Type | ID | Locator from Intelligence root | Version | Last verification |
| --- | --- | --- | --- | --- |
| Staff | — | `../OS Staff/` | — | Container chỉ có `.gitkeep`; child directories bị parent Ship ignore |
| Project | — | `../OS Projects/` | — | Container chỉ có `.gitkeep`; child directories bị parent Ship ignore |

Version metadata không chứng minh runtime. Sau khi tạo hoặc nâng instance, mở repo thật, chạy scenario liên quan rồi cập nhật bảng; không ghi `passed` từ file existence đơn thuần.

## Ship verification

- V0.4.0 candidate mandatory inventory/version, privacy/credential scan và 110 active wikilinks/headings: pass.
- Skill trees khớp source; lock cùng bytes; ba Claude adapters cùng realpath; official validator pass cho ba Skills.
- Fresh OMP 18.12.6 read-only orchestration smoke: same-worker correction, fresh worker tại accepted natural gate, Progressive Context Gate, parallel boundary, risk-based verification, receipt và model/autocompact policy đều đúng; no mutation.
- Parent ignore smoke giữ `.gitkeep`, ignore child Staff/Project paths và không ignore distribution files.
- Clean Ship chưa có Staff/Project production instance; source-instance identity/evidence không nằm trong distribution.
- V0.4.0 content commit `350b97615fc23cd37d71dc5a8e2707b1e3143916` đã push; remote clean-clone pass VERSION, clean status, mandatory files, privacy, 110 links, Skills/adapters và parent ignore boundary. Tag/GitHub Release V0.4.0 chưa tạo.
- Public documentation: Vietnamese-first cho học viên Việt Nam; English technical terms MAY giữ nguyên khi rõ nghĩa hơn.