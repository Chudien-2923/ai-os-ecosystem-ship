# OS Projects Starter Spec

- **Phiên bản hiện hành:** V0.2.3.
- **Trạng thái:** V0.2.3 thêm Skill `io-map` vào bộ nền Team Lead (§4.2): khung Input/Output và bản đồ `tong-quan.excalidraw` sinh từ mục `## Bản đồ Input/Output` trong `WORKSTREAM.md`, chỉ bật khi người dùng yêu cầu cho từng workstream. V0.2.2 đưa bộ nền công cụ bắt buộc của OS Staff vào mỗi Project để Team Lead làm việc như một agent thật: Impeccable + Superpowers project scope, Skill Creator, Browser Use qua `bu-headless` kèm ranh giới trình duyệt, hook danh bạ `ecosystem-catalog` (§4.2). Từ V0.2.2, hạng mục cài đặt bắt buộc mới của Staff cũng bắt buộc cho Project, trừ cơ chế học riêng vai Staff. Kế thừa V0.2.1: lớp `brand/` do **Team Lead** của từng brand (agent mở tại root Project) biên tập, sổ `brand/feedback.md` thay hộp `pending-rules`: Staff ghi feedback brand ngay (mức `gợi ý`/`dứt khoát`), Team Lead cùng người dùng tổng hợp bằng Skill `brand-curation`; hook `project-health` chạy trong repo Project. Factory giữ bộ khởi tạo `11-factory/project-runtime/`. Kế thừa từ V0.2.0: `brand/` hai tầng, workstream theo chiến dịch với `log.md`, file sản xuất ngoài Git.
- **Nơi duy trì:** OS Intelligence `11-factory/specs/os-projects-starter-spec.md`.
- **Mục đích:** Làm nguồn chính để Factory trong Intelligence tạo các brand workspace độc lập trong OS Projects.
- **Quyết định hiện tại:** V0.2.2 (§4.2): Project có cùng bộ nền cài đặt bắt buộc như OS Staff, trừ cơ chế học riêng vai Staff; hạng mục bắt buộc mới của Staff áp dụng cho Project cùng lượt. Kế thừa V0.2.1: Staff ghi feedback mang tính brand vào sổ `brand/feedback.md` ngay khi người dùng nói, không qua duyệt; `dứt khoát` có hiệu lực ngay, `gợi ý` chỉ là tham khảo; chỉ Team Lead sửa node `brand/`, dựa trên quyết định của người dùng. OS Intelligence là Chief of Staff tổng, giữ spec/Factory và bộ khởi tạo Project. Không có memory backend, tiến trình nền hoặc auto-upgrade Project instances.

> Mỗi Project là một brand workspace dài hạn và một repo độc lập. Staff mang vai trò và năng lực đến Project; Project giữ context, trạng thái chung và lịch sử của brand.

`OS Projects` chỉ là local organizational container và không phải Git repository. Mỗi Project folder bên trong là một standalone Git repository; history, branch, tag, remote, approval và recovery độc lập với mọi Project khác.

## 1. Tầm nhìn

OS Projects giúp các Staff làm đúng việc cho đúng brand mà không phải nạp toàn bộ hệ sinh thái hoặc dựa vào memory mơ hồ của session.

Trong mô hình V0.2.2, kế thừa V0.1.6:

- Một Project tương ứng một brand workspace dài hạn.
- Brand của khách hàng và thương hiệu cá nhân dùng cùng một contract.
- Campaign, launch, funnel, kênh nội dung hoặc đợt sản xuất là workstream bên trong Project, không mặc định trở thành repo mới.
- Brand context, workstream và canonical asset index thuộc Project repo.
- Role, skills, generic memory và cách cộng tác của Staff thuộc Staff repo.
- Markdown và wikilink điều hướng context; không xây agent harness riêng.
- Team Lead của brand (agent mở tại root Project) biên tập lớp `brand/`: Staff ghi feedback vào một sổ chung, Team Lead cùng người dùng tổng hợp vào đúng node để mọi Staff, mọi vai đọc cùng một bộ rule.

Ví dụ giả xuyên suốt spec: **Brand Mẫu** (`brand-mau`) là một brand workspace. Contract cũng dùng được cho brand khách hàng hoặc thương hiệu cá nhân; nội dung brand chỉ điền khi có nguồn thật.

## 2. Phạm vi V0.2.2

V0.2.2 định nghĩa:

- Ranh giới một Project repo.
- Starter tree tối thiểu.
- Cách tổ chức brand context bằng router và node chuyên đề.
- Progressive disclosure và Project Context Gate.
- Quan hệ Staff-first giữa Staff repo và Project repo.
- Shared workstream state và Staff checkpoint.
- Learning loop cho feedback riêng của workstream và rule bền vững của brand.
- Hybrid asset policy.
- Git checkpoint khi một mốc thay đổi hai repo.
- Session isolation giữa các brand.
- Vai Team Lead tại root Project, sổ chung `brand/feedback.md`, phiên tổng hợp do Team Lead thực hiện và ngưỡng nhắc tổng hợp.
- Bộ nền công cụ của Team Lead, tương đương bộ nền cài đặt bắt buộc của OS Staff (§4.2).
- File sản xuất nặng trong `work/<workstream>/production/` ngoài Git.
- Acceptance scenarios và quy trình factory khởi tạo Project.

V0.2.2 không định nghĩa:

- Agent harness, background service, database, vector store hoặc context injector riêng.
- Storage provider, Git LFS policy hoặc ngưỡng dung lượng bắt buộc.
- Nội dung brand khi chưa có nguồn.
- Quyền truy cập, publishing, scheduling, payment hoặc credential management.
- Orchestrator, session switcher, context clearing hoặc lock system.
- Cấu trúc nội bộ của Intelligence/Playbook; Project chỉ giữ locator và ownership cần cho integration, không copy các kho đó.

## 3. Ranh giới giữa Factory, Staff và Project

| Thành phần | Nguồn chính của | Không phải nguồn chính của |
| --- | --- | --- |
| Factory | Spec, version, template và lịch sử quyết định của từng OS | Context vận hành hằng ngày của một brand |
| OS Intelligence (Chief of Staff) | Spec, Factory, bộ khởi tạo/nâng cấp Project (`11-factory/project-runtime/`), điều phối khi người dùng yêu cầu | Biên tập `brand/` hằng ngày của một brand |
| Team Lead (session tại root Project) | Biên tập lớp `brand/`, tổng hợp sổ feedback, phiên dọn Project | Rule `gợi ý` người dùng chưa quyết; quyết định nâng phạm vi rule thay người dùng |
| Staff repo | Role, skills, generic knowledge, cách cộng tác, Staff job/checkpoint và learning của Staff | Brand facts hoặc trạng thái chung của campaign |
| Project repo | Brand context, workstream, deliverables, approvals, Project decisions và canonical asset index | Role hoặc generic procedural memory của mọi Staff; file sản xuất nặng trong Git |
| Harness | Model, tools, session, quyền file và runtime context | Bản duy nhất của tri thức cần bàn giao |

Project-specific facts không được promote thành generic Staff memory chỉ vì Staff đã đọc chúng nhiều lần. Public voice của một thương hiệu cá nhân cũng không mặc định là preference cộng tác hoặc voice của các brand khác.

## 4. Cấu trúc starter

Cấu trúc mục tiêu:

