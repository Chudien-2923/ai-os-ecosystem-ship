import { afterEach, beforeEach, expect, test } from "bun:test";
import { mkdtempSync, realpathSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import type { ExtensionAPI } from "@oh-my-pi/pi-coding-agent";
import { join } from "node:path";
import { baselineEntries, buildReport, createFreshnessHook, type HookDeps } from "./freshness";
import type { Roots, SessionSummary } from "./session-ledger";
import type { Finding } from "./stale-checks";

const NOW = new Date("2026-11-20T12:00:00.000Z");
let tmp: string;
let roots: Roots;

beforeEach(() => {
	tmp = realpathSync(mkdtempSync(join(tmpdir(), "freshness-")));
	roots = { main: join(tmp, "eco/OS Intelligence"), ecosystem: join(tmp, "eco"), worktreeBase: join(tmp, "eco/OS Worktree/OS Intelligence") };
});
afterEach(() => rmSync(tmp, { recursive: true, force: true }));

function session(id: string, extra: Partial<SessionSummary> = {}): SessionSummary {
	return {
		id,
		file: join(tmp, `${id}.jsonl`),
		cwd: "/tmp",
		title: `Phiên ${id}`,
		startedAt: "2026-11-01T00:00:00.000Z",
		mtimeMs: NOW.getTime() - 3_600_000,
		size: 1,
		userMessages: 4,
		lastUserAt: "2026-11-01T01:00:00.000Z",
		userTail: [{ at: "2026-11-01T01:00:00.000Z", chars: 100 }],
		...extra,
	};
}

const finding = (n: number): Finding => ({ check: "wikilink", location: `a.md:${n}`, detail: "gãy" });

// ------------------------------------------------------------ buildReport

test("buildReport im lặng khi không có gì", () => {
	expect(buildReport({ pending: [], concurrent: [], findings: [], errors: [], batchSize: 5 })).toBeUndefined();
});

test("buildReport nêu tổng session chờ và chỉ liệt kê batchSize session", () => {
	const pending = Array.from({ length: 7 }, (_, i) => session(`s${i}`));
	const report = buildReport({ pending, concurrent: [], findings: [], errors: [], batchSize: 5 })!;
	expect(report).toContain("7 session");
	expect(report.match(/Phiên s\d/g)?.length).toBe(5);
	expect(report).toContain("Việc tồn đọng");
	expect(report).toContain("freshness-cli.ts mark");
});

test("buildReport cắt finding ở 8 dòng", () => {
	const report = buildReport({ pending: [], concurrent: [], findings: Array.from({ length: 12 }, (_, i) => finding(i)), errors: [], batchSize: 5 })!;
	expect(report.match(/a\.md:\d+/g)?.length).toBe(8);
	expect(report).toContain("+4");
});

test("chỉ có session song song thì nhắc đọc lại, không yêu cầu mục Việc tồn đọng", () => {
	const report = buildReport({ pending: [], concurrent: [session("other", { cwd: roots.main })], findings: [], errors: [], batchSize: 5 })!;
	expect(report).toContain("Phiên other");
	expect(report).not.toContain("Việc tồn đọng");
});

test("lỗi một phần vẫn được báo", () => {
	const report = buildReport({ pending: [], concurrent: [], findings: [], errors: ["version: ENOENT"], batchSize: 5 })!;
	expect(report).toContain("version: ENOENT");
});

// ------------------------------------------------------------ baseline

test("baseline ghi mọi session đủ phạm vi trừ nhóm rủi ro từ mốc trở đi", () => {
	const all = [
		session("old", { startedAt: "2026-09-01T00:00:00.000Z" }),
		session("risky", { startedAt: "2026-10-20T00:00:00.000Z", userMessages: 3 }),
		session("closed", { startedAt: "2026-10-20T00:00:00.000Z", receiptAt: "2026-10-20T02:00:00.000Z" }),
		session("short", { startedAt: "2026-10-20T00:00:00.000Z", userMessages: 2 }),
		session("staff", { cwd: join(roots.ecosystem, "OS Staff/mia-content-writer") }),
		session("empty", { userMessages: 0, lastUserAt: undefined, userTail: [] }),
	];
	const entries = baselineEntries(all, roots, "2026-10-15", NOW);
	expect(entries.map(e => e.id).sort()).toEqual(["closed", "old", "short"]);
	expect(entries.every(e => e.note === "baseline" && e.until === "2026-11-01T01:00:00.000Z")).toBe(true);
});

// ------------------------------------------------------------ hook

type Entry = { type: string; customType?: string; message?: { role?: string } };

function harness(deps: Partial<HookDeps>) {
	type Handler = (
		event: { reason?: string },
		ctx: object,
	) => Promise<{ message: { customType: string; content: string; display: boolean } } | undefined>;
	let handler: Handler | undefined;
	createFreshnessHook({
		roots: () => roots,
		sessions: () => [session("p1")],
		checks: () => ({ findings: [], errors: [] }),
		now: () => NOW,
		...deps,
		// Stub chỉ cài `on`, phần duy nhất hook dùng của ExtensionAPI.
	})({ on: (name: string, fn: Handler) => { if (name === "before_agent_start") handler = fn; } } as unknown as ExtensionAPI);
	const ctx = (branch: Entry[], kind = "main", warnings: string[] = []) => ({
		agent: { kind },
		cwd: roots.main,
		hasUI: true,
		ui: { notify: (m: string) => warnings.push(m) },
		sessionManager: { getBranch: () => branch, getSessionFile: () => join(tmp, "current.jsonl") },
	});
	return { run: (event: { reason?: string }, c: object) => handler!(event, c), ctx };
}

test("hook chèn một lần mỗi session, bỏ sub-agent và revive", async () => {
	const h = harness({});
	const branch: Entry[] = [];
	const first = await h.run({}, h.ctx(branch));
	expect(first?.message.customType).toBe("ai-os.freshness");
	expect(first?.message.display).toBe(false);
	expect(first?.message.content).toContain("Phiên p1");
	branch.push({ type: "custom_message", customType: "ai-os.freshness" });
	expect(await h.run({}, h.ctx(branch))).toBeUndefined();
	expect(await h.run({}, h.ctx([], "sub"))).toBeUndefined();
	expect(await h.run({ reason: "revive" }, h.ctx([]))).toBeUndefined();
});

test("đọc session lỗi thì vẫn báo phần check", async () => {
	const h = harness({
		sessions: () => {
			throw new Error("ENOENT sessions");
		},
		checks: () => ({ findings: [finding(1)], errors: [] }),
	});
	const out = await h.run({}, h.ctx([]));
	expect(out?.message.content).toContain("a.md:1");
	expect(out?.message.content).toContain("ENOENT sessions");
});

test("không có gì thì hook im lặng", async () => {
	const h = harness({ sessions: () => [] });
	expect(await h.run({}, h.ctx([]))).toBeUndefined();
});

test("chỉ lượt đầu: sau khi đã có lời assistant thì không quét, không chèn giữa session", async () => {
	let scans = 0;
	const h = harness({
		sessions: () => {
			scans++;
			return [session("p1")];
		},
	});
	const branch: Entry[] = [{ type: "message", message: { role: "user" } }, { type: "message", message: { role: "assistant" } }];
	expect(await h.run({}, h.ctx(branch))).toBeUndefined();
	expect(scans).toBe(0);
});
