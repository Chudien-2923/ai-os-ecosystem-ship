# OS Staff Starter Spec

- **Phiên bản hiện hành:** V0.2.16.
- **Trạng thái:** V0.2.16 thêm Skill `io-map` (§3.22): khung Input/Output kèm bản đồ Excalidraw cập nhật sau mỗi quyết định hoặc đổi bước, chỉ bật khi người dùng cho phép cho từng việc. V0.2.15 thay hộp `pending-rules` bằng sổ feedback `brand/feedback.md`: Staff ghi feedback brand ngay khi người dùng nói (mức `gợi ý`/`dứt khoát`), không qua duyệt; Team Lead của Project tổng hợp (§3.21, OS Projects V0.2.1). V0.2.14 thêm hook danh bạ hệ sinh thái `ecosystem-catalog` (§3.20) để mọi Staff biết Staff/Project/app Builder đang có. V0.2.13 bổ sung Browser Use (Skill/CLI + đường headless cô lập, §3.19) vào bộ nền Staff mới, bên cạnh Impeccable + Superpowers project-scoped (§3.18). Instance/evidence tại [[11-factory/registry]]. Không suy cài đặt là đã kiểm mọi nghiệp vụ/hook/đa harness.
- **Ngày ghi nhận:** theo lịch sử phiên bản tại §3.
- **Nơi duy trì:** OS Intelligence `11-factory/specs/os-staff-starter-spec.md`.
- **Mục đích:** Lưu quyết định thiết kế, hành trình phát triển spec và tiêu chuẩn để tạo các nhân viên AI độc lập.
- **Quyết định hiện tại:** V0.2.6–V0.2.8 giữ memory loop (§8.8); V0.2.9 thêm đóng gói procedure bằng `/learn` (§8.9), duyệt trước bật, cho dùng Skill chưa thực thi với giới hạn ghi rõ để cải tiến từ việc thật. V0.2.10 đưa bài học brand vào một file chung của Project để mọi Staff đọc cùng một bộ rule (§3.16); V0.2.15 đổi file đó thành sổ feedback ghi ngay, Team Lead của Project tổng hợp (§3.21). V0.2.11 bắt buộc `AGENTS.md` mỗi Staff có ranh giới không điều khiển máy tính/trình duyệt của người dùng, trình duyệt chỉ chạy ngầm qua `bu-headless` (§3.17). Không gọi model nền, không dùng memory backend OMP, không triển khai creative-learning V0.3.
- **Bộ nền từ V0.2.12:** mọi Staff tạo mới có Impeccable và Superpowers qua OMP plugin project scope; Staff đã tồn tại chỉ nâng khi người dùng yêu cầu. Không thay learning loop, Project Gate, role hoặc quyền.
- **Bổ sung từ V0.2.13:** mọi Staff tạo mới phải có Browser Use discover được, CLI và wrapper `bu-headless` khả dụng; dùng lại dependency global đã có, không cài trùng, không gắn Chrome cá nhân. Hai plugin ở §3.18 vẫn bắt buộc.
- **Bổ sung từ V0.2.14:** mọi Staff (mới và cũ đã nâng) có `.omp/hooks/pre/ecosystem-catalog.ts`, chèn danh bạ `11-factory/catalog.md` chỉ để biết; Gate và brand config không đổi.
- **Bổ sung từ V0.2.15:** feedback brand vào sổ `brand/feedback.md` của Project ngay khi nhận (§3.21); hook `learning-loop` v0.2.15; config `file` trỏ sổ mới.
- **Bổ sung từ V0.2.16:** mọi Staff (mới và cũ) có Skill `io-map` tại `skills/io-map/` (§3.22).

> Nhân viên tồn tại liên tục qua các file trong repo. Session là một lần nhân viên làm việc. Harness có thể thay đổi mà không làm mất phần tri thức và trạng thái đã được lưu đúng cách.

## 1. Tầm nhìn và phạm vi

Tạo các OS Staff có vai trò cụ thể như Video Editor, Graphic Designer hoặc Sales Funnel Builder. Mỗi Staff là một repo độc lập, có trách nhiệm, cách cộng tác, kiến thức, công việc và memory riêng.

Không xây một agent harness mới. Thiết kế môi trường để model và các harness có sẵn làm việc hiệu quả: Oh My Pi, Codex, Claude Code, Antigravity hoặc harness khác có khả năng phù hợp.

Tri thức và quy trình ưu tiên Markdown liên kết bằng wikilink. Agent càng làm việc càng có cơ hội hiểu người dùng hơn, tái sử dụng cách làm đã được kiểm chứng và sửa những điều đã học sai.

### Factory và Staff là hai loại repo khác nhau

| Thành phần | Trách nhiệm | Không chịu trách nhiệm |
| --- | --- | --- |
| Repo factory | Duy trì spec, lịch sử thiết kế và tạo Staff theo phiên bản được chọn | Không làm bộ nhớ cá nhân dùng chung mặc định cho mọi Staff |
| Repo của một Staff | Giữ vai trò, knowledge, skills, memory và trạng thái công việc của Staff đó | Không chứa toàn bộ cấu hình và lịch sử runtime của mọi harness |
| Agent harness | Cung cấp phiên chạy, model access, tools, quản lý context và cơ chế quyền thực thi | Không là nơi duy nhất giữ tri thức cần để tiếp tục Staff |

Root resolve theo sibling folders trong hệ sinh thái:

- Factory hiện hành: `OS Intelligence/11-factory`.
- `OS Staff` là local organizational container, không phải Git repository.
- Mỗi Staff nằm trong một thư mục **và standalone Git repository** riêng dưới `OS Staff`; branch, history, tag, remote, approval và recovery không dùng chung với Staff khác.
- Factory chạy Git từ root Staff đích; không init hoặc commit ở container `OS Staff`.
- Staff không phải một subagent prompt trong factory.

Các locator resolve từ root hệ sinh thái; không hard-code đường dẫn máy vào Skill portable.

## 2. Nguyên tắc đã chốt

1. **Harness-agnostic:** nội dung cốt lõi không phụ thuộc memory engine, slash command, hook, scheduler hoặc database của một sản phẩm. Từ V0.2.6, hook OMP `learning-loop` là adapter tự động hóa vòng học; dữ liệu vẫn là Markdown và `AGENTS.md` giữ cách làm thủ công cho harness khác.
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
- Chưa cần hook; hướng dẫn trong repo là cơ chế nền tảng. (V0.2.6 thay đổi riêng cho learning loop — §3.12.)

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

Spec thuộc Factory trong Intelligence, không đặt trực tiếp ở thư mục chứa các Staff và không coi Factory là một Staff chuyên môn riêng lẻ.

### 3.8. V0.2.2 — Sửa thiếu sót starter và routing

Feedback từ việc khởi tạo Staff cho thấy `journal/` và `knowledge/` bị bỏ khi chưa có dữ liệu. V0.2.2 quy định hai folder này phải có `README.md` hướng dẫn và được entrypoint/learning router tham chiếu. README không phải bài học hoặc tri thức giả.

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

V0.2.4 yêu cầu `AGENTS.md` của mọi Staff mới và Staff được nâng cấp hiển thị locator khôi phục ở câu trả lời đầu tiên của session:

- Mục `Session hiện tại` gồm đường dẫn transcript JSONL và câu lệnh resume chính xác do runtime/index trả về; chỉ hiển thị một lần.
- Nếu câu trả lời đầu tiên có `Markdown đã cập nhật`, đặt `Session hiện tại` ngay trước báo cáo đó; nếu không, đặt ở cuối câu trả lời.
- Trên Orca + OMP, tìm đúng session bằng một cụm phân biệt từ prompt đầu tiên, giới hạn `agent=omp` và `cwd` là root Staff, dùng `orca search ... --fresh --json`, rồi lấy nguyên `source.filePath` và `resumeCommand`.
- Output dùng `source.filePath` làm JSONL locator và paste `resumeCommand` nguyên văn trong một fenced block `bash`; không dựng lại command từ path hoặc đổi separator/ký tự.
- Không suy đường dẫn từ Session ID hoặc file mới nhất. Harness không cung cấp metadata thì ghi `không khả dụng`; không bịa command.
- JSONL, runtime ID, search index và cache vẫn là runtime data ngoài repo; Staff chỉ hiển thị locator cho người dùng, không commit transcript vào Staff.

### 3.11. V0.2.5 — Git init là bước bắt buộc của bootstrap

- **Vấn đề quan sát được:** §1 đã quy định mỗi Staff là standalone Git repository, nhưng quy trình §12 không có bước `git init` và câu cuối §12 dễ đọc thành "không khởi tạo Git". Kết hợp quy tắc "không tự init", Staff có thể bị tạo thành folder thường; approval Git bị hoãn vô thời hạn, Orca đăng ký dạng `folder`, không có history, rollback hoặc worktree/branch thật.
- **Thay đổi:** §12 thêm bước khởi tạo standalone Git repository và root commit local. Yêu cầu tạo Staff của người dùng được tính là approval cho riêng `git init` + root commit local tại root Staff; remote, push, tag và mọi commit sau vẫn cần approval riêng. Nếu người dùng nói rõ chưa dùng Git, registry ghi instance chưa hoàn chỉnh thay vì coi là trạng thái hợp lệ. Đăng ký Orca sau khi init để repo có kind `git`.
- **Không đổi:** role model, learning loop, Project Context Gate, session locator, quy tắc không push/không stage ngoài scope và checkpoint đề xuất cho các mốc sau bootstrap.
- **Kiểm chứng:** `git rev-parse --show-toplevel` tại root Staff trả đúng root đó; có root commit; working tree sạch sau commit; container `OS Staff` vẫn không phải repo.
- **Tác động lên Staff đã tạo:** Staff V0.2.4 không cần nâng contract; Staff nào thiếu Git chỉ cần bổ sung init + root commit theo bước mới.

