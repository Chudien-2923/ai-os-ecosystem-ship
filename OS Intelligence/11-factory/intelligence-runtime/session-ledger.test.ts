import { afterEach, beforeEach, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, statSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
	charsAfter,
	classifyCwd,
	concurrentSessions,
	DEFAULT_THRESHOLDS,
	listSessions,
	loadThresholds,
	markSession,
	pendingSessions,
	readLedger,
	resolveRoots,
	type Roots,
	summarizeSession,
} from "./session-ledger";

const MIN = 60_000;
const NOW = new Date("2026-11-20T12:00:00.000Z");
let tmp: string;
let roots: Roots;

beforeEach(() => {
	tmp = realpathSync(mkdtempSync(join(tmpdir(), "session-ledger-")));
	const ecosystem = join(tmp, "AI OS Ecosystem");
	roots = {
		main: join(ecosystem, "OS Intelligence"),
		ecosystem,
		worktreeBase: join(ecosystem, "OS Worktree", "OS Intelligence"),
	};
	mkdirSync(roots.main, { recursive: true });
});
afterEach(() => rmSync(tmp, { recursive: true, force: true }));

type Msg = { role: "user" | "assistant" | "toolResult"; text: string; at: string };

const at = (minutesBeforeNow: number) => new Date(NOW.getTime() - minutesBeforeNow * MIN).toISOString();

function writeSession(name: string, cwd: string, msgs: Msg[], idleMinutes = 120, dir = "sessions/-x"): string {
	const folder = join(tmp, dir);
	mkdirSync(folder, { recursive: true });
	const file = join(folder, `${name}.jsonl`);
	const lines = [
		JSON.stringify({ type: "title", v: 1, title: `Title ${name}` }),
		JSON.stringify({ type: "session", version: 3, id: `id-${name}`, timestamp: msgs[0]?.at ?? at(600), cwd }),
		...msgs.map(m =>
			JSON.stringify({
				type: "message",
				timestamp: m.at,
				message: { role: m.role, content: [{ type: "text", text: m.text }] },
			}),
		),
	];
	writeFileSync(file, `${lines.join("\n")}\n`);
	const t = new Date(NOW.getTime() - idleMinutes * MIN);
	utimesSync(file, t, t);
	return file;
}

const opts = (extra: Partial<Parameters<typeof pendingSessions>[2]> = {}) => ({
	sessionsDir: join(tmp, "sessions"),
	roots,
	now: NOW,
	thresholds: DEFAULT_THRESHOLDS,
	worktreeExists: () => false,
	...extra,
});

const LONG = "Người dùng đổi mục tiêu học: ưu tiên Business Analysis, bỏ hẳn Software Engineering, IELTS vẫn 6.5 nhé em.";

// ------------------------------------------------------------ classifyCwd

test("classifyCwd tách Intelligence, worktree, ngoài repo và repo khác", () => {
	const eco = roots.ecosystem;
	expect(classifyCwd(roots.main, roots)).toBe("intel");
	expect(classifyCwd(join(roots.main, "03-work"), roots)).toBe("intel");
	expect(classifyCwd(join(roots.worktreeBase, "x"), roots)).toBe("intel-worktree");
	expect(classifyCwd("/tmp", roots)).toBe("outside");
	expect(classifyCwd("/private/tmp/builder-sample", roots)).toBe("outside");
	expect(classifyCwd(eco, roots)).toBe("outside");
	expect(classifyCwd(join(eco, "OS Staff", "mia-content-writer"), roots)).toBeNull();
	expect(classifyCwd(join(eco, "AI OS Ecosystem (ship)", "OS Intelligence"), roots)).toBeNull();
	expect(classifyCwd(join(eco, "OS Worktree", "mia-content-writer", "x"), roots)).toBeNull();
	expect(classifyCwd(`${roots.main} copy`, roots)).toBeNull();
});

test("resolveRoots từ worktree trả về checkout chính", () => {
	const git = (cwd: string, ...args: string[]) => {
		const r = spawnSync("git", args, { cwd, encoding: "utf8" });
		if (r.status !== 0) throw new Error(r.stderr);
	};
	git(roots.main, "init", "-q");
	writeFileSync(join(roots.main, "a.md"), "a\n");
	git(roots.main, "add", "a.md");
	git(roots.main, "-c", "user.email=t@t", "-c", "user.name=t", "commit", "-qm", "init");
	const wt = join(roots.worktreeBase, "wt");
	mkdirSync(roots.worktreeBase, { recursive: true });
	git(roots.main, "worktree", "add", "-q", wt);
	expect(resolveRoots(wt)).toEqual(roots);
	expect(resolveRoots(roots.main)).toEqual(roots);
});

