---
name: io-map
description: Khung làm việc Input/Output kèm bản đồ Excalidraw sống (tong-quan.excalidraw, mỗi hàng input → AI Agent → output). Chỉ dùng khi người dùng cho phép theo dõi Input/Output cho một việc cụ thể — người dùng gọi `/skill:io-map`, nói rõ muốn theo dõi Input/Output hoặc muốn có/vẽ/cập nhật bản đồ tổng quan, tong-quan.excalidraw cho việc đó — hoặc khi việc đang làm đã có mục `## Bản đồ Input/Output` do người dùng bật trước đây và vừa có quyết định, đổi bước hay câu chờ người dùng mới. Khi đã bật — Output trước, Input sau, tách input thiếu thành hạng mục con, trình từng khối nhỏ, hai cổng spec rồi plan, cập nhật bản đồ ngay sau mỗi quyết định hoặc đổi bước. Không tự bật chỉ vì việc có nhiều hạng mục, nhiều vòng chốt, sắp giao worker/Staff, chọn công cụ, phát sinh chi phí hay người dùng hỏi "đang tới đâu"; chưa được bật thì làm theo luồng bình thường và không nhắc, gợi ý hay hỏi về việc bật Skill này.
---

# io-map — Input/Output rõ và bản đồ sống

Skill này giúp người dùng theo dõi toàn cảnh: giao phẩm đang làm rõ, input còn thiếu và quyết định đang chờ. Markdown giữ cách làm việc; bản đồ Excalidraw có thể mở song song trong Orca để theo dõi.

## 0. Chỉ bật khi người dùng cho phép

Người dùng quyết định việc nào cần theo dõi Input/Output; Agent không tự bật. Bật khi:

- người dùng gọi `/skill:io-map`, hoặc nói rõ muốn theo dõi Input/Output, muốn có bản đồ tổng quan cho việc đó;
- việc đã có mục `## Bản đồ Input/Output` từ trước: tiếp tục cập nhật theo §4.

Chưa được bật thì làm theo luồng bình thường của repo (brainstorming, WORK/checkpoint, duyệt theo quy tắc hiện hành): không tạo mục `## Bản đồ Input/Output`, không sinh hay mở `tong-quan.excalidraw`, không áp hai cổng spec/plan của Skill này. Cũng không hỏi, gợi ý hay nhắc việc bật Skill này trong câu trả lời; người dùng biết lệnh và tự bật khi cần.

## 1. Khung Input/Output

Với mỗi hạng mục:

1. **Output trước.** Giao phẩm trông thế nào: dạng file hoặc công cụ, các phần bên trong, **tiêu chí xong**. Người dùng phải hình dung được Output trước khi việc bắt đầu.
2. **Input sau.** Ghi những gì người dùng đã có, rồi đề xuất input còn thiếu.
3. **Phân rã.** Input chưa có thành hạng mục con, cũng có Output/Input riêng. Lặp đến khi mọi input đã có hoặc người dùng cung cấp được.
4. **Mục tiêu là gốc.** Mọi hạng mục lớn phục vụ một mục tiêu. Mục tiêu chưa chốt thì hỏi sớm, vì nó quyết định nhiều lựa chọn phía dưới (chọn đối thủ, người đọc, tỉ trọng). Quyết định nào phụ thuộc mục tiêu chưa chốt thì ghi là tạm.
5. **Chốt từ lá lên gốc.** Chốt Output của phần này rồi mới sang phần dùng nó.
6. **Người đọc quyết định nơi lưu.** Output người dùng theo dõi đặt ở công cụ người dùng dùng (ví dụ Google Sheets). Output chỉ để Agent/Staff tra cứu thì lưu file (JSONL/Markdown), người dùng không cần xem.
7. **Tách làm rõ với thực thi.** "Output đã chốt" chưa có nghĩa là đủ input để chạy. Việc tay chân giao worker model rẻ; phân tích, suy luận do Agent chính làm.

### Hai cổng: spec rồi plan

