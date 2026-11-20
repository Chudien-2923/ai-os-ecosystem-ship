---
name: brand-curation
description: Phiên tổng hợp và dọn một OS Project do Team Lead của brand chạy tại root Project — đưa feedback trong sổ `brand/feedback.md` vào đúng file brand (mục `dứt khoát` đưa thẳng, mục `gợi ý` gom theo ý thành bảng để người dùng quyết đưa vào brand / chờ thêm / bỏ), rút gọn WORKSTREAM quá dài sang `log.md`, đề xuất xóa file sản xuất đã có Final và đề xuất commit. Dùng khi người dùng nói "tổng hợp feedback", "dọn brand", "dọn project", "gom feedback", hỏi sổ feedback đang có gì, hoặc khi hook `ai-os.project-health` đề xuất và người dùng đồng ý. Không dùng để viết nội dung brand mới từ đầu hay để Staff ghi sổ.
---

# Brand curation — phiên tổng hợp của Team Lead

Bạn là Team Lead của brand: agent mở tại root Project, người biên tập duy nhất các file trong `brand/`. Staff (Mia (ví dụ), Mia (ví dụ)…) ghi feedback người dùng nói vào sổ chung `brand/feedback.md` ngay khi nhận, không qua duyệt. Phiên này biến sổ đó thành context brand đã chốt, sao cho mọi Staff, mọi vai đọc ra cùng một brand.

Hai mức trong sổ quyết định quyền của bạn:
- `dứt khoát` — người dùng đã nói rõ là luật, Staff đang theo. Việc của bạn là **đặt đúng chỗ**: đưa vào file brand, giữ nghĩa, ghi nguồn, thay rule cũ.
- `gợi ý` — người dùng chưa nói là luật. Một ý chỉ đáng thành rule khi người dùng thấy nó đúng, thường sau khi lặp lại qua nhiều bài, nhiều Staff. Việc của bạn là **gom và đề xuất**; người dùng quyết. Đừng tự đưa `gợi ý` vào brand chỉ vì nó lặp nhiều — mục đích của sổ là để người dùng sàng lọc trước khi context brand đổi.

## 0. Vào đúng Project

1. Đọc `AGENTS.md`, `PROJECT.md`, `brand/guidelines.md`, `brand/feedback.md`; đọc thêm node đích khi cần đối chiếu.
2. `git status --short` — ghi lại thay đổi đang có trước khi sửa; đọc lại file ngay trước mỗi lần sửa để không ghi đè việc của session khác (Staff có thể đang thêm dòng vào sổ).

## 1. Tổng hợp sổ feedback

Sổ có hai mục chứa dòng:
- `## Feedback chờ tổng hợp` (cuối file) — dòng mới Staff ghi.
- `## Đang chờ thêm` — nhóm `gợi ý` người dùng đã xem và chọn chờ thêm; mỗi nhóm có dòng `- Nhóm: <ý gộp> · chờ từ YYYY-MM-DD` và các dòng gốc thụt vào bên dưới. Chỉ bạn sửa mục này.

Dòng: `- YYYY-MM-DD · <staff-id> · <gợi ý | dứt khoát> · <phạm vi> · <feedback> · việc: <workstream>/<sản phẩm> · nguồn: "<lời người dùng>"`, có thể kèm `· đến YYYY-MM-DD` hoặc `· bỏ: <rule cũ> · lý do: <…>`.

**Chọn node đích theo nội dung** (trường phạm vi chỉ cho biết ai áp dụng):

| Feedback nói về | Node đích |
|---|---|
| Nhận diện: logo, màu, font, tên gọi sản phẩm, giá/claim/pháp lý | `guidelines.md` nếu phạm vi "mọi kênh"; phạm vi hẹp → `formats/<format>/` và hỏi người dùng có nâng lên toàn brand không |
| Lời và chữ: giọng, từ nên/tránh, cách xưng hô | `voice-tone.md` |
| Thẩm mỹ chung không gắn một định dạng | `visual-brain.md` |
| Quy cách riêng một định dạng (caption video, outro, layout carousel…) | `formats/<format>/` — tạo khi có rule đầu tiên của định dạng |
| Quy trình nhiều bước | đề xuất Project Skill `skills/<name>/SKILL.md`, người dùng duyệt |
| Không rõ thuộc node nào | hỏi người dùng |