test("resolveRoots khi Intelligence là thư mục con của repo cha (bản Ship)", () => {
	const ship = roots.ecosystem;
	const git = (...args: string[]) => {
		const r = spawnSync("git", args, { cwd: ship, encoding: "utf8" });
		if (r.status !== 0) throw new Error(r.stderr);
	};
	git("init", "-q");
	writeFileSync(join(roots.main, "a.md"), "a\n");
	git("add", ".");
	git("-c", "user.email=t@t", "-c", "user.name=t", "commit", "-qm", "init");
	expect(resolveRoots(roots.main)).toEqual(roots);
});

// ------------------------------------------------------------ summarizeSession

test("summarizeSession chỉ đếm tin thật của người dùng", () => {
	const file = writeSession("a", "/tmp", [
		{ role: "user", text: "<system-reminder>ngày</system-reminder>", at: at(300) },
		{ role: "user", text: "Câu một", at: at(290) },
		{ role: "assistant", text: "Trả lời", at: at(289) },
		{ role: "user", text: "  Câu hai", at: at(280) },
	]);
	const s = summarizeSession(file);
	expect(s?.userMessages).toBe(2);
	expect(s?.lastUserAt).toBe(at(280));
	expect(s?.id).toBe("id-a");
	expect(s?.title).toBe("Title a");
	expect(charsAfter(s!, at(285))).toBe("  Câu hai".trim().length);
});

test("receipt chỉ tính trong lời assistant", () => {
	const ok = summarizeSession(
		writeSession("ok", "/tmp", [
			{ role: "user", text: "chốt", at: at(300) },
			{ role: "assistant", text: "Session close: READY TO CLOSE", at: at(299) },
		]),
	);
	expect(ok?.receiptAt).toBe(at(299));
	const tool = summarizeSession(
		writeSession("tool", "/tmp", [
			{ role: "user", text: "đọc skill", at: at(300) },
			{ role: "toolResult", text: "trả `READY TO CLOSE` khi xong", at: at(299) },
			{ role: "user", text: "READY TO COMPACT là gì?", at: at(298) },
		]),
	);
	expect(tool?.receiptAt).toBeUndefined();
});

test("receipt là dòng trạng thái thật của Skill, không phải câu nhắc tới chữ READY", () => {
	const forms = ["Session close: **READY TO CLOSE**", "## Continuity check: READY TO COMPACT", "**Session close: READY TO CLOSE**", "READY TO CLOSE"];
	forms.forEach((text, i) => {
		const s = summarizeSession(
			writeSession(`form${i}`, "/tmp", [
				{ role: "user", text: "chốt", at: at(300) },
				{ role: "assistant", text: `Kết quả\n${text}\nResume: x`, at: at(299) },
			]),
		);
		expect(s?.receiptAt).toBe(at(299));
	});
	const quoted = summarizeSession(
		writeSession("quoted", "/tmp", [
			{ role: "user", text: "giao worker", at: at(300) },
			{ role: "assistant", text: "Trước khi kết thúc session, dùng skill close và chỉ báo READY TO CLOSE", at: at(299) },
			{ role: "assistant", text: "Continuity check: READY TO COMPACT | BLOCKED", at: at(298) },
		]),
	);
	expect(quoted?.receiptAt).toBeUndefined();
});

test("file được ghi thêm giữa lúc đọc thì summary không khớp stat mới, để lần sau đọc lại", () => {
	const file = writeSession("race", "/tmp", [{ role: "user", text: "một", at: at(300) }]);
	const extra = `${JSON.stringify({ type: "message", timestamp: at(200), message: { role: "assistant", content: [{ type: "text", text: "Session close: READY TO CLOSE" }] } })}\n`;
	// Session khác ghi thêm đúng lúc hook đang đọc: hàm đọc trả nội dung cũ rồi file mới lớn lên.
	const s = summarizeSession(file, path => {
		const before = readFileSync(path, "utf8");
		writeFileSync(path, before + extra);
		return before;
	});
	expect(s?.receiptAt).toBeUndefined();
	expect(s?.size).not.toBe(statSync(file).size);
});

test("dòng JSON hỏng không làm mất session; file rỗng trả null", () => {
	const file = writeSession("broken", "/tmp", [{ role: "user", text: "một", at: at(300) }]);
	writeFileSync(file, `{"type":"session","id":"id-b","timestamp":"${at(310)}","cwd":"/tmp"}\n{hỏng\n${JSON.stringify({ type: "message", timestamp: at(300), message: { role: "user", content: "chuỗi thường" } })}\n`);
	const s = summarizeSession(file);
	expect(s?.userMessages).toBe(1);
	const empty = join(tmp, "empty.jsonl");
	writeFileSync(empty, "");
	expect(summarizeSession(empty)).toBeNull();
});

// ------------------------------------------------------------ pendingSessions

function pendingIds(extra: Partial<Parameters<typeof pendingSessions>[2]> = {}, ledgerMain = roots.main): string[] {
	const all = listSessions(join(tmp, "sessions"));
	return pendingSessions(all, readLedger(ledgerMain), opts(extra)).map(s => s.id);
}

