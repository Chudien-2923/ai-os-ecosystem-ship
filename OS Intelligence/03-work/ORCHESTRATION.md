# Điều phối Staff

Đọc khi yêu cầu cần giao Staff hoặc phối hợp worker; brainstorming/tra cứu nhỏ không tự dispatch.

## Trước khi giao

- Chọn đúng WORK; giữ outcome, target, scope training/Project, ownership, constraints và acceptance quan sát được.
- Project-bound assignment phải có Project ID, repo locator và workstream; Staff vẫn chạy Project Context Gate.
- Cấp context vừa đủ; không dán toàn Intelligence hoặc dữ liệu cá nhân không cần thiết.

## Runtime

Dùng orchestration runtime thực được môi trường cung cấp và đọc guide đúng version trước khi dispatch. Run/Task/Dispatch không thay role, Project Gate, quyền hoặc durable checkpoint. Timeout, heartbeat và worker nói “done” không tự chứng minh completion; mở output/evidence và settle runtime theo contract.

WORK giữ checkpoint và locator bền vững, không giữ credentials. Kết quả chuyên môn ở Staff/Project đúng owner.