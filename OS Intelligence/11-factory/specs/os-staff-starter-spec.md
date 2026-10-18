# OS Staff Starter Spec

- **Phiên bản hiện hành:** V0.2.4.
- **Trạng thái:** contract hiện hành để Factory tạo Staff mới; clean Ship chưa có Staff instance, runtime evidence phải ghi riêng tại registry sau khi tạo.
- **Ngày ghi nhận:** 2026-10-18.
- **Nơi duy trì:** OS Intelligence `11-factory/specs/os-staff-starter-spec.md`.
- **Mục đích:** Lưu quyết định thiết kế, hành trình phát triển spec và tiêu chuẩn để tạo các nhân viên AI độc lập.
- **Quyết định hiện tại:** V0.2.4 thêm session JSONL/resume locator tương thích ngược trên V0.2.3; không triển khai các ý tưởng creative-learning V0.3.

> Nhân viên tồn tại liên tục qua các file trong repo. Session là một lần nhân viên làm việc. Harness có thể thay đổi mà không làm mất phần tri thức và trạng thái đã được lưu đúng cách.

## 1. Tầm nhìn và phạm vi

Tạo các OS Staff có vai trò cụ thể như Video Editor, Graphic Designer hoặc Sales Funnel Builder. Mỗi Staff là một repo độc lập, có trách nhiệm, cách cộng tác, kiến thức, công việc và memory riêng.

Không xây một agent harness mới. Thiết kế môi trường để model và các harness có sẵn làm việc hiệu quả: Oh My Pi, Codex, Claude Code, Antigravity hoặc harness khác có khả năng phù hợp.

Tri thức và quy trình ưu tiên Markdown liên kết bằng `[[wikilink]]`. Agent càng làm việc càng có cơ hội hiểu người dùng hơn, tái sử dụng cách làm đã được kiểm chứng và sửa những điều đã học sai.

### Factory và Staff là hai loại repo khác nhau

| Thành phần | Trách nhiệm | Không chịu trách nhiệm |
| --- | --- | --- |
| Repo factory | Duy trì spec, lịch sử thiết kế và tạo Staff theo phiên bản được chọn | Không làm bộ nhớ cá nhân dùng chung mặc định cho mọi Staff |
| Repo của một Staff | Giữ vai trò, knowledge, skills, memory và trạng thái công việc của Staff đó | Không chứa toàn bộ cấu hình và lịch sử runtime của mọi harness |
| Agent harness | Cung cấp phiên chạy, model access, tools, quản lý context và cơ chế quyền thực thi | Không là nơi duy nhất giữ tri thức cần để tiếp tục Staff |

Đường dẫn theo layout Ship, resolve từ root OS Intelligence:

- Factory hiện hành: `11-factory/`.
- Nơi tạo Staff: `../OS Staff/<staff-id>`.
- Mỗi Staff nằm trong một thư mục/repo riêng dưới `OS Staff`; không phải một subagent prompt trong Factory.

Không hard-code đường dẫn máy vào Staff hoặc skill portable.

## 2. Nguyên tắc đã chốt

1. **Harness-agnostic:** nội dung cốt lõi không phụ thuộc memory engine, slash command, hook, scheduler hoặc database của một sản phẩm.
2. **Markdown-first:** role, instructions, knowledge, skills, memory và checkpoint công việc là file có thể đọc và chỉnh sửa trực tiếp.
3. **Không ép mọi thứ thành Markdown:** footage, ảnh, project dựng, scripts nghiệp vụ và output được dùng đúng định dạng; Markdown giữ mô tả và đường dẫn tham chiếu.
4. **Một nguồn nội dung chính:** không sao chép cùng bộ quy tắc thành nhiều bản cho từng harness.
5. **Progressive disclosure:** agent đọc context theo nhu cầu; người dùng nhận thông tin theo quyết định cần đưa ra.
6. **Evidence-first:** phân biệt điều đã quan sát, người dùng đã xác nhận và agent đang suy luận.
7. **Learning có chọn lọc:** không phải mỗi task đều phải sinh memory hoặc skill mới.
8. **Có thể sửa sai:** bài học có nguồn, phạm vi và cách thay thế hoặc thu hồi.
9. **Con người giữ quyền quyết định:** không tự mở rộng quyền, không coi memory là giấy phép thực hiện hành động.
10. **Đơn giản trước:** dùng quy trình bằng ngôn ngữ tự nhiên và file; chỉ thêm cơ chế khi trải nghiệm chứng minh nhu cầu.

Portable nghĩa là giữ được tri thức và trạng thái đã lưu khi đổi harness. Không có nghĩa mọi model, harness và bộ tool đều tạo ra chất lượng giống nhau.

## 3. Hành trình phát triển và quyết định phiên bản

### 3.1. Điểm xuất phát

Người dùng muốn xây các nhân viên AI chuyên môn hóa, mỗi nhân viên có repo riêng, dùng Markdown và wikilink thay vì tự xây harness. Hermes Agent và OpenClaw được nghiên cứu để học cách tổ chức memory, logs và learning loop.

Phiên thiết kế này chủ động không sử dụng memory cũ hoặc nội dung repo cũ làm đầu vào cho tính cách và sở thích của Staff.

### 3.2. Điều chỉnh kiến trúc quan trọng

Một đề xuất ban đầu đã nghiêng sang dùng OpenClaw làm runtime thử nghiệm. Người dùng làm rõ: **không sử dụng OpenClaw hay Hermes Agent làm nền tảng bắt buộc**; repo phải dùng được với các harness khác nhau, hiện tại là Oh My Pi.

Quyết định sau điều chỉnh:

- Giữ các nguyên tắc tốt học từ hai dự án.
- Bỏ các dependency vào profile, Dreaming, Workshop, `/refine` hoặc background service của chúng.
- Đặt tri thức bền vững và trạng thái bàn giao vào repo.
- Harness-specific integration chỉ là tiện ích tùy chọn, không phải điều kiện để Staff tồn tại.

### 3.3. V0.1 — Bộ khung nhân viên và khả năng bàn giao

