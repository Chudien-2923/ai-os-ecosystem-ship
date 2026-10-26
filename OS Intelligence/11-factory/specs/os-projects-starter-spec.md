# OS Projects Starter Spec

- **Phiên bản hiện hành:** V0.1.4.
- **Trạng thái:** contract hiện hành để Factory tạo Project mới; Ship V0.4.0 giữ repository metadata/standalone Git boundary và bổ sung generic Orchestration V2 tại Intelligence, clean distribution chưa có Project instance.
- **Ngày ghi nhận:** 2026-10-18.
- **Nơi duy trì:** OS Intelligence `11-factory/specs/os-projects-starter-spec.md`.
- **Mục đích:** Làm nguồn chính để Factory trong Intelligence tạo các brand workspace độc lập trong OS Projects.
- **Quyết định hiện tại:** V0.1.4 thêm session JSONL/resume locator tương thích ngược trên V0.1.3; không thêm automation riêng.

> Mỗi Project là một brand workspace dài hạn và một repo độc lập. Staff mang vai trò và năng lực đến Project; Project giữ context, trạng thái chung và lịch sử của brand.

`OS Projects` là container tổ chức local và không phải Git repository dùng chung. Mỗi Project folder bên trong là một standalone Git repository; history, branch, tag, remote, approval và recovery độc lập.

## 1. Tầm nhìn

OS Projects giúp các Staff làm đúng việc cho đúng brand mà không phải nạp toàn bộ hệ sinh thái hoặc dựa vào memory mơ hồ của session.

Trong mô hình V0.1.4, kế thừa V0.1.3:

- Một Project tương ứng một brand workspace dài hạn.
- Brand của khách hàng và thương hiệu cá nhân dùng cùng một contract.
- Campaign, launch, funnel, kênh nội dung hoặc đợt sản xuất là workstream bên trong Project, không mặc định trở thành repo mới.
- Brand context, workstream và canonical asset index thuộc Project repo.
- Role, skills, generic memory và cách cộng tác của Staff thuộc Staff repo.
- Markdown và wikilink điều hướng context; không xây agent harness riêng.

Spec dùng tên generic trong ví dụ. Clean Ship không khai báo sẵn brand, khách hàng, campaign hoặc public voice nào; Project chỉ được tạo từ dữ liệu người dùng hiện tại cung cấp.

## 2. Phạm vi V0.1.4

V0.1.4 định nghĩa:

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
- Acceptance scenarios và quy trình factory khởi tạo Project.

V0.1.4 không định nghĩa:

- Agent harness, background service, database, vector store hoặc context injector riêng.
- Storage provider, Git LFS policy hoặc ngưỡng dung lượng bắt buộc.
- Nội dung brand cụ thể khi chưa có nguồn.
- Quyền truy cập, publishing, scheduling, payment hoặc credential management.
- Orchestrator, session switcher, context clearing hoặc lock system.
- Cấu trúc nội bộ của Intelligence/Playbook; Project chỉ giữ locator và ownership cần cho integration, không copy các kho đó.

## 3. Ranh giới giữa Factory, Staff và Project

| Thành phần | Nguồn chính của | Không phải nguồn chính của |
| --- | --- | --- |
| Factory | Spec, version, template và lịch sử quyết định của từng OS | Context vận hành hằng ngày của một brand |
| Staff repo | Role, skills, generic knowledge, cách cộng tác, Staff job/checkpoint và learning của Staff | Brand facts hoặc trạng thái chung của campaign |
| Project repo | Brand context, workstream, deliverables, approvals, Project decisions và canonical asset index | Role hoặc generic procedural memory của mọi Staff |
| Harness | Model, tools, session, quyền file và runtime context | Bản duy nhất của tri thức cần bàn giao |

Project-specific facts không được promote thành generic Staff memory chỉ vì Staff đã đọc chúng nhiều lần. Public voice của một Project cũng không mặc định là preference cộng tác hoặc voice của Project khác.

## 4. Cấu trúc starter

Cấu trúc mục tiêu:

