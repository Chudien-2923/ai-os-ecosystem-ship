# OS Builder App Starter Spec

- Version: 0.2.2
- V0.2.1 thêm hook danh bạ hệ sinh thái `ecosystem-catalog`.
- V0.2.2 thêm Ponytail cho repo Builder tạo mới.
- Status: active cho repo Builder app tạo mới. Repo đã tạo không tự nâng phiên bản.
- Source dùng lại: `11-factory/builder-runtime/` (`create-app.ts`, `check-gate.ts`, `template/`) và `11-factory/shared-runtime/ecosystem-catalog.ts`. Test: `bun test 11-factory/builder-runtime 11-factory/shared-runtime`.

## 1. Mục đích và ownership

Builder app là một Git repository độc lập cho một ứng dụng, tool, extension, website hoặc funnel, nằm trong container non-Git `OS Builder`. Không tạo monorepo hay package dùng chung trước khi có ít nhất hai app thật cần.

- Người dùng làm việc trực tiếp tại repo app sau khi Intelligence tạo repo.
- Intelligence (Factory) sở hữu spec, template, hook và việc tạo repo; không giữ code, spec sản phẩm hay plan của app.
- Repo app sở hữu PRD/spec sản phẩm, plan, code, test, cấu hình deploy và Gotchas của chính nó.
- Project liên quan (nếu có) giữ business/brand facts và approvals; repo app chỉ giữ locator.

## 2. Quy trình tạo repo

1. Hỏi người dùng đúng 3 thông tin: tên repo (kebab-case), mục đích 1–2 câu, Project liên quan (locator hoặc "không có"). Không hỏi stack; stack chốt trong buổi brainstorm đầu tiên ở repo.
2. Chạy `bun 11-factory/builder-runtime/create-app.ts --name <tên> --purpose "<mục đích>" [--project "<locator>"]`. Script tự dừng, không ghi gì, khi: tên sai dạng, đích đã tồn tại, Node hệ thống < 24.22.1, `rea --version` khác bản ở §4, thiếu marketplace, thiếu Skill REA trong package global.
   - Nếu máy chưa đăng ký marketplace Ponytail, chạy `omp plugin marketplace add DietrichGebert/ponytail` một lần. Đây chỉ là đăng ký nguồn; plugin được cài cấp repo, không cài cấp người dùng.
3. Kiểm chứng theo §7.
4. Root commit local `chore: bootstrap builder app <tên>`. Yêu cầu tạo repo Builder của người dùng là approval cho `git init` + root commit local; remote, push, tag và release cần duyệt riêng.
5. Đăng ký repo trong Orca để người dùng mở được; không chạy setup hook không kiểm soát.
6. Cập nhật [[11-factory/registry]] và thêm dòng app vào [[11-factory/catalog]] (ID, một câu mục đích, `· liên quan:` nếu có, locator); báo người dùng đường dẫn repo.

## 3. Cấu trúc repo lúc tạo

```text
<tên>/
├── AGENTS.md                 # contract làm việc (§5), từ template/AGENTS.md
├── CLAUDE.md -> AGENTS.md    # symlink tương đối
├── README.md
├── CHANGELOG.md
├── .gitignore                # secrets, dependency/build output, .omp/plugins/node_modules/, .superpowers/
├── .agents/skills/reverse-engineer-anything/   # Skill REA, đúng bản CLI global
└── .omp/
    ├── mcp.json              # server rea, "enabled": false
    ├── hooks/pre/check-gate.ts
    ├── hooks/pre/ecosystem-catalog.ts   # chèn danh bạ Staff/Project/app, copy từ shared-runtime
    └── plugins/installed_plugins.json, omp-plugins.lock.json
```

- Không tạo sẵn `scripts/check.sh`, `docs/`, `VERSION` hay thư mục source; chúng ra đời khi đã chọn stack. Không tạo `memory.md`/`log.md`: Git, CHANGELOG, `docs/superpowers/` và mục Gotchas là trí nhớ của repo.
- `installed_plugins.json` chứa đường dẫn tuyệt đối tới cache plugin trên máy người dùng. Repo định công khai phải rà file này trước.
- Plugin và hook chỉ chạy trong OMP; mở repo bằng Claude Code/Codex sẽ không có chúng.
- Hook `ecosystem-catalog.ts` đọc `OS Intelligence/11-factory/catalog.md` ngoài repo (tìm ngược thư mục cha, chạy được trong worktree), chèn đầu phiên/sau compaction/khi danh bạ đổi, bỏ dòng của chính app theo heading `# <tên>` của AGENTS.md; máy không có danh bạ thì im lặng. Không ghi file vào repo, nên repo public không chứa nội dung danh bạ.

## 4. Thư viện cài sẵn

| Thư viện | Cách cài | Vai trò |
|---|---|---|
| Superpowers (`obra/superpowers`) | `omp plugin install superpowers@superpowers-marketplace --scope project` | brainstorm → spec → plan → code → kiểm tra |
| Impeccable (`pbakaus/impeccable`) | `omp plugin install impeccable@impeccable --scope project` | thiết kế giao diện |
| Logo Design (`kaankiziltug/logo-design-skill`) | `omp plugin install logo-design@logo-design-skill --scope project` | logo, app icon, favicon, nhận diện |
| Ponytail (`DietrichGebert/ponytail`) | `omp plugin install ponytail@ponytail --scope project` | Giữ giải pháp đủ dùng với ít code mới; plugin kèm skill và extension OMP, không dùng MCP |
| REA (`morluto/rea`) 6.8.0 | CLI global `npm install --global rea-agents@6.8.0`; Skill copy vào `.agents/skills/`; MCP khai báo `.omp/mcp.json` **tắt sẵn** | phân tích ngược app/web có sẵn |