V0.1 đưa ra:

- Role và phạm vi trách nhiệm.
- Hồ sơ cộng tác với người dùng.
- Memory chọn lọc, knowledge graph và procedural skills.
- Job files giữ brief, quyết định, tiến độ và bước tiếp theo.
- Hướng dẫn đọc context và giao tiếp theo progressive disclosure.

Giới hạn được nhận ra:

- Có chỗ lưu chưa đồng nghĩa có learning loop đáng tin cậy.
- Ghi thêm memory chưa chứng minh đã học đúng.
- Sửa skill chưa chứng minh chất lượng được cải thiện.
- Thiếu bước kiểm chứng, dùng lại và thu hồi bài học sai.

### 3.4. V0.2 — Vòng học có bằng chứng và checkpoint Git

V0.2 bổ sung vào V0.1:

- Trigger học rõ ràng trong quá trình làm việc.
- Phân biệt ghi nhận, bài học đề xuất và tri thức đã được chấp nhận.
- Chọn nơi lưu theo loại bài học.
- Kiểm chứng phù hợp với preference, procedure, creative judgment hoặc kiến thức bên ngoài.
- Truy xuất, dùng lại và đánh giá hiệu quả của bài học.
- Xử lý phạm vi, mâu thuẫn, hết hạn và thu hồi memory.
- `LEARNING.md` để giữ quy trình học ngoài entrypoint ngắn.
- Agent chủ động nhận ra mốc đáng commit và soạn đề xuất commit cho người dùng duyệt.
- Chưa cần hook; hướng dẫn trong repo là cơ chế nền tảng.

### 3.5. V0.2.1 — Tương thích OS Projects V0.1

V0.2.1 là compatibility patch trên V0.2, không phải triển khai các ý tưởng V0.3 đã hoãn. Bản này bổ sung:

- Phân biệt training session và project session.
- Project binding trong Staff job: Project ID, repo locator và workstream locator.
- Project Context Gate bắt buộc trước khi làm hoặc resume project-bound job.
- Project là shared source of truth; Staff giữ assignment/checkpoint riêng.
- Routing brand facts, feedback và approvals về đúng Project thay vì global Staff memory.
- Một brand cho mỗi project session; đổi brand mở session mới.
- An toàn khi một Staff có nhiều session và khi một mốc thay đổi cả Staff/Project repo.
- Acceptance scenarios cho Staff–Project integration.

Starter tree, role model, learning loop có evidence và nguyên tắc Git approval của V0.2 được giữ nguyên. Patch version được dùng cho thay đổi tương thích không thay đổi định hướng V0.2 và không nhập scope V0.3.

### 3.6. V0.3 — Đã thảo luận, chưa chấp nhận triển khai

Các ý tưởng từng được đề xuất:

- Thư viện case đối chiếu để hiểu gu qua ví dụ đã được người dùng đánh giá.
- Hiệu chỉnh mức độ người dùng tham gia vào từng loại quyết định.
- Nhận diện sâu hơn trạng thái khám phá ý tưởng, thử nghiệm và quyết định sáng tạo.

Người dùng từng quyết định **dừng ở V0.2 để trải nghiệm trước**. V0.2.1 chỉ thêm compatibility với Projects; các ý tưởng creative-learning trên vẫn là lịch sử thảo luận, không phải yêu cầu của V0.2.1 và không được tự động thêm khi tạo Staff.

### 3.7. Xác nhận vai trò repo hiện tại

Người dùng đổi tên và chuyển thư mục làm việc cũ thành `AI OS ECOSYSTEM FACTORY`. File spec được lưu trong repo factory, không đặt trực tiếp ở thư mục chứa các Staff và không coi factory là một Video Editor riêng lẻ.

### 3.8. V0.2.2 — Sửa thiếu sót starter và routing

Feedback từ một Staff instance cho thấy `journal/` và `knowledge/` có thể bị bỏ khi chưa có dữ liệu. V0.2.2 quy định hai folder này phải có `README.md` hướng dẫn và được entrypoint/learning router tham chiếu. README không phải bài học hoặc tri thức giả.

Rà soát đồng thời bổ sung kiểm tra locator xuyên repo theo root được khai báo, và làm rõ skill dùng cho training không được ép nạp Project. Core learning, vai trò, quyền Git và việc hoãn V0.3 không đổi. Instance đã có chỉ được sửa theo phạm vi được người dùng giao; không auto-migrate mọi Staff.

### 3.9. V0.2.3 — Tương thích OS Intelligence V0.1

V0.2.3 là compatibility patch trên V0.2.2:

- Spec chuyển về OS Intelligence `11-factory/specs/`; Staff metadata/locator phải trỏ nguồn chính mới.
- Context cộng tác chung nằm ở Intelligence `USER.md`; Staff `USER.md` chỉ giữ bổ sung hoặc override đúng vai trò/scope và dẫn nguồn chung, không copy toàn bộ profile.
- Assignment có thể đến từ Chief of Staff qua Orca. Runtime Run/Task/Dispatch không thay role, Project Context Gate, quyền hoặc durable checkpoint của Staff.
- Phương pháp đã kiểm chứng dùng giữa nhiều Staff/Project được đề xuất về Intelligence `08-playbook/`; không auto-publish.
- Staff làm trực tiếp với người dùng vẫn hợp lệ. Intelligence là cửa điều phối thuận tiện, không là dependency bắt buộc cho mọi training/project session.

Core role, learning evidence, Git approval, `journal/knowledge` starter, một brand mỗi project session và việc hoãn V0.3 không đổi.

### 3.10. V0.2.4 — Session JSONL/resume locator

Mọi `AGENTS.md` của Staff mới và Staff được nâng cấp phải hiển thị `Session hiện tại` trong câu trả lời đầu tiên: transcript JSONL path và exact resume command từ runtime/index, chỉ một lần. Nếu cùng câu trả lời có `Markdown đã cập nhật`, locator đứng ngay trước báo cáo đó; nếu không, nó là phần cuối.

