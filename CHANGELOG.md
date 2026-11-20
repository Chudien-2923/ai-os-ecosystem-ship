# Lịch sử thay đổi

Mọi thay đổi đáng kể của AI OS Ecosystem Ship được ghi tại đây. Ship dùng SemVer độc lập với version của OS Intelligence, Staff, Projects và Builder App.

## [V1.0.0] — 2026-11-20

### Đã thêm

- Lớp thứ tư **OS Builder**: container `OS Builder/`, spec Builder App V0.2.2 và `11-factory/builder-runtime/` (`create-app.ts`, hook `check-gate`, template) để tạo repo app cho người dùng vibe coding trực tiếp.
- Runtime hook cho Oh My Pi kèm test: `freshness` cho Intelligence (session cũ chưa đối soát, dấu hiệu Markdown cũ, session song song), `learning-loop` và `/learn` cho Staff, `project-health` và Skill `brand-curation` cho Project, `ecosystem-catalog` cho mọi repo con; script `bu-headless` chạy Browser Use trên Chromium headless riêng (macOS).
- Danh bạ `11-factory/catalog.md` (bản sạch rỗng) để Staff/Project/app biết nhau.
- Skill `io-map` (Input/Output kèm bản đồ Excalidraw, chỉ bật khi người dùng yêu cầu) và `learn` (chế độ học); Playbook Input/Output và knowledge về ownership xuyên repo.
- README có mục cài công cụ nền; `release.md` có hướng dẫn nâng cấp từ V0.5.0.

### Đã thay đổi

- Intelligence V0.2.3: hook `freshness`, quy tắc một fact một nơi, mục `Đang cân nhắc`, chế độ đối soát session cũ của `pre-compact`.
- Staff V0.2.16: learning loop theo chủ đề với archive/quên/hạn dùng, `/learn` dùng Skill Creator, bộ nền Impeccable + Superpowers, Browser Use qua `bu-headless`, ranh giới không điều khiển máy/trình duyệt cá nhân, danh bạ, sổ feedback brand, `io-map`.
- Projects V0.2.3: Team Lead tại root Project biên tập `brand/` hai tầng, Staff ghi sổ `brand/feedback.md` ngay, workstream có `log.md`, file sản xuất ngoài Git, bộ nền công cụ như Staff.
- Orchestration: follow-up chỉ gửi delta, placement đúng workspace, `--task-title`, đo context tại natural gate, retain/release quyết định lúc nghiệm thu, boundary xuyên repo gồm Builder.
- Spec và plan ghi vào file theo dõi việc, không tạo `docs/superpowers/` (trừ repo Builder app).
- Ship chuyển sang ưu tiên Oh My Pi; Codex/Claude Code đọc được Markdown và Skill nhưng không chạy hook.

### Đã kiểm chứng

- Bản clone sạch: layout bốn container với `.gitkeep`; `.gitignore` loại repo con, `OS Worktree/`, sổ `.omp/state/` và plugin cài trên máy.
- `bun test 11-factory`: 167 test pass trên 10 file.
- Chín Skill hợp lệ theo validator chính thức; chín Claude adapter cùng realpath; 141 wikilink/heading mở được; quét dữ liệu riêng và credential không còn kết quả.
- Hook `freshness` nhận đúng root `OS Intelligence` khi nằm trong repo Ship; danh bạ rỗng thì hook `ecosystem-catalog` im lặng; `baseline` đưa session cũ về 0.
- Phiên Oh My Pi mới, chỉ đọc: lượt đầu, tạo Staff, tạo Project, tạo Builder app đều route đúng spec; việc nhiều hạng mục không tự bật `io-map`; không ghi file ngoài sổ `.omp/state/` đã ignore.

### Tương thích và trạng thái

- Component contracts: Intelligence V0.2.3, Staff V0.2.16, Projects V0.2.3, Builder App V0.2.2.
- Major release vì đổi layout, cách giữ brand của Project và chuyển sang OMP-first. Instance của người dùng không tự nâng; xem hướng dẫn nâng cấp trong `OS Intelligence/11-factory/release.md`.
- Chưa kiểm: resume command thật (Orca chưa index bản clone tạm), chạy `create-app.ts` và cài plugin thật trên máy học viên mới, Codex/Claude Code runtime.

## [V0.5.0] — 2026-10-26

### Đã thêm

- `repo-reconcile` để audit toàn bộ repository/history, cập nhật current-state information có evidence và lập cleanup proposal; delete/move/archive luôn dừng ở exact approval gate.
- Ba Worktree Sync Skills: local `main → worktrees`, completed worktrees → local `main`, và full two-way reconciliation với ownership/conflict/verification gates.

### Đã thay đổi

- `pre-compact` route explicit deferred/unowned input vào Inbox và tạo Daily theo event-based trigger thay vì theo mỗi session/ngày.
- Inbox/Daily starter contract phân biệt hàng chờ tạm, date index và canonical WORK/log/Project/Staff owners.
- Runtime validation cho Codex/Claude trở thành conditional theo provider availability; fresh OMP và static adapter/discovery vẫn bắt buộc.

### Đã kiểm chứng

- Seven bundled Skills, eval JSON, Claude adapter realpaths và official Skill validation.
- Privacy/inventory/wikilink/parent-ignore/clean-clone checks cùng fresh OMP read-only smokes cho destructive gate và ba hướng worktree synchronization.

### Tương thích và trạng thái

- Component contracts giữ nguyên: Intelligence V0.2.2, Staff V0.2.4, Projects V0.1.4.
- V0.5.0 là backward-compatible minor release; learner instance không tự nâng và migration phải giữ learner state.

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
- Source, tag và GitHub Release V0.4.0 đã phát hành; release được đánh dấu Latest. Remote clean-clone proof của source candidate pass trước release.

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