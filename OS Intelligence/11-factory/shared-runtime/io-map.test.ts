import { describe, expect, test } from "bun:test";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  buildElements, defaultOut, merge, OUTPUT_COLORS, parseMap, run, RUN_COLORS, type El,
} from "../../.agents/skills/io-map/scripts/io-map";

const MD = `# Việc mẫu

## Bản đồ Input/Output

<!-- io-map -->

- Tiêu đề: Kênh mẫu
- Mục tiêu: chưa chốt — kênh để làm gì
- Bước hiện tại: worker đang chạy A
- Chờ người dùng:
  - Mục tiêu kênh
  - Chọn công cụ
  - Câu ba
  - Câu bốn

### Hạng mục lớn 1 · Nghiên cứu
Đối thủ trước, kênh mình sau

| # | Output | Giao phẩm | Input | Tiêu chí xong | Output chốt | Thực thi | Link |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A | **Kênh đối thủ** | Tab 6 cột | Tiêu chí lọc; 8 kênh người dùng gửi | Đủ 8 kênh | chốt | đang chạy | [Sheet](https://docs.google.com/x) |
| 1 | Content Direction | Tab CD | Kênh đối thủ (A); Mục tiêu của người dùng (thiếu) | | chờ người dùng duyệt | chưa chạy | |

### Hạng mục lớn 2 · Thiết kế

| # | Output | Input | Thực thi |
| --- | --- | --- | --- |
| 2 | Concept | CD (1); Nhận diện (chưa có) | kẹt |

## Đã chốt

| # | Output | Input |
| --- | --- | --- |
| Z | không thuộc bản đồ | x |
`;

const OPTS = { date: "2026-11-19", source: "WORK.md", version: 1 };
const byId = (els: El[], id: string) => {
  const e = els.find((x) => x.id === id);
  if (!e) throw new Error(`thiếu phần tử ${id}`);
  return e;
};

describe("parseMap", () => {
  test("đọc đúng mục tiêu, chờ người dùng, nhóm, trạng thái và input thiếu; dừng ở heading kế tiếp", () => {
    const d = parseMap(MD);
    expect(d.title).toBe("Kênh mẫu");
    expect(d.goalPending).toBe(true);
    expect(d.waiting).toEqual(["Mục tiêu kênh", "Chọn công cụ", "Câu ba", "Câu bốn"]);
    expect(d.groups.map((g) => g.rows.map((r) => r.id))).toEqual([["A", "1"], ["2"]]);
    expect(d.groups[0].note).toBe("Đối thủ trước, kênh mình sau");
    const [a, one] = d.groups[0].rows;
    expect(a.output).toBe("Kênh đối thủ");
    expect(a.link).toBe("https://docs.google.com/x");
    expect([a.outputState, a.run]).toEqual(["chốt", "đang chạy"]);
    expect([one.outputState, one.run]).toEqual(["chờ duyệt", "chưa chạy"]);
    expect(one.inputs.map((i) => i.missing)).toEqual([false, true]);
    const two = d.groups[1].rows[0];
    expect(two.run).toBe("kẹt");
    expect(two.inputs[1].missing).toBe(true);
    expect(two.outputState).toBe("chưa");
  });

  test("mục tiêu đã chốt", () => {
    expect(parseMap(MD.replace("chưa chốt — kênh để làm gì", "Kéo học viên về khóa AI OS")).goalPending).toBe(false);
  });

  test("báo lỗi rõ khi thiếu mục, thiếu bảng hoặc trùng mã", () => {
    expect(() => parseMap("# X\n")).toThrow("Bản đồ Input/Output");
    expect(() => parseMap("## Bản đồ Input/Output\n- Mục tiêu: x\n")).toThrow("chưa có bảng");
    expect(() => parseMap(MD.replace("| 2 | Concept", "| A | Concept"))).toThrow('trùng mã hạng mục "A"');
  });
});

