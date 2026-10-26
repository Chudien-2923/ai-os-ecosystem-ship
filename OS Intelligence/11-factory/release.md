# AI OS Ecosystem Ship Release

- Source version: V0.5.0
- Updated: 2026-10-26
- Distribution status: GitHub `main`; tag/GitHub Release V0.5.0 là latest
- Intelligence contract: V0.2.2
- Staff contract: V0.2.4
- Projects contract: V0.1.4

## Mục đích

Bản ship là clean teaching distribution. Nó giữ generic operating system, Factory specs, portable Skills và khả năng tạo Staff/Project từ prompt; không chứa dữ liệu, work, research, output hoặc runtime history của người phát hành.

## Ngôn ngữ phân phối

Public README, changelog, repository description và release notes dùng tiếng Việt làm ngôn ngữ chính vì nhóm học viên chủ yếu là người Việt Nam. Thuật ngữ kỹ thuật MAY giữ bằng tiếng Anh khi cách đó chính xác hoặc dễ hiểu hơn; không dịch máy móc chỉ để thuần Việt.

## SemVer cho Ship

- **Major:** breaking layout, ownership hoặc migration contract.
- **Minor:** capability/spec/Skill mới tương thích ngược.
- **Patch:** bug, security, link, wording hoặc adapter fix không đổi contract chính.

Version Ship độc lập với version ba component. Một release phải ghi rõ component matrix như header trên.

## Include / exclude

| Loại thay đổi từ hệ thống nguồn | Hành động với Ship |
| --- | --- |
| Generic instruction, Factory rule, spec, Skill, adapter | Đánh giá và port có kiểm chứng |
| Security hoặc compatibility fix | Ưu tiên patch release |
| USER, context, work, daily, meeting, private decision | Không copy |
| Staff/Project instance, brand facts, assets, outputs | Không copy vào clean distribution |
| Learner-created Staff/Project repositories | Giữ ngoài parent Ship tracking; mỗi child có standalone Git boundary |
| Playbook/knowledge | Chỉ ship khi được chọn làm curriculum/public method và không chứa dữ liệu riêng |
| Runtime IDs, transcript, absolute machine path, credentials | Không ship |

## Quy trình phát hành nâng cấp

1. Đọc release hiện hành, source specs/Skills và feedback có evidence.
2. Lập migration matrix: source artifact → ship artifact → include/exclude/transform → compatibility → verification.
3. Áp dụng trên bản Ship source-of-truth; không duplicate private state để rồi cố scrub sau.
4. Chạy privacy scan, mandatory inventory, wikilink/locator, Skill hash/symlink, learner-data ignore boundary và fresh prompt smoke cho tạo Staff/Project.
5. Cập nhật release, registry và log; ghi migration notes cho learner instances.
6. Không tự sửa bản learner đang dùng. Upgrade learner phải giữ `USER`, context, work, child Staff/Project repositories, assets và output; conflict/breaking change cần checkpoint cùng approval.

## Fresh-install acceptance

- Root có ba product folders `OS Intelligence`, `OS Staff`, `OS Projects`; repository metadata gồm README, CHANGELOG, VERSION, `.gitignore` và Git metadata.
- Fresh clone giữ `OS Staff` và `OS Projects` bằng `.gitkeep`; hai placeholder không phải Staff/Project data.
- Root `.gitignore` loại learner-created child directories khỏi parent Ship nhưng không che `.gitkeep`.
- Intelligence có mandatory starter, clean USER/context/work/wiki/registry.
- Bảy canonical Skills (`skill-creator`, `pre-compact`, `close`, `repo-reconcile` và ba Worktree Sync Skills) cùng Claude adapters resolve về đúng realpath.
- Prompt tạo Staff/Project route đúng spec, target sibling container, mandatory `README.md`/`VERSION`/`CHANGELOG.md` và standalone Git boundary.
- Fresh Intelligence session và Staff/Project first-use session hiển thị đúng JSONL path cùng exact resume command khi runtime hỗ trợ; resume command tải lại đúng thread.
- Không có private names, brand data, machine-specific absolute paths, runtime IDs hoặc production artifacts.

## Upgrade history

### V0.5.0

- Thêm repository hygiene capability: `repo-reconcile` dùng evidence hierarchy, bảo toàn historical records và bắt exact approval trước delete/move/archive.
- Thêm ba Worktree Sync Skills cho từng hướng local `main`/worktrees; dirty/draft/concurrently owned state được preserve, commit/merge dùng approval packet và remote push ngoài scope mặc định.
- Nâng continuity contract: explicit Inbox routing, event-based Daily và no-backfill mặc định trong `pre-compact`.
- Component contracts/layout giữ nguyên; learner instance không tự nâng và migration phải giữ learner state.
- Seven-Skill validation, privacy/inventory/link/ignore/clean-clone checks và fresh OMP direction/gate smokes pass.
- Source, tag và GitHub Release V0.5.0 đã phát hành; release được đánh dấu Latest.

### V0.4.0

- Thêm generic Orchestration V2: outcome contract, Progressive Context Gate, one implementation owner, risk-based verification và Natural Gate Receipt.
- Thêm worker continuity curriculum: reuse trong feedback loop, fresh worker tại accepted natural gate, recovery trước duplicate.
- Dạy model/autocompact theo risk và provider economics hiện hành; không ship tên model, pricing, threshold hoặc global config riêng của người phát hành.
- Component contracts và layout giữ nguyên. Learner instance không tự nâng; migration phải giữ toàn bộ learner state.
- Git checkpoints/push và remote clean-clone proof pass: VERSION 0.4.0, clean status, mandatory files, privacy, 110 links, Skills/adapters và parent ignore boundary đều đạt.
- Source, tag và GitHub Release V0.4.0 đã phát hành; release được đánh dấu Latest.

### V0.3.0

- Bổ sung repository metadata bắt buộc và standalone Git boundary cho mọi Staff/Project mới.
- Thêm parent `.gitignore` bảo vệ learner-created child repositories khỏi accidental commit vào Ship.
- Nâng generic AGENTS/Skill authoring contract, scrub source-instance identity và giữ Skills bundled không đổi.
- Source, tag và GitHub Release V0.3.0 đã phát hành; V0.2.0 được backfill thành historical release.

### V0.2.0

- Thêm session JSONL/resume locator cho Intelligence và contract bắt buộc trong mọi Staff/Project mới.
- Nâng component matrix lên Intelligence V0.2.2, Staff V0.2.4 và Projects V0.1.4.
- Giữ runtime transcript/cache ngoài repo; learner instance không bị ghi đè khi nâng cấp.
- Source V0.2.0 được giữ tại historical tag/GitHub Release V0.2.0.

### V0.1.2

- Việt hóa public README, changelog, GitHub description và release notes theo audience contract.
- Giữ English technical terms khi rõ nghĩa hơn.
- Component contracts, runtime behavior, Skills và privacy boundary không đổi.

### V0.1.1

- Thêm public README, root VERSION và CHANGELOG.
- Giữ hai product folders rỗng qua `.gitkeep` để fresh clone tái tạo đúng layout.
- Chuẩn bị public GitHub metadata và release notes; component contracts không đổi.

### V0.1.0

Initial clean teaching distribution.

Verification:

- Root/empty instance folders, mandatory Intelligence inventory và privacy scan: pass.
- 97 active wikilinks/headings: pass.
- Exact Skill trees/lock/adapters và official validation cho ba Skills: pass.
- Fresh OMP 18.11.3 read-only Staff/Project creation prompts: pass, no mutation.