Trên Orca + OMP, dùng một cụm phân biệt từ prompt đầu tiên, giới hạn `agent=omp` và `cwd` là root Staff trong `orca search ... --fresh --json`, rồi lấy nguyên `source.filePath` và `resumeCommand`. Không suy từ Session ID/file mới nhất; metadata không có thì ghi `không khả dụng`. Transcript, runtime IDs, indexes và caches ở ngoài repo; job/Project checkpoint vẫn là durable source of truth.

Output dùng `source.filePath` làm JSONL locator và paste `resumeCommand` nguyên văn trong một fenced block `bash`; không dựng lại command từ path hoặc đổi separator/ký tự.

## 4. Học từ Hermes Agent và OpenClaw, không phụ thuộc chúng

| Nguyên tắc tham khảo | Áp dụng trong V0.2/V0.2.1 |
| --- | --- |
| Hermes phân biệt memory ngắn và procedural skills | Facts/preferences không trộn với hướng dẫn thực hiện nhiều bước |
| Hermes có trigger review và khả năng duyệt thay đổi | Có trigger trong session; bài học đề xuất không tự được coi là quy tắc đã kiểm chứng |
| OpenClaw tách ghi nhận ngắn hạn và durable memory | Journal là evidence; durable layer được chọn lọc |
| OpenClaw chú trọng provenance và supersession | Giữ nguồn, phạm vi, trạng thái thay thế/thu hồi |
| Skill changes có lịch sử và khả năng quay lại | Dùng job/journal để giải thích và Git checkpoints để lưu phiên bản |
| Skills được load theo nhu cầu | Index/mô tả trước, nội dung skill sau, reference sâu khi cần |

Không tái tạo background review engine, hệ thống chấm điểm promotion, vector database hoặc wiki compiler chỉ để bắt chước hai dự án.

## 5. Cấu trúc starter cho một Staff

Starter phải có các entrypoint và hai folder nền `knowledge/`, `journal/` ngay khi khởi tạo. Khi chưa có dữ liệu, mỗi folder giữ `README.md` giải thích mục đích, lúc đọc/ghi, nguồn và scope; không tạo bài học giả. Job, skill, reference và taxonomy con chỉ tạo khi có nhu cầu thực.

```text
<staff-name>/
├── AGENTS.md
├── ROLE.md
├── USER.md
├── MEMORY.md
├── WORK.md
├── LEARNING.md
├── jobs/
├── knowledge/
│   └── README.md
├── skills/
│   └── <skill-name>/
│       ├── SKILL.md
│       └── references/
└── journal/
    └── README.md
```

| File hoặc thư mục | Nội dung | Khi đọc |
| --- | --- | --- |
| `AGENTS.md` | Entry point, routing, nguyên tắc điều hành, trigger học và Git checkpoints | Khi bắt đầu session |
| `ROLE.md` | Vai trò, outcome, phạm vi, tiêu chuẩn đầu ra và ranh giới trách nhiệm | Khi bắt đầu hoặc cần xác định phạm vi |
| `USER.md` | Preferences và cách cộng tác đã được xác nhận, có scope khi cần | Context ban đầu ngắn hoặc trước quyết định liên quan |
| `MEMORY.md` | Facts, quyết định và bài học bền vững được chọn lọc; không lặp USER/skill | Chọn lọc theo công việc |
| `WORK.md` | Mục lục công việc đang mở, link tới từng job | Khi nhận hoặc tiếp tục công việc |
| `LEARNING.md` | Trigger, phân loại, kiểm chứng, tiếp nhận và thu hồi bài học | Khi có learning trigger hoặc review dang dở |
| `jobs/` | Brief và trạng thái job độc lập; với project-bound job chỉ giữ assignment/checkpoint cùng Project/workstream locator | Chỉ job liên quan |
| `knowledge/` | Domain knowledge và reference có nguồn | Khi task/skill cần |
| `skills/` | Procedure tái sử dụng, bao gồm cách kiểm chứng output | Khi nhiệm vụ phù hợp |
| `journal/` | Sự kiện, feedback, evidence và bài học đề xuất | Khi ghi nhận hoặc truy xuất liên quan |

`knowledge/README.md` và `journal/README.md` là hướng dẫn nền bắt buộc, được `AGENTS.md` và `LEARNING.md` route khi liên quan; không preload toàn bộ hai folder. Chỉ thêm index chuyên đề/tầng phân loại khi có nội dung thật.

### 5.1. Bootstrap và khả năng đổi harness

- `AGENTS.md` là entrypoint chung được ưu tiên.
- Nếu harness không tự nạp file này, dùng cơ chế instruction được hỗ trợ hoặc chỉ dẫn khởi động để đọc nó.
- Entry point phụ, nếu cần, chỉ tham chiếu nguồn chính; không giữ một bản quy tắc thứ hai.
- Không giả định `USER.md`, `MEMORY.md` hay `ROLE.md` tự được inject chỉ vì tên file. `AGENTS.md` phải chỉ rõ lúc nào cần đọc.
- `skills/` là kho nội dung chung. Native discovery là tùy chọn và phụ thuộc harness/version; không tuyên bố mọi harness tự scan đường dẫn này.
- `SKILL.md` ưu tiên chuẩn Agent Skills với `name`, `description` và nội dung Markdown; tránh extension riêng của harness trong phần cốt lõi.
- Harness có thể đọc skill như file bình thường nếu không có native skill loader.
- Tool/API/MCP nghiệp vụ vẫn cần có trong môi trường. Markdown không thay thế tool còn thiếu.

Mọi `AGENTS.md` được Factory tạo hoặc nâng cấp phải mang contract session locator của V0.2.4. Contract này độc lập với job checkpoint và không biến runtime transcript thành dữ liệu repo.

### 5.2. Ranh giới dữ liệu

Trong repo giữ phần cần để bàn giao nhân viên. Không commit mặc định:

- Credentials, API keys, cookies, OAuth tokens và nội dung nhạy cảm không cần lưu.
- Session databases, raw transcripts, search indexes, caches và runtime logs của harness.
- Render cache, proxy media hoặc file lớn không có chiến lược lưu trữ phù hợp.