```text
<brand-project>/
├── README.md
├── VERSION
├── CHANGELOG.md
├── .gitignore
├── AGENTS.md
├── PROJECT.md
├── WORK.md
├── brand/
│   ├── foundation.md         # tầng 1
│   ├── guidelines.md         # tầng 1: nhận diện + Non-negotiables
│   ├── feedback.md           # tầng 1: sổ feedback chung, Team Lead tổng hợp
│   ├── audience.md           # tầng 2 (khi có dữ liệu)
│   ├── voice-tone.md         # tầng 2
│   ├── visual-brain.md       # tầng 2
│   └── formats/<format>/     # tầng 2: rule/style riêng một định dạng
├── skills/                   # khi có procedure riêng brand được duyệt
├── assets/
│   └── ASSETS.md
├── work/
│   └── <workstream>/
│       ├── WORKSTREAM.md     # hiện trạng
│       ├── log.md            # lịch sử, chỉ ghi nối
│       └── production/       # file sản xuất, ngoài Git
├── .omp/hooks/pre/project-health.ts       # hook nhắc tổng hợp (copy từ Factory)
├── .omp/hooks/pre/ecosystem-catalog.ts    # hook danh bạ hệ sinh thái (copy từ Factory, §4.2)
├── .omp/plugins/installed_plugins.json    # Impeccable + Superpowers project scope (§4.2)
├── .omp/plugins/omp-plugins.lock.json     # cache/node_modules ngoài Git
├── .agents/skills/brand-curation/SKILL.md # Skill tổng hợp của Team Lead (copy từ Factory)
├── .agents/skills/skill-creator/          # Skill Creator upstream nguyên bản (§4.2)
├── .claude/skills/brand-curation          # symlink → ../../.agents/skills/brand-curation
├── .claude/skills/skill-creator           # symlink → ../../.agents/skills/skill-creator
└── skills-lock.json                       # provenance Skill Creator
```

Bộ khởi tạo (nguồn các file copy, template sổ và khối `AGENTS.md`) ở Factory `11-factory/project-runtime/README.md`.

Phần bắt buộc khi khởi tạo: `README.md`, `VERSION`, `CHANGELOG.md`, `.gitignore`, `AGENTS.md` (có khối `## Team Lead` và `## Công cụ nền`), `PROJECT.md`, `WORK.md`, `brand/foundation.md`, `brand/guidelines.md` có heading `Non-negotiables`, `brand/feedback.md` (từ template Factory, chưa có dòng nào), `assets/ASSETS.md`, `.omp/hooks/pre/project-health.ts`, Skill `brand-curation` (`.agents/skills/` + symlink `.claude/skills/`) và bộ nền §4.2 (`.omp/hooks/pre/ecosystem-catalog.ts`, registration/lock hai plugin, Skill Creator + symlink + `skills-lock.json`). `.gitignore` ngoài secrets/cache/temp phải có `work/*/production/`, `*.otf`, `*.ttf`, `*.woff`, `*.woff2` và khối plugin §4.2. README ghi rõ đây là OS Project, Project ID/type, purpose, cách bắt đầu (Team Lead: mở `omp` tại root Project; Staff: từ repo Staff qua Project Context Gate), cấu trúc, quan hệ với Staff/Intelligence, version/Git và privacy. `VERSION` là contract version machine-readable; `CHANGELOG.md` giữ repository metadata/migration, không thay workstream history. Asset index chưa có asset thì phải ghi rõ trạng thái trống và cách đăng ký; README/index không được bịa entry. Audience/voice/visual nodes và `formats/<format>/` chỉ tạo khi có dữ liệu tương ứng; router nêu phần thiếu nhưng không link tới file chưa tồn tại. `outputs/`, `references/`, asset subfolders, `log.md` và node con chỉ xuất hiện khi thực sự cần. Hai folder Staff `journal/`, `knowledge/` không phải yêu cầu cấu trúc Project.

`brand/feedback.md` (từ V0.2.1, thay `brand/pending-rules.md` của V0.2.0) là sổ chung mọi Staff ghi **ngay** khi người dùng feedback điều đúng cho bài/việc khác của brand (OS Staff V0.2.15), không hỏi duyệt. Dòng: `- YYYY-MM-DD · <staff-id> · <gợi ý | dứt khoát> · <phạm vi: video | graphic | copy | mọi kênh> · <feedback> · việc: <workstream>/<sản phẩm> · nguồn: "<lời người dùng>"`, tùy chọn `· đến YYYY-MM-DD`; gỡ rule: thêm `· bỏ: <rule cũ> · lý do: <…>` trước `nguồn`. `dứt khoát` có hiệu lực ngay và thắng rule cũ trong `brand/`; `gợi ý` chỉ tham khảo, không thắng rule `brand/`. Thứ tự mục cố định: phần đầu → `## Đang chờ thêm` (nhóm `gợi ý` người dùng đã chọn chờ, chỉ Team Lead sửa) → `## Feedback chờ tổng hợp` ở **cuối file**, để quy tắc "Staff đọc lại file và chỉ thêm dòng ở cuối" luôn rơi vào mục chờ tổng hợp. Staff không sửa file nào khác trong `brand/` và chỉ sửa/xóa dòng của mình khi người dùng bảo. Team Lead tổng hợp theo §9.2.

Từ V0.1.6, nếu thật sự có procedure riêng brand được duyệt thì tạo `skills/<name>/SKILL.md` và `skills/README.md` làm index; đây là conditional content, không là folder bắt buộc rỗng. Tham chiếu node brand/style system hiện có thay vì copy làm nguồn thứ hai. `name`/`description` portable; hướng dẫn giữ điều kiện, bước, pitfalls, kiểm tra output và nguồn/mức bằng chứng. Skill chưa thực thi vẫn được active sau duyệt theo Staff `/learn`, không gọi là năng lực đã chứng minh.

### 4.1. Trách nhiệm entrypoints

| File | Trách nhiệm | Khi đọc |
| --- | --- | --- |
| `README.md` | Overview ngắn: OS type, Project ID/type/purpose, cách bắt đầu, cấu trúc, quan hệ hệ sinh thái, version/Git và privacy | Khi người hoặc Git host cần hiểu repo |
| `VERSION` | Contract version machine-readable của Project instance | Khi Factory/upgrade/check cần đối chiếu version |
| `CHANGELOG.md` | Mốc repository metadata và migration đáng giữ; không thay workstream | Khi review release/checkpoint |
| `AGENTS.md` | Project instructions, context gate, routing, data boundary, learning và Git safety | Khi Staff bắt đầu hoặc resume project session |
| `PROJECT.md` | Project identity, locator và context map | Mọi project session |
| `WORK.md` | Index workstream theo trạng thái; không sao chép toàn bộ workstream | Khi chọn hoặc tiếp tục công việc |
| `assets/ASSETS.md` | Canonical asset index và locator | Khi task cần asset |
| `work/<workstream>/WORKSTREAM.md` | Shared source of truth của workstream | Khi Staff được giao workstream đó |
| `brand/feedback.md` | Sổ feedback brand chung: `dứt khoát` phải theo, `gợi ý` tham khảo; Team Lead tổng hợp | Mọi Project Context Gate (mandatory base) |
| `.omp/hooks/pre/project-health.ts` | Nhắc Team Lead tổng hợp/dọn khi vượt ngưỡng (§9.2) | Tự chạy đầu session tại root Project |
| `work/<workstream>/log.md` | Lịch sử workstream, chỉ ghi nối | Khi cần truy lại diễn biến/evidence cũ |
| `.gitignore` | Loại secrets/cache và file sản xuất (`work/*/production/`, font) khỏi Git | Khi thêm loại file mới hoặc kiểm Git |

`AGENTS.md` trong Project không tự được nạp khi current working directory là Staff repo. Project Context Gate của Staff phải đọc file này một cách tường minh. Session mở tại root Project (Team Lead) thì harness tự nạp `AGENTS.md`, hook và Skill của Project.

Với Staff V0.2.9, entrypoint/gate của Staff kiểm tra `skills/README.md` của **đúng Project** sau mandatory gate khi task cần procedure brand; đọc SKILL.md thật được index trỏ tới trước sử dụng/sửa. Project router `PROJECT.md`/AGENTS chỉ thêm đường này khi có file thật; không đưa mọi Project Skill vào native catalog Staff, không đọc brand trong training không Project. Không mặc định loader tự scan Project vì cwd là Staff.

