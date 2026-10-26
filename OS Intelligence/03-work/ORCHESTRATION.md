# Điều phối worker

Đọc khi một yêu cầu cần giao Staff hoặc phối hợp worker; brainstorming/tra cứu nhỏ không tự dispatch.

## Trước khi giao

- Chọn đúng WORK; giữ outcome, target workspace/files, scope training hay Project, ownership, constraints và acceptance quan sát được.
- Project-bound assignment phải có Project ID, repo locator và workstream; Staff vẫn chạy Project Context Gate.
- Dùng **Progressive Context Gate**: `Read first` cho minimum sufficient context, `Read if needed` cho dependency có thể phát sinh, `Do not preload` cho history/docs/scope không liên quan. Không dán toàn Intelligence hoặc dữ liệu cá nhân không cần thiết.
- Task prompt là outcome contract, không là implementation script. Worker phải biết đích đến, checkpoint hiện tại, nguồn phải đọc, phần mình sở hữu, boundary không được vượt và cách chứng minh completion.
- Bounded task dùng một đoạn ngắn; task phức tạp/rủi ro cao dùng sáu semantics: Outcome/Target, Current checkpoint, Context locators, Ownership, Hard boundaries và Observable acceptance. Chuẩn hóa ý nghĩa, không bắt điền filler.
- Không lặp lifecycle preamble, system rules hoặc toàn bộ source-of-truth vào Task spec. Dùng locator + current delta; correction trong active loop chỉ cần exact defect, evidence và regression acceptance khi boundary cũ còn hiệu lực.

## Worker topology

- Mỗi coherent slice mặc định có một implementation owner; không chia nhiều editor chỉ vì có thể tách file.
- Chỉ parallel implementation khi ba điều kiện đều rõ trước dispatch: ownership không giao nhau, interface contract xác định được và verification boundary độc lập. Thiếu một điều kiện thì owner làm tuần tự.
- Read-only research/review có thể parallel và gửi bounded findings cho implementation owner. Shared config, schema, package, plan và source-of-truth mặc định thuộc integration owner.

## Model và context routing

- Chọn model theo rủi ro: model mạnh cho implementation/high-risk judgment; model rẻ hơn cho bounded read-only research, reconciliation hoặc documentation khi chất lượng đã được pilot trên task thật.
- Giữ cùng model trong một feedback loop để bảo toàn reasoning/cache; đổi model tại natural gate bằng fresh worker, không đổi giữa vòng correction.
- Context window là giới hạn, không phải mục tiêu dùng hết. Khi provider có long-context pricing tier, đặt autocompact theo từng model ở phía an toàn trước tier đó và kiểm tra catalog/runtime hiện hành; không copy ngưỡng cũ như hằng số.
- Bounded task thường xuyên chạm compact là tín hiệu review scope, preload, tool loop và lifecycle. Compact giữ file/runtime authority nhưng có thể làm nghèo nuance chỉ có trong conversation.

## Verification ownership

- Implementation owner chạy affected behavior tests cùng integration/full-suite/typecheck/build/migration smoke mà plan yêu cầu; ghi exact command/result, limitation và gate chưa đạt.
- Coordinator mở output/evidence thật, review boundary rủi ro và chạy changed-path smoke độc lập cho behavioral change. Không mặc định lặp toàn bộ suite chỉ để tái tạo cùng kết quả.
- Coordinator full-rerun tại natural slice gate, schema/transaction/security hoặc production/provider boundary, sau correction ảnh hưởng rộng, hay khi evidence thiếu/đáng ngờ. Research/docs kiểm tra nguồn, claim và artifact tương ứng.

## Natural Gate Receipt

- Mỗi accepted slice/subsystem gate có một current durable receipt; runtime giữ attempt history, không tạo receipt cho mọi Dispatch.
- Worker draft/update cùng receipt trong feedback loop. Coordinator chỉ accept sau khi evidence mở được, changed-path smoke đạt, blocker/non-claim đầy đủ và next locator đủ để tiếp quản.
- Receipt giữ Outcome, Implemented, Contracts/invariants, Evidence, Open blockers/non-claims, Next context (`Read first`/`Read if needed`/`Do not preload`) và Next ownership. Không paste log, chronological tool activity, source-of-truth hoặc reasoning đã superseded.

## Runtime và continuity

Dùng orchestration runtime thật được môi trường cung cấp và đọc guide đúng version trước khi dispatch. Run/Task/Dispatch không thay role, Project Gate, quyền hoặc durable checkpoint. Timeout, heartbeat và worker nói “done” không chứng minh completion; mở output/evidence và settle theo contract.

- Cùng task/feedback loop: giữ cùng worker. Dispatch còn active thì reply vào đó; attempt đã settlement nhưng correction cùng output thì reuse terminal/worker với authority mới theo runtime guide.
- Sau accepted natural gate và durable receipt đủ tiếp quản: fresh worker được phép cho slice/subsystem mới. Retain worker cũ để hỏi lại không bắt buộc giao bước kế tiếp cho terminal đó.
- Timeout hoặc trạng thái chưa xác minh: inspect/recover trước, không duplicate.
- Retain khi có follow-up gần; release khi output đã được chấp nhận, work đóng/hoãn hoặc không còn nhu cầu tra cứu. Không giữ worker vô thời hạn.
- Trước mỗi worker-start, kiểm tra owner hiện tại. Worker mới cần lý do thật: independent slice, accepted natural gate, worker cũ không thể phục hồi, owner/workspace không còn đúng, context reuse không an toàn có lý do cụ thể hoặc người dùng yêu cầu.

WORK giữ checkpoint và locator bền vững, không giữ credentials. Kết quả chuyên môn ở Staff/Project đúng owner. Xem [[09-knowledge/worker-context-continuity]] cho lifecycle/context scenarios.