### 3.12. V0.2.6 — Learning loop bằng hook OMP

- **Vấn đề quan sát được:** journal và MEMORY chỉ có hướng dẫn hoặc bài học đề xuất kẹt ở trạng thái chưa duyệt. Nạp, ghi, duyệt và tìm lại đều dựa vào agent tự giác (§10 cũ: không yêu cầu hook), nên Staff có thể bỏ quên journal/LEARNING/MEMORY.
- **Lựa chọn kiến trúc:** dùng code để ghi nhận và chèn bài học có chọn lọc. Không dùng memory backend có sẵn của OMP vì dữ liệu nằm ngoài repo/Git, không phân scope brand/chung, khó kiểm tra.
- **Thay đổi:** mỗi Staff có hook OMP `.omp/hooks/pre/learning-loop.ts` (bản gốc `11-factory/staff-runtime/learning-loop.ts`) và `.omp/learning-loop.json`. Vòng: hook ghi nguyên văn lời người dùng vào `journal/sessions/` (gitignored) → người dùng nói "chốt bài học" hoặc `/chot` → Staff đề xuất danh sách (bài học · scope · đích · nguồn) → chỉ dòng được đồng ý vào `MEMORY.md` (chung) hoặc `brand/staff-lessons/<staff-id>.md` của Project (brand) → hook tự chèn `MEMORY.md` đầu phiên, khi file đổi và sau compaction, chèn bài học brand khi tin nhắn nhắc từ khóa brand. Buổi chưa chốt im lặng ≥ 6 giờ được nhắc một lần; ≥ 7 ngày thì hết hạn. Hook không gọi model, không commit.
- **Chế độ làm việc:** chạy được cả khi người dùng làm việc trực tiếp với Staff lẫn khi Intelligence điều phối (Intelligence gửi lệnh chốt khi nghiệm thu).
- **Tác động lên Staff đã tạo:** nâng theo bước cài learning loop ở §12 khi được người dùng giao.

### 3.13. V0.2.7 — Bài học theo chủ đề, archive, quên và `/nap`

- **Vấn đề quan sát được:** người dùng: "nhiều lúc làm việc với staff nó sẽ không thuộc brand nào cả". V0.2.6 chỉ có `MEMORY.md` cho mọi bài học không thuộc brand, và file này được chèn vào mọi buổi; vượt 200 dòng thì hook cắt phần cuối (bài học mới nhất) mà không chuyển đi đâu.
- **Lựa chọn kiến trúc:** bài học theo chủ đề và archive giúp tránh chèn mọi bài học vào mọi buổi; không tự chuyển bài học bằng code + model chạy nền.
- **Thay đổi:** `memory/<slug>.md` giữ bài học chỉ đúng cho một loại việc (frontmatter `title`/`description`/`aliases`); hook chèn mục lục chủ đề cùng `MEMORY.md` và chèn file chủ đề khi tin nhắn khớp title/alias/slug. Scope chốt thêm `chủ đề <slug>`; `chung` thu hẹp thành "đúng ở mọi buổi". Lúc chốt, hook báo số dòng `MEMORY.md`/chủ đề trên 200; nếu ghi xong sẽ vượt, Staff đề xuất chuyển dòng sang chủ đề hoặc `memory/archive.md` trong cùng danh sách, người dùng đồng ý mới chuyển. Hook không chèn archive, không tự chuyển; file vẫn quá dài thì chỉ dặn Staff báo người dùng. Chỉ dẫn chốt nhắc Staff đề xuất commit sau khi ghi. **Quên:** người dùng bảo quên → Staff xóa dòng khớp và ghi mô tả ngắn vào `memory/forgotten.md`; lúc chốt hook đưa danh sách này vào chỉ dẫn để Staff không đề xuất lại (nói lại đúng ý đó thì phải hỏi xác nhận). **Xem đã nạp:** phần chèn ghi rõ lý do (từ khóa khớp, đầu phiên, chỉ dẫn chốt); lệnh `/nap` liệt kê theo giờ những gì hook đã chèn trong phiên kèm số dòng hiện tại; toàn bộ context xem bằng `/context` có sẵn của OMP.
- **Không đổi:** ghi log, nhắc buổi chưa chốt, bài học brand ở Project, không gọi model, không commit. Không thêm nhật ký thay đổi memory riêng (Git + "Kết quả chốt" đã đủ), không FTS, không hạn dùng từng dòng.
- **Tác động lên Staff đã tạo:** copy hook, thêm `memory/README.md`, sửa `MEMORY.md`/`LEARNING.md`/`AGENTS.md` theo phạm vi nâng cấp được giao.

### 3.14. V0.2.8 — Lịch sử sửa memory, hạn dùng và tìm lại

- **Vấn đề:** memory sửa giữa buổi chưa có dấu vết trước commit; bài học tạm chưa có hạn dùng; kho knowledge/job chỉ được tìm khi Staff tự nhớ mở.
- **Thay đổi:** hook chụp hash + số dòng các file bài học trong frontmatter `memory-files` của file phiên, so trước/sau lượt và ghi mục "Memory đổi trong buổi"; lúc chốt đọc Git để liệt kê file bài học chưa commit. Không tạo cơ sở dữ liệu hay nhật ký `.ndjson` riêng.
- **Hạn dùng:** `· đến YYYY-MM-DD` ở cuối dòng, có hiệu lực hết ngày đó theo ngày địa phương. Ngày sai hoặc ngày chỉ nằm trong trích nguồn không làm dòng bị ẩn. Hook lọc trước khi nạp, kiểm tra lại file brand/chủ đề đã nạp dù tin mới không nhắc từ khóa, và ghi rõ bản hiện hành thay thế bản cũ. Không xóa transcript đã nạp hay file gốc; lúc chốt đề xuất chuyển dòng hết hạn sang archive, vẫn cần người dùng duyệt.
- **Tìm lại:** từ khóa bỏ dấu, tách ở dấu câu, bỏ lời điều khiển phổ biến; cặp âm tiết + từ từ 3 ký tự để giữ CLI/SRT. Khớp ≥2 từ nội dung độc lập và ≥50% từ hỏi, có bằng chứng cụm từ hoặc từ đặc trưng trong heading; chấm điểm ưu tiên heading/heading cha và giảm lợi thế đoạn dài. Tối đa 2 đoạn × 12 dòng / 1 200 ký tự, trừ README/file ẩn/symlink/file >512 KiB. Cache RAM mtime/size, version theo hash nguồn; restore A→B→A được nạp lại, lặp câu không lấp chỗ bằng đoạn yếu hơn. Config brand thiếu/hỏng thì dừng recall; config rỗng hợp lệ khác config hỏng. File phải khớp đủ các brand đã khai báo. Nội dung là tham khảo, không thay Project Gate/approval.
- **Không đổi:** không tự commit/push; không tự chuyển/xóa bài học; không tìm trong log lời thô/hội thoại cũ; không thêm phát hiện mâu thuẫn bằng model hay trí nhớ chung của đội.
- **Vòng đời:** file journal dùng full session ID đã URI-encode, không gộp log trùng 8 ký tự cuối. Log hết hạn mở lại không có mốc đã duyệt giả. File bài học rỗng/xóa có thông báo thu hồi; sau compact giữ danh tính brand/chủ đề để nạp lại dù câu tiếp tục không có từ khóa. Snapshot vẫn không là locking/rollback của shared memory.
- **Áp dụng:** source tại `11-factory/staff-runtime/`; cài vào Staff theo quy trình §12, kiểm chứng trên từng learner instance.

### 3.15. V0.2.9 — `/learn` và tái sử dụng quy trình giữa session

- **Nhu cầu:** người dùng giao kết quả, Staff tự khám phá cách làm; khi hiệu quả cần giữ lại để session khác không giải thích hoặc khám phá lại từ đầu. Video chỉ là ví dụ.
- **Lựa chọn kiến trúc:** `/learn` mở authoring prompt, đọc inventory Skill và ghi qua tool sau duyệt. OS Staff dùng Skill Creator upstream, adapter OMP mỏng và kho repo-local, không sao chép memory backend.
- **Khác đã chốt:** trước lưu/kích hoạt người dùng duyệt bản tóm tắt; Skill chỉ từ tài liệu vẫn được bật với nhãn chưa kiểm chứng, không gate pilot/eval. Lỗi và kết quả thực ở job tạo dữ liệu để đề xuất sửa, không tự sửa Skill.
- **Áp dụng:** source `11-factory/staff-runtime/learn.ts` → `.omp/hooks/pre/learn.ts`; native custom directory `skills/`, package Skill Creator nguyên bản có license/lock. Không thay memory loop hoặc `/skill:learn` riêng của Intelligence.
- **Giới hạn:** proposal approval không là lock; reread không là CAS. Staff/Project giữ đúng ownership, không đưa mọi brand vào catalog Staff.