`AGENTS.md` của mọi Project mới và Project được nâng cấp phải thêm `Session hiện tại` trong câu trả lời đầu tiên: transcript JSONL path cùng exact resume command từ runtime/index, chỉ một lần. Nếu câu trả lời đầu tiên có `Markdown đã cập nhật`, session locator đứng ngay trước báo cáo đó; nếu không, nó là phần cuối. Trên Orca + OMP, dùng một cụm phân biệt từ prompt đầu tiên, giới hạn `agent=omp` và `cwd` là root Project trong `orca search ... --fresh --json`, rồi lấy nguyên `source.filePath` và `resumeCommand`. Không suy từ Session ID/file mới nhất; metadata không có thì ghi `không khả dụng`. Transcript, runtime ID, search index và cache không được commit vào Project.

Output dùng `source.filePath` làm JSONL locator và paste `resumeCommand` nguyên văn trong một fenced block `bash`; không dựng lại command từ path hoặc đổi separator/ký tự.

### 4.2. Bộ nền công cụ của Team Lead (V0.2.2, V0.2.3)

- **Nguồn quyết định:** agent mở tại root Project là Team Lead làm việc thật với người dùng, không chỉ là repo chứa context; người dùng yêu cầu những gì OS Staff bắt buộc cài thì OS Projects cũng bắt buộc như vậy.
- **Quy tắc tương đương:** mọi hạng mục cài đặt bắt buộc của OS Staff ([[11-factory/specs/os-staff-starter-spec#12. Cách factory dùng spec để tạo Staff]], bước 10) cũng bắt buộc cho Project, **trừ** cơ chế học riêng vai Staff: hook `learning-loop`, `.omp/learning-loop.json`, `MEMORY.md`/`memory/`, `journal/` và adapter `/learn`. Phần tương đương của Project là sổ `brand/feedback.md` + hook `project-health` + Skill `brand-curation`. Khi spec Staff thêm hạng mục cài đặt bắt buộc mới, Factory nâng spec này cùng lượt, hoặc ghi rõ lý do loại trừ tại đây; người dùng duyệt loại trừ.
- **Hạng mục hiện hành** (danh sách nguồn → đích và lệnh cài duy nhất ở `11-factory/project-runtime/README.md`):
  - **Impeccable + Superpowers** — plugin OMP cài từ root Project với `--scope project`, như OS Staff §3.18: upstream nguyên bản, ghi version thực vào registry, chỉ commit `installed_plugins.json` + `omp-plugins.lock.json`; cache, `node_modules/`, `.superpowers/` ngoài Git; chuyển máy thì cài lại. Không cài user/global để thay project registration.
  - **Skill Creator** — exact upstream `anthropics/skills@skill-creator` copy nguyên package từ Intelligence `.agents/skills/skill-creator/` vào `.agents/skills/skill-creator/` (cùng chỗ `brand-curation`), symlink `.claude/skills/skill-creator`, `skills-lock.json` giữ source/hash, giữ `LICENSE.txt`. Không đặt trong `skills/` vì đó là kho procedure riêng brand mà Staff đọc qua Gate (§4, §9.1). Team Lead dùng khi tạo/sửa/evaluate Skill riêng brand trong `skills/` sau khi người dùng duyệt; `brand-curation` vẫn sửa ở nguồn Factory.
  - **Browser Use** — Skill global + CLI + wrapper `bu-headless` của máy, như OS Staff §3.19: kiểm có sẵn và discover được, không copy Skill vào repo. Bản Ship này chỉ hỗ trợ macOS; copy `11-factory/shared-runtime/bu-headless` vào một thư mục trong PATH (ví dụ `~/.local/bin/`). `AGENTS.md` có khối ranh giới trình duyệt như OS Staff §3.17: trang công khai qua `bu-headless`, trang cần đăng nhập qua trình duyệt nhúng Orca profile `Agent`, không Chrome cá nhân/relay/cookie/`mac-approve`/cloud khi chưa duyệt.
  - **Danh bạ hệ sinh thái** — copy `11-factory/shared-runtime/ecosystem-catalog.ts` (từ v0.1.1 nhận `- Project ID:` để bỏ dòng của chính Project) vào `.omp/hooks/pre/`; `AGENTS.md` có một dòng hệ sinh thái cho harness không hook. Chỉ để biết, không đọc sâu hay sửa repo khác.
  - **Skill `io-map`** (V0.2.3, tương ứng OS Staff §3.22) — copy nguyên `.agents/skills/io-map/` của Intelligence vào `.agents/skills/io-map/`, symlink `.claude/skills/io-map`. Chỉ bật khi người dùng yêu cầu cho workstream đó; mục `## Bản đồ Input/Output` trong `WORKSTREAM.md` ghi nhận workstream đã bật. Khi bật, dữ liệu bản đồ nằm trong mục đó, bản đồ `work/<workstream>/tong-quan.excalidraw` được commit cùng workstream. Staff làm workstream này cập nhật cùng bản đồ, không tạo bản thứ hai.
- **`.gitignore`:** Project commit cả `.omp/hooks/`, nên chỉ chặn phần runtime của plugin: `.omp/plugins/*`, `!.omp/plugins/installed_plugins.json`, `!.omp/plugins/omp-plugins.lock.json`, `.superpowers/`.
- **Routing trong `AGENTS.md` (khối `## Công cụ nền`):** Superpowers cho brainstorming/lập kế hoạch/kiểm chứng khi việc phù hợp (vd chiến lược brand, kế hoạch workstream), spec/plan ghi vào `WORKSTREAM.md`, không tạo `docs/superpowers/` theo quyết định của người dùng; Impeccable cho trình bày trực quan/UI/UX copy; không ép mọi việc brand qua quy trình code/design, không đổi vai Team Lead thành Staff thực thi. Bộ nền không cấp thêm quyền publish/chi tiền, không thêm MCP server, không mở trình duyệt cá nhân.
- **Kiểm chứng:** `omp plugin list --json` tại root Project thấy hai plugin scope project; fresh `omp -p` tại root Project có `impeccable`, `using-superpowers`, `brainstorming`, `skill-creator`, `browser-use`, `brand-curation` trong catalog; danh bạ được chèn và không có dòng của chính Project; `git status` chỉ thấy registration/lock, cache/node_modules không được Git thấy. Cài trọn bộ không đồng nghĩa mọi hook/command của plugin đã nghiệm thu.

## 5. `PROJECT.md` là router

`PROJECT.md` chỉ giữ:

- Canonical Project name.
- Stable Project ID.
- Loại Project, ví dụ client brand hoặc personal brand.
- Repo locator cần để xác nhận đúng workspace.
- Mandatory base links.
- Conditional links kèm lý do và thời điểm đọc.
- Link tới `WORK.md` và `assets/ASSETS.md`; index tồn tại từ lúc khởi tạo, chỉ đọc khi task cần asset.

`PROJECT.md` không sao chép positioning, voice, visual rules hoặc guidelines thành một bản tóm tắt thứ hai.

Ví dụ minh họa:

```markdown
# Brand Mẫu

- Project ID: brand-mau
- Type: client-brand

## Always load

- `brand/foundation.md` — hiểu brand identity và positioning nền.
- `brand/guidelines.md#non-negotiables` — kiểm tra constraint không được vi phạm.
- `brand/feedback.md` — sổ feedback chung; `dứt khoát` thắng rule cũ, `gợi ý` tham khảo.

## Load when relevant

- `brand/audience.md` — khi audience ảnh hưởng thông điệp hoặc offer.
- `brand/voice-tone.md` — khi viết hoặc duyệt copy.
- `brand/visual-brain.md` — khi tạo hoặc duyệt visual.
- `WORK.md` — khi chọn hoặc tiếp tục workstream.
- `assets/ASSETS.md` — khi cần canonical asset.
```

Các locator trên minh họa router bên trong Project repo tương lai, không phải file phải tồn tại trong Factory. Khi tạo Project thật, có thể dùng wikilink tương ứng sau khi xác nhận file/heading đích tồn tại.

## 6. Brand context graph

### 6.1. Mandatory base

Mọi Project Context Gate phải đọc:

1. `brand/foundation.md`.
2. Phần `Non-negotiables` trong `brand/guidelines.md` (cùng phần nhận diện của file đó khi task tạo hoặc duyệt output có logo/màu/font/tên sản phẩm/giá).
3. `brand/feedback.md`.

Không preload toàn bộ brand graph. Workstream route thêm audience, voice, visual hoặc asset context khi nhiệm vụ cần.

### 6.2. Trách nhiệm từng node

| Node | Nguồn chính của | Không chứa |
| --- | --- | --- |
| `foundation.md` | Brand identity, purpose, positioning, value proposition, offer cấp cao và sự thật nền | Voice examples, visual references, trạng thái campaign |
| `audience.md` | Nhóm khách hàng, nhu cầu, pain/desire, buying context và evidence | Persona bịa ra hoặc assumption không gắn nhãn |
| `voice-tone.md` | Public voice, tone theo tình huống/kênh, từ nên-tránh, examples và counterexamples | Quy tắc logo/màu hoặc preference cộng tác riêng của người dùng |
| `visual-brain.md` | Nguyên tắc thẩm mỹ, reference/anti-reference, pattern từ feedback đã duyệt và lý do | Raw asset library hoặc thông số sử dụng logo chính thức |
| `guidelines.md` | Tầng 1 — nhận diện dùng cho mọi kênh và mọi vai: logo, màu, typography, tên gọi sản phẩm, rule giá/claim/pháp lý, điều cấm, link nguồn chính thức; heading `Non-negotiables` | Mood/inspiration chưa duyệt; rule vận hành dành cho Agent (ở `AGENTS.md`) |
| `feedback.md` | Tầng 1 — sổ feedback brand chung (`dứt khoát`/`gợi ý`), chờ Team Lead tổng hợp | Feedback chỉ cho một deliverable; ghi chú công việc |
| `formats/<format>/` | Tầng 2 — rule, style system và kiểm tra riêng một định dạng (vd founder video) | Font/màu/logo định nghĩa lại (chỉ link `guidelines.md`) |

### 6.3. Một nguồn chính

- Mỗi fact hoặc rule có một node nguồn chính.
- Router và node khác chỉ link kèm lý do/thời điểm đọc.
- Không giữ hai rule active trùng hoặc mâu thuẫn.
- Khi node quá lớn, tách node con và giữ file cũ làm router để không làm gãy link.
- Không tạo taxonomy hoặc index rỗng trước nhu cầu thực.
- Khi link thiếu hoặc nội dung không đủ, Staff làm rõ; không tự bịa brand context.
- Wikilink nội bộ resolve từ root Project. Locator xuyên repo phải ghi rõ gốc resolve: Project locator từ root Staff; workstream locator và backlink tới Staff job từ root Project.
- Kiểm tra bằng cách mở file/heading thật và đối chiếu identity theo cả hai chiều; không bỏ qua đường dẫn viết trong inline code hoặc plain text. Không dùng cwd hay folder của workstream để đoán gốc.

### 6.4. Hai tầng và quyền biên tập

- **Tầng 1 — lõi, mọi Staff/mọi việc đọc:** `foundation`, `guidelines`, `feedback`.
- **Tầng 2 — đọc khi liên quan:** `audience`, `voice-tone`, `visual-brain`, `content-system` hoặc node tương đương, `formats/<format>/`.
- Tầng 2 không định nghĩa lại tầng 1; mâu thuẫn được xử lý bằng cách sửa tầng 2 về link tầng 1.
- Rule dành cho Agent (công cụ, quyền, trạng thái, data boundary) ở Project `AGENTS.md`, không ở `brand/`.
- Chỉ Team Lead sửa node trong `brand/` (trừ `feedback.md`, nơi Staff thêm dòng của mình); bootstrap/migration do Factory (OS Intelligence) làm. OS Intelligence khi người dùng yêu cầu trực tiếp làm theo cùng quy tắc với Team Lead (staff-id `intelligence` khi ghi sổ).

## 7. Staff-first và Project Context Gate

### 7.1. Điểm bắt đầu session

Người dùng có thể làm trực tiếp trong repo Staff hoặc giao qua Intelligence. Staff tự nạp role, skills và memory theo [[11-factory/specs/os-staff-starter-spec]], sau đó đọc Project repo được chỉ định; Chief of Staff assignment không thay Project Context Gate.

Session OMP mở tại root Project (cwd là Project) là **Team Lead** của brand đó, không phải Staff: dùng Project Context Gate để đọc context, không cần Staff job/checkpoint, biên tập `brand/` và tổng hợp sổ feedback. Người dùng làm việc brand trực tiếp với Team Lead (dựng/sửa context brand, tổng hợp feedback) và với Staff (thực thi). Feedback người dùng nói thẳng với Team Lead: dứt khoát → Team Lead sửa thẳng node và báo; thoáng qua → ghi sổ `gợi ý` với staff-id `team-lead`.

Một project session chỉ có một active brand. Khi đổi brand, người dùng đóng session cũ và mở session mới trong cùng Staff repo. Không xây cơ chế xóa context hoặc đổi brand trong conversation đang có.

Một Staff có thể có nhiều session đồng thời:

- Một session training nghiệp vụ, không có active Project mặc định.
- Một project session cho Brand Mẫu.
- Một project session cho một brand khác.

### 7.2. Gate bắt buộc

Gate chạy khi bắt đầu job trong project session hoặc resume session đó:

1. Lấy Project ID, repo locator và workstream locator từ yêu cầu mới hoặc Staff checkpoint.
2. Xác nhận repo tồn tại và `PROJECT.md` có đúng Project ID.
3. Đọc Project `AGENTS.md`.
4. Đọc `PROJECT.md`.
5. Đọc mandatory base links.
6. Đọc `WORKSTREAM.md` hiện tại.
7. Đọc conditional links mà workstream hoặc task yêu cầu.
8. Báo một dòng rồi mới làm việc:

```text
Context active: <project> · <workstream>
```

Không lặp dòng này ở mọi turn. Nếu Project chưa rõ, locator sai hoặc harness không có quyền đọc, Staff phải dừng và làm rõ/cấp quyền; không dùng Project gần nhất hoặc memory cũ để đoán.

### 7.3. Giới hạn bảo đảm

Gate là contract hành vi bằng Markdown. Nó không bảo đảm model tuân thủ tuyệt đối và không xóa context mà harness đã nạp. V0.1.3 chưa cần hook; chỉ đánh giá automation nếu trải nghiệm cho thấy gate thường xuyên bị bỏ qua.

## 8. Workstream

### 8.1. Folder và identity ổn định

Mỗi campaign, launch, funnel, content lane, loạt sản xuất hoặc initiative có một folder ổn định. Một sản phẩm đơn lẻ (một video, một bài) không là workstream; nó là một dòng trong bảng bàn giao của workstream chứa nó, và sản phẩm mới cùng loạt đi vào workstream đó:

```text
work/<workstream>/WORKSTREAM.md
```

Folder không di chuyển khi hoàn thành hoặc hủy. `WORK.md` thay đổi nhóm link; `WORKSTREAM.md` thay đổi status. Không copy sang `archive/` vì sẽ tạo hai nguồn và làm gãy link/checkpoint.

Baseline status:

- `planned`
- `active`
- `paused`
- `completed`
- `cancelled`

Blocker là dữ liệu riêng của workstream, không phải lifecycle status mới.

### 8.2. Nội dung tối thiểu

`WORKSTREAM.md` mở rộng khi thông tin phát sinh, không bắt điền một form đầy đủ ngay từ đầu:

- Outcome.
- Status.
- Success criteria.
- Scope và out-of-scope.
- Context to load.
- Assignments theo Staff.
- Deliverables và output locator.
- Trạng thái đã kiểm chứng cùng evidence.
- Decisions và feedback đã duyệt.
- Blockers và uncertainty.
- Next step.

Từ V0.2.0:

- `WORKSTREAM.md` chỉ giữ **hiện trạng**; Staff sửa đè, không ghi nối nhật ký. Lịch sử (diễn biến, bản đã thay, ghi chép bàn giao, hash cũ) vào `work/<workstream>/log.md`, mỗi dòng `- YYYY-MM-DD · <ai> · <sự kiện> · <locator/evidence>`.
- Bảng bàn giao có cột bắt buộc **"Final ở đâu"** (path ngoài repo, hash nếu có) cho mọi sản phẩm đã xuất bản cuối.
- `WORKSTREAM.md` vượt 200 dòng là tín hiệu cần dọn (hook `project-health` của Project báo Team Lead).
- `WORK.md` ở root chỉ là mục lục link + một dòng trạng thái mỗi workstream; ghi chép bàn giao không nằm ở đây.

### 8.3. Project chính, Staff giữ checkpoint

Project workstream là shared source of truth cho:

- Brief và success criteria chung.
- Trạng thái tổng.
- Deliverables.
- Brand decisions và approvals.
- Cross-Staff dependencies.

Staff job/checkpoint giữ:

- Project ID và repo locator.
- Workstream locator.
- Assignment riêng của Staff.
- Trạng thái phần việc Staff đã kiểm chứng.
- Bước tiếp theo của Staff.
- Link hoặc hash liên quan khi có.

Không sao chép toàn bộ brief và trạng thái sang Staff job. “Staff hoàn thành assignment” không tự động đồng nghĩa workstream đã hoàn thành.

## 9. Project learning loop

### 9.1. Ghi nhận và phân loại

Feedback xuất hiện trước tiên tại workstream/evidence liên quan. Staff phân loại:

| Phạm vi | Nơi xử lý |
| --- | --- |
| Chỉ deliverable hoặc workstream này | Giữ trong `WORKSTREAM.md` |
| Bền vững cho brand (đúng cho bài/việc khác) | Staff ghi ngay một dòng vào `brand/feedback.md`, không hỏi duyệt (Staff V0.2.15); Team Lead tổng hợp theo §9.2 |
| Năng lực hoặc procedure dùng lại của một Staff | Đi qua Staff learning loop |
| Procedure chỉ đúng cho brand này | `skills/<name>/SKILL.md` của Project sau proposal/approval `/learn`; index `skills/README.md` và router đúng Project |
| Phương pháp đã kiểm chứng và có thể dùng giữa nhiều Staff/Project | Ứng viên cho Intelligence `08-playbook/`; không auto-publish |

Skill riêng Project và shared proposal/evidence giữ ở workstream/Project; Staff job giữ binding, trạng thái và locator, không copy brand context. Duyệt update phải chỉ rõ Skill/phần đổi/lý do, đọc lại target trước ghi; phát hiện thay đổi cạnh tranh thì hợp nhất và trình phần ảnh hưởng duyệt. Không có CAS/lock hoặc auto-Undo backend. Nguồn chỉ là tài liệu/code chưa chạy được lưu/bật sau duyệt với giới hạn rõ, không bắt pilot/eval trước bật. Approval Skill không thay Git/publish/chi tiền.


### 9.2. Sổ feedback: Staff ghi ngay, Team Lead tổng hợp

Staff ghi sổ khi nhận feedback, ở mọi phiên làm cho brand (project session qua gate và phiên training mà hook đã nạp brand theo binding), rồi báo một dòng `Đã ghi sổ feedback <brand>: <tóm tắt> (<mức>)`. `dứt khoát` khi người dùng nói rõ là luật; không rõ thì `gợi ý`. Ý lặp lại thì thêm dòng mới (số lần lặp là dữ liệu cho Team Lead), không sửa dòng cũ.

**Phiên tổng hợp** do Team Lead chạy theo Skill Project `brand-curation` (`.agents/skills/brand-curation/SKILL.md`, nguồn Factory `11-factory/project-runtime/skills/brand-curation/`):

1. Dòng có `· đến` đã qua (ở cả hai mục) → xóa trước tiên, không đưa vào brand dù là `dứt khoát`; ghi một dòng vào `log.md` workstream liên quan nếu có.
2. `dứt khoát` còn hiệu lực: đưa từng dòng vào node đích **theo nội dung** (nhận diện → `guidelines` khi phạm vi "mọi kênh"; lời/chữ → `voice-tone`; thẩm mỹ chung → `visual-brain`; quy cách một định dạng → `formats/<format>/`; quy trình nhiều bước → đề xuất Project Skill). Giữ nghĩa, ghi nguồn ngắn, thay hoặc gỡ rule cũ, xóa dòng khỏi sổ. Chỉ hỏi người dùng khi mâu thuẫn thật, cần nâng phạm vi hoặc không rõ node đích.
3. `gợi ý`: nhóm theo ý, trình người dùng **một bảng** (ý gộp · số lần/Staff/việc · mới từ lần trước · trích nguồn · node + câu rule đề xuất · khuyến nghị `đưa vào brand | chờ thêm | bỏ`). Team Lead không tự đưa `gợi ý` vào brand chỉ vì lặp nhiều.
4. Áp dụng quyết định: `đưa vào brand` → ghi node, xóa dòng của nhóm; `bỏ` → xóa dòng; `chờ thêm` → chuyển dòng vào nhóm `- Nhóm: <ý gộp> · chờ từ YYYY-MM-DD` ở `## Đang chờ thêm`. Lần sau chỉ trình lại nhóm đang chờ khi có dòng mới cùng ý.
5. Rút gọn `WORKSTREAM.md` quá ngưỡng sang `log.md`; đề xuất xóa file sản xuất của sản phẩm đã xong theo §10.3; đề xuất commit, người dùng duyệt.

**Kích hoạt:** hook `project-health` (copy vào `.omp/hooks/pre/` của Project) chạy đầu mỗi session Team Lead và chỉ báo khi mục `## Feedback chờ tổng hợp` có ≥ 1 dòng `dứt khoát`, ≥ 10 dòng hoặc dòng cũ nhất > 7 ngày (không đếm `## Đang chờ thêm` và dòng `· đến` còn hạn), thay đổi chưa commit cũ nhất > 3 ngày, hoặc `WORKSTREAM.md` > 200 dòng. Người dùng vẫn gọi "tổng hợp feedback"/"dọn <project>" bất kỳ lúc nào. Không có tiến trình nền; hook không chạy trong session Staff hay Intelligence.

Không giữ hai rule active cùng nói một việc; lịch sử thay đổi rule nằm trong Git.

## 10. Hybrid asset policy

`assets/ASSETS.md` là canonical index, không phải nơi chứa mọi binary.

Index là starter infrastructure bắt buộc kể cả khi chưa có asset. Trạng thái trống phải nói “chưa có entry” và giữ quy trình tiếp nhận; không tạo placeholder đại diện cho file chưa tồn tại. Asset subfolders chỉ tạo khi có file thật.

### 10.1. Có thể lưu trong Git

- File nhỏ và ổn định.
- Cần version cùng brand context.
- Không chứa secret hoặc dữ liệu không được phép commit.
- Ví dụ có thể gồm SVG logo hoặc tài liệu text; quyết định thực tế phụ thuộc quyền sử dụng và repo.

### 10.2. Dùng storage ngoài

- Raw video.
- Source design lớn.
- Product master nặng.
- Binary thay đổi thường xuyên.
- File mà clone toàn bộ không hợp lý.

Manifest chỉ giữ metadata cần dùng:

- Asset name và purpose.
- Canonical location.
- Format/version.
- Usage constraint hoặc license khi liên quan.
- Access requirement.
- Trạng thái/điểm kiểm tra gần nhất khi cần.

Không dùng credentials, token hoặc signed URL tạm làm canonical locator. Cache, proxy và render tạm không phải canonical asset. Workstream output vẫn thuộc workstream cho tới khi được duyệt thành canonical brand asset.

### 10.3. File sản xuất (V0.2.0)

- Mọi thứ chỉ cần để dựng/render lại (frame, project Remotion/dựng, render trung gian, font, cache, JSON trung gian) nằm trong `work/<workstream>/production/` và bị `.gitignore` loại khỏi Git. Kết quả duyệt và evidence ghi bằng chữ trong `WORKSTREAM.md`/`log.md`.
- Output đã bàn giao là deliverable chuẩn (ví dụ ảnh nhỏ đã duyệt) có thể giữ trong Git ở `outputs/` theo §10.1.
- File Final do người dùng chuyển ra ngoài repo; locator ghi ở cột "Final ở đâu".
- Phiên dọn chỉ đề xuất xóa `production/` của sản phẩm đã xong khi path Final tồn tại thật; ổ ngoài chưa cắm thì không đề xuất; người dùng duyệt từng mục; xóa bằng cách chuyển vào Thùng rác.

V0.1.3 không chọn storage provider, không bắt buộc Git LFS và không đặt ngưỡng MB chung cho mọi Project.

## 11. Nhiều session và concurrent edits

Không thêm lock system trong V0.1.3.

- Mỗi session dùng job/checkpoint riêng.
- Một project session chỉ có một active Project.
- Training session không tự đọc Project context.
- Trước khi sửa hoặc commit shared Staff files như `skills/`, `MEMORY.md`, `USER.md` hoặc `WORK.md`, session phải đọc lại trạng thái hiện hành.
- Không ghi đè thay đổi mới của session khác.
- Nếu phát hiện thay đổi cạnh tranh hoặc merge conflict, dừng và hợp nhất có chủ đích; không chọn một bản tùy ý.

Project workstream giúp nhiều Staff nhìn cùng shared state, nhưng không thay thế việc kiểm tra file hiện hành trước mutation.

## 12. Git checkpoints qua hai repo

### 12.1. Hai repo, hai lịch sử

Một mốc có thể thay đổi cả Project và Staff repo. Git không tạo một commit atomic phủ hai repo.

Khi cả hai có thay đổi đáng lưu, Staff trình một đề xuất gồm hai commit riêng. Mỗi proposal nêu:

- Repo.
- Lý do đây là mốc đáng lưu.
- Scope/file dự kiến.
- Commit message.
- Verification và giới hạn.

Người dùng có thể duyệt cả hai, một repo hoặc hoãn.

### 12.2. Thứ tự khi duyệt cả hai

1. Kiểm tra Git state/diff của từng repo.
2. Commit Project repo trước.
3. Staff checkpoint commit có thể tham chiếu Project commit hash.
4. Không tạo commit Project thứ ba chỉ để backlink Staff hash.
5. Xác nhận hash/message thực tế của từng commit.

Không mô tả hai commit là atomic. Khôi phục một repo không tự khôi phục repo còn lại.

### 12.3. Quy tắc an toàn

- Người dùng duyệt mới commit.
- Stage đúng scope; không mặc định `git add .`.
- Không tự push, init, amend, reset hoặc rewrite history.
- Không thay identity hoặc thêm remote khi chưa được yêu cầu.
- Không gom thay đổi của session khác hoặc secrets.
- Nếu repo chưa có Git/HEAD hoặc thiếu identity, báo đúng điều kiện thiếu.

Quy tắc collaboration này được định nghĩa ở [[11-factory/specs/os-staff-starter-spec]] V0.2.3. Repo Staff được tạo theo phiên bản cũ không tự nâng cấp và vẫn cần migration được duyệt.

## 13. Security và data boundaries

Không commit mặc định:

- API keys, cookies, OAuth tokens, credentials hoặc secrets.
- Raw session transcript, cache và runtime database của harness.
- Signed URL tạm.
- Tài sản không có quyền lưu hoặc phân phối.
- Raw media lớn không có storage strategy.

Context của một brand không được dùng làm reference cho brand khác chỉ vì cùng Staff đã từng đọc. Cross-brand comparison hoặc reuse cần yêu cầu và scope rõ; không auto-promote kết luận sang brand node.

Quyền đọc/ghi repo vẫn do filesystem, Git host và harness quyết định. Markdown instruction không cấp thêm permission.

## 14. Acceptance scenarios V0.2.2

### 14.1. Đúng Project và progressive loading

- Staff bắt đầu session trong repo Staff đang tồn tại và được giao workstream của Brand Mẫu (ví dụ giả).
- Gate xác nhận đúng Project ID, đọc Project instructions, mandatory base, workstream và voice node cần thiết.
- Staff báo `Context active: Brand Mẫu · <workstream>` trước khi làm.
- Staff không preload visual references nếu task chỉ cần copy.

### 14.2. Voice thương hiệu cá nhân không thành preference toàn cục

- Staff đọc public voice của một Project thương hiệu cá nhân để viết nội dung.
- Rule đó không được ghi vào `USER.md` hoặc generic Staff memory nếu không phải preference cộng tác toàn cục.
- Session khác làm brand khác không dùng voice của Project thương hiệu cá nhân đó.

### 14.3. Resume an toàn

- Staff checkpoint chứa Project/workstream locator.
- Session resume kiểm tra lại `PROJECT.md`, mandatory base và workstream hiện hành.
- Nếu locator không còn đúng, Staff dừng thay vì đoán hoặc chạy lại external action.

### 14.4. Brand switch

- Người dùng đóng session Brand Mẫu và mở session mới cho brand khác.
- Session mới chạy gate cho brand mới.
- Không có context switcher hoặc tuyên bố model đã quên session cũ.

### 14.5. Shared workstream và Staff checkpoint

- Hai Staff cùng làm một workstream.
- Shared brief, approval, deliverable và tổng trạng thái nằm ở Project.
- Mỗi Staff job chỉ giữ assignment/checkpoint riêng.
- Không có hai bản brief active cạnh tranh.

### 14.6. Feedback và brand learning

- Feedback chỉ đúng cho một deliverable ở lại workstream.
- Người dùng feedback điều đúng cho bài khác → Staff ghi ngay một dòng có staff-id + mức + phạm vi ở cuối `brand/feedback.md`, báo một dòng, không hỏi duyệt; không file `brand/` nào khác đổi.
- Staff khác vai mở Project sau đó đọc được dòng đó qua gate; dòng `dứt khoát` được theo ngay, dòng `gợi ý` chỉ tham khảo.
- Phiên tổng hợp của Team Lead đưa `dứt khoát` vào đúng node và xóa khỏi sổ; `gợi ý` thành bảng chờ người dùng quyết, không node nào đổi vì `gợi ý` trước khi người dùng duyệt; nhóm `chờ thêm` không bị trình lại khi chưa có dòng mới; rule cũ bị thay thế không còn active song song.

### 14.7. Assets

- `assets/ASSETS.md` tồn tại từ lúc khởi tạo; Staff đọc index khi task cần asset.
- Index trống nói đúng chưa có entry và cách tiếp nhận; không tạo asset giả.
- Asset có thật ghi purpose, canonical locator/root, format/version, usage constraint/provenance, access requirement, status và source/approval.
- Staff mở đúng file hiện có; candidate/retired không bị dùng như current, signed URL tạm/cache/render tạm không thành canonical source.

### 14.8. Git qua hai repo

- Một mốc thay đổi Project workstream và Staff checkpoint.
- Staff trình hai proposal riêng trong một lần.
- Nếu duyệt cả hai, Project commit trước và Staff commit có thể tham chiếu hash đó.
- Không push hoặc tuyên bố atomic.

### 14.9. Concurrent sessions

- Một Staff có training session và nhiều project session đang mở.
- Mỗi session dùng checkpoint riêng.
- Trước khi sửa shared Staff files, session đọc lại trạng thái hiện hành và không ghi đè thay đổi mới.

### 14.10. Locator và cấu trúc bắt buộc

- Mandatory files, heading `Non-negotiables` và `assets/ASSETS.md` luôn tồn tại; README/index không dùng nội dung giả để lấp dữ liệu thiếu.
- Conditional nodes chưa có được router ghi là chưa có; không có link active tới file thiếu.
- Staff job resolve đúng Project/workstream; backlink từ workstream resolve đúng Staff job khi mở từ root Project.
- Cả wikilink/heading lẫn locator plain text/inline code đều được kiểm tra, không chỉ chiều Staff → Project.

### 14.11. Session JSONL/resume locator

- Fresh Project session trả `Session hiện tại` đúng một lần trong câu trả lời đầu tiên.
- JSONL path và resume command thuộc đúng agent/cwd; mở command trong terminal mới tải lại đúng thread.
- Nếu câu trả lời đầu tiên cập nhật Markdown, locator đứng ngay trước `Markdown đã cập nhật`; metadata không có được báo `không khả dụng`.
- Không copy hoặc commit transcript/runtime history vào Project.

### 14.12. Hook và phiên dọn

- Session Team Lead mới (cwd root Project) khi sổ có dòng `dứt khoát` hoặc vượt ngưỡng → message ẩn `ai-os.project-health` nêu Project, lý do và Skill `brand-curation`; sổ trống/không vượt → không chèn. Session Intelligence và Staff không chèn message này.
- File trong `work/*/production/` không được tính là thay đổi chưa commit.
- Phiên dọn chỉ đề xuất xóa file sản xuất khi Final tồn tại thật.

### 14.13. Bộ nền công cụ Team Lead

- Fresh `omp -p` tại root Project, không gợi ý đáp án: catalog có `impeccable`, `using-superpowers`, `brainstorming`, `skill-creator`, `browser-use`, `brand-curation`; Agent kể được Staff/Project/app từ danh bạ mà không liệt kê chính Project như repo khác.
- Hỏi cách xem một trang công khai và một trang cần đăng nhập → chọn `bu-headless` và Orca profile `Agent`; từ chối Chrome cá nhân/relay/cookie.
- `git status` sau cài chỉ thấy registration/lock plugin, hook, Skill Creator, symlink, `skills-lock.json`; không thấy `node_modules/` hoặc cache.

## 15. Quy trình factory tạo một Project

1. Xác nhận brand/project name, stable ID, repo name và loại Project.
2. Xác nhận đường dẫn đích trong container non-Git `OS Projects`; không ghi đè folder có dữ liệu và không init Git ở container.
3. Dùng spec V0.2.2 này và bộ khởi tạo `11-factory/project-runtime/` (danh sách nguồn → đích duy nhất ở `11-factory/project-runtime/README.md`) làm nguồn.
4. Trước khi ghi, lập implementation matrix: từng yêu cầu/spec artifact → target path → bắt buộc/conditional → nguồn dữ liệu → cách kiểm chứng.
5. Tạo mandatory files, gồm `.gitignore` đủ pattern §4 và §4.2, `brand/feedback.md` (copy template, thay tên brand), `assets/ASSETS.md`, khối `## Team Lead`, `## Công cụ nền` và "OS Intelligence và Staff" trong `AGENTS.md` (copy template), hook `.omp/hooks/pre/project-health.ts` + `.omp/hooks/pre/ecosystem-catalog.ts`, Skill `.agents/skills/brand-curation/` + `.agents/skills/skill-creator/` cùng symlink `.claude/skills/` và `skills-lock.json`, rồi cài hai plugin project scope (§4.2); index chưa có entry phải giữ hướng dẫn và trạng thái trống, không bịa asset.
6. Điền Project identity và mandatory base; không bịa brand facts còn thiếu.
7. Tạo conditional context nodes, asset subfolders và workstreams chỉ khi có dữ liệu/nhu cầu thật; ghi uncertainty/evidence phù hợp.
8. Khởi tạo standalone Git repository tại root Project (`git init -b main`, `.gitignore` cho secrets/cache/temp, rà inventory để loại secrets và media nặng theo asset policy) và tạo root commit local. Yêu cầu tạo Project là approval cho riêng bước này; không remote/push/tag. Nếu người dùng nói rõ chưa dùng Git, dừng ở filesystem và ghi registry là instance chưa hoàn chỉnh. Không để Project dùng Git history của container hoặc Project khác; nếu đăng ký Orca, làm sau bước này để repo có kind `git`.
9. Kiểm tra Project Context Gate bằng một scenario Staff-first nếu có Staff và quyền phù hợp. Mở `omp` tại root Project mới: Skill `brand-curation` được discover; hook im lặng khi sổ trống và đề xuất tổng hợp khi sổ có một dòng `dứt khoát` (dòng thử xóa sau khi kiểm). Kiểm bộ nền theo §4.2 và §14.13.
10. Đối chiếu file inventory với implementation matrix (gồm từng mục trong `project-runtime/README.md`); kiểm tra mandatory structure, wikilinks/heading, locator hai chiều theo root khai báo, asset locator/status, data boundaries và Git state.
11. Commit tiếp theo, remote và push chỉ trong phạm vi người dùng duyệt.
12. Ghi Project path, spec/version, sản phẩm, verification và giới hạn vào Intelligence [[log]] và [[11-factory/registry]].

Tạo Project repo không đồng nghĩa đã cập nhật mọi Staff hoặc Intelligence caller để biết Project Context Gate. Factory phải kiểm tra contract các phía khi triển khai.

## 16. Compatibility với OS Staff V0.2.15

[[11-factory/specs/os-staff-starter-spec]] V0.2.15 ghi feedback brand ngay vào `brand/feedback.md` và đọc file này trong Project Context Gate.

- OS Projects V0.2.2 và OS Staff V0.2.15 là bộ contract hiện hành; hook `project-health`, Skill `brand-curation` và bộ nền §4.2 nằm trong từng Project (nguồn Factory `11-factory/project-runtime/`), không còn ở Intelligence.
- Staff trước V0.2.15 ghi vào `brand/pending-rules.md`; Project V0.2.1 không còn file đó, nên Staff cũ phải nâng (copy `learning-loop.ts`, sửa `file` trong config) trước khi làm Project V0.2.1.
- Project V0.2.0 nâng lên V0.2.1: `git mv brand/pending-rules.md brand/feedback.md` rồi thay nội dung bằng template; dòng pending còn lại chuyển thành dòng `dứt khoát` (người dùng đã duyệt khi chốt); cài hook, Skill, khối `AGENTS.md` theo `project-runtime/README.md`.
- Project V0.2.1 nâng lên V0.2.2: cài bộ nền §4.2 và khối `## Công cụ nền` theo `project-runtime/README.md`; không đổi `brand/`, workstream hay sổ feedback. Staff không cần nâng.
- Repo đã tạo không tự nâng cấp khi Factory đổi spec; migration phải nằm trong yêu cầu được duyệt.
- File/path smoke không thay thế kiểm chứng với Intelligence, Staff và Project session thực.

## 17. Điểm còn mở

Không chặn starter hiện hành:

- Audience/voice và phần visual/provenance của từng brand cần được xác nhận theo nguồn thật.
- Storage provider và access model của từng brand.
- Có dùng Git LFS hay không.
- Harness-specific bootstrap nếu một harness không đọc được repo sibling.
- Quyền chia sẻ/remote Git của từng Project.

## 18. Lịch sử phiên bản

### V0.1 — 2026-10-13

- Chốt Project tương ứng một brand workspace và một repo độc lập.
- Chốt router + node chuyên đề và mandatory base.
- Chốt Staff-first Project Context Gate có xác nhận một dòng.
- Chốt Project là shared source of truth, Staff giữ checkpoint riêng.
- Chốt folder workstream/path ổn định và learning promotion có approval.
- Chốt hybrid asset policy.
- Chốt hai commit riêng khi thay đổi hai repo.
- Chốt một brand mỗi project session và cho phép một Staff có nhiều session.
- Trạng thái mới là thiết kế được chốt; chưa tạo Project repo hoặc kiểm chứng runtime.
- Compatibility reference được cập nhật sang OS Staff V0.2.1 sau khi người dùng duyệt integration patch; không thay đổi Project contract V0.1.

### V0.1.1 — Sửa kiểm chứng locator và trạng thái starter

- Rà soát phát hiện backlink từ Project tới Staff dùng thừa một cấp `../`; bổ sung kiểm tra mọi locator/heading hai chiều theo root được khai báo.
- Làm rõ file bắt buộc với conditional brand nodes chưa có dữ liệu; không tạo brand facts giả hoặc link tới file chưa có.
- Đồng bộ compatibility với Staff V0.2.2.
- Giữ nguyên workstream ownership, lifecycle, asset policy, learning approval và quyền Git.

### V0.1.2 — 2026-10-15 — Asset index bắt buộc và checklist triển khai

- Feedback lặp lại cho thấy sơ đồ có `assets/ASSETS.md` nhưng quy tắc conditional khiến factory bỏ cả folder/index. Chuyển index thành starter infrastructure bắt buộc; entry/subfolder vẫn theo dữ liệu thật.
- Asset index ghi các asset hiện có, status, locator, provenance/usage constraint đã biết và phần chưa xác minh; không biến file tồn tại thành quyền publish.
- Quy trình tạo Project phải lập implementation matrix và đối chiếu inventory trước bàn giao để không bỏ sót artifact trong spec.
- Giữ nguyên progressive disclosure: asset index không thuộc mandatory base và chỉ đọc khi task cần asset.

### V0.1.3 — 2026-10-15 — Tương thích OS Intelligence V0.1

- Chuyển nguồn spec và log về Intelligence Factory, thêm registry làm bản đồ version/locator.
- Cho phép assignment qua Chief of Staff nhưng giữ Staff role, Project Context Gate và một brand mỗi worker session.
- Route phương pháp dùng chung tới Intelligence `08-playbook/`; không tự publish hoặc copy Playbook vào Project.
- Cập nhật locator/metadata trong phạm vi integration không thay đổi brand context, assets hoặc concurrent output.

### V0.1.4 — 2026-10-18 — Session JSONL/resume locator

- Mọi Project mới và Project được nâng cấp hiển thị transcript JSONL path cùng exact resume command trong câu trả lời đầu tiên.
- Locator lấy từ runtime metadata của đúng agent/cwd, không suy từ ID hoặc file mới nhất; transcript vẫn ở ngoài repo.
- Đồng bộ compatibility với OS Staff V0.2.4 và OS Intelligence V0.2.2.

### V0.1.5 — 2026-11-02 — Git init khi bootstrap

- Vấn đề: phần mở đầu spec đã quy định mỗi Project là standalone Git repository, nhưng bước init "chỉ trong phạm vi người dùng duyệt" không gắn với thời điểm nào nên có thể bị hoãn vô thời hạn.
- Thay đổi: yêu cầu tạo Project là approval cho `git init` + root commit local; commit sau, remote, push và tag vẫn cần approval riêng. Chọn không dùng Git phải được ghi là instance chưa hoàn chỉnh.
- Không đổi: ownership, asset policy, Context Gate, session locator và quyền remote/push.
- Tác động: Project đã có Git không cần migration; Project thiếu Git chỉ bổ sung init + root commit khi người dùng giao.
- Đồng bộ compatibility với OS Staff V0.2.5 và OS Intelligence V0.2.2.

### V0.1.6 — `/learn` procedure riêng brand

- Thêm kho/index procedure có điều kiện, đi qua Project Gate của Staff V0.2.9; không nạp mọi brand vào catalog chung.
- Giữ đúng ownership, tham chiếu style system hiện có và approval trước lưu/kích hoạt; cho phép dùng Skill chưa thực thi với trạng thái bằng chứng đúng.
- Spec đổi không tự nâng metadata hoặc sửa nội dung các Project instance.

### V0.2.0 — 2026-11-11 — Intelligence biên tập brand, hộp chung và phiên dọn

- Vấn đề: Staff chỉ thêm file, không ai gom; Staff đọc rule cũ; Staff khác vai đọc cùng brand ra hai kiểu vì bài học brand nằm ở `staff-lessons/<staff>.md` chỉ Staff đó nạp; `WORK.md` dễ thành nhật ký, `WORKSTREAM.md` quá dài, mỗi sản phẩm bị tách thành workstream riêng và file sản xuất nặng tồn đọng chưa commit.
- Thay đổi: `brand/pending-rules.md` thay `staff-lessons`; `brand/` hai tầng và chỉ Intelligence biên tập; phiên dọn theo Skill `project-curation`, kích hoạt bởi hook `project-health` đầu session Intelligence; workstream theo chiến dịch, `WORKSTREAM.md` hiện trạng + `log.md`, cột "Final ở đâu"; `production/` ngoài Git; `.gitignore` bắt buộc.
- Không đổi: Project ownership của brand facts, Project Context Gate (thêm một file mandatory), session locator, quyền Git/push, asset policy cho canonical asset.
- Spec đổi không tự nâng instance; migration cần yêu cầu được duyệt.

### V0.2.1 — 2026-11-18 — Team Lead và sổ feedback

- Vấn đề: người dùng làm việc brand trực tiếp với agent mở tại root Project (Team Lead), không qua Intelligence; feedback cho Staff thường cần nhiều bài, nhiều lượt mới đúng, nhưng V0.2.0 chỉ có lớp "rule duyệt từng cái" có hiệu lực ngay, không có chỗ tích lũy feedback để tìm mẫu trước khi sửa context brand.
- Thay đổi: sổ `brand/feedback.md` thay `pending-rules.md`, hai mức `dứt khoát`/`gợi ý`, mục `## Đang chờ thêm` + `## Feedback chờ tổng hợp` cuối file; Staff ghi ngay không hỏi duyệt; Team Lead (session tại root Project) là người biên tập duy nhất `brand/`, tổng hợp bằng Skill Project `brand-curation`; hook `project-health` v0.2.0 chuyển vào từng Project; Factory có bộ khởi tạo `11-factory/project-runtime/` (hook, Skill, template sổ, khối `AGENTS.md`).
- Không đổi: `brand/` hai tầng, Project Context Gate (đổi tên một file mandatory), workstream/`log.md`, `production/` ngoài Git, session locator, quyền Git/push, asset policy.

### V0.2.2 — 2026-11-19 — Bộ nền công cụ của Team Lead

- Vấn đề: agent tại root Project đã là Team Lead làm việc thật với người dùng, nhưng Project không có Superpowers, Impeccable, Skill Creator, đường Browser Use có ranh giới hay danh bạ hệ sinh thái mà mọi Staff mới bắt buộc có.
- Thay đổi: §4.2 — quy tắc tương đương với bộ nền cài đặt bắt buộc của OS Staff (trừ learning loop, `/learn`, memory/journal của Staff); hai plugin project scope, Skill Creator tại `.agents/skills/`, kiểm Browser Use + khối ranh giới trình duyệt, hook `ecosystem-catalog` v0.1.1 (nhận `- Project ID:`); khối `## Công cụ nền` trong `AGENTS.md`; `.gitignore` chặn runtime plugin.
- Không đổi: `brand/`, sổ feedback, Project Context Gate, workstream, quyền Git/push/publish, không thêm MCP.

### V0.2.3 — 2026-11-19 — Input/Output rõ và bản đồ sống

- Vấn đề: brainstorm nhiều vòng với Team Lead làm người dùng mất phương hướng nếu không thấy toàn cảnh. Cách Input/Output + bản đồ Excalidraw giúp nhìn toàn cảnh, nhưng script riêng từng workstream dễ khiến dữ liệu nằm ở hai nơi.
- Thay đổi: Skill dùng chung `io-map` trong bộ nền §4.2 (canonical tại Intelligence, playbook [[08-playbook/input-output-map]]); `AGENTS.md` khối `## Công cụ nền` có một dòng routing.
- Không đổi: `brand/`, sổ feedback, Project Context Gate, cấu trúc workstream, quyền.
