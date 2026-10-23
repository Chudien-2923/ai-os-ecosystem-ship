# AI OS Ecosystem Factory

Factory là chức năng của OS Intelligence. Nó duy trì specs/version, tạo hoặc nâng cấp standalone Staff/Project repositories, xử lý feedback và theo dõi compatibility.

## Nguồn chính

- [[11-factory/release]] — Ship release hiện hành và upgrade policy.
- [[11-factory/registry]] — instances đã được tạo trong bản của người dùng này.
- [[11-factory/specs/os-intelligence-starter-spec]] — Intelligence V0.2.2.
- [[11-factory/specs/os-staff-starter-spec]] — Staff V0.2.4.
- [[11-factory/specs/os-projects-starter-spec]] — Projects V0.1.4.
- [[log]] — lịch sử thay đổi có ý nghĩa; không thay spec/registry.

## Layout của ecosystem

Từ root `OS Intelligence`:

- `../OS Staff/` — container tổ chức local cho từng Staff; ban đầu chỉ có `.gitkeep`.
- `../OS Projects/` — container tổ chức local cho từng Project; ban đầu chỉ có `.gitkeep`.
- Mỗi child Staff/Project là một standalone Git repository với history, remote, approval và recovery độc lập.
- Intelligence giữ Factory, context chung, research, Playbook và Skills của Chief of Staff.

Không tạo Staff/Project bên trong Intelligence, không init Git tại hai container và không dùng parent Ship repository để version learner data. Root `.gitignore` loại child directories khỏi parent repository.

## Tạo Staff từ prompt

Khi người dùng yêu cầu như “tạo cho tôi một AI Video Editor”:

1. Rút từ prompt: role, outcome, scope, tool/runtime cần thiết và acceptance. Chỉ hỏi gap ảnh hưởng kết quả.
2. Đề xuất stable ID dạng lowercase-kebab-case và target `../OS Staff/<staff-id>`; kiểm tra target trước khi ghi.
3. Đọc đúng phần của [[11-factory/specs/os-staff-starter-spec]] và lập implementation matrix artifact → path → requirement → source → verification.
4. Tạo repository metadata `README.md`, `VERSION`, `CHANGELOG.md` và starter thật: `AGENTS.md`, `ROLE.md`, `USER.md`, `MEMORY.md`, `WORK.md`, `LEARNING.md`, `jobs/`, `knowledge/README.md`, `journal/README.md`. Skill/knowledge/job chỉ thêm khi có dữ liệu thật.
5. Trong `AGENTS.md`, bắt buộc thêm `Session hiện tại` ở câu trả lời đầu tiên với JSONL path và exact resume command từ runtime metadata.
6. Staff `USER.md` chỉ giữ role-specific override; context chung route về Intelligence `USER.md` bằng locator tương đối từ Staff root.
7. Nếu Staff làm cho Project, thêm Project Context Gate và locator; brand/shared state vẫn thuộc Project.
8. Chỉ init standalone Git tại root Staff khi người dùng duyệt; không init ở `OS Staff` hoặc parent Ship.
9. Mở mọi link/heading/locator, chạy fresh first-use và session-resume scenario, rồi cập nhật [[11-factory/registry]]. Chỉ commit/remote/push trong phạm vi được duyệt.

## Tạo Project từ prompt

Khi người dùng yêu cầu như “tạo Project cho brand X”:

1. Xác định project/brand name, stable ID, loại Project và thông tin đã biết; không bịa brand facts.
2. Target là `../OS Projects/<project-id>`; kiểm tra target trước khi ghi.
3. Đọc [[11-factory/specs/os-projects-starter-spec]] và lập implementation matrix.
4. Tạo repository metadata `README.md`, `VERSION`, `CHANGELOG.md` cùng mandatory files: `AGENTS.md`, `PROJECT.md`, `WORK.md`, `brand/foundation.md`, `brand/guidelines.md` có heading `Non-negotiables`, `assets/ASSETS.md`.
5. Trong `AGENTS.md`, bắt buộc thêm `Session hiện tại` ở câu trả lời đầu tiên với JSONL path và exact resume command từ runtime metadata.
6. Audience/voice/visual, asset folders và workstreams chỉ tạo khi có dữ liệu thật. File trống phải nói đúng trạng thái và cách cập nhật.
7. Chỉ init standalone Git tại root Project khi người dùng duyệt; không init ở `OS Projects` hoặc parent Ship.
8. Nếu đã có Staff phù hợp, chạy Staff-first Project Context Gate; nếu chưa có, kiểm tra cấu trúc/link và ghi rõ runtime chưa kiểm chứng.
9. Cập nhật Intelligence [[04-projects/index]], [[11-factory/registry]] và [[log]]. Chỉ commit/remote/push trong phạm vi được duyệt.

## Upgrade

Spec hoặc Ship release mới không tự nâng learner instance. Trước migration phải phân biệt:

- generic system behavior/spec/Skill có thể nâng;
- `USER`, context, work, research, child Staff/Project repositories, assets và outputs của learner phải giữ;
- parent Ship ignore boundary không thay quyền hoặc history của child repositories;
- conflict hoặc breaking migration cần checkpoint và approval.

Quy trình đầy đủ ở [[11-factory/release]].