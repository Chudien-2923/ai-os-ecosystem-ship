# Điều phối worker

Đọc khi một yêu cầu cần giao Staff, Project hoặc Builder App Agent, hoặc phối hợp worker; brainstorming/tra cứu nhỏ không tự dispatch.

**Nguồn duy nhất** cho quy tắc điều phối. [[USER]] giữ preference của người dùng; [[09-knowledge/index]] giữ bài học và evidence; log/WORK giữ lịch sử. Thay đổi quy tắc thì sửa tại đây, không chép sang nơi khác.

## Trước khi giao

- Chọn đúng WORK; giữ yêu cầu gốc/feedback quan trọng, outcome, target workspace/files, scope training hay Project, ownership, constraints và acceptance quan sát được.
- Project/Builder-bound assignment phải có owner repo, ID, workstream hoặc app locator và acceptance; Staff vẫn chạy Project Context Gate. Training không tự nạp brand.
- Dùng **Progressive Context Gate**: `Read first` cho minimum sufficient context, `Read if needed` cho dependency có thể phát sinh, `Do not preload` cho history/docs/scope không liên quan. Không dán toàn Intelligence hoặc dữ liệu cá nhân không cần thiết.
- Task prompt là outcome contract, không là implementation script. Worker phải biết đích đến, checkpoint hiện tại, nguồn phải đọc, phần mình sở hữu, boundary không được vượt và cách chứng minh completion. Chỉ khóa thứ tự/cách làm khi đó là business/security invariant hoặc correction có evidence.
- Bounded task dùng một đoạn ngắn; task phức tạp/rủi ro cao dùng sáu semantics: Outcome/Target, Current checkpoint, Context locators, Ownership, Hard boundaries và Observable acceptance. Chuẩn hóa ý nghĩa, không bắt điền filler.
- **Follow-up chỉ gửi delta:** khi worker đã mang context (cùng Dispatch hoặc Dispatch mới trên cùng terminal), spec chỉ gồm `Target`, `Delta` (state/feedback/defect mới và boundary nào thay đổi) và `Acceptance`; ghi “ownership/boundary giữ như Dispatch trước” thay vì chép lại. Full contract chỉ dành cho fresh worker hoặc khi owner/boundary đổi.
- Không lặp lifecycle preamble, system rules hoặc toàn bộ source-of-truth vào Task spec.
- Viết Task spec bằng ngôn ngữ người dùng đọc và audit được; giữ nguyên thuật ngữ chuẩn, tên field, path, lệnh, ID và trích dẫn nguyên văn.

## Worker topology

- Mỗi coherent slice mặc định có một implementation owner; không chia nhiều editor chỉ vì có thể tách file.
- Chỉ parallel implementation khi ba điều kiện đều rõ trước dispatch: ownership không giao nhau, interface contract xác định được và verification boundary độc lập. Thiếu một điều kiện thì owner làm tuần tự.
- Read-only research/review có thể parallel và gửi bounded findings cho implementation owner. Shared config, schema, package, plan và source-of-truth mặc định thuộc integration owner.

## Model và context routing

- Harness của worker là Oh My Pi (OMP); tên model người dùng nêu là model chạy trong OMP, không phải chỉ dẫn đổi harness.
- Chọn model theo rủi ro: model mạnh cho implementation/high-risk judgment; model rẻ hơn cho bounded read-only research, reconciliation hoặc documentation khi chất lượng đã được pilot trên task thật. Launch phải chỉ định model tường minh; kiểm tra model effective, không khẳng định chỉ từ requested args.
- Giữ cùng model trong một feedback loop để bảo toàn reasoning/cache; đổi model tại natural gate bằng fresh worker, không đổi giữa vòng correction.
- Context window là giới hạn, không phải mục tiêu dùng hết. Khi provider có long-context pricing tier, đặt autocompact theo từng model ở phía an toàn trước tier đó và kiểm tra catalog/runtime hiện hành; không copy ngưỡng cũ như hằng số.
- Bounded task thường xuyên chạm compact là tín hiệu review scope, preload, tool loop và lifecycle. Compact giữ file/runtime authority nhưng có thể làm nghèo nuance chỉ có trong conversation.

## Launch và placement

- Dùng Orca thật. Tải guide khớp phiên bản (`orca skills get orchestration`) và kiểm `orca status --json` trước khi dispatch; lệnh chép trong note không phải API bất biến.
- Mỗi luồng supervised có Run; mỗi attempt có Task/Dispatch authority. Address worker bằng Dispatch theo guide; terminal title hoặc ID cũ không cấp authority.
- Worker phải đặt trong đúng Orca workspace của repo đích (với folder workspace: `--worktree "path:<absolute-target-root>"`, truyền lại cùng selector khi reuse terminal). Không tạo worker dưới `OS Intelligence` rồi bù bằng `--cwd` sang repo đích.
- Mỗi `worker-start` truyền `--task-title "<tên mô tả>"` phân biệt owner và outcome; không dùng runtime ID làm title. Runtime chưa hiển thị title thì đổi tên terminal theo guide.

## Theo dõi và nghiệm thu

- Durable enqueue không chứng minh worker đã đọc; heartbeat không là completion; timeout/mất kết nối không chứng minh failure. Worker báo done phải khớp active Dispatch và output/evidence phải mở được.
- Worker hỏi: coordinator trả lời ngay trên Dispatch đó nếu đã có context; chỉ hỏi người dùng khi thiếu quyết định hoặc dữ liệu thật.

