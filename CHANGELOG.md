# Lịch sử thay đổi

Mọi thay đổi đáng kể của AI OS Ecosystem Ship được ghi tại đây. Ship dùng SemVer độc lập với version của OS Intelligence, Staff và Projects.

## [V0.4.0] — 2026-10-26

### Đã thêm

- Orchestration V2 cho Intelligence: outcome contract thích ứng, Progressive Context Gate, one-owner default và Natural Gate Receipt.
- Worker continuity curriculum: reuse trong cùng feedback loop, fresh worker tại accepted natural gate và recovery trước duplicate.
- Risk-based verification ownership và model/context routing dựa trên độ rủi ro thay vì một model hoặc ngưỡng provider cố định.

### Đã thay đổi

- Autocompact được hướng dẫn theo economics của từng model/provider; context window không còn được coi là mục tiêu phải dùng hết.
- Parallel implementation chỉ hợp lệ khi ownership, interface contract và verification boundary đều độc lập trước dispatch.

### Đã kiểm chứng

- Mandatory inventory/version consistency, privacy/credential scan và 110 active wikilinks/headings.
- Bundled Skill tree/hash/lock/symlink parity cùng official validation cho ba Skills; parent learner-data ignore boundary.
- Fresh OMP 18.12.6 read-only orchestration scenario chọn đúng same-worker correction, fresh worker tại natural gate, Progressive Context Gate, verification ownership và durable receipt; không mutation.

### Tương thích và trạng thái

- Component contracts giữ nguyên: Intelligence V0.2.2, Staff V0.2.4, Projects V0.1.4.
- Source candidate đã commit/push lên GitHub `main` tại content commit `350b97615fc23cd37d71dc5a8e2707b1e3143916`; remote clean-clone proof pass. Tag và GitHub Release V0.4.0 chưa tạo; latest tagged release vẫn là V0.3.0.

## [V0.3.0] — 2026-10-23

### Đã thêm

- Standalone-repository contract cho từng Staff/Project; `OS Staff` và `OS Projects` chỉ là container local.
- `README.md`, `VERSION` và `CHANGELOG.md` vào mandatory starter của mọi Staff/Project mới.
- Root `.gitignore` bảo vệ learner-created child repositories và local artifacts khỏi parent Ship repository.

### Đã thay đổi

- Đồng bộ Factory index và clean specs với generic contract hiện hành, không mang absolute path, tên instance hoặc private evidence từ source ecosystem.
- Nâng Skill integration guidance: portable metadata, canonical adapter realpath, fresh-session activation, eval theo rủi ro và xử lý output không tin cậy.
- Generalize release evidence để không lộ identity của private source instances.

### Đã kiểm chứng

- Fresh-install inventory, privacy scan, active wikilinks/headings, Skill tree/hash/symlink và official Skill validation.
- Factory planning smoke cho Staff/Project bắt buộc repository metadata, standalone Git boundary, session locator và không mutation.
- Parent Git ignore boundary giữ `.gitkeep` nhưng loại child Staff/Project data.

### Trạng thái phát hành

- Source, tag và GitHub Release V0.3.0 được phát hành trên public repository.
- V0.2.0 được backfill thành historical tag/release tại commit source tương ứng.

## [V0.2.0] — 2026-10-18

### Đã thêm

- `Session hiện tại` trong câu trả lời đầu tiên của Intelligence, Staff và Project: transcript JSONL path cùng exact resume command từ runtime metadata.
- Factory contract để mọi Staff/Project được tạo sau này mang cùng cơ chế, không commit transcript/cache vào repo.

### Đã thay đổi

- Nâng component matrix lên Intelligence V0.2.2, Staff V0.2.4 và Projects V0.1.4.
- Bổ sung fresh-session/resume acceptance cho learner setup.

### Trạng thái phát hành

- Source V0.2.0 được commit/push lên GitHub `main`; tag/GitHub Release được backfill khi phát hành V0.3.0.

## [V0.1.2] — 2026-10-17

### Đã thay đổi

- Việt hóa README và Changelog cho nhóm học viên chủ yếu là người Việt Nam.
- Giữ các thuật ngữ kỹ thuật bằng tiếng Anh khi rõ nghĩa hơn thay vì dịch máy móc.
- Chuyển GitHub repository description và release notes hiện hành sang tiếng Việt.
- Thêm Vietnamese-first audience contract vào Ship release metadata.

### Không thay đổi

- Component contracts vẫn là Intelligence V0.2.1, Staff V0.2.3 và Projects V0.1.3.
- Cấu trúc, Skills, Factory behavior và privacy boundary giữ nguyên.

## [V0.1.1] — 2026-10-17

### Đã thêm

- Public GitHub README với hướng dẫn setup, kiến trúc, privacy boundary và versioning.
- Root `VERSION` để tool đọc được Ship version.
- `.gitkeep` để fresh clone giữ hai product folders `OS Staff` và `OS Projects` chưa có instance data.
- GitHub repository metadata và release notes workflow.

### Đã thay đổi

- Fresh-install acceptance phân biệt ba product folders với repository metadata files.
- Nâng Ship metadata từ V0.1.0 lên V0.1.1; component contract versions không đổi.

## [V0.1.0] — 2026-10-17

### Đã thêm

- Clean teaching distribution đầu tiên.
- OS Intelligence V0.2.1 clean starter.
- Factory specs cho OS Staff V0.2.3 và OS Projects V0.1.3.
- Portable Skills `skill-creator`, `pre-compact`, `close` cùng Claude adapters.
- Factory routing để tạo Staff và Project từ natural-language prompt.
- Ship SemVer, migration contract, registry và release-local log.

### Đã kiểm chứng

- Mandatory starter inventory và privacy scan.
- 97 active wikilinks/headings.
- Exact Skill trees, lock file và Claude adapter realpaths.
- Official validation cho cả ba bundled Skills.
- Fresh OMP read-only smoke cho prompt tạo Staff và Project.