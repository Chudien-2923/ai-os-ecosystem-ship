# OS Intelligence Skills

`.agents/skills/` là canonical source duy nhất cho procedural skills của OS Intelligence. Codex discover trực tiếp; Oh My Pi hỗ trợ Agents provider nhưng có thể hiển thị Claude adapter do provider precedence; Claude Code dùng symlink theo từng Skill tại `.claude/skills/`. Mọi adapter phải resolve về cùng canonical directory.

## Active skills

- `skill-creator` — package chính thức `anthropics/skills@skill-creator`, dùng để tạo, sửa, đánh giá, benchmark và cải thiện Skill. Provenance/hash ở root `skills-lock.json`; package giữ nguyên `LICENSE.txt` Apache-2.0.
- `pre-compact` — reconcile current-session durable state trước `/compact`; invocation `/skill:pre-compact`.
- `close` — chạy reconciliation core của `pre-compact`, kiểm tra runtime/handoff rồi chuẩn bị `/new` hoặc exit; invocation `/skill:close`.

## Bắt buộc khi tạo Skill

1. Tạo Skill mới MUST invoke `skill-creator` trước khi viết. Sửa behavior/trigger hoặc chạy evaluation SHOULD dùng Skill Creator; sửa path/typo/metadata không đổi hành vi chỉ cần focused validation.
2. Dùng conversation hiện có để rút intent, trigger, output và examples; chỉ hỏi gap ảnh hưởng kết quả.
3. Chọn mức eval theo rủi ro:
   - Objective hoặc high-impact: 2–3 realistic prompts, with-skill so với baseline/old version, assertions và evidence.
   - Subjective/creative: human review trên output thật; không ép assertion giả khách quan.
   - Minor wording/path fix: focused smoke; không chạy full benchmark khi hành vi không đổi.
4. Sau methodology của Skill Creator, áp dụng ownership/path/adapter contract bên dưới.
5. Claude-only operation như description optimizer dùng `claude -p` được ghi `unavailable` hoặc `not run` khi không có subscription; không tạo kết quả thay thế giả.

## OS Intelligence integration contract

- Mỗi Skill ở đúng một cấp: `.agents/skills/<skill-name>/SKILL.md`.
- `name` lowercase-kebab-case, khớp tên folder; `description` nói rõ làm gì và khi nào dùng.
- Chỉ dùng frontmatter portable theo Agent Skills trừ khi requirement buộc dùng extension riêng và compatibility đã được ghi rõ.
- `references/`, `scripts/`, `assets/` chỉ tạo khi có nội dung thật; path trong Skill là tương đối từ skill root.
- Mỗi Skill có symlink `.claude/skills/<skill-name>` trỏ tới `../../.agents/skills/<skill-name>`; không copy `SKILL.md`.
- Không tạo mirror `.omp/skills/` hoặc `.codex/skills/`.
- Skill của Staff ở Staff repo. Brand procedure ở Project. Playbook đã có evidence ở `08-playbook/`; Skill MAY tham chiếu nhưng không sao chép làm nguồn thứ hai.
- Skill mới hoặc thay đổi behavior/trigger đáng kể phải được smoke bằng fresh OMP và Codex session. Claude runtime smoke chỉ bắt buộc khi có account/provider khả dụng hoặc người dùng yêu cầu; nếu không, kiểm tra adapter tĩnh và ghi `not run`.
- OMP snapshot Skill lúc khởi động; luôn dùng fresh session sau khi cài Skill mới để đánh giá discovery/trigger.

## Upstream và security

- `skill-creator` là upstream package, không sửa trực tiếp. Cập nhật qua package source rồi đối chiếu lock/hash/license và chạy lại smoke. Nếu cần fork, tạo quyết định riêng và giữ notice derivative.
- Skills CLI security scan ngày 2026-10-16: Gen pass, Snyk low risk, Socket cảnh báo LOW tại `eval-viewer/viewer.html` về khả năng DOM XSS/iframe URI nếu dữ liệu review do bên không tin cậy kiểm soát. Chỉ mở viewer với output local/trusted; với HTML/data URI không tin cậy, review inline hoặc kiểm tra/sandbox trước.
- Generated eval workspace/viewer results là evidence tạm; không commit mặc định nếu không có giá trị durable.