### Verification ownership

- Implementation owner chạy affected behavior tests cùng integration/full-suite/typecheck/build/migration smoke mà plan yêu cầu; ghi exact command/result, limitation và gate chưa đạt.
- Coordinator mở output/evidence thật, review boundary rủi ro và chạy changed-path smoke độc lập cho behavioral change. Không mặc định lặp toàn bộ suite chỉ để tái tạo cùng kết quả.
- Coordinator full-rerun tại natural slice gate, schema/transaction/security hoặc production/provider boundary, sau correction ảnh hưởng rộng, hay khi evidence thiếu/đáng ngờ. Research/docs kiểm tra nguồn, claim và artifact tương ứng.

### Natural Gate Receipt

- Mỗi accepted slice/subsystem gate có một current durable receipt; runtime giữ attempt history, không tạo receipt cho mọi Dispatch.
- Worker draft/update cùng receipt trong feedback loop. Coordinator chỉ accept sau khi evidence mở được, changed-path smoke đạt, blocker/non-claim đầy đủ và next locator đủ để tiếp quản.
- Receipt giữ Outcome, Implemented, Contracts/invariants, Evidence, Open blockers/non-claims, Next context (`Read first`/`Read if needed`/`Do not preload`) và Next ownership. Không paste log, chronological tool activity, source-of-truth hoặc reasoning đã superseded.

## Continuity và vòng đời worker

Lý do và scenario: [[09-knowledge/worker-context-continuity]].

- **Reuse trong feedback loop:** feedback, input, câu hỏi hoặc correction của cùng task không phải task độc lập. Dispatch còn active thì gửi vào đúng Dispatch đó; attempt đã settlement thì reuse cùng terminal bằng Task/Dispatch mới, không dùng lại ID đã settlement.
- **Fresh tại natural gate:** slice/subsystem đã nghiệm thu và có receipt đủ tiếp quản thì slice mới có thể dùng fresh worker. Với chuỗi deliverable nhỏ, mỗi deliverable được người dùng duyệt là một natural gate.
- **Đo context tại gate:** tại mỗi natural gate, xem context hiện tại của worker (input + cache của lượt assistant cuối có usage) trong transcript OMP. Nếu đã vượt long-context pricing tier của model đang dùng, deliverable kế tiếp dùng fresh worker với receipt; dưới ngưỡng thì giữ để reuse.
- **Recover, không duplicate:** timeout hoặc trạng thái chưa xác minh không chứng minh worker đã thoát; kiểm tra assignment cũ, inspect/recover theo guide trước khi thay.
- **Chỉ tạo worker mới khi có lý do thực:** lát cắt độc lập hoặc đã qua natural gate; worker cũ xác nhận không thể phục hồi; owner/workspace/quyền/chuyên môn không còn đúng; context cũ xung đột với rủi ro nêu được; hoặc người dùng yêu cầu. Thay worker thì ghi lý do trong WORK; “có feedback mới” tự nó không phải lý do.
- **Retain/release:** retain khi WORK còn một gate đang chờ (người dùng review, câu hỏi, bước kế tiếp đã xác định) và ghi terminal handle vào WORK; release khi WORK đóng/hoãn, bước kế tiếp chuyển owner hoặc người dùng yêu cầu. Quyết định reuse/retain/release ngay lúc nghiệm thu khi terminal còn mở; trước khi reuse handle, kiểm tra handle còn trong `orca terminal list --json`. Retain không giữ worker qua lúc terminal đóng hoặc Orca/máy khởi động lại.

## Boundary khi làm việc xuyên repo

Lý do: [[09-knowledge/cross-repo-ownership-routing]].

- Xác định owner trước khi sửa file: Intelligence, Staff, Project hay Builder app. Được đọc repo đích để hiểu brief, định tuyến và review; quyền filesystem không chuyển ownership.
- Direct cross-repo edit chỉ dành cho thay đổi nhỏ, cơ học, rủi ro thấp, không cần judgment chuyên môn (typo/path/metadata, đồng bộ fact đã chốt). Task nhiều bước, nhiều artifact, source-of-truth lớn hoặc learning riêng là owned task, giao Agent repo đích qua supervised Orca. Không chắc thì coi là owned task.
- Builder app implementation chỉ nằm trong standalone app repo dưới `OS Builder`; Intelligence và Project chỉ giữ context, locator và high-level status.

## Training và học

- Mỗi assignment là một training cycle: chuyển feedback đầy đủ cùng artifact, không rút mất sắc thái; worker sửa deliverable trước, capture exact feedback/source/scope, gọi tên lớp lỗi, route Project/Staff/Intelligence đúng ownership và tự kiểm regression ở task tương tự. Không biến mọi correction thành global rule.
- Intelligence học lỗi chọn owner, làm rõ brief, task contract, truyền feedback và nghiệm thu. Staff học kỹ năng trong đúng repo Staff; brand judgment ở Project.
- Coordinator nghiệm thu cả output lẫn việc Staff đã cập nhật đúng checkpoint/learning route. Tiến bộ đo bằng correction/rework giảm, không bằng số note.

WORK giữ checkpoint và locator bền vững, không giữ credentials. Orca giữ runtime state, không là bản duy nhất của brief/output/quyết định.