- REA không cài qua `omp plugin` vì OMP chưa hỗ trợ nguồn npm. REA cần Node ≥ 24.22.1.
- REA MCP tắt sẵn vì bật tốn thêm khoảng 24.000 token mỗi request (đo khi viết spec). Agent bật khi cần theo §5, người dùng mở lại session.
- Ponytail tự nạp quy tắc mỗi lượt OMP ở chế độ đang bật (mặc định upstream là `full`); `/ponytail off` tắt cho phiên hiện tại. Không thay quy trình Superpowers hay các bước kiểm tra.
- Nâng bản thư viện: cập nhật hằng số trong `create-app.ts` và bảng này cùng lúc; repo đã tạo không tự nâng.

## 5. Contract AGENTS.md

Template `11-factory/builder-runtime/template/AGENTS.md`, mục tiêu ≤ ~80 dòng, gồm: dự án (mục đích, Project, dòng hệ sinh thái, trạng thái, trỏ spec/plan đang chạy); khối routing "khi nào dùng thư viện nào"; lệnh kiểm tra; thủ tục bật REA; quy tắc commit; ranh giới quyền; Gotchas. Dòng hệ sinh thái: chỉ đọc repo khác khi việc cần, không sửa; không chép tên, mục đích, đường dẫn từ danh bạ vào file commit — tham chiếu riêng để ở file gitignore.

Khối routing (đã duyệt, giữ nguyên ý):

- Việc mới hoặc đổi hành vi → Superpowers.
- Phần nhìn thấy được → Impeccable, sau khi brainstorm đã chốt làm gì.
- Làm giống tính năng của app/web có sẵn → REA trước, rồi brainstorm.
- Logo, app icon, favicon, nhận diện thương hiệu → Logo Design.
- Khi triển khai → Ponytail bổ trợ chọn giải pháp đơn giản, không thay quy trình Superpowers.
- Sửa nhỏ, rõ ràng → làm thẳng.

PRD/spec dài để trong `docs/`; AGENTS.md chỉ trỏ tới. Gotchas chỉ ghi lỗi đã gây làm lại thật.

## 6. Lệnh kiểm tra và hook

- `scripts/check.sh` là cổng kiểm tra duy nhất của mọi stack (JS gọi `npm run check`, Swift gọi `swift build` + `swift test`…). Task đầu tiên của plan đầu tiên phải tạo nó.
- Hook `check-gate.ts`, chỉ cho Agent chính:
  - Chụp file khác `HEAD` lúc `agent_start` và lúc `agent_end` ổn định; bỏ qua `*.md`, `*.mdx`, `.omp/**` và file bị gitignore. File người dùng tự sửa giữa hai lượt không tính.
  - Không có file code đổi → không làm gì.
  - Chưa có `scripts/check.sh` → nhắc một lần mỗi session, không mở lượt.
  - Pass → im lặng. Fail → gửi ≤ 60 dòng cuối output và mở lượt tự sửa; tối đa 2 vòng; vòng thứ 3 fail → dừng, báo người dùng. Tin nhắn mới của người dùng đặt lại số vòng.
  - Tin nhắn fail tự nhận là của hook (không phải người dùng) và dặn: nếu sửa phải làm điều người dùng đã cấm (ví dụ lỗi có từ trước khi người dùng giới hạn phạm vi) thì dừng và hỏi người dùng, không tự sửa. Lý do: tránh Agent sửa vượt lời dặn "chỉ thêm comment".
  - Timeout 10 phút (`CHECK_GATE_TIMEOUT_MS` ghi đè) → báo người dùng, không tự sửa. Không phải Git repo hoặc lỗi nội bộ → không chặn session.
- Lệnh kiểm tra chạy trên máy, không tốn token; token chỉ ở phần lỗi gửi lại và lượt sửa.
- Lượt tự sửa do hook mở chỉ chạy trong session tương tác; `omp -p` thoát trước khi lượt đó chạy (message vẫn được ghi vào session).

## 7. Kiểm chứng khi tạo repo

- `git rev-parse --show-toplevel` đúng thư mục repo; `OS Builder` vẫn không phải Git.
- `readlink CLAUDE.md` = `AGENTS.md`.
- `omp -p --no-session` trong repo, không gợi ý đáp án: Agent nêu đúng tên/mục đích dự án và `scripts/check.sh`; thấy Skill `brainstorming`, `impeccable`, `logo-design`, `reverse-engineer-anything`, `ponytail`; không có tool `mcp__rea_*`. Phiên OMP mới nạp extension Ponytail, có chế độ hoạt động và các lệnh `/ponytail`.
- `git status` chỉ chứa file ở §3 (không có `.omp/plugins/node_modules`); có `.omp/hooks/pre/ecosystem-catalog.ts`.

## 8. Bảo mật và quyền

Không đưa secret, PII, dữ liệu khách hàng/thanh toán vào Git; tách dev/staging/production. Không chi tiền, bật dịch vụ trả phí, ghi production hay publish từ quyền nhớ lại. Tự động hóa trình duyệt chỉ headless; thao tác cần đăng nhập do người dùng tự làm. REA chỉ dùng cho phần mềm người dùng có quyền phân tích.