describe("buildElements", () => {
  const els = buildElements(parseMap(MD), OPTS);

  test("ô giữa luôn là AI Agent, nền theo trạng thái thực thi", () => {
    expect(byId(els, "box-A-t").text).toBe("AI Agent");
    expect(byId(els, "box-A").backgroundColor).toBe(RUN_COLORS["đang chạy"]);
    expect(byId(els, "box-2").backgroundColor).toBe(RUN_COLORS["kẹt"]);
    expect(byId(els, "mark-1").backgroundColor).toBe(OUTPUT_COLORS["chờ duyệt"]);
  });

  test("input thiếu: chữ đỏ và mũi tên nét đứt; input đủ giữ nét liền", () => {
    expect(byId(els, "in-1-1").strokeColor).toBe("#e03131");
    expect(byId(els, "in-1-arr-1").strokeStyle).toBe("dashed");
    expect(byId(els, "in-1-arr-0").strokeStyle).toBe("solid");
  });

  test("output có link, mục tiêu chưa chốt nét đứt đỏ, chờ người dùng hiện tối đa 3 câu", () => {
    expect(byId(els, "out-A").link).toBe("https://docs.google.com/x");
    expect(byId(els, "ov-goal").strokeStyle).toBe("dashed");
    const wait = String(byId(els, "wait-t").text);
    expect(wait).toContain("3. Câu ba");
    expect(wait).not.toContain("Câu bốn");
    expect(wait).toContain("… và 1 câu nữa");
  });

  test("tổng quan: mỗi hạng mục lớn một khối nối vào mục tiêu", () => {
    expect(byId(els, "ov-g0-t").text).toContain("Output chốt 1/2 · xong 0/2");
    expect(byId(els, "ov-arr-1").endBinding).toEqual({ elementId: "ov-goal", focus: 0, gap: 6 });
  });
});

describe("merge và run", () => {
  test("giữ phần người dùng vẽ thêm; dừng khi người dùng sửa hoặc xóa phần do io-map sinh", () => {
    const first = merge(buildElements(parseMap(MD), OPTS), null).doc;
    const mine = { id: "người dùng-ve", type: "text", x: 0, y: 0, width: 10, height: 10, text: "ghi chú", boundElements: [] };
    const withNote = { ...first, elements: [...first.elements, mine] };
    const again = merge(buildElements(parseMap(MD), OPTS), withNote);
    expect(again.edited).toEqual([]);
    expect(again.doc.elements.some((e) => e.id === "người dùng-ve")).toBe(true);

    const edited = { ...first, elements: first.elements
      .map((e) => (e.id === "out-A" ? { ...e, text: "A · tên người dùng sửa" } : e))
      .filter((e) => e.id !== "box-2") };
    const res = merge(buildElements(parseMap(MD), OPTS), edited);
    expect(res.edited.some((x) => x.startsWith("người dùng sửa: out-A"))).toBe(true);
    expect(res.edited).toContain("người dùng xóa: box-2");
  });

  test("CLI: ghi file, dừng không ghi đè khi có chỉnh tay, --force ghi lại", () => {
    const dir = mkdtempSync(join(tmpdir(), "io-map-"));
    const md = join(dir, "WORKSTREAM.md");
    writeFileSync(md, MD);
    const out = defaultOut(md);
    expect(out).toBe(join(dir, "tong-quan.excalidraw"));
    expect(run([md])).toBe(0);

    const doc = JSON.parse(readFileSync(out, "utf8"));
    doc.elements = doc.elements.map((e: El) => (e.id === "out-A" ? { ...e, text: "sửa tay" } : e));
    writeFileSync(out, JSON.stringify(doc));
    const before = readFileSync(out, "utf8");
    expect(run([md])).toBe(1);
    expect(readFileSync(out, "utf8")).toBe(before);
    expect(run([md, "--force"])).toBe(0);
    expect(readFileSync(out, "utf8")).not.toContain("sửa tay");
  });

  test("bản đồ từ script Python cũ (dấu kiểm có dấu cách) không bị báo nhầm là người dùng sửa", () => {
    const legacy = { id: "box-cu", type: "text", x: 0, y: 0, width: 10, height: 10, text: "A · Kênh đối thủ",
      strokeColor: "#1e1e1e", fontSize: 20, boundElements: [],
      customData: { gen: '["A · Kênh đối thủ", "#1e1e1e", 20]' } };
    const res = merge(buildElements(parseMap(MD), OPTS), { elements: [legacy] });
    expect(res.edited).toEqual([]);
    expect(res.doc.elements.some((e) => e.id === "box-cu")).toBe(false);
    const changed = merge(buildElements(parseMap(MD), OPTS), { elements: [{ ...legacy, text: "người dùng sửa" }] });
    expect(changed.edited).toHaveLength(1);
  });

  test("file job của Staff có bản đồ riêng theo tên job", () => {
    expect(defaultOut("jobs/viet-bai-x.md")).toBe("jobs/viet-bai-x.tong-quan.excalidraw");
    expect(run(["/khong/ton/tai.md"])).toBe(2);
  });
});