- **Spec** gồm Output, Input và tiêu chí xong của từng hạng mục. Người dùng duyệt thì cột `Output chốt` chuyển sang `chốt`. Chưa duyệt spec thì chưa làm.
- **Plan** gồm các bước nhỏ, ai làm (Agent, worker hay Staff, dùng model nào), mỗi bước kiểm theo tiêu chí xong bằng cách nào, và chi phí hay quyền nào cần người dùng duyệt. Plan bắt buộc có cổng riêng khi thực thi có **lựa chọn đáng kể**: chọn công cụ hoặc dịch vụ, phát sinh chi phí, cần quyền hoặc credentials, giao worker hoặc Staff, hay khó hoàn tác. Lý do: người dùng muốn thống nhất cách làm và công cụ trước khi chạy, không để Agent tự chọn.
  - Viết plan cho **cả đợt chạy** (ví dụ A + B chạy chung một worker), không viết cho từng hạng mục. Khi người dùng vừa chốt spec mà đợt chạy có lựa chọn đáng kể, câu trả lời lượt đó **chính là bản plan**: ghi mục `## Kế hoạch` theo mẫu dưới, đưa câu "duyệt kế hoạch đợt …" vào `Chờ người dùng`, rồi trình người dùng từng bước. Không chỉ liệt kê các lựa chọn. Người dùng duyệt thì đổi trạng thái đợt thành `đã duyệt <ngày>` và cột `Thực thi` mới chuyển sang `đang chạy`.

    ```markdown
    ## Kế hoạch

    ### Đợt 1 · A + B — chờ duyệt

    | Bước | Hạng mục | Ai làm (model) | Kiểm bằng | Chi phí / quyền cần duyệt |
    | --- | --- | --- | --- | --- |
    | 1 | A | worker phù hợp | đủ 8 kênh, mỗi kênh có Chọn? | dịch vụ mẫu: chi phí cần duyệt; token người dùng tự điền `.env` |
    ```
  - Người dùng nói "làm đi", "chạy đi" ngay lúc chốt spec thì đó là duyệt spec, **chưa phải duyệt plan**. Nếu đợt chạy có lựa chọn đáng kể, kể cả chỉ là giao Staff, lượt đó vẫn trình plan trước, không tự giao việc hay chạy phần "không tốn tiền". Chỉ bỏ bước này khi người dùng nói rõ không cần duyệt kế hoạch.
  - Không có lựa chọn đáng kể (chỉ có một cách làm hiển nhiên): lúc trình spec ghi thêm một dòng `Cách làm: …`. Người dùng duyệt spec là duyệt luôn cách làm, không phải duyệt hai lần.
  - Gặp ca lưng chừng thì hỏi một câu ngắn "đợt này có cần người dùng duyệt cách làm không?", không tự bỏ qua bước plan.

## 2. Trình để người dùng chốt

Người dùng trả lời bằng cách trích từng khối của Agent rồi ghi "Đồng ý", "Bỏ" hoặc sửa ngay bên dưới. Vì vậy:

- Mỗi đề xuất là **một khối nhỏ, đánh số**, có khuyến nghị và lý do.
- Khi trình một Output, kèm **một dòng mẫu đã điền đủ** (dữ liệu minh họa, ghi rõ là minh họa) và **1–2 tiêu chí xong**. Nếu chỉ có tên cột, người dùng phải hỏi lại "cột này là gì".
- Thuật ngữ mới có ví dụ cụ thể. Tên tiếng Anh chuyên môn được giữ, kèm giải thích tiếng Việt.
- **Nói rõ giả định về thực tế** để người dùng sửa được. Ví dụ "em giả định video đối thủ do họ tự quay". Người dùng thường sửa giả định bằng hiểu biết ngành.
- Điều người dùng chốt ghi ngay vào Markdown nguồn, kèm ngày và nguyên văn câu của người dùng. Đề xuất chưa chốt để ở mục riêng, không nâng thành quyết định.
- Người dùng hỏi "đang tới đâu, cái gì cần người dùng chốt?" thì trả lời theo ba phần: đã chốt, **một việc cần chốt bây giờ**, bước tiếp.
- Trước khi trình một lượng lớn thông tin (báo cáo research, bảng nhiều cột), cập nhật bản đồ trước rồi dẫn người dùng từng phần.

