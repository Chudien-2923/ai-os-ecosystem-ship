# AI OS Ecosystem Factory

Factory là chức năng của OS Intelligence. Nó duy trì specs/version, tạo hoặc nâng cấp standalone Staff, Project và Builder app repositories, xử lý feedback và theo dõi compatibility.

## Nguồn chính

- [[11-factory/release]] — Ship release hiện hành, component matrix và hướng dẫn nâng cấp.
- [[11-factory/registry]] — instances đã được tạo trong bản của người dùng này.
- [[11-factory/catalog]] — danh bạ Staff/Project/app (ID, một câu mục đích, locator); hook `ecosystem-catalog` chèn danh bạ này vào các repo con.
- [[11-factory/specs/os-intelligence-starter-spec]] — Intelligence V0.2.3: hook `freshness` giữ Markdown đúng hiện trạng (§10.4).
- [[11-factory/specs/os-staff-starter-spec]] — Staff V0.2.16: learning loop và `/learn` bằng hook OMP, bộ nền Impeccable + Superpowers, Browser Use qua `bu-headless`, danh bạ, sổ feedback brand, Skill `io-map`. Quy trình tạo ở §12.
- [[11-factory/specs/os-projects-starter-spec]] — Projects V0.2.3: Team Lead biên tập `brand/`, sổ `brand/feedback.md`, bộ nền công cụ như Staff (§4.2). Quy trình tạo ở §15.
- [[11-factory/specs/os-builder-app-starter-spec]] — Builder App V0.2.2: repo app để người dùng vibe coding trực tiếp; quy trình tạo ở §2.
- [[log]] — lịch sử thay đổi có ý nghĩa; không thay spec/registry.

## Runtime đi kèm

Mã nguồn hook/script nằm trong `11-factory/`; Factory copy vào repo con theo spec. Hook chỉ chạy trong Oh My Pi (OMP); Codex/Claude Code vẫn đọc được Markdown và Skill nhưng không chạy hook.

| Thư mục | Nội dung | Test |
| --- | --- | --- |
| `intelligence-runtime/` | Hook `freshness` của chính Intelligence (cài qua `.omp/hooks/pre/freshness.ts`), CLI `freshness-cli.ts pending\|check\|mark\|baseline`; cấu hình `.omp/freshness.json`, sổ `.omp/state/` ngoài Git | `bun test 11-factory/intelligence-runtime` |
| `staff-runtime/` | Hook `learning-loop` và adapter `/learn` cho Staff | `bun test 11-factory/staff-runtime` |
| `project-runtime/` | Hook `project-health`, Skill `brand-curation`, template sổ feedback và khối `AGENTS.md` Team Lead; bảng nguồn → đích ở `project-runtime/README.md` | `bun test 11-factory/project-runtime` |
| `shared-runtime/` | Hook `ecosystem-catalog` cho Staff/Project/app; script `bu-headless` (Browser Use trên Chromium headless riêng, macOS); test của Skill `io-map` | `bun test 11-factory/shared-runtime` |
| `builder-runtime/` | `create-app.ts` dựng repo app, hook `check-gate.ts`, `template/` | `bun test 11-factory/builder-runtime` |

Công cụ cần cài trên máy (OMP, Bun, Git, Orca, plugin, Browser Use, phần riêng của Builder) ở README gốc của Ship.

## Layout của ecosystem

Từ root `OS Intelligence`:

- `../OS Staff/`, `../OS Projects/`, `../OS Builder/` — container tổ chức local; ban đầu chỉ có `.gitkeep`.
- Mỗi Staff/Project/app bên trong là một standalone Git repository với history, remote, approval và recovery độc lập.
- `../OS Worktree/<repo>/<worktree>` — nơi đặt Git worktree khi cần; không tạo worktree cùng cấp với repo chính.
- Intelligence giữ Factory, context chung, research, Playbook và Skills của Chief of Staff.

Không tạo Staff/Project/app bên trong Intelligence, không init Git tại ba container và không dùng parent Ship repository để version dữ liệu của người dùng. Root `.gitignore` loại các thư mục con khỏi parent repository.

## Tạo repo từ prompt

Prompt tự nhiên là đủ, ví dụ “tạo cho tôi một AI Content Writer”, “tạo Project cho brand X”, “tạo app quản lý lịch hẹn”.

1. Rút từ prompt và context đã có: vai trò hoặc brand hoặc mục đích app, outcome, Project liên quan. Chỉ hỏi phần thiếu ảnh hưởng kết quả; Builder chỉ hỏi đúng ba thông tin theo spec.
2. Đề xuất stable ID lowercase-kebab-case và target trong đúng container; kiểm tra target trước khi ghi.
3. Đọc đúng quy trình trong spec (Staff §12, Projects §15, Builder §2) và lập implementation matrix: artifact → path → bắt buộc/điều kiện → nguồn → cách kiểm.
4. Tạo nội dung thật theo spec, gồm `README.md`, `VERSION`, `CHANGELOG.md`, hook/Skill/plugin bắt buộc. File chưa có dữ liệu nói đúng trạng thái; không bịa brand facts hay placeholder giả.
5. `AGENTS.md` của repo con có mục `Session hiện tại` ở câu trả lời đầu tiên (JSONL path và exact resume command từ runtime metadata).
6. Yêu cầu tạo Staff/Project/app là approval cho `git init` + root commit local tại root repo con; remote, push, tag cần người dùng duyệt riêng.
7. Mở mọi link/locator, chạy scenario first-use bằng phiên OMP mới, rồi cập nhật [[11-factory/registry]] và thêm dòng vào [[11-factory/catalog]] cùng lượt. Project mới thêm vào [[04-projects/index]].

## Upgrade

Spec hoặc Ship release mới không tự nâng instance của người dùng. Trước migration phải phân biệt:

- generic system behavior/spec/Skill/hook có thể nâng;
- `USER`, context, work, research, repo con Staff/Project/app, assets và outputs phải giữ;
- parent Ship ignore boundary không thay quyền hoặc history của repo con;
- conflict hoặc breaking migration cần checkpoint và approval.

Quy trình đầy đủ ở [[11-factory/release]].