### 3.16. V0.2.10 — Bài học brand vào hộp chung của Project

- **Vấn đề quan sát được:** bài học brand nằm ở `brand/staff-lessons/<staff-id>.md`, chỉ hook của đúng Staff đó tự nạp; Staff khác đọc context chưa cập nhật hoặc mâu thuẫn nên có thể làm sai dù rule đã được chốt.
- **Thay đổi:** đích scope `brand <project-id>` là `brand/pending-rules.md` của Project (OS Projects V0.2.0), mọi Staff ghi chung một file. Dòng: `- YYYY-MM-DD · <staff-id> · <phạm vi: video | graphic | copy | mọi kênh> · <bài học> · nguồn: "<lời người dùng>"`. Đọc lại file ngay trước khi ghi, chỉ thêm ở cuối. Dòng pending có hiệu lực ngay và thắng rule cũ trong `brand/` khi mâu thuẫn. Staff không sửa file nào khác trong `brand/`; OS Intelligence gom vào node chính bằng phiên dọn. **Quên rule brand:** dòng còn trong hộp mang đúng staff-id của mình thì xóa (ghi `memory/forgotten.md` như cũ); dòng của Staff khác hoặc rule đã được gom vào `brand/` thì thêm dòng `bỏ: <rule cũ> · lý do: <…>` cho phiên dọn gỡ.
- **Rule đã chốt cũng phải tới Staff:** Staff làm job brand ở chế độ training (không gắn Project) chỉ thấy file hook chèn; sau phiên dọn, hộp `pending-rules` trống nên Staff mất hết rule đã gom. Config brand có thêm trường tùy chọn `context`: danh sách node rule đã chốt (vd `brand/guidelines.md`, `brand/formats/<format>.md` hợp với vai Staff); nhắc từ khóa brand → hook chèn các node `context` rồi tới hộp pending (pending thắng khi mâu thuẫn), mỗi file theo dõi hash riêng nên đổi file nào chèn lại file đó. Staff không ghi file `context`.
- **Không đổi:** cơ chế hook chèn file brand khi tin nhắn nhắc từ khóa, hạn dùng `· đến`, theo dõi thay đổi/chưa commit, `MEMORY.md`/`memory/`; schema `.omp/learning-loop.json` giữ `id`/`keywords`/`file` (`file` trỏ tới `brand/pending-rules.md`), chỉ thêm `context` tùy chọn.
- **Định danh khi chốt:** hook in sẵn staff-id trong chỉ dẫn chốt, lấy từ dòng `- ID:` của `AGENTS.md` Staff (đúng cả trong worktree), thiếu thì dùng tên folder repo; không ghi Project ID vào ô staff-id.
- **Tác động lên Staff đã tạo:** copy hook, sửa `file` trong config và các chỗ nhắc `staff-lessons` trong `AGENTS.md`/`LEARNING.md`/`MEMORY.md`/`memory/README.md`; cần Project đích đã có `brand/pending-rules.md` (đích hiện hành được thay ở §3.21).

### 3.17. V0.2.11 — Không chiếm quyền máy tính và trình duyệt của người dùng

- **Vấn đề quan sát được:** quy tắc không điều khiển máy tính/trình duyệt cá nhân chỉ ở context chung hoặc template riêng có thể bị Staff bỏ sót. Skill browser toàn cục có thể mặc định gắn Chrome thật; vì vậy mỗi Staff phải có ranh giới rõ ngay tại entrypoint.
- **Thay đổi:** `AGENTS.md` mỗi Staff, mục quyền/dữ liệu, chép nguyên văn khối sau (chỉ đổi cách xưng nếu `USER.md` của Staff override):

  > - Không điều khiển máy tính, chuột/bàn phím, ứng dụng hoặc trình duyệt cá nhân của người dùng: không Computer Use, không gắn vào Chrome thật (kể cả browser relay), không `mac-approve`, không import cookie/tài khoản từ Chrome. Trình duyệt có hai đường: (1) trang công khai (mở, chụp, lấy dữ liệu, cuộn) chạy `bu-headless` (Browser Use CLI trên Chromium headless riêng, profile tạm; `bu-headless stop` để tắt); lỗi `BU_CDP_URL … unreachable` nghĩa là chạy `bu-headless` trước, không gỡ biến `BU_CDP_URL`, không cloud browser hay `browser-use login` khi người dùng chưa duyệt. (2) Trang cần đăng nhập, hoặc người dùng muốn xem thao tác: dùng trình duyệt nhúng của Orca với profile cô lập `Agent` (`orca tab profile list` lấy id; `orca tab create --url <url> --profile <id>`, `orca snapshot`, `orca click --element @eN`, `orca fill`, `orca screenshot`, `orca tab close`); trang chưa đăng nhập thì nhờ người dùng tự đăng nhập trong tab đó rồi làm tiếp; không dùng profile Default, không Import Browser Cookies, không tạo profile scope `imported`; Orca không chạy thì báo người dùng, không chuyển sang Chrome. Thao tác xác thực, thanh toán, gửi/đăng hoặc trên máy cá nhân: người dùng tự làm hoặc duyệt trước, rồi tiếp tục từ kết quả người dùng đưa.

  Đường (2) dành cho trang cần đăng nhập vì `bu-headless` xóa profile mỗi lần; tắt OMP `browser.relay` để không điều khiển Chrome thật.

- **Không đổi:** cấu trúc repo, hook `learning-loop`, `/learn`, Project binding. Không copy Skill `browser-use` vào kho `skills/` của Staff; Skill toàn cục tại `~/.agents/skills/browser-use` đã được OMP nạp cạnh `skills.customDirectories`.
- **Kiểm chứng cần chạy:** `bu-headless` dùng `HeadlessChrome` cô lập, không tìm Chrome thật; khi endpoint chưa khả dụng phải báo lỗi, không fallback. Staff mới: `rg -n "bu-headless" AGENTS.md` có kết quả.
- **Tác động lên Staff đã tạo:** thêm khối trên vào `AGENTS.md`, nâng `VERSION`/metadata/CHANGELOG lên V0.2.11; không cần sửa hook hoặc config.

### 3.18. V0.2.12 — Impeccable và Superpowers là bộ nền Staff

- **Nguồn quyết định:** người dùng yêu cầu Impeccable và Superpowers là bộ nền của mọi Staff tạo mới. Superpowers dùng upstream `obra/superpowers`.
- **Cài đặt bắt buộc:** từ root Staff, dùng `omp plugin install impeccable@impeccable --scope project` và `omp plugin install superpowers@superpowers-marketplace --scope project`. Nếu thiếu marketplace, tra CLI hiện hành và nguồn upstream để đăng ký; không thay bằng file persona, symlink cache hoặc chỉ ghi tên trong hướng dẫn. Không cài user/global để thay project registration.
- **Nguồn và version:** Impeccable từ `pbakaus/impeccable`, Superpowers từ `obra/superpowers`; dùng marketplace đã xác minh, giữ upstream nguyên bản. Ghi version thực vào instance receipt/lock, không khẳng định luôn dùng bản trong phiên trước.
- **Dữ liệu bền vững:** allowlist riêng `.omp/plugins/installed_plugins.json` và `.omp/plugins/omp-plugins.lock.json`; không commit `.omp/plugins/node_modules/`, plugin cache, `.superpowers/` hoặc runtime state. Registration có absolute cache path máy hiện tại, không phải bản vendor portable; khi chuyển máy cần cài lại hai plugin, không hứa cache path cũ chạy được.
- **Routing entrypoint:** đọc Skill đúng trigger. Superpowers cung cấp quy trình brainstorming/plan/debug/verification; Impeccable cho UI/design/UX copy khi nhiệm vụ liên quan. Spec/plan của Superpowers ghi vào file job hoặc `WORKSTREAM.md` của Project, không tạo `docs/superpowers/`. Không ép mọi nghiệp vụ qua code/design workflow, không thay Staff role, không auto-tạo Skill nghề. Cài trọn bộ không đồng nghĩa mọi hook/command đã nghiệm thu.
- **MCP và quyền:** đây là plugin bundles có Skill/agent/hook, không phải yêu cầu tự tạo hai MCP server cùng tên. Không thêm MCP ngoài manifest/nhu cầu thật; không mở browser cá nhân, publish/chi tiền hoặc quyền khác.
- **Kiểm chứng:** `omp plugin list --json` từ root Staff xác nhận cả hai scope project và enabled trong lock; fresh OMP không tiếp tục transcript cũ phải thấy `impeccable`, `using-superpowers`, `brainstorming` trong catalog và bootstrap Superpowers. Kiểm registration/lock được Git thấy, cache/node_modules không được Git thấy. Giữ `skills.customDirectories` và learning adapters hiện có.

### 3.19. V0.2.13 — Browser Use là bộ nền Staff

