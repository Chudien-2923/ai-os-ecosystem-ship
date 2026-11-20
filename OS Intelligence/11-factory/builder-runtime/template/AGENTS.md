# {{APP_NAME}}

Repo Builder app được tạo bởi OS Intelligence Factory ngày {{DATE}} theo Builder App Starter V0.2.2. Người dùng làm việc trực tiếp trong repo này và vibe coding; Agent giao tiếp tiếng Việt, diễn đạt trung tính, giải thích thuật ngữ tiếng Anh khi cần người dùng quyết định.

## Dự án

- Mục đích: {{PURPOSE}}
- Project liên quan: {{PROJECT}}
- Hệ sinh thái: hook `.omp/hooks/pre/ecosystem-catalog.ts` chèn danh bạ Staff/Project/app khác từ `OS Intelligence/11-factory/catalog.md` (ngoài repo; máy khác không có thì bỏ qua). Harness không có hook (Claude Code/Codex): tự đọc `../../OS Intelligence/11-factory/catalog.md` khi cần nhận diện repo khác. Chỉ đọc repo khác khi việc cần, không sửa; không chép tên, mục đích, đường dẫn từ danh bạ vào file commit — tham chiếu riêng để ở file gitignore.
- Trạng thái: mới tạo, chưa chọn stack. Cập nhật dòng này khi có spec/plan đang chạy (trỏ tới file trong `docs/superpowers/`).

## Cách làm việc

Chọn công cụ theo việc, không cần người dùng chỉ định:

- Việc mới hoặc đổi hành vi → Superpowers: brainstorm → spec → plan → code → kiểm tra.
- Phần nhìn thấy được (giao diện, bố cục, màu, chữ, animation) → Impeccable, sau khi brainstorm đã chốt làm gì.
- Người dùng muốn làm giống một tính năng của app/web có sẵn → REA xem nó hoạt động thế nào trước, rồi brainstorm. Thủ tục bật REA ở mục dưới.
- Logo, app icon, favicon, nhận diện thương hiệu → Logo Design.
- Ponytail (plugin OMP) ưu tiên giải pháp đủ dùng với ít code mới; không thay quy trình Superpowers hoặc bỏ kiểm tra cần thiết. `/ponytail off` tắt cho phiên hiện tại.
- Sửa nhỏ, rõ ràng (đổi chữ, sửa lỗi gõ) → làm thẳng, không cần quy trình.

Spec, plan và tiến độ của Superpowers nằm trong `docs/superpowers/`; đó là trí nhớ quyết định của repo. PRD hoặc tài liệu dài để trong `docs/`, file này chỉ trỏ tới.

## Lệnh kiểm tra

- `scripts/check.sh` là cổng kiểm tra duy nhất, gộp typecheck/lint/test/build của stack. Chưa có file này thì task đầu tiên của plan đầu tiên phải tạo nó.
- Hook `.omp/hooks/pre/check-gate.ts` tự chạy lệnh này cuối mỗi lượt có sửa code. Fail thì sửa đúng nguyên nhân (tối đa 2 vòng tự động); không báo xong khi kiểm tra còn fail; không sửa test hoặc nới kiểm tra chỉ để pass.

## Bật REA khi cần

REA khai báo trong `.omp/mcp.json` ở trạng thái tắt (`"enabled": false`) vì bật sẵn tốn ~24.000 token mỗi request.

1. Nói với người dùng sẽ dùng REA cho việc gì.
2. Đổi `"enabled": false` thành `true` trong `.omp/mcp.json`.
3. Nhờ người dùng mở lại session (thoát rồi resume) để REA được nạp.
4. Xong việc thì đặt lại `false` trong lượt kết thúc.

Trong lúc chờ, phân tích JavaScript/web đơn giản có thể dùng CLI `rea` qua shell. Chỉ phân tích phần mềm người dùng có quyền phân tích.

## Commit

- Commit theo mốc: xong một task hoặc plan và kiểm tra pass; message rõ ràng (ví dụ `feat: …`, `fix: …`).
- Không push, tạo remote, tag, release hoặc publish khi người dùng chưa yêu cầu rõ.
- Cập nhật `CHANGELOG.md` khi thay đổi đáng kể với người dùng sản phẩm.

## Ranh giới

- Không chi tiền, bật dịch vụ trả phí, ghi vào production hoặc dùng tài khoản thật khi người dùng chưa duyệt.
- Không đưa secret, `.env`, dữ liệu cá nhân hoặc dữ liệu khách hàng vào Git.
- Không điều khiển máy tính, ứng dụng hoặc trình duyệt cá nhân của người dùng: không Computer Use, không gắn vào Chrome thật, không `mac-approve`, không import cookie từ Chrome. Trang công khai (mở, chụp, lấy dữ liệu) chạy `bu-headless` (Browser Use CLI trên Chromium headless riêng, profile tạm); không chạy `browser-use` trần. Trang cần đăng nhập, `localhost` của app, hoặc người dùng muốn xem thao tác: trình duyệt nhúng của Orca với profile cô lập `Agent` (`orca tab create --url <url> --profile <id>`, `orca snapshot`, `orca click`, `orca fill`, `orca screenshot`); người dùng tự đăng nhập trong tab đó, không dùng profile Default hay Import Browser Cookies. Test E2E của app thì cài Playwright làm devDependency trong repo, không dựa vào bản toàn cục. Thao tác xác thực, thanh toán, gửi/đăng thì người dùng tự làm hoặc duyệt trước.
- Phân biệt rõ điều đã chạy kiểm chứng, điều người dùng báo lại và điều chưa kiểm tra.

## Gotchas

Lỗi đã gây làm lại thật trong repo này, mỗi dòng một bài học; xóa dòng khi không còn đúng. Không ghi ý tưởng hoặc lỗi chưa xảy ra.

- (chưa có)
