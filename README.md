# AI OS Ecosystem Ship

Bản khởi tạo sạch, có quản lý phiên bản để giảng dạy cách xây dựng một hệ điều hành AI cá nhân gồm ba lớp: **OS Intelligence**, **OS Staff** theo vai trò và **OS Projects** theo brand/workspace.

Tài liệu dành chủ yếu cho học viên Việt Nam nên phần hướng dẫn và mô tả sử dụng tiếng Việt. Các thuật ngữ kỹ thuật như Staff, Project, Skill, Factory, runtime, workflow, version và migration được giữ bằng tiếng Anh khi rõ nghĩa hơn.

## Phiên bản hiện hành

- Ship source và public release: **V0.4.0**
- OS Intelligence contract: **V0.2.2**
- OS Staff contract: **V0.2.4**
- OS Projects contract: **V0.1.4**

Thay đổi theo từng release được ghi tại [CHANGELOG.md](CHANGELOG.md). Contract chi tiết của component và migration nằm trong [`OS Intelligence/11-factory/`](OS%20Intelligence/11-factory/).

## Cấu trúc

```text
AI OS Ecosystem/
├── OS Intelligence/   # Chief of Staff, nghiên cứu, Factory, Playbook và Skills
├── OS Staff/          # Trống cho tới khi Intelligence tạo Staff theo vai trò
└── OS Projects/       # Trống cho tới khi Intelligence tạo brand/project workspace
```

Trong fresh Git clone, `OS Staff` và `OS Projects` chỉ có `.gitkeep` để Git giữ lại hai product folders chưa có instance data.

`OS Staff` và `OS Projects` là container tổ chức local, không phải repository dùng chung. Mỗi Staff/Project được tạo bên trong là một standalone Git repository với history, remote và quyền riêng độc lập. Root `.gitignore` loại các child instance khỏi Ship parent repository để learner data không bị commit nhầm vào distribution.

## Bắt đầu sử dụng

1. Clone hoặc tải repository về máy.
2. Mở folder `OS Intelligence` bằng Oh My Pi, Codex, Claude Code hoặc coding-agent harness tương thích.
3. Bắt đầu fresh session. Agent sẽ đọc `AGENTS.md`, `IDENTITY.md`, `SOUL.md` và `USER.md` sạch.
4. Trong câu trả lời đầu tiên, Agent cung cấp `Session hiện tại` gồm JSONL path và exact resume command khi runtime hỗ trợ.
5. Prompt tự nhiên, ví dụ:
   - `Hãy tạo cho tôi một AI Staff Video Editor.`
   - `Hãy tạo Project cho brand của tôi.`
6. Intelligence dùng Factory specs để tạo Staff hoặc Project với `README.md`, `VERSION`, `CHANGELOG.md`, mandatory operating files và standalone Git boundary; sau đó kiểm tra cấu trúc, links và runtime behavior trước khi ghi registry.

## Ranh giới của bản sạch

Repository không chứa hồ sơ cá nhân, private work, research, runtime IDs, Staff/Project instances, brand data, assets hoặc production outputs của người phát hành. Dữ liệu học viên chỉ được thêm trong quá trình sử dụng và thuộc instance của chính học viên đó.

Learner-created Staff/Project, `USER`, context, work, assets và outputs không phải nội dung của Ship. Không dùng parent Ship repository để version hoặc publish child instance; mỗi child repo chỉ được init/commit/remote/push trong phạm vi người dùng duyệt.

## Quản lý phiên bản và nâng cấp

Ship release dùng SemVer độc lập với version của ba component specs:

- **Major:** breaking change về layout, ownership hoặc migration contract.
- **Minor:** capability, spec hoặc Skill mới có backward compatibility.
- **Patch:** sửa packaging, security, compatibility, links hoặc documentation mà không đổi contract chính.

Việc source system được nâng cấp không tự ghi đè bản phân phối này hoặc learner instance đang sử dụng. Migration phải giữ `USER`, context, work, Staff, Projects, assets và outputs của học viên. Xem [`release.md`](OS%20Intelligence/11-factory/release.md).

## Skills và license

Anthropic `skill-creator` đi kèm vẫn giữ upstream Apache-2.0 license tại `OS Intelligence/.agents/skills/skill-creator/LICENSE.txt`. Release này chưa khai báo repository-wide license riêng.