- **Nguồn quyết định:** người dùng bổ sung Browser Use vào bộ nền Staff tạo mới. Không tự migrate các Staff cũ khác.
- **Hình thức:** Browser Use là Skill + CLI dependency của máy, không phải plugin OMP marketplace hay MCP server bắt buộc. Skill global `~/.agents/skills/browser-use/SKILL.md` phải được OMP discover. Cài CLI theo hướng dẫn upstream; cài wrapper macOS bằng cách copy `11-factory/shared-runtime/bu-headless` vào thư mục trong PATH (ví dụ `~/.local/bin/`) và cấp quyền thực thi. Bản Ship này chỉ hỗ trợ macOS. Dùng lại dependency đã có, không copy Skill vào `skills/`, không tạo alias hoặc sửa upstream để tránh một nguồn thành nhiều bản.
- **Bootstrap bắt buộc:** kiểm `command -v browser-use`, `command -v bu-headless`, `browser-use --version`; fresh OMP từ root Staff phải có `browser-use` trong catalog và đọc được Skill thực. Nếu thiếu dependency, làm theo hướng dẫn cài hiện hành tại `https://github.com/browser-use/browser-harness/blob/main/install.md`, giữ đúng ranh giới browser; không đánh dấu sẵn sàng chỉ vì có tên Skill trong README. Chuyển máy phải provision dependency, đường global trên máy cũ không tự portable.
- **Routing:** read/HTTP đủ thì không mở browser. Khi cần tương tác/JS/screenshot, đọc Skill Browser Use nhưng tuân §3.17 trước: trang công khai chạy `bu-headless` (wrapper chuyển tiếp Browser Use helpers), xong `bu-headless stop`; trang cần đăng nhập dùng browser nhúng Orca với profile `Agent`, nhờ người dùng tự đăng nhập. Không `Browser('chrome')`, Chrome thật, relay, import cookie, `mac-approve`, gỡ `BU_CDP_URL` hoặc dùng cloud/login khi người dùng chưa duyệt.
- **An toàn môi trường:** endpoint mặc định của wrapper là `http://127.0.0.1:9334` (`BU_CDP_URL`); wrapper tự đặt endpoint/name, chỉ chạy Chromium headless profile tạm localhost và từ chối port của tiến trình khác. Không thay wrapper/global để cài một Staff mới; nếu không có đường cô lập thì báo thiếu, không fallback sang Chrome cá nhân. Mỗi learner kiểm đường headless trên máy của mình; không kế thừa smoke của người phát hành.
- **Entrypoint/verification:** nêu Browser Use và đường `bu-headless` tại AGENTS/skill inventory; fresh read-only scenario phải chọn đúng đường cho public/login và từ chối lời hướng dẫn Chrome/cloud xung đột từ upstream. Không coi scenario đọc hiểu là browser navigation đã chạy hoặc mọi helper đã được kiểm.
- **Không đổi:** role, Project Gate, quyền publish/chi tiền và hai learning adapters; không bật MCP hoặc browser cá nhân.

### 3.20. V0.2.14 — Danh bạ hệ sinh thái

- **Nguồn quyết định:** người dùng yêu cầu mọi Staff, kể cả Staff tạo từ lâu, biết sự xuất hiện của Project trong `OS Projects` và app trong `OS Builder` do Intelligence tạo; chỉ khi làm việc mới đào sâu.
- **Thay đổi:** Factory giữ danh bạ duy nhất [[11-factory/catalog]] (mỗi Staff/Project/app một dòng: ID, một câu mục đích, locator từ root AI OS Ecosystem). Staff copy `11-factory/shared-runtime/ecosystem-catalog.ts` vào `.omp/hooks/pre/`; hook tìm danh bạ bằng cách đi ngược thư mục cha (chạy được trong worktree), chèn một message ẩn đầu phiên, sau compaction và khi danh bạ đổi; bỏ dòng của chính Staff theo `- ID:`; thiếu danh bạ thì im lặng, không ghi file. `AGENTS.md` có một dòng hệ sinh thái cho harness không hook.
- **Hành vi:** danh bạ chỉ để biết; chưa có assignment thì Staff không chạy Gate, không đọc `brand/`, không sửa repo khác. Project mới/xóa chỉ cần Factory sửa dòng danh bạ, không sửa từng Staff.
- **Không đổi:** Project Context Gate, `.omp/learning-loop.json` (rule brand vẫn theo vai từng Staff), learning loop, `/learn`, quyền.

### 3.21. V0.2.15 — Sổ feedback brand, ghi ngay

- **Nguồn quyết định:** feedback brand thường qua nhiều bài, nhiều lượt mới rõ. Người dùng muốn Team Lead (agent tại root Project) tổng hợp feedback từ mọi Staff trước khi cập nhật context brand, không để feedback lẻ sửa thẳng rule và không phải duyệt hai lần.
- **Thay đổi:** đích scope `brand <project-id>` là sổ `brand/feedback.md` của Project (OS Projects V0.2.1). Staff **ghi ngay** khi người dùng feedback điều đúng cho bài/việc khác của brand (giọng, từ, xưng hô, trình bày, thẩm mỹ, nhận diện, claim, quy cách định dạng), ở mọi phiên làm cho brand (project session qua gate và phiên training mà hook đã nạp brand theo binding); không hỏi duyệt, không chờ "chốt bài học"; báo một dòng `Đã ghi sổ feedback <brand>: <tóm tắt> (<mức>)`. Feedback chỉ cho một deliverable (chính tả, giá/số liệu bài đó, chọn ảnh cụ thể) ở lại workstream. Dòng: `- YYYY-MM-DD · <staff-id> · <gợi ý | dứt khoát> · <phạm vi: video | graphic | copy | mọi kênh> · <feedback> · việc: <workstream>/<sản phẩm> · nguồn: "<lời người dùng>"`; `dứt khoát` khi người dùng nói rõ là luật, không rõ thì `gợi ý`. Đọc lại file trước khi ghi, chỉ thêm ở cuối file; chỉ sửa/xóa dòng của mình khi người dùng bảo; ý lặp lại → thêm dòng mới. `dứt khoát` thắng rule cũ trong `brand/`; `gợi ý` chỉ tham khảo, mâu thuẫn với `brand/` thì theo `brand/` và nêu với người dùng. Team Lead của Project biên tập `brand/`. Bước "chốt bài học" không còn đề xuất dòng brand để người dùng duyệt; feedback brand chưa có trong sổ thì ghi ngay lúc chốt.
- **Hook:** `learning-loop` v0.2.15 chèn sổ với nhãn hai mức kèm chỉ dẫn ghi ngay khi tin nhắn nhắc brand; node `context` ghi "Team Lead biên tập, chỉ dòng `dứt khoát` thắng khi mâu thuẫn".
- **Không đổi:** schema `.omp/learning-loop.json` (`id`/`keywords`/`file`/`context`, `file` trỏ `brand/feedback.md`), `MEMORY.md`/`memory/`, `/learn`, quyền trong `work/` (Staff vẫn tạo/sửa nội dung workstream được giao). Không tự thêm binding brand cho Staff chưa làm brand đó; Staff chưa có binding mà nhận feedback brand trong project session vẫn ghi sổ (gate đã đọc sổ) và đề xuất thêm binding.
- **Tác động lên Staff đã tạo:** copy hook, sửa `file` trong config (nếu có binding) và các chỗ nhắc `pending-rules`/"Intelligence gom" trong `AGENTS.md`/`LEARNING.md`/`MEMORY.md`/`memory/README.md`; cần Project đích đã nâng V0.2.1.

### 3.22. V0.2.16 — Input/Output rõ và bản đồ Excalidraw sống

- **Nguồn quyết định:** người dùng đánh giá khung Input/Output kèm bản đồ Excalidraw giúp theo dõi tổng thể và không thiếu dữ kiện khi quyết định; quyết định áp dụng khả năng này cho mọi Staff và Team Lead của mọi Project. Cách làm tại [[08-playbook/input-output-map]].
- **Thay đổi:** Skill `io-map` có bản canonical ở Intelligence `.agents/skills/io-map/` (SKILL.md + `scripts/io-map.ts`), copy nguyên thư mục vào `skills/io-map/` của Staff; OMP discover qua `skills.customDirectories` có sẵn. Dữ liệu bản đồ nằm trong mục `## Bản đồ Input/Output` của file theo dõi việc. Việc riêng của Staff dùng file job `jobs/<job>.md`, bản đồ sinh ra là `jobs/<job>.tong-quan.excalidraw`. Việc thuộc Project dùng bản đồ của workstream Project, không tạo bản thứ hai trong Staff.
- **Hành vi:** chỉ bật khi người dùng cho phép cho một việc cụ thể (gọi `/skill:io-map` hoặc nói rõ muốn theo dõi Input/Output), hoặc việc đã có mục `## Bản đồ Input/Output`; chưa bật thì làm theo luồng bình thường, không tự bật chỉ vì việc nhiều hạng mục hay nhiều vòng chốt (trước đó Skill tự bật cho mọi việc nhiều hạng mục). Khi đã bật: cập nhật bản đồ cùng lượt với Markdown khi có quyết định, đổi bước hoặc danh sách `Chờ người dùng` thay đổi. Phần người dùng vẽ thêm trên canvas được giữ; chỗ người dùng sửa trên phần do script sinh ra thì script dừng và liệt kê, Agent đưa vào Markdown rồi mới chạy lại.
- **Không đổi:** role, Project Context Gate, learning loop, `/learn`, quyền. Skill không thêm hook hay MCP; chỉ cần `bun` có sẵn của OMP.
- **Sửa Skill:** sửa bản canonical ở Intelligence, chạy `bun test 11-factory/shared-runtime`, rồi copy lại; không sửa riêng bản trong Staff.

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