```text
<brand-project>/
├── README.md
├── VERSION
├── CHANGELOG.md
├── AGENTS.md
├── PROJECT.md
├── WORK.md
├── brand/
│   ├── foundation.md
│   ├── audience.md
│   ├── voice-tone.md
│   ├── visual-brain.md
│   └── guidelines.md
├── assets/
│   └── ASSETS.md
└── work/
    └── <workstream>/
        └── WORKSTREAM.md
```

Phần bắt buộc khi khởi tạo: `README.md`, `VERSION`, `CHANGELOG.md`, `AGENTS.md`, `PROJECT.md`, `WORK.md`, `brand/foundation.md`, `brand/guidelines.md` có heading `Non-negotiables`, và `assets/ASSETS.md`. README ghi rõ đây là OS Project, Project ID/type/purpose, cách bắt đầu, cấu trúc, quan hệ với Staff/Intelligence, version/Git và privacy. `VERSION` là contract version machine-readable; `CHANGELOG.md` giữ repository metadata/migration, không thay workstream history. Asset index chưa có asset thì phải ghi rõ trạng thái trống và cách đăng ký; README/index không được bịa entry. Audience/voice/visual nodes chỉ tạo khi có dữ liệu tương ứng; router nêu phần thiếu nhưng không link tới file chưa tồn tại. `outputs/`, `references/`, asset subfolders và node con chỉ xuất hiện khi thực sự cần. Hai folder Staff `journal/`, `knowledge/` không phải yêu cầu cấu trúc Project.

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

`AGENTS.md` trong Project không tự được nạp khi current working directory là Staff repo. Project Context Gate của Staff phải đọc file này một cách tường minh.

`AGENTS.md` của mọi Project mới và Project được nâng cấp phải thêm `Session hiện tại` trong câu trả lời đầu tiên: transcript JSONL path cùng exact resume command từ runtime/index, chỉ một lần. Nếu câu trả lời đầu tiên có `Markdown đã cập nhật`, session locator đứng ngay trước báo cáo đó; nếu không, nó là phần cuối. Trên Orca + OMP, dùng một cụm phân biệt từ prompt đầu tiên, giới hạn `agent=omp` và `cwd` là root Project trong `orca search ... --fresh --json`, rồi lấy nguyên `source.filePath` và `resumeCommand`. Không suy từ Session ID/file mới nhất; metadata không có thì ghi `không khả dụng`. Transcript, runtime ID, search index và cache không được commit vào Project.

Output dùng `source.filePath` làm JSONL locator và paste `resumeCommand` nguyên văn trong một fenced block `bash`; không dựng lại command từ path hoặc đổi separator/ký tự.

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
# Project Alpha

- Project ID: project-alpha
- Type: client-brand

## Always load