test("không receipt thì chờ; câu ngắn sau receipt không làm hiện lại; đoạn dài thì có", () => {
	writeSession("none", "/tmp", [{ role: "user", text: "chào", at: at(300) }]);
	writeSession("short", "/tmp", [
		{ role: "user", text: LONG, at: at(300) },
		{ role: "assistant", text: "READY TO CLOSE", at: at(299) },
		{ role: "user", text: "OKe commit đi nhé", at: at(298) },
	]);
	writeSession("long", "/tmp", [
		{ role: "user", text: "chốt", at: at(300) },
		{ role: "assistant", text: "READY TO CLOSE", at: at(299) },
		{ role: "user", text: LONG, at: at(298) },
	]);
	expect(pendingIds().sort()).toEqual(["id-long", "id-none"]);
});

test("sổ đối soát, file đang hoạt động, session hiện tại, worktree, repo khác", () => {
	writeSession("marked", "/tmp", [{ role: "user", text: LONG, at: at(300) }]);
	writeSession("busy", "/tmp", [{ role: "user", text: LONG, at: at(300) }], 10);
	const current = writeSession("current", "/tmp", [{ role: "user", text: LONG, at: at(300) }]);
	writeSession("wt", join(roots.worktreeBase, "x"), [{ role: "user", text: LONG, at: at(300) }]);
	writeSession("staff", join(roots.ecosystem, "OS Staff", "mia-content-writer"), [{ role: "user", text: LONG, at: at(300) }]);
	writeSession("nouser", "/tmp", [{ role: "assistant", text: "x", at: at(300) }]);
	markSession(roots.main, { id: "id-marked", until: at(300), at: NOW.toISOString(), note: "test" });
	expect(pendingIds({ currentFile: current, worktreeExists: () => true })).toEqual([]);
	expect(pendingIds({ currentFile: current, worktreeExists: () => false })).toEqual(["id-wt"]);
});

test("pending sắp cũ → mới và bỏ qua session sub-agent ở thư mục con", () => {
	writeSession("new", "/tmp", [{ role: "user", text: "b", at: at(200) }]);
	writeSession("old", "/tmp", [{ role: "user", text: "a", at: at(400) }]);
	writeSession("sub", "/tmp", [{ role: "user", text: "task", at: at(300) }], 120, "sessions/-x/parent");
	expect(pendingIds()).toEqual(["id-old", "id-new"]);
});

test("markSession hai lần cùng id giữ until lớn nhất", () => {
	markSession(roots.main, { id: "s", until: at(100), at: at(0), note: "1" });
	markSession(roots.main, { id: "s", until: at(300), at: at(0), note: "2" });
	expect(readLedger(roots.main).get("s")?.until).toBe(at(100));
	expect(readLedger(join(tmp, "không-có")).size).toBe(0);
});

test("listSessions dùng cache khi file không đổi", () => {
	const file = writeSession("c", "/tmp", [{ role: "user", text: "a", at: at(300) }]);
	const cache = join(tmp, "cache.json");
	expect(listSessions(join(tmp, "sessions"), cache)[0]?.userMessages).toBe(1);
	// Đổi nội dung nhưng giữ size + mtime → cache vẫn trả bản cũ.
	const t = new Date(NOW.getTime() - 120 * MIN);
	writeFileSync(file, readFileSync(file, "utf8").replace('"role":"user"', '"role":"xxxx"'));
	utimesSync(file, t, t);
	expect(listSessions(join(tmp, "sessions"), cache)[0]?.userMessages).toBe(1);
	expect(listSessions(join(tmp, "không-có"), cache)).toEqual([]);
});

// ------------------------------------------------------------ concurrent + thresholds

test("concurrentSessions chỉ lấy session Intelligence vừa hoạt động", () => {
	const current = writeSession("me", roots.main, [{ role: "user", text: "a", at: at(5) }], 1);
	writeSession("other", roots.main, [{ role: "user", text: "a", at: at(5) }], 5);
	writeSession("outside", "/tmp", [{ role: "user", text: "a", at: at(5) }], 5);
	writeSession("old", roots.main, [{ role: "user", text: "a", at: at(30) }], 20);
	const all = listSessions(join(tmp, "sessions"));
	expect(concurrentSessions(all, opts({ currentFile: current })).map(s => s.id)).toEqual(["id-other"]);
});

test("loadThresholds đọc .omp/freshness.json, hỏng thì dùng mặc định", () => {
	expect(loadThresholds(roots.main)).toEqual(DEFAULT_THRESHOLDS);
	mkdirSync(join(roots.main, ".omp"), { recursive: true });
	writeFileSync(join(roots.main, ".omp", "freshness.json"), JSON.stringify({ thresholds: { batchSize: 3 } }));
	expect(loadThresholds(roots.main)).toEqual({ ...DEFAULT_THRESHOLDS, batchSize: 3 });
	writeFileSync(join(roots.main, ".omp", "freshness.json"), "{hỏng");
	expect(loadThresholds(roots.main)).toEqual(DEFAULT_THRESHOLDS);
});
