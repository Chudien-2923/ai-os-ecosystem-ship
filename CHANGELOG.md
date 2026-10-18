# Lịch sử thay đổi

Mọi thay đổi đáng kể của AI OS Ecosystem Ship được ghi tại đây. Ship dùng SemVer độc lập với version của OS Intelligence, Staff và Projects.

## [V0.2.0] — 2026-10-18

### Đã thêm

- `Session hiện tại` trong câu trả lời đầu tiên của Intelligence, Staff và Project: transcript JSONL path cùng exact resume command từ runtime metadata.
- Factory contract để mọi Staff/Project được tạo sau này mang cùng cơ chế, không commit transcript/cache vào repo.

### Đã thay đổi

- Nâng component matrix lên Intelligence V0.2.2, Staff V0.2.4 và Projects V0.1.4.
- Bổ sung fresh-session/resume acceptance cho learner setup.

### Trạng thái phát hành

- Source V0.2.0 được commit/push lên GitHub `main`; tag và GitHub Release V0.2.0 chưa được tạo.

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