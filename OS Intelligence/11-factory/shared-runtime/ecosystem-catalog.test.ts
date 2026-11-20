import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import ecosystemCatalog, {
	type CatalogEntry,
	findCatalog,
	MESSAGE_TYPE,
	needsInject,
	parseCatalog,
	renderCatalog,
	selfId,
} from "./ecosystem-catalog";

const SAMPLE = `# Danh bạ hệ sinh thái

Ghi chú mở đầu — không phải dòng danh bạ.

## Staff

- mia-content-writer — Mia — Content Writer (ví dụ) — OS Staff/mia-content-writer
- mia-content-writer-2 — Mia — Content Writer 2 (ví dụ) — OS Staff/mia-content-writer-2

## Projects

- brand-mau — brand thời trang thể thao — OS Projects/brand-mau
- dòng thiếu dấu phân cách

## Builder

- app-mau — app dựng video · liên quan: mia-content-writer — OS Builder/app-mau

## Ghi chú

- not-an-entry — mục lạ — OS Other/x
`;

describe("parseCatalog", () => {
	const entries = parseCatalog(SAMPLE);

	test("đọc đúng dòng hợp lệ dưới ba mục", () => {
		expect(entries.map(entry => entry.id)).toEqual(["mia-content-writer", "mia-content-writer-2", "brand-mau", "app-mau"]);
	});

	test("tách section, mô tả và locator; giữ phần liên quan trong mô tả", () => {
		expect(entries[3]).toEqual({
			section: "Builder",
			id: "app-mau",
			description: "app dựng video · liên quan: mia-content-writer",
			locator: "OS Builder/app-mau",
		});
		expect(entries[2].section).toBe("Projects");
	});

	test("bỏ dòng thiếu ` — ` và dòng dưới heading lạ", () => {
		expect(entries.some(entry => entry.id === "not-an-entry")).toBe(false);
		expect(entries.some(entry => entry.description.includes("thiếu"))).toBe(false);
	});
});

describe("findCatalog", () => {
	let root: string;
	beforeAll(() => {
		root = mkdtempSync(join(tmpdir(), "eco-"));
		mkdirSync(join(root, "OS Intelligence/11-factory"), { recursive: true });
		writeFileSync(join(root, "OS Intelligence/11-factory/catalog.md"), SAMPLE);
		for (const dir of ["OS Staff/mia-content-writer-2", "OS Worktree/mia-content-writer/feat-x", "OS Builder/app-mau/.worktrees/a"]) mkdirSync(join(root, dir), { recursive: true });
	});
	afterAll(() => rmSync(root, { recursive: true, force: true }));

	test("tìm được từ repo chính, OS Worktree và .worktrees trong repo", () => {
		for (const dir of ["OS Staff/mia-content-writer-2", "OS Worktree/mia-content-writer/feat-x", "OS Builder/app-mau/.worktrees/a"]) {
			const found = findCatalog(join(root, dir));
			expect(found?.ecosystemRoot).toBe(root);
			expect(found?.file).toBe(join(root, "OS Intelligence/11-factory/catalog.md"));
		}
	});

	test("không có danh bạ ở thư mục cha nào → undefined", () => {
		const lonely = mkdtempSync(join(tmpdir(), "lonely-"));
		expect(findCatalog(lonely)).toBeUndefined();
		rmSync(lonely, { recursive: true, force: true });
	});
});

describe("selfId", () => {
	test("ưu tiên dòng `- ID:` của Staff", () => {
		expect(selfId("# Mia (ví dụ) — Writer\n\n- ID: mia-content-writer-2\n")).toBe("mia-content-writer-2");
		expect(selfId("# Mia (ví dụ)\n\n- ID: `mia-content-writer`.\n")).toBe("mia-content-writer");
	});

	test("Builder: heading đầu một từ", () => {
		expect(selfId("# app-mau\n\nRepo Builder app…")).toBe("app-mau");
	});

	test("Project: dòng `- Project ID:`", () => {
		expect(selfId("# Brand Mẫu Apparel — Project instructions\n\n- Project ID: brand-mau\n")).toBe("brand-mau");
		expect(selfId("# Brand Mẫu (ví dụ) — Project instructions\n\n- Project ID: `brand-mau-2`.\n")).toBe("brand-mau-2");
	});

	test("heading nhiều từ và không có ID → undefined", () => {
		expect(selfId("# app-mau (ví dụ) app\n")).toBeUndefined();
	});
});