**Cách ghi vào node** (dùng cho mọi dòng được đưa vào brand):
- Viết rule dạng sự thật/điều kiện, giữ nghĩa lời người dùng; cuối rule ghi nguồn ngắn `(nguồn: YYYY-MM-DD · <staff-id> · "<trích lời người dùng>")`.
- Tầng 2 (`voice-tone`, `visual-brain`, `formats/*`…) không định nghĩa lại font/màu/logo — chỉ link về `guidelines.md`.
- Rule cũ bị thay: sửa hoặc xóa tại chỗ; không để hai rule active cùng nói một việc. Git giữ lịch sử.
- Dòng `bỏ: <rule cũ>`: gỡ rule đó khỏi node.

**Bước 0 — hết hạn trước**: dòng có `· đến` đã qua (ở cả hai mục) → xóa khỏi sổ, không đưa vào brand dù là `dứt khoát`; ghi một dòng vào `log.md` của workstream liên quan nếu có. Làm bước này trước vì feedback hết hạn chỉ đúng cho một mốc đã qua; đưa nó vào node là biến luật tạm thành luật lâu dài.

**Bước 1 — `dứt khoát`**: đưa từng dòng còn hiệu lực vào node theo bảng trên rồi xóa dòng khỏi sổ. Không hỏi người dùng, trừ khi: mâu thuẫn với rule khác mà không rõ cái nào đúng hơn, phạm vi hẹp đụng nhận diện, hoặc không rõ node đích. Dòng `dứt khoát` có `· đến` còn hạn: để lại trong sổ (vẫn có hiệu lực tới ngày đó).

**Bước 2 — `gợi ý`**: nhóm các dòng cùng nói một ý (khác chữ vẫn là một ý nếu cùng điều người dùng muốn). Trình người dùng **một bảng**, mỗi nhóm một dòng:

| # | Ý gộp | Số lần · Staff · việc | Mới từ lần trước | Trích nguồn | Node + câu rule đề xuất | Khuyến nghị |
|---|---|---|---|---|---|---|

- Khuyến nghị là một trong `đưa vào brand` / `chờ thêm` / `bỏ`, kèm một câu lý do (vd lặp ở 3 bài của 2 Staff → đưa vào; một lần, chưa rõ phạm vi → chờ thêm; mâu thuẫn với lựa chọn người dùng chốt sau đó → bỏ).
- Chỉ trình nhóm có dòng trong `## Feedback chờ tổng hợp`. Nhóm đang ở `## Đang chờ thêm` chỉ trình lại khi có dòng mới cùng ý — gộp dòng cũ + mới, cột "Mới từ lần trước" ghi số dòng/Staff mới. Nhóm đang chờ không có dòng mới thì không trình, trừ khi người dùng hỏi. Lý do: người dùng đã quyết chờ; nhắc lại khi chưa có bằng chứng mới chỉ tốn thời gian của người dùng.
- Người dùng duyệt theo số dòng (vd "1, 3 đưa vào; 2 chờ; 4 bỏ"). Dòng người dùng chưa trả lời giữ nguyên.

**Bước 3 — áp dụng quyết định**:
- `đưa vào brand` → ghi vào node như trên; xóa mọi dòng của nhóm (cả ở `## Đang chờ thêm`).
- `bỏ` → xóa các dòng của nhóm.
- `chờ thêm` → chuyển các dòng vào nhóm tương ứng ở `## Đang chờ thêm` (nhóm mới: `- Nhóm: <ý gộp> · chờ từ <hôm nay>`; nhóm sẵn có: thêm dòng thụt vào, giữ ngày chờ cũ).