Starter phải có repository metadata, các entrypoint và ba folder nền `knowledge/`, `journal/`, `memory/` ngay khi khởi tạo. `README.md` giới thiệu ngắn gọn đây là OS Staff, identity/role, entrypoint, cấu trúc, quan hệ trong hệ sinh thái, privacy và Git boundary; `VERSION` giữ contract version machine-readable; `CHANGELOG.md` giữ các mốc repository metadata. Khi chưa có knowledge/journal/memory data, mỗi folder giữ `README.md` giải thích mục đích, lúc đọc/ghi, nguồn và scope; không tạo bài học giả. Job, skill, reference và taxonomy con chỉ tạo khi có nhu cầu thực.

```text
<staff-name>/
├── .gitignore            # `.omp/*` trừ hook + config; `journal/sessions/`
├── .omp/
│   ├── hooks/pre/learning-loop.ts
│   ├── hooks/pre/learn.ts
│   ├── hooks/pre/ecosystem-catalog.ts
│   ├── learning-loop.json
│   ├── config.yml       # skills.customDirectories: [skills]
│   └── plugins/installed_plugins.json, omp-plugins.lock.json # hai plugin nền; cache/node_modules ngoài Git
├── README.md
├── VERSION
├── CHANGELOG.md
├── AGENTS.md
├── ROLE.md
├── USER.md
├── MEMORY.md
├── memory/
│   ├── README.md
│   ├── <slug>.md         # bài học theo chủ đề; hook chèn khi tin nhắn khớp
│   ├── archive.md        # dòng chuyển ra khi vượt 200 dòng; hook không chèn
│   └── forgotten.md      # ý người dùng bảo quên; hook chỉ đưa vào chỉ dẫn chốt
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
    ├── README.md
    └── sessions/         # gitignored; hook ghi lời người dùng
```

| File hoặc thư mục | Nội dung | Khi đọc |
| --- | --- | --- |
| `README.md` | Overview ngắn: OS type, Staff identity/role, cách bắt đầu, cấu trúc, quan hệ hệ sinh thái, version/Git và privacy | Khi người hoặc Git host cần hiểu repo |
| `VERSION` | Contract version machine-readable của Staff instance | Khi Factory/upgrade/check cần đối chiếu version |
| `CHANGELOG.md` | Mốc repository metadata và migration đáng giữ; không thay job/journal | Khi review release/checkpoint |
| `AGENTS.md` | Entry point, routing, nguyên tắc điều hành, trigger học và Git checkpoints | Khi bắt đầu session |
| `ROLE.md` | Vai trò, outcome, phạm vi, tiêu chuẩn đầu ra và ranh giới trách nhiệm | Khi bắt đầu hoặc cần xác định phạm vi |
| `USER.md` | Preferences và cách cộng tác đã được xác nhận, có scope khi cần | Context ban đầu ngắn hoặc trước quyết định liên quan |
| `MEMORY.md` | Bài học chung (đúng ở mọi buổi, không phụ thuộc loại việc) người dùng đã đồng ý qua lệnh chốt, mỗi dòng có ngày + trích nguồn; không lặp USER/skill; tối đa 200 dòng | Trên OMP hook tự chèn (kèm mục lục chủ đề) đầu phiên, khi file hoặc mục lục đổi và sau compaction; harness khác đọc đầu phiên |
| `memory/` | `<slug>.md`: bài học chỉ đúng cho một loại việc, frontmatter `title`/`description`/`aliases`, tối đa 200 dòng; `archive.md`: dòng đã chuyển ra theo đồng ý của người dùng; `forgotten.md`: mô tả ngắn các ý người dùng bảo quên; `README.md`: hướng dẫn | Hook chèn file chủ đề khi tin nhắn khớp title/alias/slug; archive không bao giờ chèn; forgotten chỉ vào chỉ dẫn chốt; harness khác mở file khi việc liên quan |
| `WORK.md` | Mục lục công việc đang mở, link tới từng job | Khi nhận hoặc tiếp tục công việc |
| `LEARNING.md` | Vòng ghi → chốt → ghi theo duyệt → dùng lại; phân loại scope; sửa và thu hồi | Khi chốt bài học hoặc review dang dở |
| `jobs/` | Brief và trạng thái job độc lập; với project-bound job chỉ giữ assignment/checkpoint cùng Project/workstream locator | Job liên quan; hook có thể chèn đoạn tham khảo giới hạn, không thay trạng thái/approval hiện hành |
| `knowledge/` | Domain knowledge và reference có nguồn | Khi task/skill cần; từ V0.2.8 hook tìm theo từ khóa và chèn đoạn liên quan có nguồn |
| `skills/` | Procedure tái sử dụng, bao gồm cách kiểm chứng output | Khi nhiệm vụ phù hợp |
| `journal/` | `sessions/`: lời người dùng + mục "Memory đổi trong buổi" và snapshot `memory-files` do hook ghi (gitignored; `status` open → chốt/bỏ/hết hạn). Entry evidence khác ở root `journal/` | Khi chốt hoặc truy nguồn; log thay đổi không là bản sao nội dung để hoàn tác |
| `.omp/hooks/pre/learning-loop.ts` | Hook OMP learning loop, copy từ Factory; dòng đầu ghi version | OMP tự nạp; không sửa riêng từng Staff — sửa bản gốc Factory rồi copy |
| `.omp/learning-loop.json` | Brand → từ khóa → sổ feedback brand (`brand/feedback.md`) và node đã chốt (`context`) trong Project | Hook đọc mỗi lượt; Staff đề xuất thêm brand mới khi làm brand đó |
| `.omp/hooks/pre/learn.ts` | Adapter `/learn`, policy đầu phiên/sau compact | Copy từ Factory; command đưa vào Skill Creator, không tự ghi Skill hoặc công nhận approval |
| `.omp/hooks/pre/ecosystem-catalog.ts` | Hook danh bạ hệ sinh thái, copy từ `11-factory/shared-runtime/` | OMP tự chèn danh bạ đầu phiên/sau compaction/khi danh bạ đổi; không sửa riêng từng Staff |
| `.omp/config.yml` | `skills.customDirectories` trỏ kho `skills/`, giữ array đã có | OMP native discovery; không đổi global hoặc bật memory backend |
| `.omp/plugins/installed_plugins.json`, `omp-plugins.lock.json` | Registration + version/enable lock cho Impeccable và Superpowers project-scoped; không copy vendor vào `skills/` | OMP plugin loader; cài lại trên máy mới nếu cache path không tồn tại |

`knowledge/README.md`, `journal/README.md` và `memory/README.md` là hướng dẫn nền bắt buộc, được `AGENTS.md` và `LEARNING.md` route khi liên quan; không preload toàn bộ các folder này. Chỉ thêm index chuyên đề/tầng phân loại khi có nội dung thật.

### 5.1. Bootstrap và khả năng đổi harness

- `AGENTS.md` là entrypoint chung được ưu tiên.
- Nếu harness không tự nạp file này, dùng cơ chế instruction được hỗ trợ hoặc chỉ dẫn khởi động để đọc nó.
- Entry point phụ, nếu cần, chỉ tham chiếu nguồn chính; không giữ một bản quy tắc thứ hai.
- Không giả định `USER.md`, `MEMORY.md` hay `ROLE.md` tự được inject chỉ vì tên file. `AGENTS.md` phải chỉ rõ lúc nào cần đọc.
- Ngoại lệ trên OMP (từ V0.2.6): hook `learning-loop` tự chèn `MEMORY.md` kèm mục lục chủ đề, file chủ đề khớp tin nhắn (V0.2.7) và bài học brand; `AGENTS.md` vẫn ghi cách đọc thủ công cho harness khác.
- `skills/` là canonical. Trên OMP V0.2.9 cấu hình project-local `skills.customDirectories` trỏ kho này, không copy SKILL.md sang `.omp/skills/`. Array phải giữ custom directory hiện có. Harness khác vẫn phụ thuộc loader/version; không tuyên bố mọi harness tự scan.
- `SKILL.md` ưu tiên chuẩn Agent Skills với `name`, `description` và nội dung Markdown; tránh extension riêng của harness trong phần cốt lõi.
- Harness có thể đọc skill như file bình thường nếu không có native skill loader.
- Tool/API/MCP nghiệp vụ vẫn cần có trong môi trường. Markdown không thay thế tool còn thiếu.

Mọi `AGENTS.md` được Factory tạo hoặc nâng cấp phải mang contract session locator của V0.2.4. Contract này độc lập với job checkpoint: resume JSONL khôi phục chat runtime, còn job/Project files giữ trạng thái bền vững và vẫn là nguồn tiếp tục khi transcript không còn.

### 5.2. Ranh giới dữ liệu

Trong repo giữ phần cần để bàn giao nhân viên. Không commit mặc định:

- Credentials, API keys, cookies, OAuth tokens và nội dung nhạy cảm không cần lưu.
- Session databases, raw transcripts, search indexes, caches và runtime logs của harness; log thô `journal/sessions/` của hook learning-loop.
- Render cache, proxy media hoặc file lớn không có chiến lược lưu trữ phù hợp.

Job/journal có thể tham chiếu media hoặc output bên ngoài repo. Nếu muốn bàn giao hoặc khôi phục các tài sản đó, cần bảo đảm nơi lưu riêng còn truy cập được; Git của repo không tự bảo vệ chúng.

Với project-bound job, brand context, shared brief, deliverables và approvals thuộc Project repo. Staff repo chỉ giữ phần cần để tiếp tục assignment của Staff và link/locator tới nguồn Project.

Memory tự động riêng của harness không được là bản duy nhất chứa điều cần cho Staff. Việc cô lập context toàn cục vẫn phụ thuộc cấu hình runtime; repo không thể xóa các instruction đã được harness nạp.

## 6. Quy ước wikilink và progressive disclosure

### 6.1. Wikilink là điều hướng, không phải auto-loader

- Một node là một file Markdown có mục đích rõ ràng.
- Dùng đường dẫn không mơ hồ: ví dụ minh họa `knowledge/captions.md`, resolve từ root repo Staff.
- Có thể dùng heading để trỏ tới phần cụ thể: ví dụ minh họa file `jobs/product-demo.md`, heading `feedback`.
- Link nên kèm lý do và thời điểm đọc, ví dụ minh họa ở root Staff: “Trước khi thiết kế phụ đề, đọc node captions trong `knowledge/` để kiểm tra khả năng đọc trên điện thoại”. Chỉ tạo wikilink khi node đã tồn tại.
- Không crawl toàn bộ graph hoặc đọc mọi backlink theo mặc định.
- Khi link thiếu hoặc mơ hồ, kiểm tra file thực tế; không tự bịa nội dung node.
- Khi đổi tên node, cập nhật các liên kết bị ảnh hưởng.
- Các đường dẫn minh họa trong spec này là ví dụ cho repo Staff tương lai, không tuyên bố các file đó đã tồn tại trong Factory.
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
4. Đọc mandatory base do Project router chỉ định, gồm `brand/feedback.md` (sổ feedback chung: `dứt khoát` phải theo và thắng rule cũ, `gợi ý` tham khảo — OS Projects V0.2.1).
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
| Brand facts, voice, visual judgment và feedback bền vững | Project brand nodes (Team Lead của Project biên tập); feedback brand mới ghi ngay vào `brand/feedback.md`, không hỏi duyệt (§3.21) |
| Generic procedure/năng lực dùng lại của Staff | Staff skill/knowledge/learning loop |
| Preference cộng tác đã được xác nhận và đúng scope | `USER.md` |

Public voice của một brand không mặc định là preference cộng tác toàn cục. Feedback riêng Project không được promote vào `MEMORY.md`, `USER.md` hay Skill dùng chung nếu chưa phân loại đúng scope.

### 7.4. Nhiều session

Một Staff có thể có training session và nhiều project session đồng thời. Không thêm lock system trong V0.2.3.

- Mỗi session dùng job/checkpoint riêng.
- Trước sửa/commit shared Staff files như `skills/`, `MEMORY.md`, `USER.md`, `WORK.md`, đọc lại bản hiện hành; ưu tiên edit từng phần, không ghi đè toàn file từ bản sao cũ. Nhiều phiên sửa chung một file phải có một owner hợp nhất; hook chỉ tách journal/quan sát file, không tự khóa mọi thao tác ghi shared memory.
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
| Procedure kỹ thuật | Thực thi thành công + kiểm output để gọi đã kiểm chứng; `/learn` được bật sau duyệt dù chưa chạy, ghi đúng giới hạn (§8.9) |
| Creative judgment | Brief, reference và feedback; agent tự chấm đẹp chưa đủ |
| Kiến thức bên ngoài | Nguồn đáng tin, thời điểm và phạm vi; lặp lại nhiều không chứng minh đúng |

Một bài học đề xuất chỉ cần vài dòng: nội dung, nguồn, phạm vi, thay đổi dự kiến và trạng thái kiểm chứng. Không bắt mọi entry dùng metadata nặng hoặc điểm confidence giả chính xác.

Không promote:

- Suy đoán hoặc failure chưa giải quyết thành fact/quy tắc đã chứng minh; Skill chưa thực thi được bật theo §8.9 nhưng không được gắn nhãn đã đúng.
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
| “Từ nay video phân tích chuyên môn của người dùng không dùng nhạc nền” | Preference đã xác nhận, scope video phân tích chuyên môn |
| Caption che nội dung demo | Giữ feedback, đề xuất bước kiểm vùng caption; được bật sau duyệt với trạng thái bằng chứng đúng, dùng thật để đánh giá |
| Chuỗi filter đã sửa được lỗi và output đạt yêu cầu | Có thể cập nhật procedure đúng phạm vi |
| Render lỗi nhưng chưa biết nguyên nhân | Giữ evidence, chưa gọi đó là bài học |
| Campaign dùng monochrome tới khi kết thúc | Constraint của job/campaign, không là gu lâu dài |

### 8.8. Learning loop hook (V0.2.6–V0.2.10)

Trên OMP, vòng §8.3 được thực thi bằng hook thay vì chỉ dựa vào agent tự nhớ:

| Khâu §8.3 | Ai làm |
| --- | --- |
| Ghi nhận | Hook chép lời người dùng vào `journal/sessions/`; V0.2.8 so hash/số dòng file bài học trước/sau lượt để ghi các lần đổi trong buổi |
| Phân loại + Đề xuất | Staff, khi người dùng nói "chốt bài học"/`/chot` hoặc đồng ý chốt buổi hook nhắc |
| Kiểm chứng + Tiếp nhận | Người dùng đồng ý từng dòng; Staff ghi đúng đích: `MEMORY.md` (chung — đúng ở mọi buổi), `memory/<slug>.md` (chủ đề — chỉ một loại việc; chủ đề mới do Staff đề xuất kèm aliases), đề xuất Skill (procedure nhiều bước, sau đó qua Skill Creator). Feedback brand không qua danh sách duyệt: Staff ghi ngay vào Project `brand/feedback.md` (sổ chung mọi Staff; vừa brand vừa chủ đề thì chọn brand; dòng có staff-id + mức + phạm vi — §3.21) |
| Truy xuất | Hook chèn `MEMORY.md` + mục lục; chủ đề/brand khớp từ khóa. V0.2.8 tìm đoạn tham khảo trong knowledge/jobs (tối đa 2 × 12 dòng / 1 200 ký tự mỗi lượt), ghi nguồn và từ khớp |
| Giới hạn | Mỗi file tối đa 200 dòng. Lúc chốt hook báo số dòng; nếu ghi xong sẽ vượt, Staff đề xuất chuyển dòng sang chủ đề hoặc `memory/archive.md` (nguyên văn + ` · chuyển YYYY-MM-DD từ <file>`), người dùng đồng ý mới chuyển. Hook không tự chuyển |
| Đánh giá | Sửa hoặc xóa dòng khi sai; không thêm dòng trái ngược. Người dùng bảo quên → xóa dòng và ghi `memory/forgotten.md`; lúc chốt hook đưa danh sách đó vào chỉ dẫn để không học lại |
| Minh bạch | Mỗi phần chèn ghi lý do; `/nap` liệt kê phần hook đã chèn trong phiên; `/context` (có sẵn trong OMP) xem toàn bộ context |
| Hạn dùng | `· đến YYYY-MM-DD` ở cuối dòng; qua ngày đó hook không nạp dòng, cập nhật bản hiện hành của file đã nạp; lúc chốt đề xuất archive. Không tự xóa |
| Lịch sử/Git | Hash + số dòng trong file phiên ghi lần đổi, không chứa before/after để khôi phục. Lúc chốt hook liệt kê file bài học chưa commit; khôi phục đầy đủ vẫn dựa Git sau commit |

Tìm lại trong `knowledge/` và `jobs/` đã triển khai từ V0.2.8. Hội thoại cũ vẫn tra bằng `orca search` khi cần, không tự đưa vào context.

### 8.9. `/learn` — đóng gói procedure (V0.2.9)

1. **Kích hoạt:** `/learn` không đối số rút từ công việc/hội thoại hiện tại; đối số có thể là yêu cầu, URL/file hoặc thư mục. Staff được đề xuất học sau khi việc đã được người dùng xác nhận đạt; người dùng đồng ý mới bắt đầu, không tự tạo Skill sau mọi task.
2. **Methodology:** đọc Skill Creator upstream trước tạo/sửa behavior/evaluate; giữ upstream/license/provenance, không fork ngầm. Policy repo-local ghi rõ người dùng cho phép bật chưa thực thi sau duyệt; không ép pilot/eval trước bật theo mặc định upstream.
3. **Inventory:** đọc catalog/kho Staff và đúng Project sau gate. Có Skill đã bao phủ thì dùng lại; cần sửa thì đọc bản hiện hành, nêu đúng tên/phần đổi/lý do. Không sửa vendor, copy style system hoặc tạo bản trùng chỉ vì tên khác.
4. **Proposal:** giữ tại job/workstream đúng owner, ngoài kho active; chưa có job thì tạo job học và route từ WORK. Nêu cách làm, điều kiện dùng, tạo/sửa, đích/phạm vi, nguồn và phần đã/chưa kiểm chứng; giữ bản target dùng khi đề xuất để so trước ghi. Người dùng duyệt đúng proposal mới lưu/kích hoạt; từ chối/chưa duyệt không thay active. Resume/compact đọc lại checkpoint, không lấy “OK” không rõ ngữ cảnh làm approval.
5. **Ghi:** procedure chung `skills/<name>/SKILL.md` Staff; brand-only ở Project theo Project spec. Frontmatter portable `name`/`description`; nội dung gồm mục đích/không làm, điều kiện/công cụ, procedure, pitfalls, verification, nguồn/mức bằng chứng. Chỉ bundle script/reference/asset cần thiết, không credential/transcript/path tạm.
6. **Sau duyệt:** reread và đối chiếu target; cạnh tranh thì hợp nhất và trình lại phần ảnh hưởng approval, không ghi đè từ bản cũ. Được bật Skill chưa thực thi, ghi rõ chưa kiểm chứng; vẫn kiểm cấu trúc/path/nguồn và quyền hiện hành. Receipt nêu file/thay đổi/discovery/đã-chưa chạy/nguồn/Git chưa commit.
7. **Dùng lại:** native catalog cung cấp metadata, Staff chọn đúng Skill và đọc file thật trước làm. Session mới discover; sau tạo/sửa trong phiên đọc đúng file trực tiếp, không hứa mọi cache/subagent đã refresh. Catalog bị tắt/filter thì báo đúng trạng thái, không tự vượt cấu hình. Brand-only Skill qua đúng Project Gate, không global preload.
8. **Cải tiến:** job/workstream giữ Skill/path/bản đã dùng khi cần, bước/input, lỗi/output, cách sửa và kết quả; phân biệt procedure với input/môi trường/khác scope. Sửa task trước, đề xuất sửa Skill đúng tên và chờ duyệt; không auto-promote failure/workaround hoặc tự học nền.

Adapter source `11-factory/staff-runtime/learn.ts`, cài vào `.omp/hooks/pre/learn.ts`. Main-only, không chạy revive/subagent; policy một lần mỗi branch sau compact/bản policy đổi. Command giữ nguyên args, không shell-eval/fetch nguồn; idle mở lượt, streaming follow-up; conflict `/learn` thì báo không thay command khác.

Không dùng tool `learn`/`manage_skill` của OMP vì đường ghi memory/managed store không khớp repo-local. Không có CAS/lock mọi tool hoặc Undo backend; duyệt hội thoại không là security boundary. Git/publish/chi tiền/quyền truy cập vẫn riêng.


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
Người dùng muốn commit mốc này hay để gom với phần tiếp theo?
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

**OMP V0.2.10 dùng hai thành phần repo-local:** `learning-loop` v0.2.10 (§8.8) và `learn` v0.2.9 (§8.9). Project Context Gate và Git checkpoints vẫn do entrypoint/agent đánh giá; không mở backend hoặc model nền.

Từ V0.2.12 có thêm plugin/Skill/agent/hook upstream của Impeccable và Superpowers (§3.18); hai adapter learning ở trên giữ nguyên. Không tự viết thêm automation học nền hoặc mở quyền; không suy mọi hook upstream đều được OMP hỗ trợ nếu chưa kiểm chứng.

Lý do:

- Giữ khả năng đổi harness.
- Mốc đáng commit phụ thuộc ngữ cảnh và kết quả, không chỉ sự kiện kết thúc turn.
- Tránh nhắc commit liên tục khi công việc chưa hoàn thành hoặc thay đổi không thuộc task.

Giới hạn:

- Prompt không bảo đảm agent luôn nhớ hoặc luôn làm đúng.
- Repo không tự học khi không có session đang chạy.
- Không bảo đảm ghi được checkpoint trước crash, tắt cưỡng bức hoặc mất điện.
- Markdown không cưỡng chế permission, sandbox hoặc approval như runtime.

Chỉ thêm automation để giải quyết nhu cầu có thật (V0.2.6 memory loop; V0.2.9 entrypoint/discovery procedure). Hook không tự stage/commit/push, không tự gọi model nền hoặc thay quyết định người dùng; `/learn` chuyển yêu cầu vào lượt model đang được người dùng cho phép.

## 11. Tiêu chí trải nghiệm và kiểm chứng V0.2.16

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

- Staff mới có `.git` tại đúng root Staff và root commit local ngay khi bootstrap; container `OS Staff` không phải repo.
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
- Phiên không gắn Project vẫn kể đúng Staff/Project/app trong danh bạ mà không mở `brand/`; Project mới thêm vào danh bạ hiện ở phiên kế tiếp mà không sửa repo Staff.
- Khi hai repo thay đổi, proposal/approval/commit/recovery được xử lý độc lập và Project commit trước nếu cả hai được duyệt.

### 11.6. Starter và routing

- `knowledge/README.md`, `journal/README.md` và `memory/README.md` tồn tại, có hướng dẫn thực và được entrypoint/learning router liên kết.
- README nói đúng trạng thái chưa có entry; không bị tính là tri thức đã học hoặc evidence đã kiểm chứng.
- Từ job mở đúng Project/workstream rồi backlink quay lại đúng job; kiểm tra cả locator ngoài wikilink và heading đích.
- Training có thể đọc skill và tạo evidence trong Staff mà không yêu cầu Project Gate; project-bound task vẫn phải qua gate.
- `AGENTS.md` có nguyên khối ranh giới máy tính/trình duyệt §3.17 (`bu-headless` cho trang công khai, Orca profile `Agent` cho trang cần đăng nhập, không Chrome thật/Computer Use/`mac-approve`/import cookie).
- Hai plugin Impeccable + Superpowers đã cài scope project, lock enabled; fresh catalog có Skill và bootstrap Superpowers (§3.18), không chỉ dựa plugin global. Registration/lock được theo dõi, cache/node_modules không vào Git; không thêm MCP server giả.


### 11.7. Session JSONL/resume locator

- Fresh Staff session trả `Session hiện tại` đúng một lần trong câu trả lời đầu tiên.
- JSONL path và resume command đến từ metadata authoritative của chính agent/cwd; không chọn nhầm session song song.
- Chạy command trong terminal mới tải lại đúng thread đã trả locator.
- Nếu câu trả lời đầu tiên cập nhật Markdown, `Session hiện tại` đứng ngay trước `Markdown đã cập nhật`; nếu metadata không có, Agent báo `không khả dụng`.
- Transcript không được copy hoặc commit vào Staff repo.

### 11.8. Learning loop hook

- Phiên Staff trên OMP: lời người dùng được ghi vào `journal/sessions/`; file không xuất hiện trong `git status`.
- "chốt bài học" → danh sách có scope/đích/nguồn; chỉ dòng được đồng ý được ghi; file phiên `status: chốt`.
- Phiên mới: transcript có message `ai-os.learning-loop` chứa `MEMORY.md`; `brand/feedback.md` của Project chỉ được chèn khi tin nhắn nhắc brand. Người dùng feedback brand → Staff ghi ngay dòng có staff-id + mức + phạm vi ở cuối `feedback.md` và báo một dòng, không file `brand/` nào khác đổi; feedback chỉ cho một bài → sổ không đổi.
- Buổi bỏ dở ≥ 6 giờ được nhắc một lần; phiên song song đang sống không bị đụng.
- Phiên ngoài repo Staff (ví dụ Intelligence) không chạy hook.
- Tin nhắn khớp alias của một chủ đề → file chủ đề được chèn; tin không liên quan → chỉ có mục lục cùng `MEMORY.md`; `memory/archive.md` không bao giờ được chèn.
- Chốt khi ghi xong sẽ vượt 200 dòng → danh sách có dòng đề xuất chuyển; chỉ dòng được đồng ý được chuyển.
- Người dùng bảo quên một bài học → dòng bị xóa và `memory/forgotten.md` có mô tả; lần chốt sau nói lại đúng ý đó → Staff hỏi xác nhận thay vì tự đề xuất.
- `/nap` hiện các phần hook đã chèn trong phiên, kèm giờ và lý do.
- Sửa file bài học giữa hai lượt hoặc Staff sửa trong lượt → file phiên ghi lần đổi đúng một lần, tách khỏi lời người dùng; chốt có file chưa commit.
- Dòng có hạn đúng ngày vẫn được nạp; từ ngày sau bị ẩn. Bản brand/chủ đề đã nạp được cập nhật dù tin mới không nhắc lại từ khóa.
- Tin phù hợp → tối đa 2 đoạn knowledge/job có nguồn và đúng phần khớp; lặp đoạn không chèn lại, file của brand khác không được chèn.
- Config brand thiếu/hỏng không được biến thành gate rỗng để recall; symlink không được kéo lời thô journal vào kho tìm.
- Hai session ID khác nhau, dù trùng đuôi 8 ký tự, có journal riêng; resume không nạp lặp đoạn yếu, compact nạp lại scope cũ, restore nguồn A→B→A không bị bỏ qua.
- Không lấy nhãn "tham khảo" làm bảo đảm thông tin vẫn hiện hành; file nguồn bị xóa/rỗng và lesson hết hạn phải được thu hồi/cập nhật rõ.

### 11.9. `/learn` và discovery

- Không đối số/có nguồn giữ đúng yêu cầu; `/learn` đang streaming đi follow-up, command trùng tên không bị thay thế.
- Chưa duyệt/từ chối không thay Skill active; duyệt tài liệu chưa chạy vẫn được lưu/bật với trạng thái đúng, không ép pilot.
- Fresh OMP session thấy kho Staff và Skill Creator; task tương tự tìm/đọc đúng procedure, ngoài scope không ép áp dụng. Các provider/vendor Skill cũ không mất.
- Feedback sửa output và giữ evidence; cập nhật Skill cần approval riêng. Proposal cũ không ghi đè thay đổi cạnh tranh; resume/compact đọc đúng proposal/policy.
- Project-only Skill qua đúng gate/index và không được nạp trong training không Project. Kiểm cấu trúc/nguồn/discovery không đồng nghĩa procedure đã thành công nghiệp vụ.


## 12. Cách factory dùng spec để tạo Staff

Khi có yêu cầu tạo một Staff cụ thể:

1. Xác định vai trò, outcome, phạm vi, công cụ cần có và tiêu chí hoàn thành.
2. Chọn tên và đường dẫn riêng dưới `OS Staff`; kiểm tra nội dung có sẵn trước khi ghi.
3. Tạo repository metadata `README.md`, `VERSION`, `CHANGELOG.md`; README phải ghi rõ đây là OS Staff và role/ID, không dùng mô tả generic có thể áp cho mọi Staff.
4. Tạo starter files có nội dung thực, gồm `knowledge/README.md`, `journal/README.md`, `memory/README.md` và routing từ entrypoint/learning; không chỉ đổi tên một prompt chung.
5. Ghi Staff được tạo theo `OS Staff Starter Spec V0.2.16`, ví dụ trong metadata đầu `AGENTS.md` và `VERSION`; `AGENTS.md` có khối ranh giới máy tính/trình duyệt §3.17, routing bộ nền §§3.18–3.19, dòng hệ sinh thái §3.20, quy tắc sổ feedback brand §3.21 (gate đọc `brand/feedback.md`; ghi ngay feedback brand với mức/tiêu chí/câu báo; Team Lead biên tập `brand/`) và dòng `io-map` §3.22.
6. Chỉ đưa vào Staff `USER.md` bổ sung/override đã xác nhận đúng vai trò; route context chung tới Intelligence, không copy profile hoặc nhập memory cũ.
7. Tạo skill/knowledge ban đầu theo nhu cầu thực, không nhồi sẵn mọi kỹ năng.
8. Nối entrypoint/skill discovery vào harness đang sử dụng nếu cần, không tạo nhiều bản nội dung.
9. Khởi tạo standalone Git repository tại root Staff: `git init -b main`, có `.gitignore` cho secrets/cache/temp, rà inventory để loại secrets và media nặng, rồi tạo root commit local `chore(staff): bootstrap <staff-id>`. Yêu cầu tạo Staff là approval cho riêng bước này; không remote/push/tag. Nếu người dùng nói rõ chưa dùng Git, dừng ở filesystem và ghi registry là instance chưa hoàn chỉnh. Khi bootstrap cùng Project, commit Project trước theo §9.6. Nếu đăng ký Orca, làm sau bước này để repo có kind `git`.
10. Cài learning loop (§8.8): copy `11-factory/staff-runtime/learning-loop.ts` vào `.omp/hooks/pre/`; tạo `.omp/learning-loop.json` (brand Staff sẽ làm, `file` trỏ `brand/feedback.md` của Project đó, `context` liệt kê `brand/guidelines.md` và node `brand/formats/*` hợp với vai Staff, hoặc `{"brands": []}`); `.gitignore` có `.omp/*`, `!.omp/hooks/`, `!.omp/learning-loop.json`, `journal/sessions/`; viết `MEMORY.md`, `memory/README.md`, `LEARNING.md` (mục brand theo §3.21: ghi ngay vào sổ, không chờ chốt), `journal/README.md`, `AGENTS.md` theo §8.8 (ví dụ giả: Mia — Content Writer, `mia-content-writer`). Smoke: một tin nhắn tạo file phiên, lệnh chốt chèn chỉ dẫn, `git status` chỉ thấy hook + config; nhắc brand trong phiên không gắn Project → output áp dụng rule đã chốt của brand.
   Cài `/learn` (§8.9): copy `11-factory/staff-runtime/learn.ts`; cài Skill Creator upstream nguyên bản tại `skills/skill-creator/` với license/provenance lock, cấu hình `.omp/config.yml` cho `skills.customDirectories` và allowlist file config này. Giữ custom directory/provider có sẵn, không bật memory backend. Viết routing/approval tại LEARNING và AGENTS; fresh OMP smoke discovery và vòng proposal → duyệt → dùng lại, không nhầm với gate pilot cho mọi Skill.
   Cài hai bộ nền bắt buộc (§3.18), chạy từ root Staff: `omp plugin install impeccable@impeccable --scope project`; `omp plugin install superpowers@superpowers-marketplace --scope project`. Giữ riêng registration/lock trong Git theo allowlist, loại cache/node_modules và `.superpowers/`; fresh OMP kiểm catalog/bootstrap, không chỉ ghi tên trong AGENTS hoặc dựa vào global plugin.
   Kiểm Browser Use bắt buộc (§3.19): Skill global discover được trong fresh OMP, CLI + wrapper `bu-headless` khả dụng; routing public/headless và login/Orca profile `Agent` đúng. Dùng lại dependency có sẵn, không copy Skill, tự gắn Chrome hoặc thêm MCP server.
   Cài danh bạ hệ sinh thái (§3.20): copy `11-factory/shared-runtime/ecosystem-catalog.ts` vào `.omp/hooks/pre/`, thêm dòng hệ sinh thái vào `AGENTS.md` và thêm dòng Staff vào [[11-factory/catalog]]. Smoke: fresh OMP không gắn Project kể đúng các Project/app.
   Cài Skill `io-map` (§3.22): copy `.agents/skills/io-map/` của Intelligence vào `skills/io-map/`, thêm vào `skills/README.md` và một dòng routing trong `AGENTS.md`. Smoke: fresh OMP tại root Staff có `io-map` trong catalog.
11. Nếu Staff sẽ làm với OS Projects, thêm Project binding/Context Gate, conditional Skill index và chạy scenario với [[11-factory/specs/os-projects-starter-spec]] V0.2.1; không tự nâng mọi instance Project.
12. Dùng một job thực để chạy các acceptance scenarios phù hợp; kiểm tra mọi link/heading, locator hai chiều theo root được khai báo và Git state, không chỉ tìm chuỗi wikilink.
13. Sau root commit, đề xuất checkpoint Git khi có mốc đáng lưu; không tự commit/push.

Tài liệu này cho phép dùng làm cơ sở thiết kế Staff, không phải lệnh tạo ngay mọi Staff. Bước Git init chỉ áp dụng cho Staff đang được tạo theo yêu cầu hoặc Staff được người dùng giao bổ sung Git; không init hàng loạt folder có sẵn.

Staff được tạo từ một phiên bản không tự động nâng cấp khi factory sửa spec. Thay đổi spec sau này cần được xem xét trước khi áp dụng vào Staff đang có công việc và memory riêng.

## 13. Những gì chưa thuộc V0.2.16

- Tự xây agent harness hoặc orchestration framework.
- Bắt buộc Hermes Agent, OpenClaw hoặc một model provider.
- Background learning luôn chạy, cron, hook gọi model nền hoặc automation học riêng ngoài hai adapter `learning-loop`/`learn`; plugin hooks upstream của hai bộ nền thuộc §3.18, không là quyền tự học nền.
- Vector database, graph database, wiki compiler hoặc công thức chấm điểm promotion riêng.
- Auto-commit, auto-push hoặc tự mở rộng quyền theo mức độ tin cậy.
- Chia sẻ và đồng bộ memory tự động giữa mọi Staff; hồ sơ người dùng dùng chung cho mọi Staff (kiểu "About me").
- Tự chuyển, dọn hoặc gộp memory bằng code/model (archive chỉ qua đề xuất lúc chốt); tìm lại tự động trong hội thoại cũ; phát hiện mâu thuẫn bằng code/model.
- Thư viện gu sáng tạo và cơ chế calibration nâng cao của đề xuất V0.3.

Nguyên tắc mở rộng: có vấn đề quan sát được, có thay đổi nhỏ giải quyết nó, có cách kiểm chứng, rồi mới nâng spec.

## 14. Duy trì lịch sử spec

- Phần hiện hành phải thể hiện rõ phiên bản đang áp dụng.
- Giữ lịch sử quyết định để biết vì sao một ý tưởng được chấp nhận, thay thế hoặc hoãn.
- Mỗi lần nâng phiên bản ghi: vấn đề từ trải nghiệm, thay đổi, điều không đổi, cách kiểm chứng và tác động lên Staff đã tạo.
- Không biến ý tưởng brainstorming thành yêu cầu đã chốt.
- Không nâng phiên bản chỉ vì có thêm ý tưởng; người dùng quyết định sau trải nghiệm.
- Thêm hạng mục cài đặt bắt buộc mới vào §12 bước 10 (plugin, Skill, CLI, hook dùng chung): cùng lượt nâng [[11-factory/specs/os-projects-starter-spec]] theo quy tắc tương đương §4.2 của spec đó, trừ cơ chế học riêng vai Staff; loại trừ khác cần người dùng duyệt.
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

Spec này tổng hợp quyết định thiết kế và nghiên cứu tài liệu/source công khai. Evidence triển khai thuộc [[11-factory/registry]] của từng learner instance; mỗi learner tự kiểm bootstrap, Project Gate, learning reuse, concurrent shared edits và bàn giao đa harness. Không kế thừa kết quả của người phát hành; V0.2 không triển khai creative-learning V0.3.