Job/journal có thể tham chiếu media hoặc output bên ngoài repo. Nếu muốn bàn giao hoặc khôi phục các tài sản đó, cần bảo đảm nơi lưu riêng còn truy cập được; Git của repo không tự bảo vệ chúng.

Với project-bound job, brand context, shared brief, deliverables và approvals thuộc Project repo. Staff repo chỉ giữ phần cần để tiếp tục assignment của Staff và link/locator tới nguồn Project.

Memory tự động riêng của harness không được là bản duy nhất chứa điều cần cho Staff. Việc cô lập context toàn cục vẫn phụ thuộc cấu hình runtime; repo không thể xóa các instruction đã được harness nạp.

## 6. Quy ước wikilink và progressive disclosure

### 6.1. Wikilink là điều hướng, không phải auto-loader

- Một node là một file Markdown có mục đích rõ ràng.
- Dùng đường dẫn không mơ hồ: ví dụ `[[knowledge/captions]]` trỏ tới `knowledge/captions.md` từ root repo Staff.
- Có thể dùng heading để trỏ tới phần cụ thể, ví dụ `[[jobs/product-demo#feedback]]`.
- Link nên kèm lý do và thời điểm đọc: ví dụ “Trước khi thiết kế phụ đề, đọc `[[knowledge/captions]]` để kiểm tra khả năng đọc trên điện thoại”.
- Không crawl toàn bộ graph hoặc đọc mọi backlink theo mặc định.
- Khi link thiếu hoặc mơ hồ, kiểm tra file thực tế; không tự bịa nội dung node.
- Khi đổi tên node, cập nhật các liên kết bị ảnh hưởng.
- Các wikilink minh họa trong spec này là ví dụ cho repo Staff tương lai, không tuyên bố các file đó đã tồn tại trong factory.
- Với locator xuyên repo, khai báo gốc resolve: `Project repo` từ root Staff; `Workstream` từ root Project; backlink `Staff checkpoint` từ root Project. Không resolve theo folder chứa job/workstream hoặc cwd ngẫu nhiên.
- Khi kiểm chứng, mở đích thật của cả wikilink (kể cả heading) và locator dạng plain text/inline code, theo cả hai chiều Staff → Project → Staff. Link trỏ file thật nhưng sai Project ID/assignment vẫn là lỗi.

### 6.2. Agent đọc context theo từng lớp

1. Entry point và context nền ngắn.
2. Job hiện tại cùng yêu cầu và quyết định liên quan.
3. Skill phù hợp.
4. Knowledge/reference cần cho bước đang thực hiện.
5. Journal hoặc memory cũ khi cần bằng chứng, recall hoặc xử lý uncertainty.

Không dùng “đọc mọi thứ để chắc chắn” làm chiến lược mặc định.

### 6.3. Agent giao tiếp theo từng lớp

- Kết luận hoặc trạng thái trước.
- Chỉ đưa những lựa chọn cần người dùng tham gia, kèm đề xuất có lý do.
- Chi tiết triển khai và bằng chứng mở thêm khi cần; không kể mọi tool call.
- Chi phí, blocker, rủi ro không đảo ngược, external actions và approval phải xuất hiện đúng lúc, không bị giấu trong phần chi tiết.
- Progressive disclosure không đồng nghĩa cắt ngắn đến mức thiếu thông tin ra quyết định.

## 7. Công việc và khả năng bàn giao

Mỗi job là đơn vị có thể tiếp tục từ một session khác. Job file cần giữ đủ thông tin, nhưng mở rộng dần thay vì bắt điền mọi mục ngay lúc bắt đầu.

Nội dung cần có khi tương ứng đã phát sinh:

- Mục tiêu và tiêu chí hoàn thành.
- Input, output và các link liên quan.
- Trạng thái đã thực sự xác minh, kèm đường dẫn bằng chứng.
- Quyết định đã được người dùng duyệt, tách khỏi đề xuất chưa duyệt.
- Blocker hoặc điều còn chưa chắc chắn.
- Bước tiếp theo cụ thể.
- Kết quả và bài học nếu có.

Checkpoint tại mốc có ý nghĩa, không chỉ trước khi kết thúc session. Phiên bị ngắt có thể không cho agent cơ hội ghi lần cuối.

Khi tiếp tục, đọc checkpoint rồi đối chiếu trạng thái hiện tại trước khi thực hiện hành động có tác động. Không chạy lại một hành động bên ngoài chỉ vì lịch sử kết quả chưa rõ.

### 7.1. Session mode và Project binding

Mỗi session xác định một mode:

- **Training session:** phát triển nghiệp vụ, skill hoặc generic knowledge; không có active Project mặc định.
- **Project session:** làm việc cho đúng một active brand/Project. Khi đổi brand, người dùng đóng session cũ và mở session mới trong cùng Staff repo.

Skill có thể dùng trong cả hai mode nếu phù hợp mục tiêu. Project Context Gate chỉ áp dụng cho project-bound task; training không tự chọn brand, đọc Project hoặc ghi vào Project. Ví dụ luyện tập phải tách khỏi brand facts/production output.

Project-bound job phải giữ:

- Stable Project ID.
- Project repo locator.
- Workstream locator.
- Assignment và acceptance criteria riêng của Staff.
- Trạng thái phần việc đã thực sự kiểm chứng.
- Bước tiếp theo và blocker của Staff.

Không dùng “Project gần nhất” làm mặc định cho job mới. Không sao chép toàn bộ shared brief hoặc brand context vào Staff job.

### 7.2. Project Context Gate

Khi bắt đầu hoặc resume project-bound job, Staff phải:

1. Lấy Project ID, repo locator và workstream locator từ yêu cầu hoặc checkpoint.
2. Xác nhận repo tồn tại và `PROJECT.md` có đúng Project ID.
3. Đọc Project `AGENTS.md` và `PROJECT.md`.
4. Đọc mandatory base do Project router chỉ định.
5. Đọc `WORKSTREAM.md` hiện tại.
6. Đọc conditional nodes phù hợp với assignment.
7. Chỉ sau đó mới báo một dòng và bắt đầu làm:

