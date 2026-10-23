# OS Intelligence Log

## 2026-10-17 — AI OS Ecosystem Ship V0.1.0

- Phát hành clean teaching distribution với ba sibling folder: `OS Intelligence`, `OS Staff`, `OS Projects`.
- `OS Staff` và `OS Projects` bắt đầu rỗng; Intelligence tạo instance theo prompt và specs hiện hành.
- Component contracts: Intelligence V0.2.1, Staff V0.2.3, Projects V0.1.3.
- Giữ portable Skills `skill-creator`, `pre-compact`, `close` và Claude symlink adapters.
- Không chứa hồ sơ, Project, Staff, work, research, raw source, output hoặc lịch sử runtime của người phát hành.
- Upgrade policy và release history ở [[11-factory/release]].
- Fresh-install inventory, privacy, wikilinks/headings, Skill hashes/adapters/official validation đều pass.
- Fresh OMP 18.11.3 read-only prompts xác nhận Intelligence route đúng quy trình tạo Staff và Project; không mutation.

## 2026-10-17 — Ship V0.1.1 public packaging

- Thêm root README, VERSION và CHANGELOG để GitHub hiển thị mục đích, version matrix và release history.
- Thêm `.gitkeep` trong `OS Staff` và `OS Projects` để fresh clone giữ hai product folders chưa có instance.
- Component contracts giữ nguyên; đây là Ship patch release về packaging và documentation.

## 2026-10-17 — Ship V0.1.2 Vietnamese-first public docs

- Correction từ người phát hành: học viên chủ yếu là người Việt Nam nên README và public release documentation dùng tiếng Việt làm ngôn ngữ chính.
- Thuật ngữ kỹ thuật tiếng Anh được giữ khi rõ nghĩa hơn; không dịch máy móc.
- Component contracts và behavior không đổi; đây là documentation/localization patch release.

## 2026-10-18 — Ship V0.2.0 session resume source

- Thêm session JSONL/resume locator vào clean Intelligence và Factory contracts cho mọi Staff/Project mới.
- Nâng component matrix lên Intelligence V0.2.2, Staff V0.2.4 và Projects V0.1.4.
- Giữ transcript, runtime IDs, indexes và caches ngoài distribution; source được commit/push lên `main`; tag/GitHub Release V0.2.0 được backfill trong đợt V0.3.0.
- Fresh OMP clean-Intelligence smoke trả đúng JSONL locator và exact resume command; terminal mới dùng command đó tải lại đúng thread. Fresh read-only Factory prompt nêu đúng mandatory Staff/Project behavior và component matrix, không mutation. Source instances cũng pass nhưng không được coi là learner-instance evidence trong clean Ship.

## 2026-10-23 — Ship V0.3.0 standalone repository boundary

- Đồng bộ clean Factory contracts với repository metadata `README.md`, `VERSION`, `CHANGELOG.md` và standalone Git boundary cho mọi Staff/Project mới.
- Thêm root `.gitignore` để parent Ship không track learner-created child repositories; giữ `.gitkeep` và distribution files nhìn thấy.
- Nâng generic Skill integration guidance; bundled Skill trees/lock/adapters không đổi và official validation pass.
- Privacy, inventory, active wikilinks/headings, Factory planning smoke và clean-clone boundary pass; không đưa source-instance identity, USER/context/work/assets/output vào distribution.
- Source/tag/GitHub Release V0.3.0 được publish; V0.2.0 được backfill thành historical release.