- [[brand/foundation]] — hiểu brand identity và positioning nền.
- [[brand/guidelines#non-negotiables]] — kiểm tra constraint không được vi phạm.

## Load when relevant

- [[brand/audience]] — khi audience ảnh hưởng thông điệp hoặc offer.
- [[brand/voice-tone]] — khi viết hoặc duyệt copy.
- [[brand/visual-brain]] — khi tạo hoặc duyệt visual.
- [[WORK]] — khi chọn hoặc tiếp tục workstream.
- [[assets/ASSETS]] — khi cần canonical asset.
```

Các wikilink trên là ví dụ bên trong Project repo tương lai, không phải file phải tồn tại trong factory.

## 6. Brand context graph

### 6.1. Mandatory base

Mọi Project Context Gate phải đọc:

1. `brand/foundation.md`.
2. Phần `Non-negotiables` trong `brand/guidelines.md`.

Không preload toàn bộ brand graph. Workstream route thêm audience, voice, visual hoặc asset context khi nhiệm vụ cần.

### 6.2. Trách nhiệm từng node

| Node | Nguồn chính của | Không chứa |
| --- | --- | --- |
| `foundation.md` | Brand identity, purpose, positioning, value proposition, offer cấp cao và sự thật nền | Voice examples, visual references, trạng thái campaign |
| `audience.md` | Nhóm khách hàng, nhu cầu, pain/desire, buying context và evidence | Persona bịa ra hoặc assumption không gắn nhãn |
| `voice-tone.md` | Public voice, tone theo tình huống/kênh, từ nên-tránh, examples và counterexamples | Quy tắc logo/màu hoặc preference cộng tác riêng của người dùng |
| `visual-brain.md` | Nguyên tắc thẩm mỹ, reference/anti-reference, pattern từ feedback đã duyệt và lý do | Raw asset library hoặc thông số sử dụng logo chính thức |
| `guidelines.md` | Constraint bắt buộc: logo, màu, typography, legal/claim, điều cấm và link nguồn chính thức | Mood hoặc inspiration chưa được duyệt |

### 6.3. Một nguồn chính

- Mỗi fact hoặc rule có một node nguồn chính.
- Router và node khác chỉ link kèm lý do/thời điểm đọc.
- Không giữ hai rule active trùng hoặc mâu thuẫn.
- Khi node quá lớn, tách node con và giữ file cũ làm router để không làm gãy link.
- Không tạo taxonomy hoặc index rỗng trước nhu cầu thực.
- Khi link thiếu hoặc nội dung không đủ, Staff làm rõ; không tự bịa brand context.
- Wikilink nội bộ resolve từ root Project. Locator xuyên repo phải ghi rõ gốc resolve: Project locator từ root Staff; workstream locator và backlink tới Staff job từ root Project.
- Kiểm tra bằng cách mở file/heading thật và đối chiếu identity theo cả hai chiều; không bỏ qua đường dẫn viết trong inline code hoặc plain text. Không dùng cwd hay folder của workstream để đoán gốc.

## 7. Staff-first và Project Context Gate

### 7.1. Điểm bắt đầu session

Người dùng có thể làm trực tiếp trong repo Staff hoặc giao qua Intelligence. Staff tự nạp role, skills và memory theo [[11-factory/specs/os-staff-starter-spec]], sau đó đọc Project repo được chỉ định; Chief of Staff assignment không thay Project Context Gate.

Một project session chỉ có một active brand. Khi đổi brand, người dùng đóng session cũ và mở session mới trong cùng Staff repo. Không xây cơ chế xóa context hoặc đổi brand trong conversation đang có.

Một Staff có thể có nhiều session đồng thời:

- Một session training nghiệp vụ, không có active Project mặc định.
- Một project session cho Project A.
- Một project session cho Project B.
- Một project session cho Project C.

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

Mỗi campaign, launch, funnel, content lane hoặc initiative có một folder ổn định:

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
| Bền vững cho brand | Đề xuất cập nhật đúng brand node |
| Năng lực hoặc procedure dùng lại của một Staff | Đi qua Staff learning loop |
| Phương pháp đã kiểm chứng và có thể dùng giữa nhiều Staff/Project | Ứng viên cho Intelligence `08-playbook/`; không auto-publish |

### 9.2. Promote brand learning cần approval

Staff chủ động đề xuất, người dùng duyệt trước khi feedback trở thành brand rule bền vững.

Proposal cần có:

- Nội dung đề xuất.
- Evidence/source workstream.
- Scope áp dụng.
- Node đích.
- Rule cũ bị thay thế nếu có.
- Phần chưa kiểm chứng.

Sau khi duyệt:

1. Sửa node nguồn chính.
2. Backlink tới evidence/workstream.
3. Đánh dấu proposal đã tiếp nhận.
4. Loại rule cũ khỏi tập chỉ dẫn đang active nếu bị thay thế.
5. Giữ lịch sử trong workstream và Git, không giữ hai rule active.

Không promote chỉ vì feedback được lặp lại hoặc Staff tự thấy output đẹp.

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

## 14. Acceptance scenarios V0.1.4

### 14.1. Đúng Project và progressive loading

- Một Staff bắt đầu session trong Staff repo và được giao workstream của Project Alpha.
- Gate xác nhận đúng Project ID, đọc Project instructions, mandatory base, workstream và voice node cần thiết.
- Staff báo `Context active: Project Alpha · <workstream>` trước khi làm.
- Staff không preload visual references nếu task chỉ cần copy.

### 14.2. Public voice không thành preference toàn cục

- Staff đọc public voice của Project A để viết nội dung.
- Rule đó không được ghi vào `USER.md` hoặc generic Staff memory nếu không phải preference cộng tác toàn cục.
- Session khác làm Project B không dùng voice của Project A.

### 14.3. Resume an toàn

- Staff checkpoint chứa Project/workstream locator.
- Session resume kiểm tra lại `PROJECT.md`, mandatory base và workstream hiện hành.
- Nếu locator không còn đúng, Staff dừng thay vì đoán hoặc chạy lại external action.

### 14.4. Brand switch

- Người dùng đóng session Project A và mở session mới cho Project B.
- Session mới chạy gate cho Project B.
- Không có context switcher hoặc tuyên bố model đã quên session cũ.

### 14.5. Shared workstream và Staff checkpoint

- Hai Staff cùng làm một workstream.
- Shared brief, approval, deliverable và tổng trạng thái nằm ở Project.
- Mỗi Staff job chỉ giữ assignment/checkpoint riêng.
- Không có hai bản brief active cạnh tranh.

### 14.6. Feedback và brand learning

- Feedback chỉ đúng cho một deliverable ở lại workstream.
- Feedback có vẻ bền vững được Staff đề xuất với source, scope và target node.
- Brand node chỉ đổi sau khi người dùng duyệt.
- Rule cũ bị thay thế không còn active song song.

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

- `README.md`, `VERSION`, `CHANGELOG.md`, mandatory operating files, heading `Non-negotiables` và `assets/ASSETS.md` luôn tồn tại; README/index không dùng nội dung giả để lấp dữ liệu thiếu.
- Project root là standalone Git boundary; container `OS Projects` và parent Ship không nhận child history/data.
- Conditional nodes chưa có được router ghi là chưa có; không có link active tới file thiếu.
- Staff job resolve đúng Project/workstream; backlink từ workstream resolve đúng Staff job khi mở từ root Project.
- Cả wikilink/heading lẫn locator plain text/inline code đều được kiểm tra, không chỉ chiều Staff → Project.

### 14.11. Session JSONL/resume locator

- Fresh Project session trả `Session hiện tại` đúng một lần trong câu trả lời đầu tiên.
- JSONL path và resume command thuộc đúng agent/cwd; mở command trong terminal mới tải lại đúng thread.
- Nếu câu trả lời đầu tiên cập nhật Markdown, locator đứng ngay trước `Markdown đã cập nhật`; metadata không có được báo `không khả dụng`.
- Không copy hoặc commit transcript/runtime history vào Project.


## 15. Quy trình factory tạo một Project

1. Xác nhận brand/project name, stable ID, repo name và loại Project.
2. Xác nhận đường dẫn đích trong container `OS Projects`; không ghi đè folder có dữ liệu và không init Git ở container hoặc parent Ship.
3. Dùng spec V0.1.4 này làm nguồn.
4. Trước khi ghi, lập implementation matrix: từng requirement/artifact → target path → bắt buộc/conditional → nguồn dữ liệu → cách kiểm chứng.
5. Tạo repository metadata `README.md`, `VERSION`, `CHANGELOG.md` và mandatory files, gồm `assets/ASSETS.md`; index chưa có entry phải giữ hướng dẫn và trạng thái trống, không bịa asset.
6. Điền Project identity và mandatory base; không bịa brand facts còn thiếu.
7. Tạo conditional context nodes, asset subfolders và workstreams chỉ khi có dữ liệu/nhu cầu thật; ghi uncertainty/evidence phù hợp.
8. Chỉ init standalone Git tại root Project khi người dùng duyệt; không có approval thì ghi Git setup là pending.
9. Kiểm tra Project Context Gate bằng một scenario Staff-first nếu có Staff và quyền phù hợp.
10. Đối chiếu file inventory với implementation matrix; kiểm tra mandatory structure, links/headings, locator hai chiều, asset status, data boundaries và Git boundary.
11. Chỉ commit/remote/push trong phạm vi người dùng duyệt.
12. Ghi Project path, spec/version, verification và giới hạn vào Intelligence [[log]] và [[11-factory/registry]].

Tạo Project repo không đồng nghĩa đã cập nhật mọi Staff hoặc Intelligence caller để biết Project Context Gate. Factory phải kiểm tra contract các phía khi triển khai.

## 16. Compatibility với OS Staff V0.2.4 và Intelligence V0.2.2

[[11-factory/specs/os-staff-starter-spec]] V0.2.4 giữ integration contract của V0.2.3 và dùng cùng session locator contract.

- OS Projects V0.1.4, OS Staff V0.2.4 và Intelligence V0.2.2 là bộ contract hiện hành.
- V0.1/V0.1.1/V0.1.2/V0.1.3 và Staff V0.2.1/V0.2.2/V0.2.3 là nền contract; patch hiện hành thêm session locator, không đổi Project ownership, learning approval, assets hoặc quyền Git.
- Staff V0.2 hoặc cũ hơn chưa có Project integration contract; Staff trước V0.2.3 chưa có Intelligence compatibility; Staff trước V0.2.4 chưa bắt buộc session locator.
- Repo đã tạo không tự nâng cấp khi Factory đổi spec; migration phải nằm trong yêu cầu được duyệt.
- File/path smoke không thay thế kiểm chứng với Intelligence, Staff và Project session thực.

## 17. Điểm còn mở

Không chặn starter hiện hành:

- Audience/voice và phần visual/provenance của mỗi Project chỉ có sau khi được xác nhận.
- Storage provider và access model của từng brand.
- Có dùng Git LFS hay không.
- Harness-specific bootstrap nếu một harness không đọc được repo sibling.
- Quyền chia sẻ/remote Git của từng Project.
- Nội dung, evidence và assets thật của Project chưa được tạo.
- Nhu cầu hook/automation sau trải nghiệm.

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

- Rà soát một implementation sớm phát hiện backlink Staff–Project dùng thừa một cấp `../`; từ đó bổ sung kiểm tra mọi locator/heading hai chiều theo root được khai báo.
- Làm rõ file bắt buộc với conditional brand nodes chưa có dữ liệu; không tạo brand facts giả hoặc link tới file chưa có.
- Đồng bộ compatibility với Staff V0.2.2 và trạng thái Project instance đã được tạo.
- Giữ nguyên workstream ownership, lifecycle, asset policy, learning approval và quyền Git.

### V0.1.2 — 2026-10-15 — Asset index bắt buộc và checklist triển khai

- Feedback lặp lại cho thấy sơ đồ có `assets/ASSETS.md` nhưng quy tắc conditional khiến factory bỏ cả folder/index. Chuyển index thành starter infrastructure bắt buộc; entry/subfolder vẫn theo dữ liệu thật.
- Một Project instance đã kiểm chứng asset index với status, locator, provenance/usage constraint và phần chưa xác minh; file tồn tại không tự tạo quyền publish.
- Quy trình tạo Project phải lập implementation matrix và đối chiếu inventory trước bàn giao để không bỏ sót artifact trong spec.
- Giữ nguyên progressive disclosure: asset index không thuộc mandatory base và chỉ đọc khi task cần asset.

### V0.1.3 — 2026-10-15 — Tương thích OS Intelligence V0.1

- Chuyển nguồn spec và log về Intelligence Factory, thêm registry làm bản đồ version/locator.
- Cho phép assignment qua Chief of Staff nhưng giữ Staff role, Project Context Gate và một brand mỗi worker session.
- Route phương pháp dùng chung tới Intelligence `08-playbook/`; không tự publish hoặc copy Playbook vào Project.
- Project instance hiện hữu được cập nhật locator/metadata trong phạm vi integration; brand context, assets và concurrent output giữ nguyên.

### V0.1.4 — 2026-10-18 — Session JSONL/resume locator

- Mọi Project mới và Project được nâng cấp hiển thị transcript JSONL path cùng exact resume command trong câu trả lời đầu tiên.
- Locator lấy từ runtime metadata của đúng agent/cwd, không suy từ ID hoặc file mới nhất; transcript vẫn ở ngoài repo.
- Đồng bộ compatibility với OS Staff V0.2.4 và OS Intelligence V0.2.2.