```text
Context active: <project> · <workstream>
```

Không lặp confirmation ở mọi turn. Nếu Project chưa rõ, locator sai, mandatory context thiếu hoặc harness không có quyền đọc/ghi cần thiết, Staff phải dừng và làm rõ; không làm từ memory cũ.

### 7.3. Ranh giới trạng thái và learning

| Nội dung | Nguồn chính |
| --- | --- |
| Shared brief, trạng thái tổng, deliverables, brand decisions và approvals | Project workstream |
| Assignment, verified checkpoint và next step riêng của Staff | Staff job |
| Brand facts, voice, visual judgment và feedback bền vững | Project brand nodes sau approval phù hợp |
| Generic procedure/năng lực dùng lại của Staff | Staff skill/knowledge/learning loop |
| Preference cộng tác đã được xác nhận và đúng scope | `USER.md` |

Public voice của một Project không mặc định là preference cộng tác toàn cục. Feedback của brand A không được promote vào `MEMORY.md`, `USER.md` hay skill dùng chung rồi áp dụng cho brand B nếu chưa phân loại đúng scope.

### 7.4. Nhiều session

Một Staff có thể có training session và nhiều project session đồng thời. Không thêm lock system trong V0.2.3.

- Mỗi session dùng job/checkpoint riêng.
- Trước khi sửa hoặc commit shared Staff files như `skills/`, `MEMORY.md`, `USER.md` hoặc `WORK.md`, đọc lại trạng thái hiện hành.
- Không ghi đè thay đổi mới của session khác.
- Nếu có thay đổi cạnh tranh hoặc merge conflict, dừng và hợp nhất có chủ đích; không chọn một bản tùy ý.

## 8. Memory và learning loop V0.2.3

V0.2.3 giữ vòng học có evidence và Project routing của V0.2.2; chỉ thêm shared-context/Playbook routing qua Intelligence, không tự đồng bộ memory giữa các repo.

### 8.1. Các lớp trí nhớ

| Loại | Nơi chính | Không nên biến thành |
| --- | --- | --- |
| Working state | Job file | Preference toàn cục |
| Episodic evidence | Journal và feedback trong job | Quy tắc chỉ vì được ghi lại |
| User preferences | `USER.md` | Sự thật chuyên môn hoặc quyền thực thi |
| Durable facts/decisions | `MEMORY.md` hoặc knowledge node | Raw transcript dài |
| Procedural memory | Skill | Nhật ký sự cố và mọi chi tiết của một task |
| Brand-specific facts, feedback và creative judgment | Project workstream hoặc brand node | `USER.md`, global `MEMORY.md` hoặc generic skill |

### 8.2. Trigger học

- Người dùng sửa cách làm hoặc yêu cầu ghi nhớ.
- Một trở ngại được giải quyết bằng cách đã thực sự hoạt động.
- Hoàn thành một mốc quan trọng hoặc một job.
- Bắt đầu session tiếp tục có bài học đề xuất hoặc review dang dở liên quan.

Agent cần ghi nhận kịp thời nhưng không phải review sâu sau mọi tin nhắn. Review được phép kết luận “không có gì đáng lưu”.

### 8.3. Vòng học

1. **Ghi nhận:** lưu sự kiện/feedback và nguồn tại job hoặc journal.
2. **Phân loại:** đây là tình huống riêng, Project-specific context, preference, durable fact hay procedure?
3. **Đề xuất:** ghi bài học, phạm vi áp dụng và thay đổi dự kiến.
4. **Kiểm chứng:** dùng cách kiểm tra phù hợp với loại bài học.
5. **Tiếp nhận:** cập nhật đúng nơi; không giữ nhiều bản quy tắc trùng nhau.
6. **Truy xuất và dùng lại:** áp dụng khi task mới đúng phạm vi.
7. **Đánh giá:** giữ nếu hữu ích; sửa, thu hẹp hoặc thu hồi nếu sai.

Đây là quy trình hành vi bằng Markdown, không yêu cầu xây một state machine hay background service.

### 8.4. Evidence và điều kiện tiếp nhận

| Loại bài học | Bằng chứng phù hợp |
| --- | --- |
| Preference | Chỉ dẫn rõ của người dùng; không bắt lặp lại nếu đã xác nhận |
| Procedure kỹ thuật | Thực thi thành công và kiểm tra output, không chỉ exit code |
| Creative judgment | Brief, reference và feedback; agent tự chấm đẹp chưa đủ |
| Kiến thức bên ngoài | Nguồn đáng tin, thời điểm và phạm vi; lặp lại nhiều không chứng minh đúng |

Một bài học đề xuất chỉ cần vài dòng: nội dung, nguồn, phạm vi, thay đổi dự kiến và trạng thái kiểm chứng. Không bắt mọi entry dùng metadata nặng hoặc điểm confidence giả chính xác.

Không promote:

- Suy đoán chưa kiểm chứng hoặc failure chưa giải quyết.
- Workaround tạm thời thành best practice toàn cục.
- Preference của một job thành sở thích cho mọi tình huống.
- Nội dung tool/web không đáng tin thành instruction có thẩm quyền.
- Quyền đăng bài, chi tiền hoặc thao tác hệ thống từ một câu memory.

Những thay đổi về role, quyền hoặc preference chưa rõ không được tự xác nhận thay người dùng. Approval tiếp nhận bài học và approval commit Git là hai quyết định khác nhau.

### 8.5. Kiểm tra cải thiện và khả năng gây hại

Khi sửa một skill, kiểm tra:

- Có xử lý được vấn đề đã gặp không?
- Có làm hỏng trường hợp trước đây vẫn đúng không?
- Có thêm chi phí hoặc thao tác không cần thiết cho task ngoài phạm vi không?

