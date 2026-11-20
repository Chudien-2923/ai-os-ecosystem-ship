# AI OS Ecosystem Ship Release

- Source version: V1.0.0
- Updated: 2026-11-20
- Distribution status: chuẩn bị phát hành; tag/GitHub Release V0.5.0 là latest cho tới khi V1.0.0 được publish
- Intelligence contract: V0.2.3
- Staff contract: V0.2.16
- Projects contract: V0.2.3
- Builder App contract: V0.2.2

## Mục đích

Bản ship là clean teaching distribution. Nó giữ generic operating system, Factory specs, runtime hook, portable Skills và khả năng tạo Staff/Project/Builder app từ prompt; không chứa dữ liệu, work, research, output hoặc runtime history của người phát hành.

## Ngôn ngữ phân phối

Public README, changelog, repository description và release notes dùng tiếng Việt làm ngôn ngữ chính vì nhóm học viên chủ yếu là người Việt Nam. Thuật ngữ kỹ thuật MAY giữ bằng tiếng Anh khi cách đó chính xác hoặc dễ hiểu hơn; không dịch máy móc chỉ để thuần Việt.

## SemVer cho Ship

- **Major:** breaking layout, ownership hoặc migration contract.
- **Minor:** capability/spec/Skill mới tương thích ngược.
- **Patch:** bug, security, link, wording hoặc adapter fix không đổi contract chính.

Version Ship độc lập với version bốn component. Một release phải ghi rõ component matrix như header trên.

## Include / exclude

| Loại thay đổi từ hệ thống nguồn | Hành động với Ship |
| --- | --- |
| Generic instruction, Factory rule, spec, Skill, adapter | Đánh giá và port có kiểm chứng |
| Security hoặc compatibility fix | Ưu tiên patch release |
| USER, context, work, daily, meeting, private decision | Không copy |
| Staff/Project instance, brand facts, assets, outputs | Không copy vào clean distribution |
| Learner-created Staff/Project/app repositories | Giữ ngoài parent Ship tracking; mỗi child có standalone Git boundary |
| Runtime hook/script | Ship mã nguồn kèm test; chuỗi prompt và fixture dùng xưng hô trung tính, ví dụ giả |
| Playbook/knowledge | Chỉ ship khi được chọn làm curriculum/public method và không chứa dữ liệu riêng |
| Runtime IDs, transcript, absolute machine path, credentials | Không ship |

## Quy trình phát hành nâng cấp

1. Đọc release hiện hành, source specs/Skills và feedback có evidence.
2. Lập migration matrix: source artifact → ship artifact → include/exclude/transform → compatibility → verification.
3. Áp dụng trên bản Ship source-of-truth; không duplicate private state để rồi cố scrub sau.
4. Chạy privacy scan, mandatory inventory, wikilink/locator, Skill hash/symlink, `bun test` của runtime, learner-data ignore boundary và fresh prompt smoke cho tạo Staff/Project/app.
5. Cập nhật release, registry và log; ghi migration notes cho learner instances.
6. Không tự sửa bản learner đang dùng. Upgrade learner phải giữ `USER`, context, work, child Staff/Project repositories, assets và output; conflict/breaking change cần checkpoint cùng approval.

## Fresh-install acceptance

- Root có bốn product folders `OS Intelligence`, `OS Staff`, `OS Projects`, `OS Builder`; repository metadata gồm README, CHANGELOG, VERSION, `.gitignore` và Git metadata.
- Fresh clone giữ `OS Staff`, `OS Projects`, `OS Builder` bằng `.gitkeep`; placeholder không phải instance data.
- Root `.gitignore` loại learner-created child directories, `OS Worktree/`, sổ `OS Intelligence/.omp/state/` và plugin cài trên máy khỏi parent Ship nhưng không che `.gitkeep`.
- Intelligence có mandatory starter, clean USER/context/work/wiki/registry, danh bạ rỗng và hook `freshness` cài qua `.omp/hooks/pre/freshness.ts`.
- Chín canonical Skills (`skill-creator`, `pre-compact`, `close`, `repo-reconcile`, ba Worktree Sync Skills, `io-map`, `learn`) cùng Claude adapters resolve về đúng realpath.
- `bun test 11-factory` pass từ root `OS Intelligence`.
- Prompt tạo Staff/Project/app route đúng spec, target sibling container, file vận hành bắt buộc và standalone Git boundary.
- Fresh Intelligence session và Staff/Project first-use session hiển thị đúng JSONL path cùng exact resume command khi runtime hỗ trợ; resume command tải lại đúng thread.
- Không có private names, brand data, machine-specific absolute paths, runtime IDs hoặc production artifacts.

