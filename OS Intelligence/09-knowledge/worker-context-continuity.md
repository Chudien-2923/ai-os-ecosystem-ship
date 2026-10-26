# Giữ continuity của worker trong feedback loop

- Status: method candidate; áp dụng trên task thật rồi mới nâng thành Playbook
- Scope: supervised orchestration từ OS Intelligence tới Staff hoặc Project
- Evidence boundary: private production evidence không nằm trong Ship; mỗi learner instance tự ghi bằng chứng của mình

## Bài học

Context worker đã đọc và reasoning đã hình thành là tài sản đã trả chi phí. Tạo worker mới giữa cùng một feedback loop buộc đọc lại artifact, dựng lại reasoning và tăng rủi ro lệch ý. Ngược lại, kéo một worker qua nhiều subsystem làm context phình, tăng chi phí và khiến compact dễ làm nghèo nuance.

Mặc định: **reuse trong cùng feedback loop, fresh tại natural gate**.

## Cùng feedback loop

- Dispatch còn active: gửi input, câu trả lời và correction vào đúng worker/Dispatch.
- Attempt đã settlement nhưng correction vẫn dành cho cùng output: reuse cùng terminal/worker bằng authority mới theo runtime guide; không tái sử dụng lifecycle ID cũ.
- Timeout, mất kết nối hoặc trạng thái chưa xác minh không chứng minh worker đã thoát. Inspect/recover trước khi tạo bản sao.
- Retain worker khi có follow-up gần; release khi output đã được chấp nhận, việc đóng/hoãn hoặc không còn nhu cầu tra cứu. Không giữ vô thời hạn.

## Natural gate

Fresh worker hợp lệ khi một slice/subsystem đã có:

1. Output được coordinator nghiệm thu.
2. Durable receipt nêu outcome, phần đã làm, invariants, evidence, blocker/non-claim và context kế tiếp.
3. Ownership của bước mới rõ; worker mới không phải dựng lại toàn bộ lịch sử.

Retain terminal cũ để hỏi lại không bắt buộc slice kế tiếp tiếp tục dùng terminal đó.

## Context và autocompact

- Context window là giới hạn kỹ thuật, không phải mục tiêu sử dụng hết.
- Khi provider có long-context pricing tier, đặt autocompact theo từng model ở phía an toàn trước tier đó; kiểm tra catalog/runtime hiện hành thay vì copy một ngưỡng cố định.
- Compact không xóa filesystem hoặc runtime authority, nhưng summary có thể làm mất nuance chỉ tồn tại trong conversation.
- Một bounded task thường xuyên chạm autocompact là tín hiệu review scope, tool loop, context preload và lifecycle; tăng threshold không sửa thiết kế task quá rộng.

## Khi được tạo worker mới

Cần ít nhất một lý do thật:

1. Deliverable độc lập đủ điều kiện chạy song song, hoặc bước mới đã qua natural gate.
2. Worker cũ đã được xác nhận không thể phục hồi.
3. Owner, workspace, quyền hoặc chuyên môn không còn đúng.
4. Context cũ xung đột tới mức reuse không an toàn và coordinator nêu được rủi ro cụ thể.
5. Người dùng yêu cầu worker mới.

## Scenario kiểm tra

| Tình huống | Hành vi đúng |
| --- | --- |
| Worker đang làm và hỏi input | Reply vào cùng Dispatch |
| Worker vừa hoàn thành, nhận correction cho cùng artifact | Authority mới trên cùng worker/terminal |
| Worker timeout hoặc trạng thái chưa xác minh | Inspect/recover; không duplicate |
| Slice mới sau receipt đã nghiệm thu | Fresh worker được phép |
| Hai deliverable độc lập đủ ba boundary | Có thể chạy song song |

Dấu hiệu đạt: không nạp lại cùng Context Gate chỉ vì coordinator mở worker mới cho correction; đồng thời không kéo một conversation qua nhiều subsystem sau khi đã có checkpoint đủ bàn giao.