describe("renderCatalog", () => {
	const root = "/eco";
	const entries: CatalogEntry[] = parseCatalog(SAMPLE);

	test("bỏ dòng của chính mình, đường dẫn tính từ root repo", () => {
		const text = renderCatalog(entries, { self: "mia-content-writer-2", repoRoot: "/eco/OS Staff/mia-content-writer-2", ecosystemRoot: root });
		expect(text).not.toContain("mia-content-writer-2");
		expect(text).toContain("- mia-content-writer — Mia — Content Writer (ví dụ) — ../mia-content-writer");
		expect(text).toContain("../../OS Projects/brand-mau");
		expect(text.startsWith("[ecosystem-catalog — hook tự chèn]\n\nHệ sinh thái AI OS hiện có — chỉ để biết.")).toBe(true);
	});

	test("từ worktree OS Worktree/<repo>/<tên>, locator thêm một cấp", () => {
		const text = renderCatalog(entries, { self: "mia-content-writer", repoRoot: "/eco/OS Worktree/mia-content-writer/feat-x", ecosystemRoot: root });
		expect(text).toContain("— ../../../OS Projects/brand-mau");
		expect(text).not.toContain("- mia-content-writer —");
	});

	test("bỏ mục rỗng; chỉ còn chính mình → chuỗi rỗng", () => {
		const onlyStaff = entries.filter(entry => entry.section === "Staff");
		const text = renderCatalog(onlyStaff, { self: "mia-content-writer-2", repoRoot: "/eco/OS Staff/mia-content-writer-2", ecosystemRoot: root });
		expect(text).toContain("Staff:");
		expect(text).not.toContain("Projects:");
		expect(renderCatalog([entries[1]], { self: "mia-content-writer-2", repoRoot: "/eco/OS Staff/x", ecosystemRoot: root })).toBe("");
	});
});

describe("needsInject", () => {
	const own = (hash: string) => ({ type: "custom_message", customType: MESSAGE_TYPE, details: { hash } });

	test("đầu phiên chưa chèn → true", () => {
		expect(needsInject([], "h1")).toBe(true);
	});

	test("đã chèn cùng hash → false; danh bạ đổi → true", () => {
		expect(needsInject([own("h1")], "h1")).toBe(false);
		expect(needsInject([own("h1")], "h2")).toBe(true);
	});

	test("compaction sau lần chèn → true; chèn lại sau compaction → false", () => {
		expect(needsInject([own("h1"), { type: "compaction" }], "h1")).toBe(true);
		expect(needsInject([own("h1"), { type: "compaction" }, own("h1")], "h1")).toBe(false);
	});

	test("message của hook khác không tính", () => {
		expect(needsInject([{ type: "custom_message", customType: "ai-os.learning-loop", details: { hash: "h1" } }], "h1")).toBe(true);
	});
});

describe("wiring", () => {
	type Handler = (event: { reason?: string }, ctx: unknown) => Promise<unknown>;
	let handler: Handler | undefined;
	ecosystemCatalog({ on: (name: string, fn: Handler) => (name === "before_agent_start" ? (handler = fn) : undefined) } as never);
	const ctx = (kind: string) => ({ agent: { kind }, sessionManager: { getBranch: () => [] } });

	test("đăng ký before_agent_start", () => {
		expect(handler).toBeDefined();
	});

	test("sub-agent và lượt revive không chèn", async () => {
		expect(await handler?.({}, ctx("sub"))).toBeUndefined();
		expect(await handler?.({ reason: "revive" }, ctx("main"))).toBeUndefined();
	});
});
