# AI OS Ecosystem Registry

- Ship release: V1.0.0.
- Root convention: sibling `OS Intelligence`, non-Git containers `OS Staff`/`OS Projects`/`OS Builder`, mỗi repo con là standalone repository.
- Trạng thái là quan sát gần nhất; kiểm tra repo thật trước khi khẳng định hiện tại.

## Component contracts

| Component | Version | Source | Status |
| --- | --- | --- | --- |
| Intelligence | V0.2.3 | [[11-factory/specs/os-intelligence-starter-spec]] | Clean starter; hook `freshness` cài sẵn qua `.omp/hooks/pre/freshness.ts`, `.omp/freshness.json` chưa có tên cần theo dõi |
| Staff | V0.2.16 | [[11-factory/specs/os-staff-starter-spec]] | Factory-ready; chưa có instance |
| Projects | V0.2.3 | [[11-factory/specs/os-projects-starter-spec]] | Factory-ready; chưa có instance |
| Builder App | V0.2.2 | [[11-factory/specs/os-builder-app-starter-spec]] | Factory-ready; chưa có instance; cần Node ≥ 24.22.1 và REA đúng version theo spec |

## Instances

| Type | ID | Locator from Intelligence root | Version | Last verification |
| --- | --- | --- | --- | --- |
| Staff | — | `../OS Staff/` | — | Container chỉ có `.gitkeep`; thư mục con bị parent Ship ignore |
| Project | — | `../OS Projects/` | — | Container chỉ có `.gitkeep`; thư mục con bị parent Ship ignore |
| Builder app | — | `../OS Builder/` | — | Container chỉ có `.gitkeep`; thư mục con bị parent Ship ignore |

Version metadata không chứng minh runtime. Sau khi tạo hoặc nâng instance, mở repo thật, chạy scenario liên quan rồi cập nhật bảng; không ghi `passed` từ file existence đơn thuần. Tạo, xóa hoặc đổi tên repo thì sửa dòng tương ứng trong [[11-factory/catalog]] cùng lượt.

## Ship verification

Kết quả kiểm chứng của release hiện hành ghi tại [[11-factory/release]]. Bản sạch không chứa instance, danh tính hay evidence của người phát hành.
