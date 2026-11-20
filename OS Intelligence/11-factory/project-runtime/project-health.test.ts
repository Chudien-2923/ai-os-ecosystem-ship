import { afterEach, beforeEach, expect, test } from "bun:test";
import { appendFileSync, copyFileSync, mkdirSync, mkdtempSync, renameSync, rmSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { assessProject, curationReasons, formatReport, parseFeedback, THRESHOLDS, type ProjectHealth } from "./project-health";

const DAY = 86_400_000;
const NOW = new Date(2026, 10, 20, 12, 0, 0);
let tmp: string;

beforeEach(() => {
	tmp = mkdtempSync(join(tmpdir(), "project-health-"));
});
afterEach(() => rmSync(tmp, { recursive: true, force: true }));

function write(path: string, text: string, ageDays?: number): void {
	mkdirSync(join(path, ".."), { recursive: true });
	writeFileSync(path, text);
	if (ageDays !== undefined) {
		const t = new Date(NOW.getTime() - ageDays * DAY);
		utimesSync(path, t, t);
	}
}

function git(dir: string, ...args: string[]): void {
	const result = spawnSync("git", ["-C", dir, ...args], { encoding: "utf8" });
	if (result.status !== 0) throw new Error(result.stderr);
}

function commitAll(dir: string, message: string): void {
	git(dir, "add", "-A");
	git(dir, "-c", "user.email=t@t", "-c", "user.name=t", "commit", "-qm", message);
}

function project(name: string, { repo = true } = {}): string {
	const dir = join(tmp, name);
	write(join(dir, "PROJECT.md"), `# ${name}\n\n- Project ID: ${name}-id\n`);
	if (repo) {
		git(dir, "init", "-q");
		commitAll(dir, "init");
	}
	return dir;
}

/** Sổ đúng thứ tự mục của template Factory: phần đầu → Đang chờ thêm → Feedback chờ tổng hợp (cuối file). */
function book({ waiting = [] as string[], pending = [] as string[] } = {}): string {
	return [
		"# Sổ feedback — Demo",
		"",
		"- Dòng: `- YYYY-MM-DD · <staff-id> · <gợi ý | dứt khoát> · <phạm vi> · <feedback> · việc: <ws>/<sp> · nguồn: \"<lời người dùng>\"`",
		"",
		"## Đang chờ thêm",
		"",
		...waiting,
		"",
		"## Feedback chờ tổng hợp",
		"",
		...pending,
		"",
	].join("\n");
}

const line = (date: string, level = "gợi ý", extra = "") => `- ${date} · mia-content-writer-2 · ${level} · copy · fb${extra} · việc: ws/a · nguồn: "x"`;

const health = (over: Partial<ProjectHealth> = {}): ProjectHealth => ({
	id: "p", dir: "/p", feedbackCount: 0, feedbackFirm: 0, uncommittedCount: 0, longWorkstreams: [], ...over,
});

test("parseFeedback chỉ đếm mục Feedback chờ tổng hợp, bỏ ví dụ phần đầu và nhóm Đang chờ thêm", () => {
	const text = book({
		waiting: ["- Nhóm: câu ngắn · chờ từ 2026-11-01", `  ${line("2026-10-01")}`, `  ${line("2026-10-02")}`],
		pending: [line("2026-11-10"), line("2026-11-03"), line("2026-11-12")],
	});
	expect(parseFeedback(text, NOW)).toEqual({ count: 3, firm: 0, oldest: "2026-11-03" });
	expect(parseFeedback("# rỗng\n", NOW)).toEqual({ count: 0, firm: 0 });
});

test("dòng thêm ở cuối file sau Đang chờ thêm vẫn được đếm", () => {
	const text = book({ waiting: ["- Nhóm: x · chờ từ 2026-11-01", `  ${line("2026-10-01")}`] }) + `${line("2026-11-19")}\n`;
	expect(parseFeedback(text, NOW)).toEqual({ count: 1, firm: 0, oldest: "2026-11-19" });
});

test("mức dứt khoát nhận cả không dấu và chữ hoa", () => {
	const text = book({
		pending: [line("2026-11-10", "dứt khoát"), line("2026-11-11", "dut khoat"), line("2026-11-12", "Dứt Khoát"), line("2026-11-13", "gợi ý")],
	});
	expect(parseFeedback(text, NOW)).toEqual({ count: 4, firm: 3, oldest: "2026-11-10" });
});

test("bỏ dòng `· đến` còn hạn, dòng đã hết hạn vẫn tính", () => {
	const text = book({
		pending: [line("2026-11-01", "gợi ý", " · đến 2026-11-30"), line("2026-11-02", "gợi ý", " · đến 2026-11-15"), line("2026-11-10")],
	});
	expect(parseFeedback(text, NOW)).toEqual({ count: 2, firm: 0, oldest: "2026-11-02" });
});

test("ngưỡng sổ: 9 dòng/7 ngày/không dứt khoát im lặng; 1 dứt khoát, 10 dòng hoặc 8 ngày thì báo", () => {
	expect(curationReasons(health({ feedbackCount: 9, feedbackOldestDays: 7 }))).toEqual([]);
	const firm = curationReasons(health({ feedbackCount: 1, feedbackFirm: 1, feedbackOldestDays: 0 }));
	expect(firm).toHaveLength(1);
	expect(firm[0]).toContain("dứt khoát");
	expect(curationReasons(health({ feedbackCount: THRESHOLDS.feedbackLines, feedbackOldestDays: 1 }))).toHaveLength(1);
	expect(curationReasons(health({ feedbackCount: 1, feedbackOldestDays: 8 }))).toHaveLength(1);
});

test("ngưỡng Git: chưa commit 3 ngày im lặng, 4 ngày thì báo", () => {
	expect(curationReasons(health({ uncommittedCount: 5, uncommittedOldestDays: 3 }))).toEqual([]);
	expect(curationReasons(health({ uncommittedCount: 5, uncommittedOldestDays: 4 }))).toHaveLength(1);
});

test("ngưỡng WORKSTREAM: 200 dòng im lặng, 201 thì báo", () => {
	const dir = project("ws");
	write(join(dir, "work/a/WORKSTREAM.md"), "x\n".repeat(200));
	write(join(dir, "work/b/WORKSTREAM.md"), "x\n".repeat(201));
	commitAll(dir, "ws");
	const h = assessProject(dir, NOW)!;
	expect(h.longWorkstreams).toEqual([{ path: "work/b/WORKSTREAM.md", lines: 201 }]);
	expect(curationReasons(h)).toHaveLength(1);
});

test("file trong production/ đã ignore không tính là chưa commit; file brand chưa commit thì tính", () => {
	const dir = project("brand-mau");
	write(join(dir, ".gitignore"), "work/*/production/\n");
	commitAll(dir, "ignore");
	write(join(dir, "work/a/production/frame.png"), "png", 10);
	expect(assessProject(dir, NOW)!.uncommittedCount).toBe(0);
	write(join(dir, "brand/foundation.md"), "# f\n", 5);
	const h = assessProject(dir, NOW)!;
	expect(h.uncommittedCount).toBe(1);
	expect(h.uncommittedOldestDays).toBe(5);
});

test("rename ở cột index lẫn cột worktree chỉ tính một path mới", () => {
	const dir = project("rename");
	write(join(dir, "a.md"), "a\n");
	write(join(dir, "b.md"), "b\n");
	commitAll(dir, "ab");
	git(dir, "mv", "a.md", "c.md");
	renameSync(join(dir, "b.md"), join(dir, "d.md"));
	git(dir, "add", "-N", "d.md");
	expect(assessProject(dir, NOW)!.uncommittedCount).toBe(2);
});

test("assessProject đọc Project ID, sổ feedback, số dòng dứt khoát và tuổi dòng cũ nhất", () => {
	const dir = project("pb");
	write(join(dir, "brand/feedback.md"), book({ pending: [line("2026-11-10", "dứt khoát"), line("2026-11-15")] }));
	const h = assessProject(dir, NOW)!;
	expect(h.id).toBe("pb-id");
	expect(h.feedbackCount).toBe(2);
	expect(h.feedbackFirm).toBe(1);
	expect(h.feedbackOldestDays).toBe(10);
});

test("thiếu sổ hoặc chỉ có pending-rules.md cũ: không đếm, không throw; không có PROJECT.md thì null", () => {
	const dir = project("legacy", { repo: false });
	expect(assessProject(dir, NOW)!.feedbackCount).toBe(0);
	write(join(dir, "brand/pending-rules.md"), `# P\n${line("2026-11-01")}\n`.repeat(12));
	expect(assessProject(dir, NOW)!.feedbackCount).toBe(0);
	const plain = join(tmp, "notes");
	mkdirSync(plain, { recursive: true });
	expect(assessProject(plain, NOW)).toBeNull();
});

test("formatReport rỗng khi không có lý do; có thì nêu Project ID và Skill brand-curation", () => {
	expect(formatReport("brand-mau", [])).toBeUndefined();
	const report = formatReport("brand-mau", ["sổ có 1 dòng dứt khoát"])!;
	expect(report).toContain("[project-health — hook tự chèn]");
	expect(report).toContain("brand-mau");
	expect(report).toContain("brand-curation");
	expect(report).not.toContain("project-curation");
});

type Entry = { type: string; customType?: string };
type Handler = (event: { reason?: string }, ctx: object) => Promise<{ message: { customType: string; content: string } } | undefined>;

/** Copy hook vào `<root>/.omp/hooks/pre/` như cách Factory cài cho Project, rồi nạp theo path đó. */
async function installHook(root: string): Promise<Handler> {
	const hooks = join(root, ".omp/hooks/pre");
	mkdirSync(hooks, { recursive: true });
	copyFileSync(join(import.meta.dir, "project-health.ts"), join(hooks, "project-health.ts"));
	const { default: setup } = await import(join(hooks, "project-health.ts"));
	let handler: Handler | undefined;
	setup({ on(name: string, fn: Handler) { if (name === "before_agent_start") handler = fn; } });
	return handler!;
}

const ctx = (branch: Entry[], warnings: string[] = []) => ({
	agent: { kind: "main" }, hasUI: true,
	ui: { notify: (m: string) => warnings.push(m) },
	sessionManager: { getBranch: () => branch },
});

test("hook trong .omp/hooks/pre của Project đọc sổ của chính root đó, chèn một lần mỗi session, bỏ revive", async () => {
	const dir = project("brand-mau");
	write(join(dir, "brand/feedback.md"), book());
	commitAll(dir, "book");
	const handler = await installHook(dir);
	expect(await handler({}, ctx([]))).toBeUndefined();
	appendFileSync(join(dir, "brand/feedback.md"), `${line("2026-11-19", "dứt khoát")}\n`);
	const branch: Entry[] = [];
	const first = await handler({}, ctx(branch));
	expect(first?.message.customType).toBe("ai-os.project-health");
	expect(first?.message.content).toContain("brand-mau-id");
	expect(first?.message.content).toContain("brand-curation");
	branch.push({ type: "custom_message", customType: "ai-os.project-health" });
	expect(await handler({}, ctx(branch))).toBeUndefined();
	expect(await handler({ reason: "revive" }, ctx([]))).toBeUndefined();
});

test("hook im lặng, không throw khi root không phải Project", async () => {
	const root = join(tmp, "not-a-project");
	mkdirSync(root, { recursive: true });
	const handler = await installHook(root);
	const warnings: string[] = [];
	expect(await handler({}, ctx([], warnings))).toBeUndefined();
	expect(warnings).toEqual([]);
});

test("hook im lặng ở Project chưa có sổ feedback dù WORKSTREAM vượt ngưỡng (Project chưa nâng V0.2.1)", async () => {
	const dir = project("legacy-hook");
	write(join(dir, "brand/pending-rules.md"), `# P\n${line("2026-11-01", "dứt khoát")}\n`);
	write(join(dir, "work/a/WORKSTREAM.md"), "x\n".repeat(201));
	commitAll(dir, "legacy");
	const handler = await installHook(dir);
	expect(await handler({}, ctx([]))).toBeUndefined();
});