Có thể dùng case thực đã hoàn thành để đối chiếu. Không cần evaluation framework ngay, nhưng phải nói rõ phần chưa được kiểm chứng.

### 8.6. Mâu thuẫn, hết hạn và thu hồi

- Kiểm tra scope trước: nhịp dựng cho clip giải trí và clip chuyên môn có thể khác nhau mà không mâu thuẫn.
- Nếu cùng scope, xem nguồn, thời điểm và quyền quyết định; không dùng “mới hơn” làm luật duy nhất.
- Entry đã thay thế phải bị loại khỏi tập chỉ dẫn đang có hiệu lực; lịch sử có thể giữ tại journal/Git.
- Điều kiện tạm thời ghi expiry hoặc điều kiện kết thúc khi đã biết.
- Kiến thức phụ thuộc tool/version cần được kiểm tra lại khi gặp dấu hiệu lỗi thời.
- Người dùng sửa hoặc yêu cầu quên thì cập nhật nguồn liên quan; không chỉ thêm một entry trái ngược mới.

### 8.7. Ví dụ Video Editor

| Tình huống | Xử lý |
| --- | --- |
| “Riêng clip này đừng dùng nhạc” | Ghi vào job, không thành global preference |
| “Từ nay video phân tích chuyên môn của tôi không dùng nhạc nền” | Preference đã xác nhận, scope video phân tích chuyên môn |
| Caption che nội dung demo | Ghi feedback; đề xuất bước kiểm tra vùng caption; kiểm chứng trước khi đưa vào skill |
| Chuỗi filter đã sửa được lỗi và output đạt yêu cầu | Có thể cập nhật procedure đúng phạm vi |
| Render lỗi nhưng chưa biết nguyên nhân | Giữ evidence, chưa gọi đó là bài học |
| Campaign dùng monochrome tới khi kết thúc | Constraint của job/campaign, không là gu lâu dài |

## 9. Git checkpoints chủ động

### 9.1. Mục đích

Người dùng không phải nhớ khi nào nên commit hoặc tự nghĩ commit message. Agent chủ động nhận ra mốc đáng lưu, kiểm tra thay đổi, giải thích và đề xuất nội dung commit.

**Mặc định: đề xuất trước, người dùng duyệt mới commit. Không tự push.**

### 9.2. Git lưu được gì?

- `git status` cho biết file thay đổi, staged và untracked.
- `git diff` xem thay đổi tracked chưa stage so với staging area.
- `git diff --cached` xem staged changes so với commit hiện tại.
- Khi repo đã có `HEAD`, `git diff HEAD` xem tổng thay đổi tracked so với commit gần nhất.
- File untracked cần đọc trực tiếp; không tự có trong các diff trên.
- `git log` và `git show` tra lịch sử đã commit.
- Repo chưa có commit đầu tiên không có `HEAD`; không dùng các lệnh đòi hỏi `HEAD` như thể nó tồn tại.

Git không tự lưu mỗi lần sửa. Nếu sửa A thành B rồi C mà không commit mốc B, Git không tự tạo phiên bản B có thể khôi phục. Stage cũng không phải lịch sử phiên bản bền vững. Commit là cục bộ; không cần push mới xem lại được.

### 9.3. Thời điểm đề xuất

- Hoàn thành một phần việc có ý nghĩa và đã kiểm chứng.
- Tiếp nhận bài học đã xác nhận vào skill/memory.
- Người dùng thay đổi preference hoặc quyết định quan trọng.
- Trước một đợt sửa lớn/thử nghiệm, khi trạng thái hiện tại đáng giữ.
- Bàn giao, đổi harness hoặc kết thúc phiên, nếu có thay đổi đáng lưu.

Không nhắc theo số phút, số file hoặc mỗi lần trả lời. Gom thay đổi cùng mục đích; không nhắc lại đề xuất bị hoãn nếu chưa có thay đổi đáng kể. Khi cần bàn giao, lưu việc hoãn trong job để session sau có context.

Nếu lưu checkpoint dở dang, nói rõ là dở dang và phần chưa kiểm chứng; không mô tả nó như trạng thái hoàn thành.

### 9.4. Nội dung đề xuất

Một đề xuất ngắn cần có:

- Vì sao đây là mốc đáng lưu.
- Phạm vi file/thay đổi dự kiến.
- Commit message rõ nghĩa.
- Bằng chứng đã kiểm tra và giới hạn còn lại nếu có.
- Lựa chọn duyệt commit hoặc để gom với phần tiếp theo.

Ví dụ minh họa, không phải commit đã được thực hiện:

```text
Đây là một mốc nên lưu bằng Git.
Đã bổ sung và kiểm chứng bước kiểm tra caption che nội dung demo.

Commit đề xuất:
fix(video): kiểm tra caption che nội dung trước khi render

Phạm vi: skill dựng video và bài học liên quan.
Bạn muốn commit mốc này hay để gom với phần tiếp theo?
```

Commit message:

- Tiêu đề nói thay đổi chính, tìm kiếm được; không dùng “update” hoặc “save stuff”.
- Body khi cần giải thích lý do, job/feedback nguồn và cách kiểm chứng.
- Không ghi “đã kiểm chứng” khi mới chỉ sửa tài liệu.
- Không đưa secrets hoặc chi tiết nhạy cảm không cần thiết vào message.
- Prefix kiểu `fix(video):` là ví dụ, không bắt buộc áp dụng một convention ngoài quy ước repo.

### 9.5. Quy trình an toàn

1. Kiểm tra trạng thái Git, diff và file mới có liên quan.
2. Phân biệt phần việc hiện tại với thay đổi của người dùng hoặc tác nhân khác.
3. Đề xuất phạm vi và message.
4. Chờ người dùng duyệt; nếu phạm vi thay đổi đáng kể sau đó, trình bày lại.
5. Stage đúng phần được duyệt; không mặc định `git add .`.
6. Commit rồi xác nhận kết quả thực tế, gồm hash và message.
7. Không tự push, amend, reset hoặc rewrite history ngoài sự cho phép tương ứng.

