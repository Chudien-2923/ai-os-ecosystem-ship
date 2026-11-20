# Input/Output rõ + bản đồ Excalidraw sống

Cách làm cho việc có nhiều hạng mục người dùng phải chốt qua nhiều vòng: mọi hạng mục có Output và Input rõ trước khi làm, và có một bản đồ Excalidraw cập nhật theo từng quyết định để người dùng luôn thấy tổng thể khi brainstorm với Agent.

- Status: phương pháp đi kèm Ship; mỗi learner instance tự ghi evidence khi áp dụng.

## Mục tiêu

- Người dùng không bị chệch hướng hoặc "mất phương hướng" giữa các vòng brainstorm dài.
- Mỗi quyết định có đủ dữ kiện: biết mình đang chốt phần nào, phần đó phục vụ giao phẩm và mục tiêu nào, còn thiếu input gì, đang chờ người dùng điều gì.

## Phạm vi

Áp dụng cho Intelligence, mọi Staff và Team Lead của mọi Project, nhưng **chỉ khi người dùng cho phép cho từng việc**: gọi `/skill:io-map` hoặc nói rõ muốn theo dõi Input/Output; việc đã có bản đồ thì tiếp tục cập nhật. Chưa được bật thì làm theo luồng bình thường, không tự bật chỉ vì việc nhiều hạng mục và không gợi ý bật. Repo app trong `OS Builder` không cài `io-map`.

## Cách làm

Nguồn duy nhất là Skill `io-map`: bản canonical ở `.agents/skills/io-map/` của Intelligence, Factory copy sang từng Staff và Project. Skill gồm:

- khung Input/Output, trong đó mục tiêu là gốc;
- cách trình để người dùng trích từng khối trả lời, kèm dòng mẫu đã điền và tiêu chí xong;
- dữ liệu bản đồ nằm trong mục `## Bản đồ Input/Output` của file theo dõi việc;
- script `scripts/io-map.ts` sinh `tong-quan.excalidraw`, khi nào phải cập nhật, và cách xử lý khi người dùng sửa trên canvas;
- cách dùng cùng Superpowers `brainstorming`: `brainstorming` lo cách hỏi, nơi ghi vẫn là file theo dõi việc;
- hai cổng spec rồi plan: plan theo đợt chạy ở mục `## Kế hoạch`, bắt buộc khi thực thi có lựa chọn đáng kể (công cụ, chi phí, quyền, giao worker/Staff, khó hoàn tác); "làm đi" lúc chốt spec chưa phải duyệt plan.

Test hồi quy: `bun test 11-factory/shared-runtime`.

## Ngữ pháp bản đồ

- Mỗi hạng mục một hàng, input → ô giữa → output; ô giữa luôn ghi `AI Agent`, tên hạng mục nằm phía Output.
- Mũi tên bắt đầu sát chữ, cong nhẹ; gom các hàng theo hạng mục lớn trong khung nét đứt.
- Hai mức: tổng quan (hạng mục lớn → mục tiêu) và chi tiết từng hạng mục.
- Mục tiêu là gốc: chưa chốt thì ô Mục tiêu hiện đỏ nét đứt.
- Màu ô `AI Agent` thể hiện thực thi; ô vuông trước Output thể hiện Output đã chốt chưa; input thiếu hiện chữ đỏ, mũi tên nét đứt; ô "Chờ người dùng" liệt kê câu hỏi đang chờ.
- Bấm vào Output để mở giao phẩm khi có cột `Link`.
- Một nguồn dữ liệu: script đọc thẳng bảng trong Markdown; cập nhật cả khi đổi bước, không chỉ khi có quyết định.

## Giới hạn đã biết

- Phương pháp mới được chứng minh rõ ở pha làm rõ Output của một workstream; pha thực thi và nghiệm thu cần learner tự kiểm.
- Ảnh chụp `orca plugin shot` chỉ thấy phần đầu canvas; muốn kiểm phần dưới phải chụp bản sao đã dịch phần tử.
- Script giữ phần người dùng vẽ thêm và dừng (không ghi đè) khi người dùng sửa phần do script sinh ra.