### Dùng cùng Superpowers

Repo có Superpowers thì Skill `brainstorming` vẫn chạy. Hai Skill chia việc như sau:

- **`brainstorming` lo cách hỏi:** tìm hiểu người dùng muốn gì và vì sao trước, mỗi lượt một câu, nêu các hướng làm.
- **`io-map` lo nơi ghi và bản đồ:** spec ghi vào mục `Đã chốt` và bảng hạng mục, plan ghi vào mục `## Kế hoạch`, cả hai trong chính file theo dõi việc. Không tạo `docs/superpowers/specs` hay `plans` riêng, vì như vậy thành hai nguồn lệch nhau. `brainstorming` và `writing-plans` đều cho phép preference của người dùng ghi đè nơi lưu, và đây là preference đó.
- **`writing-plans` dùng có chọn lọc:** giữ cách chia bước nhỏ, mỗi bước có cách kiểm theo tiêu chí xong. Bỏ phần test trước và commit theo task, vì đó là kiểu làm code.
- **Bản đồ Excalidraw là bề mặt hình chính.** Chỉ mở Visual Companion (tab trình duyệt) khi cần xem mockup cụ thể và người dùng đồng ý.

Phạm vi: Intelligence, Staff, Project. Repo app trong `OS Builder` không cài `io-map` và giữ nguyên luồng Superpowers (brainstorm → spec → plan → code, hồ sơ ở `docs/superpowers/`).

## 3. Dữ liệu bản đồ: một nguồn trong Markdown

Bản đồ được sinh ra từ mục `## Bản đồ Input/Output` trong file theo dõi việc. Không sửa tay file `.excalidraw`, cũng không chép bảng hạng mục sang nơi khác.

| Nơi làm | File chứa mục | Bản đồ sinh ra |
| --- | --- | --- |
| Project (Team Lead hoặc Staff được giao) | `work/<workstream>/WORKSTREAM.md` | `work/<workstream>/tong-quan.excalidraw` |
| OS Intelligence | `03-work/<việc>/WORK.md` | `03-work/<việc>/tong-quan.excalidraw` |
| Staff, việc riêng/training | `jobs/<job>.md` | `jobs/<job>.tong-quan.excalidraw` |

Staff làm việc thuộc Project thì dùng bản đồ của workstream Project, không tạo bản thứ hai trong repo Staff.

Mẫu (giữ đúng tên mục và tên cột; cột thiếu thì bỏ trống):

```markdown
## Bản đồ Input/Output

<!-- io-map: dữ liệu của tong-quan.excalidraw; sửa ở đây rồi chạy io-map -->

- Tiêu đề: Kênh Mẫu · Content Direction (ví dụ)
- Mục tiêu: chưa chốt — người dùng làm kênh để đạt điều gì
- Bước hiện tại: worker đang chạy A + B
- Chờ người dùng:
  - Mục tiêu kênh
  - Công cụ xuất dữ liệu bị dừng: cần thử lại hay đổi cách xuất?

### Hạng mục lớn 1 · Content Direction
Nghiên cứu đối thủ (A → B → C) rồi chốt bảng cho kênh mình (1)

| # | Output | Giao phẩm | Input | Tiêu chí xong | Output chốt | Thực thi | Link |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A | Kênh đối thủ | Tab Kênh đối thủ: 8 kênh, 6 cột | Tiêu chí ≥3 bài/tuần; 8 kênh mẫu người dùng gửi | Đủ 8 kênh | chốt | đang chạy | https://docs.google.com/... |
| 1 | Content Direction Brand Mẫu (ví dụ) | Tab Content Direction | CD đối thủ (C); Mục tiêu của người dùng (thiếu) | | chờ duyệt | chưa chạy | |
```

