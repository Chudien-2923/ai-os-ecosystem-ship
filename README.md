# AI OS Ecosystem Ship

Bản khởi tạo sạch, có quản lý phiên bản để giảng dạy cách xây dựng một hệ điều hành AI cá nhân gồm bốn lớp: **OS Intelligence** (Chief of Staff), **OS Staff** theo vai trò, **OS Projects** theo brand/workspace và **OS Builder** cho từng app.

Tài liệu dành chủ yếu cho học viên Việt Nam nên phần hướng dẫn và mô tả sử dụng tiếng Việt. Các thuật ngữ kỹ thuật như Staff, Project, Skill, Factory, hook, runtime, workflow, version và migration được giữ bằng tiếng Anh khi rõ nghĩa hơn.

## Phiên bản hiện hành

- Ship: **V1.0.0**
- OS Intelligence contract: **V0.2.3**
- OS Staff contract: **V0.2.16**
- OS Projects contract: **V0.2.3**
- OS Builder App contract: **V0.2.2**

Thay đổi theo từng release được ghi tại [CHANGELOG.md](CHANGELOG.md). Contract chi tiết của component và migration nằm trong [`OS Intelligence/11-factory/`](OS%20Intelligence/11-factory/).

## Cấu trúc

```text
AI OS Ecosystem/
├── OS Intelligence/   # Chief of Staff, nghiên cứu, Factory, Playbook, Skills và runtime hook
├── OS Staff/          # Trống cho tới khi Intelligence tạo Staff theo vai trò
├── OS Projects/       # Trống cho tới khi Intelligence tạo brand/project workspace
└── OS Builder/        # Trống cho tới khi Intelligence tạo repo app để vibe coding
```

Trong fresh Git clone, `OS Staff`, `OS Projects` và `OS Builder` chỉ có `.gitkeep`.

Ba folder này là container tổ chức local, không phải repository dùng chung. Mỗi Staff/Project/app được tạo bên trong là một standalone Git repository với history, remote và quyền riêng. Root `.gitignore` loại các repo con khỏi Ship parent repository để dữ liệu của bạn không bị commit nhầm vào bản phân phối.

## Ưu tiên Oh My Pi

Từ V1.0.0, Ship dùng **Oh My Pi (OMP)** làm harness chính: các hook tự động (giữ Markdown đúng hiện trạng, vòng học của Staff, danh bạ hệ sinh thái, sức khỏe Project, cổng kiểm tra của app) chỉ chạy trong OMP. Codex hoặc Claude Code vẫn đọc được Markdown và Skill, nhưng không chạy hook; khi đó các bước hook làm hộ phải làm tay theo spec.

## Cài công cụ nền

Cài một lần trên máy. Bản này hướng dẫn cho macOS.