Nếu folder chưa có Git hoặc thiếu identity để commit, báo điều kiện thiếu. Không tự khởi tạo repo, thêm remote hoặc thay identity chỉ vì tới mốc đề xuất.

Job/journal giải thích “đã xảy ra gì và vì sao”; Git lưu “nội dung thay đổi thế nào giữa các mốc”. Git chỉ khôi phục nội dung được theo dõi trong commit, không hoàn tác bài đăng, email, thanh toán hoặc trạng thái dịch vụ bên ngoài.

### 9.6. Checkpoint khi thay đổi Staff và Project repo

Git không tạo một commit atomic phủ hai repo. Khi một mốc thay đổi cả Project và Staff:

1. Kiểm tra state/diff của từng repo độc lập.
2. Trình một đề xuất gồm hai commit riêng; mỗi proposal có repo, lý do, scope, message và verification.
3. Người dùng có thể duyệt cả hai, một repo hoặc hoãn.
4. Nếu duyệt cả hai, commit Project trước.
5. Staff checkpoint commit có thể tham chiếu Project commit hash.
6. Không tạo Project commit thứ ba chỉ để backlink Staff hash.

Approval, staging và recovery độc lập cho từng repo. Không mô tả hai commit là atomic; khôi phục một repo không tự khôi phục repo còn lại. Các quy tắc không tự push/init/amend/reset/rewrite và không mặc định `git add .` vẫn áp dụng cho cả hai.

## 10. Quyết định về hooks và automation

**V0.2.3 không yêu cầu hook.** `AGENTS.md` giữ trigger ngắn cho learning, Project Context Gate và Git checkpoints; agent thực hiện đánh giá trong session.

Lý do:

- Giữ khả năng đổi harness.
- Mốc đáng commit phụ thuộc ngữ cảnh và kết quả, không chỉ sự kiện kết thúc turn.
- Tránh nhắc commit liên tục khi công việc chưa hoàn thành hoặc thay đổi không thuộc task.

Giới hạn:

- Prompt không bảo đảm agent luôn nhớ hoặc luôn làm đúng.
- Repo không tự học khi không có session đang chạy.
- Không bảo đảm ghi được checkpoint trước crash, tắt cưỡng bức hoặc mất điện.
- Markdown không cưỡng chế permission, sandbox hoặc approval như runtime.

Chỉ cân nhắc hook khi trải nghiệm cho thấy bỏ sót lặp lại hoặc có nhu cầu kiểm tra bắt buộc tại sự kiện harness hỗ trợ. Hook tương lai nên kích hoạt đánh giá, không tự stage/commit/push. Đây chưa phải phần triển khai của V0.2.4.

## 11. Tiêu chí trải nghiệm và kiểm chứng V0.2.4

Các mục dưới đây là acceptance scenarios cần chạy trên Staff thật, **không phải kết quả đã đạt**.

### 11.1. Tiếp tục công việc và đổi harness

- Một session làm tới mốc, lưu checkpoint.
- Session mới không mang transcript cũ vẫn xác định đúng role, job, quyết định đã duyệt, output và bước tiếp theo.
- Không hỏi lại điều đã có đủ bằng chứng trong repo.
- Lặp lại việc tiếp tục bằng một harness khác có tools/quyền cần thiết.
- Không cần database hoặc memory engine của Hermes/OpenClaw.

### 11.2. Learning và memory

- Ghi đúng correction, nguồn và scope.
- Kiểm chứng rồi cập nhật đúng nơi.
- Task tương tự ở session mới dùng được bài học và tránh lỗi đã sửa.
- Task ngoài scope không bị áp dụng quá mức.
- Khi người dùng đổi yêu cầu, entry cũ được sửa/thu hồi thay vì giữ hai luật trái nhau.
- Có thể truy nguồn để giải thích vì sao agent đang áp dụng bài học.

### 11.3. Git checkpoints

- Agent chủ động đề xuất ở mốc có ý nghĩa.
- Message và phạm vi phản ánh đúng diff; phân biệt file untracked và việc chưa kiểm chứng.
- Không commit khi chưa duyệt, không push ngoài yêu cầu.
- Không gom nhầm thay đổi ngoài phạm vi hoặc secrets.
- Hoãn một đề xuất không làm agent lặp nhắc ở mỗi turn.
- Sau commit được duyệt, người dùng tìm được đúng mốc qua message/hash.
- Việc thử khôi phục nên làm trên bản sao hoặc nhánh kiểm tra được cho phép, không dùng thao tác phá hủy lên công việc hiện tại.

### 11.4. Progressive disclosure và chất lượng

- Không preload toàn bộ journal/knowledge graph.
- Không bắt người dùng đọc toàn bộ quá trình nghiên cứu hoặc tool calls.
- Approval và rủi ro quan trọng vẫn được trình bày kịp thời.
- Quan sát mức lặp correction, chất lượng đầu ra và công làm lại; không dùng số file memory làm thước đo tiến bộ.

### 11.5. Staff–Project integration

- Project-bound job lưu đúng Project ID, repo locator và workstream locator.
- Gate đọc Project instructions, router, mandatory base, workstream và conditional nodes trước khi làm.
- Confirmation hiển thị đúng `Context active: <project> · <workstream>` khi bắt đầu/resume, không lặp ở mọi turn.
- Thiếu context, sai Project ID hoặc thiếu quyền khiến Staff dừng thay vì đoán.
- Shared state nằm ở Project; Staff job không trở thành bản brief thứ hai.
- Brand feedback không bị promote nhầm thành global Staff memory/preference.
- Đổi brand dùng session mới; training session không tự nạp Project.
- Nhiều session không ghi đè shared Staff files.
- Khi hai repo thay đổi, proposal/approval/commit/recovery được xử lý độc lập và Project commit trước nếu cả hai được duyệt.

### 11.6. Starter và routing