- `Mục tiêu:` bắt đầu bằng `chưa chốt` → ô mục tiêu đỏ nét đứt.
- `### ...` là một hạng mục lớn. Dòng chữ ngay dưới là ghi chú của nhóm.
- **Input**: các input cách nhau bằng `;`. Input là Output của hạng mục khác thì ghi mã hạng mục đó trong ngoặc, ví dụ `Kênh đối thủ (A)`. Không đánh `(thiếu)` cho loại input này, vì thứ tự phụ thuộc đã thể hiện việc chờ. Chỉ đánh `(thiếu)` hoặc `(chưa có)` khi **không hạng mục nào tạo ra** input đó và người dùng chưa cung cấp, ví dụ `Mục tiêu của người dùng (thiếu)`. Input loại này hiện chữ đỏ, mũi tên nét đứt, và cần thành hạng mục con hoặc một câu trong `Chờ người dùng`.
- **Output chốt**: `chốt` | `chờ duyệt` | `chưa`. Hiện thành ô vuông màu trước tên Output.
- **Thực thi**: `chưa chạy` | `đang chạy` | `xong` | `kẹt`. Hiện thành màu nền ô `AI Agent`.
- **Link**: URL (Sheets, Figma) hoặc đường dẫn tới giao phẩm thật. Khi có link, bấm vào chữ Output trên bản đồ sẽ mở giao phẩm.
- `Chờ người dùng:` liệt kê câu hỏi đang chờ. Bản đồ hiện 3 câu đầu, phần còn lại ghi "… và N câu nữa".

## 4. Chạy và cập nhật

```bash
bun <thư mục chứa SKILL.md này>/scripts/io-map.ts <file.md>            # ghi bản đồ
bun <thư mục chứa SKILL.md này>/scripts/io-map.ts <file.md> --check    # chỉ kiểm dữ liệu, không ghi
```

Cập nhật bản đồ **cùng lượt** với Markdown khi:

- người dùng chốt, bỏ hoặc sửa một điều;
- đổi bước: bắt đầu chạy, chạy xong, bị kẹt, chờ người dùng làm gì đó;
- danh sách `Chờ người dùng` thay đổi (thêm câu mới, người dùng đã trả lời);
- giao phẩm có link thật.

Dải "Bước hiện tại" từng bị cũ vì chỉ được cập nhật khi người dùng chốt quyết định. Đổi bước cũng phải cập nhật.

Lần đầu tạo bản đồ, mở cho người dùng trong Orca:
`orca plugin open stablyai.orca-excalidraw --editor "<đường dẫn tuyệt đối tới .excalidraw>"`

Muốn kiểm hình trước khi báo xong:
`orca plugin shot stablyai.orca-excalidraw --editor "<file>" --width 1500 --height 2300 --out /tmp/io-map.png`
Ảnh chụp chỉ thấy phần đầu canvas. Muốn xem phần dưới thì chụp một bản sao trong `/tmp` đã dịch các phần tử lên.

## 5. Khi người dùng sửa trên canvas

- Phần người dùng vẽ thêm (ghi chú, hình, mũi tên) luôn được giữ.
- Nếu người dùng sửa hoặc xóa phần do io-map sinh ra, script **dừng, không ghi đè**, và liệt kê từng chỗ. Đọc danh sách đó, đưa thay đổi vào Markdown, báo người dùng một dòng, rồi chạy lại với `--force`.
- Agent chỉ đọc được bản người dùng đã lưu. Nhắc người dùng bật Orca **Settings → Editor → Auto Save Files**. Nếu tab của người dùng đang lẫn bản cũ, người dùng đóng tab, chọn **Don't Save**, rồi mở lại.

## 6. Hình thức

Bản đồ dùng Excalifont nét tay (hiện đúng dấu tiếng Việt; `fontFamily: 5`). Ô giữa mỗi hàng luôn ghi `AI Agent`; tên hạng mục nằm ở phía Output, vì hạng mục được gọi theo giao phẩm nó tạo ra. Phần trên có hai mức: **Tổng quan** (các hạng mục lớn → mục tiêu) và **Chi tiết** (mỗi hạng mục lớn một khung nét đứt, mỗi hạng mục một hàng). Muốn đổi bố cục thì sửa script ở nguồn Factory, không sửa riêng bản trong từng repo.
