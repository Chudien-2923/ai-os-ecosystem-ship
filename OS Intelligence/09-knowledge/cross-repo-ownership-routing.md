# Routing ownership khi làm việc xuyên repo

- Status: method candidate; mỗi learner instance tự ghi evidence của mình
- Scope: mọi task phát sinh trong OS Intelligence nhưng deliverable hoặc chuyên môn thuộc Staff, Project hoặc Builder app repo khác.
- Quy tắc hiện hành: [[03-work/ORCHESTRATION#Boundary khi làm việc xuyên repo]]. Note này chỉ giữ lý do và scenario.

## Bài học

OS Intelligence được đọc context ở repo đích để hiểu brief, định tuyến và review. Việc có thể truy cập repo trên cùng máy không đồng nghĩa OS Intelligence sở hữu việc triển khai tại đó.

Khi tự làm thay Agent repo đích, Intelligence mất vai trò reviewer độc lập, Staff/Project không học được từ correction và source of truth của repo đích bị sửa ngoài ownership của nó. Vai trò đầu mối với người dùng không phải quyền thay Agent con thực thi.

## Scenario kiểm tra

| Tình huống | Hành vi đúng |
| --- | --- |
| Feedback lớn về nội dung của một Project, cần sửa nhiều source of truth | Owned task: giao Agent của Project qua Orca; Intelligence giữ brief, supervision và nghiệm thu |
| Sửa một dòng ghi lại quyết định người dùng đã chốt trong repo con | Direct edit được phép (đồng bộ fact, không cần judgment chuyên môn) |
| Tính năng mới cho một app trong `OS Builder` | Thuộc repo app; Intelligence chỉ giữ locator và trạng thái cấp cao |
| Không chắc việc nhỏ hay lớn | Coi là owned task |