- `knowledge/README.md` và `journal/README.md` tồn tại, có hướng dẫn thực và được entrypoint/learning router liên kết.
- README nói đúng trạng thái chưa có entry; không bị tính là tri thức đã học hoặc evidence đã kiểm chứng.
- Từ job mở đúng Project/workstream rồi backlink quay lại đúng job; kiểm tra cả locator ngoài wikilink và heading đích.
- Training có thể đọc skill và tạo evidence trong Staff mà không yêu cầu Project Gate; project-bound task vẫn phải qua gate.

### 11.7. Session JSONL/resume locator

- Fresh Staff session trả `Session hiện tại` đúng một lần trong câu trả lời đầu tiên.
- JSONL path và resume command thuộc đúng agent/cwd; terminal mới tải lại đúng thread.
- Nếu câu trả lời đầu tiên cập nhật Markdown, locator đứng ngay trước `Markdown đã cập nhật`; metadata không có được báo `không khả dụng`.
- Transcript/runtime history không được copy hoặc commit vào Staff.


## 12. Cách factory dùng spec để tạo Staff

Khi có yêu cầu tạo một Staff cụ thể:

1. Xác định vai trò, outcome, phạm vi, công cụ cần có và tiêu chí hoàn thành.
2. Chọn tên và đường dẫn riêng dưới `OS Staff`; kiểm tra nội dung có sẵn trước khi ghi.
3. Tạo starter files có nội dung thực, gồm `knowledge/README.md`, `journal/README.md` và routing từ entrypoint/learning; không chỉ đổi tên một prompt chung.
4. Ghi Staff được tạo theo `OS Staff Starter Spec V0.2.4`, ví dụ trong metadata đầu `AGENTS.md`.
5. Chỉ đưa vào Staff `USER.md` bổ sung/override đã xác nhận đúng vai trò; route context chung tới Intelligence, không copy profile hoặc nhập memory cũ.
6. Tạo skill/knowledge ban đầu theo nhu cầu thực, không nhồi sẵn mọi kỹ năng.
7. Nối entrypoint/skill discovery vào harness đang sử dụng nếu cần, không tạo nhiều bản nội dung.
8. Nếu Staff sẽ làm với OS Projects, thêm Project binding/Context Gate vào entrypoint và chạy một project-bound scenario với [[11-factory/specs/os-projects-starter-spec]] V0.1.4.
9. Dùng một job thực để chạy các acceptance scenarios phù hợp; kiểm tra mọi link/heading và locator hai chiều theo root được khai báo, không chỉ tìm chuỗi wikilink.
10. Đề xuất checkpoint Git khi có mốc đáng lưu; không tự commit/push.

Tài liệu này cho phép dùng làm cơ sở thiết kế Staff, không phải lệnh tạo ngay mọi Staff hoặc khởi tạo Git cho các folder.

Staff được tạo từ một phiên bản không tự động nâng cấp khi factory sửa spec. Thay đổi spec sau này cần được xem xét trước khi áp dụng vào Staff đang có công việc và memory riêng.

## 13. Những gì chưa thuộc V0.2.4

- Tự xây agent harness hoặc orchestration framework.
- Bắt buộc Hermes Agent, OpenClaw hoặc một model provider.
- Background learning luôn chạy, cron hoặc hooks bắt buộc.
- Vector database, graph database, wiki compiler hoặc công thức chấm điểm promotion riêng.
- Auto-commit, auto-push hoặc tự mở rộng quyền theo mức độ tin cậy.
- Chia sẻ và đồng bộ memory tự động giữa mọi Staff.
- Thư viện gu sáng tạo và cơ chế calibration nâng cao của đề xuất V0.3.

Nguyên tắc mở rộng: có vấn đề quan sát được, có thay đổi nhỏ giải quyết nó, có cách kiểm chứng, rồi mới nâng spec.

## 14. Duy trì lịch sử spec

- Phần hiện hành phải thể hiện rõ phiên bản đang áp dụng.
- Giữ lịch sử quyết định để biết vì sao một ý tưởng được chấp nhận, thay thế hoặc hoãn.
- Mỗi lần nâng phiên bản ghi: vấn đề từ trải nghiệm, thay đổi, điều không đổi, cách kiểm chứng và tác động lên Staff đã tạo.
- Không biến ý tưởng brainstorming thành yêu cầu đã chốt.
- Không nâng phiên bản chỉ vì có thêm ý tưởng; người dùng quyết định sau trải nghiệm.
- Đề xuất Git checkpoint cho mốc spec có ý nghĩa; commit history chỉ tồn tại khi commit thực sự được tạo.

## 15. Nguồn tham khảo và giới hạn bằng chứng

Nguồn dùng để học nguyên tắc, không phải dependency của spec:

- [Hermes Agent — Persistent Memory](https://hermes-agent.nousresearch.com/docs/user-guide/features/memory)
- [Hermes Agent — Skills](https://hermes-agent.nousresearch.com/docs/user-guide/features/skills)
- [OpenClaw — Memory](https://docs.openclaw.ai/concepts/memory)
- [OpenClaw — Dreaming](https://docs.openclaw.ai/concepts/dreaming)
- [OpenClaw — Skill Workshop](https://docs.openclaw.ai/tools/skill-workshop)
- [Agent Skills specification](https://agentskills.io/specification)
- [Codex — AGENTS.md](https://developers.openai.com/codex/guides/agents-md)
- [Claude Code — Project instructions and memory](https://code.claude.com/docs/en/memory)
- [Antigravity — Rules](https://antigravity.google/docs/rules/)
- [Oh My Pi — Configuration discovery](https://github.com/can1357/oh-my-pi/blob/main/docs/config-usage.md)

Tài liệu và source của các harness thay đổi theo phiên bản. Khi tích hợp phải kiểm tra bản đang dùng, không coi mô tả discovery hôm nay là cam kết vĩnh viễn.

Spec này là contract tạo Staff của Ship source V0.2.0. Mỗi Staff mới phải được kiểm tra bằng starter inventory, routing, fresh first-use, session JSONL/resume và Project Context Gate khi có Project; generalized learning reuse, concurrent shared edits và bàn giao đa harness là acceptance theo từng instance. V0.2.4 không triển khai creative-learning V0.3.