| Công cụ | Dùng cho | Cách cài |
| --- | --- | --- |
| Git | Mọi repo | Có sẵn trên macOS khi cài Xcode Command Line Tools (`xcode-select --install`) |
| Oh My Pi (`omp`) | Harness chạy Agent và hook | Theo hướng dẫn chính thức của Oh My Pi |
| Bun | Chạy hook, script và test | `curl -fsSL https://bun.sh/install \| bash` |
| Orca | Mở repo, điều phối worker, tra session cũ, mở bản đồ Excalidraw | Theo hướng dẫn của nhà phát hành Orca. Không bắt buộc để tạo Staff/Project, cần khi điều phối worker |
| Plugin Superpowers + Impeccable | Intelligence, Staff, Project, app | Đăng ký nguồn một lần, rồi cài theo từng repo (xem dưới) |
| Browser Use CLI + `bu-headless` | Staff, Project mở trang web công khai bằng trình duyệt ngầm | Cài Browser Use theo [hướng dẫn upstream](https://github.com/browser-use/browser-harness/blob/main/install.md), chạy `browser-use install` để có Chromium, rồi copy `OS Intelligence/11-factory/shared-runtime/bu-headless` vào một thư mục trong `PATH` (ví dụ `~/.local/bin/`) và `chmod +x` |
| Node ≥ 24.22.1, REA, plugin Logo Design + Ponytail | Chỉ khi tạo Builder app | Phiên bản và lệnh chính xác ở spec Builder §2 và §4 |

Đăng ký nguồn plugin một lần:

```bash
omp plugin marketplace add obra/superpowers-marketplace
omp plugin marketplace add pbakaus/impeccable
```

Cài plugin cho chính `OS Intelligence` (chạy trong folder `OS Intelligence`):

```bash
omp plugin install superpowers@superpowers-marketplace --scope project
omp plugin install impeccable@impeccable --scope project
```

Staff, Project và app được Factory cài plugin của riêng chúng khi tạo. Thư mục `.omp/plugins/` của Intelligence nằm ngoài Git vì chứa đường dẫn máy.

Kiểm nhanh: `omp --version`, `bun --version`, `command -v browser-use bu-headless`. Trong folder `OS Intelligence`, `bun test 11-factory` chạy toàn bộ test của runtime đi kèm.

## Bắt đầu sử dụng

1. Clone hoặc tải repository về máy và cài công cụ nền ở trên.
2. Mở folder `OS Intelligence` bằng Oh My Pi (khuyến nghị) hoặc harness tương thích.
3. Nếu máy đã dùng OMP trước đó, chạy một lần trong folder `OS Intelligence`: `bun 11-factory/intelligence-runtime/freshness-cli.ts baseline --since <YYYY-MM-DD hôm nay>`. Hook `freshness` coi mọi session OMP ngoài các repo của hệ sinh thái là việc cần đối soát; lệnh này đánh dấu các session cũ trước ngày cài để lượt đầu không bị liệt kê hàng trăm session.
4. Bắt đầu fresh session. Agent sẽ đọc `AGENTS.md`, `IDENTITY.md`, `SOUL.md` và `USER.md` sạch. Trong câu trả lời đầu tiên, Agent cung cấp `Session hiện tại` gồm JSONL path và exact resume command khi runtime hỗ trợ.
5. Prompt tự nhiên, ví dụ:
   - `Hãy tạo cho tôi một AI Staff Content Writer.`
   - `Hãy tạo Project cho brand của tôi.`
   - `Hãy tạo app quản lý lịch hẹn để tôi vibe coding.`
6. Intelligence dùng Factory specs để tạo đúng repo con với file vận hành, hook, Skill và standalone Git, kiểm tra bằng phiên OMP mới, rồi ghi registry và danh bạ.

## Ranh giới của bản sạch

Repository không chứa hồ sơ cá nhân, private work, research, runtime IDs, Staff/Project/app instances, brand data, assets hoặc production outputs của người phát hành. Dữ liệu của bạn chỉ được thêm trong quá trình sử dụng và thuộc instance của chính bạn.

Không dùng parent Ship repository để version hoặc publish repo con; mỗi repo con chỉ được commit/remote/push trong phạm vi bạn duyệt. Agent không tự điều khiển máy tính hay trình duyệt cá nhân của bạn: trang công khai mở bằng `bu-headless`, trang cần đăng nhập do bạn tự thao tác.

## Quản lý phiên bản và nâng cấp

Ship release dùng SemVer độc lập với version của bốn component specs:

- **Major:** breaking change về layout, ownership hoặc migration contract.
- **Minor:** capability, spec hoặc Skill mới có backward compatibility.
- **Patch:** sửa packaging, security, compatibility, links hoặc documentation mà không đổi contract chính.

V1.0.0 là major release (thêm `OS Builder`, Projects đổi cách giữ brand, Ship chuyển sang OMP-first). Bản cũ không tự bị ghi đè; hướng dẫn nâng cấp từ V0.5.0 giữ nguyên `USER`, context, work và các repo con của bạn, xem [`release.md`](OS%20Intelligence/11-factory/release.md).

## Skills và license

Anthropic `skill-creator` đi kèm vẫn giữ upstream Apache-2.0 license tại `OS Intelligence/.agents/skills/skill-creator/LICENSE.txt`. Release này chưa khai báo repository-wide license riêng.

Bundled Skills của Intelligence:

- `/skill:pre-compact` và `/skill:close` — continuity trước compact hoặc đổi session; đối soát session cũ do hook `freshness` báo.
- `/skill:repo-reconcile` — audit stale information/history và đề xuất cleanup có approval gate.
- `/skill:sync-worktrees-from-main`, `/skill:merge-worktrees-into-main`, `/skill:sync-main-with-worktrees` — đồng bộ local `main` và worktrees theo từng hướng.
- `/skill:io-map` — khung Input/Output kèm bản đồ Excalidraw; chỉ bật khi bạn yêu cầu cho một việc.
- `/skill:learn` — chế độ học có learning map, kết thúc bằng Markdown và HTML hub.
- `skill-creator` — tạo, sửa, đánh giá Skill.
