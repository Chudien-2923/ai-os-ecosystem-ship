# Học từ công việc

Đọc khi có correction, preference rõ, yêu cầu ghi nhớ, kết quả đáng học hoặc bài học đang chờ review. Không phải checklist sau mọi prompt.

## Vòng học

1. Hiểu sự kiện trong scope hiện tại và sửa hành vi ngay khi correction đã rõ.
2. Phân loại theo bảng dưới; tìm và đọc node đang có trước khi tạo mới.
3. Ghi vài dòng gồm bài học, nguồn/evidence, phạm vi và trạng thái. Suy luận chưa kiểm chứng ở lại WORK/exploration, không thành luật chung.
4. Đủ căn cứ thì cập nhật đúng node và hướng dẫn/index giúp lần sau tìm được. Preference người dùng đã nói rõ không phải hỏi duyệt lần hai.
5. Dùng lại trong trường hợp phù hợp; quan sát kết quả. Nếu sai, sửa/thu hẹp/thu hồi, không để hai chỉ dẫn active trái nhau.
6. Báo ngắn điều thực sự đã lưu; ghi [[log]] ở mốc thay đổi có ý nghĩa, không chép lại bài học.

## Nơi ghi

| Loại | Nguồn chính |
| --- | --- |
| Preference cộng tác chung đã xác nhận | [[USER]] hoặc [[10-context/index]] |
| Kinh nghiệm/chuyên môn Chief of Staff | [[09-knowledge/index]] |
| Phương pháp đã áp dụng thành công để dùng lại | [[08-playbook/index]] |
| Tri thức xử lý từ nguồn ngoài | [[07-wiki/index]], theo [[07-wiki/WIKI]] |
| Diễn biến/correction riêng một việc | WORK được chọn từ [[03-work/index]] |
| Brand facts, gu hoặc feedback Project-specific | Project workstream/node theo approval của Project |
| Kỹ năng chuyên môn của Staff | Learning/skill/knowledge trong đúng Staff repo |
| Version và migration hệ thống | [[11-factory/index]] |

### Một fact, một nơi

- Mỗi fact có đúng một owner theo bảng trên; nơi khác chỉ đặt link, không chép tóm tắt. Bản tóm tắt thứ hai là chỗ sẽ bị cũ đầu tiên.
- Khi sửa một fact, tìm mọi chỗ nhắc tới nó trong file active (cùng file và file khác) và sửa luôn trong cùng lượt. Không sửa được thì ghi rõ chỗ còn lệch vào WORK đang làm.
- Đề xuất người dùng chưa chốt (trả lời mơ hồ, đồng ý rồi chuyển chủ đề, hoặc chưa trả lời) không phải quyết định. Ghi vào mục `## Đang cân nhắc` của đúng owner: `- YYYY-MM-DD · <đề xuất> · chưa chốt · nguồn: <session/WORK>`. Khi người dùng chốt thì chuyển lên phần đã chốt, khi người dùng bỏ thì xóa dòng.

### Session chưa đối soát

Hook `freshness` ([[11-factory/index]]) liệt kê ở đầu session những session cũ chưa đi qua `pre-compact`/`close` (kể cả session mở ngoài các repo của hệ sinh thái) và các dấu hiệu Markdown cũ. Khi người dùng đồng ý, đối soát theo Skill `pre-compact` chế độ đối soát session cũ; xong mỗi session chạy `bun 11-factory/intelligence-runtime/freshness-cli.ts mark <id>`. Không tự mở rộng sang việc khác.

## Bằng chứng và truy xuất lại

Preference có nguồn là chỉ dẫn rõ của người dùng. Procedure cần đã chạy và mở output; creative judgment cần brief/reference/feedback, không chỉ Agent tự chấm đẹp. Kiến thức bên ngoài cần nguồn và giới hạn, lặp lại nhiều không chứng minh đúng.

Ví dụ “brief đã rõ, đừng hỏi ba vòng” chỉ hỗ trợ bài học: đủ đầu ra/Project/giới hạn thì giao việc, không hỏi để điền mẫu. Không suy thành “không bao giờ hỏi”. Bài học giao việc phải được link từ [[03-work/ORCHESTRATION]]; bài học Factory từ [[11-factory/index]]. Chỉ có file mà không có đường dùng lại là chưa hoàn tất việc ghi nhớ.

Trước khi tiếp nhận vào shared file, đọc bản mới nhất. Nếu session khác đang sửa cùng nội dung, giữ proposal trong WORK và phân một session hợp nhất. Không suy từ im lặng thành approval đổi role/quyền; approval học không phải approval Git, publish, chi tiền hoặc tăng quyền.

## Review và thu hồi

Kiểm tra scope trước khi kết luận hai bài học mâu thuẫn. Cùng scope thì xem nguồn, thời điểm và quyền quyết định; không chọn mới hơn một cách máy móc. Nội dung thay thế rời tập hướng dẫn active, lịch sử có thể giữ ở work/log/Git. Thông tin phụ thuộc tool/version cần xem lại khi có dấu hiệu lỗi thời.

Kiểm chứng việc học bằng một việc tương tự ở session khác: tìm được bài học, áp dụng đúng, ít correction/công làm lại hơn mà không làm hỏng trường hợp ngoài scope. Chưa chạy thì ghi chưa kiểm chứng, không dùng số file làm thước đo tiến bộ.