Giữ phần đầu sổ (mục đích, hai mức, định dạng, quy tắc ghi) và thứ tự mục: `## Đang chờ thêm` trước, `## Feedback chờ tổng hợp` ở cuối file — Staff thêm dòng ở cuối file nên thứ tự này giữ dòng mới luôn rơi vào mục chờ tổng hợp.

## 2. Feedback người dùng nói thẳng với Team Lead

Ngoài phiên tổng hợp, khi người dùng nói feedback brand trực tiếp với bạn:
- Người dùng nói dứt khoát ("từ giờ", "luôn", "tuyệt đối không", hoặc xác nhận khi bạn hỏi) → sửa thẳng node theo bảng ở §1, báo node/dòng đã đổi. Người dùng đang ngồi với người biên tập, nên câu dứt khoát chính là duyệt.
- Nhận xét thoáng qua hoặc không rõ là luật → ghi sổ mức `gợi ý` với staff-id `team-lead`, báo một dòng `Đã ghi sổ feedback <brand>: <tóm tắt> (gợi ý)`; ý này sẽ được gom cùng feedback của Staff.

## 3. Rút gọn workstream

Với mỗi `work/<ws>/WORKSTREAM.md` > 200 dòng:
- `WORKSTREAM.md` chỉ giữ hiện trạng: mục tiêu, trạng thái, success criteria, bảng bàn giao (có cột "Final ở đâu"), quyết định còn hiệu lực, blocker, bước tiếp theo.
- Lịch sử (diễn biến, bản cũ đã thay, ghi chép bàn giao, hash cũ) chuyển sang `work/<ws>/log.md`, dòng `- YYYY-MM-DD · <ai> · <sự kiện> · <locator/evidence>`. Cái gì không còn ở WORKSTREAM thì phải có trong `log.md` hoặc Git.
- `WORK.md` ở root chỉ là mục lục link + một dòng trạng thái.

## 4. Giải phóng dung lượng

Liệt kê sản phẩm đã xong/đã duyệt trong bảng bàn giao mà `work/<ws>/production/` còn file:

| Sản phẩm | Trạng thái | Dung lượng production | Final ở đâu | Final tồn tại? |
|---|---|---|---|---|

- Kiểm Final bằng `test -e "<path>"` (và hash nếu bảng có). Ổ ngoài chưa cắm → "chờ kiểm", không đề xuất xóa. Không có locator → hỏi người dùng.
- Chỉ đề xuất xóa khi Final tồn tại thật. Người dùng chọn mục nào thì chuyển đúng folder đó vào Thùng rác macOS (`trash <path>` nếu có, nếu không `osascript -e 'tell application "Finder" to delete POSIX file "<path>"'`); không `rm`.

## 5. Kết thúc

1. Mở lại mọi wikilink/locator đã sửa (file + heading thật).
2. `git status --short` — file trong `production/` không xuất hiện.
3. Đề xuất commit theo nhóm (brand / workstream / metadata): file cụ thể, message, lý do. Người dùng duyệt mới commit; stage theo path, không `git add .`; không push.
4. Báo người dùng:

```markdown
**Tổng hợp <project-id>**
- Dứt khoát đã đưa vào brand: N → <node>: <tóm tắt từng rule một dòng>
- Gợi ý: bảng ở trên (<số nhóm> nhóm) — chờ người dùng quyết / đã áp dụng: <đưa vào / chờ thêm / bỏ>
- Workstream rút gọn: <file> <trước> → <sau> dòng
- Có thể xóa: <dung lượng> (<số mục>) — chờ người dùng chọn
- Đề xuất commit: <nhóm + message>
```

Không tự promote rule ra ngoài Project (Playbook, Staff memory); thấy phương pháp dùng được nhiều nơi thì chỉ nêu một dòng đề xuất.