## Nâng cấp từ V0.5.0 lên V1.0.0

V1.0.0 là major release. Không có bước nào ghi đè `USER`, context, work hay repo con của bạn; repo con không tự nâng.

**Thay đổi chính:** thêm `OS Builder/`; Intelligence V0.2.2 → V0.2.3 (hook `freshness`, quy tắc một fact một nơi); Staff V0.2.4 → V0.2.16 (learning loop và `/learn` bằng hook, bộ nền plugin, Browser Use, danh bạ, sổ feedback brand, `io-map`); Projects V0.1.4 → V0.2.3 (Team Lead biên tập `brand/`, sổ `brand/feedback.md`, bộ nền công cụ); Builder App V0.2.2 mới; Ship chuyển sang ưu tiên Oh My Pi.

1. **Giữ trạng thái hiện tại.** Trong bản Ship của bạn, commit mọi thay đổi chưa lưu (hoặc tạo một branch backup) trước khi lấy bản mới.
2. **Lấy V1.0.0** từ remote gốc (`git fetch` rồi merge tag `v1.0.0` vào branch của bạn). File bạn sở hữu như `USER.md`, `10-context/`, `02-daily/`, nội dung `03-work/`, `07-wiki/`, `log.md` không bị bản mới sửa nội dung. Nếu có conflict ở `11-factory/registry.md`: lấy bảng component contracts của bản mới, giữ nguyên các dòng instance của bạn. Conflict ở file khác: giữ phần bạn tự thêm, lấy phần contract của bản mới; không chắc thì hỏi Intelligence lập bảng so sánh trước khi chọn.
3. **Cài công cụ nền** theo README gốc (OMP, Bun, plugin Superpowers + Impeccable cho `OS Intelligence`, Browser Use + `bu-headless`; phần Builder chỉ khi cần).
4. **Mở phiên OMP mới** tại `OS Intelligence`. Hook `freshness` chạy từ lượt đầu. Để không bị liệt kê toàn bộ session cũ trước ngày nâng cấp, chạy một lần: `bun 11-factory/intelligence-runtime/freshness-cli.ts baseline --since <YYYY-MM-DD của ngày nâng cấp>`.
5. **Danh bạ:** thêm một dòng cho mỗi Staff/Project đang có vào `11-factory/catalog.md` để hook `ecosystem-catalog` của repo con nhận ra nhau.
6. **Nâng repo con khi cần:** nhờ Intelligence nâng từng Staff hoặc Project theo spec mới (Staff §12, Projects §15). Projects đổi cách giữ brand nên cần checkpoint Git trước và bạn duyệt từng bước; repo nào chưa nâng vẫn chạy theo contract cũ.
7. **Kiểm:** `bun test 11-factory` pass; phiên mới trả lời đúng `Session hiện tại`; `git status` của Ship không hiện repo con.

## Upgrade history

### V1.0.0

- Thêm lớp OS Builder (spec V0.2.2, `builder-runtime/`) và container `OS Builder/`.
- Ship runtime hook kèm test cho Intelligence, Staff, Project và app; script `bu-headless`; danh bạ rỗng.
- Nâng component matrix: Intelligence V0.2.3, Staff V0.2.16, Projects V0.2.3, Builder App V0.2.2; thêm Skill `io-map`, `learn`.
- Hook `freshness` xác định root Intelligence theo vị trí runtime, đúng cả khi Intelligence nằm trong repo Ship.
- Major release: đổi layout, cách giữ brand của Project, OMP-first. Instance không tự nâng; hướng dẫn nâng cấp ở mục trên.
- Kiểm chứng trên bản clone sạch: 167 test, 9 Skill, 141 wikilink, privacy/credential, ignore boundary, năm phiên OMP mới chỉ đọc (lượt đầu, tạo Staff/Project/app, `io-map` không tự bật). Chưa kiểm resume command thật, cài plugin/`create-app.ts` thật trên máy mới, Codex/Claude runtime.

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