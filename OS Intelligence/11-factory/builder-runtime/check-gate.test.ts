import { afterEach, beforeEach, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { chmodSync, copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

type Sent = { message: { customType: string; content: string; display?: boolean }; options?: { triggerTurn?: boolean } };
type Handler = (event: Record<string, unknown>, ctx: unknown) => Promise<unknown>;

let root: string;
let handlers: Record<string, Handler>;
let sent: Sent[];
let notes: string[];

const git = (...args: string[]) => spawnSync("git", args, { cwd: root, encoding: "utf8" });
const write = (path: string, text: string) => {
	mkdirSync(join(root, path, ".."), { recursive: true });
	writeFileSync(join(root, path), text);
};
const checkScript = (body: string) => {
	write("scripts/check.sh", `#!/usr/bin/env bash\n${body}\n`);
	chmodSync(join(root, "scripts/check.sh"), 0o755);
};
const ctx = (kind = "main", id = "s1") => ({
	agent: { kind },
	hasUI: true,
	ui: { notify: (text: string) => notes.push(text) },
	sessionManager: { getSessionId: () => id },
});

async function load(withGit = true) {
	root = mkdtempSync(join(tmpdir(), "check-gate-"));
	mkdirSync(join(root, ".omp/hooks/pre"), { recursive: true });
	const modulePath = join(root, ".omp/hooks/pre/check-gate.ts");
	copyFileSync(join(import.meta.dir, "check-gate.ts"), modulePath);
	write("src/a.ts", "export const a = 1;\n");
	write("README.md", "# demo\n");
	if (withGit) {
		git("init", "-q", "-b", "main");
		git("-c", "user.email=t@t", "-c", "user.name=t", "add", "-A");
		git("-c", "user.email=t@t", "-c", "user.name=t", "commit", "-qm", "init");
	}
	handlers = {};
	sent = [];
	notes = [];
	// Module được copy vào repo tạm và nạp từ đó để kiểm tra ROOT resolution thật; path chọn lúc chạy nên phải import động.
	const { default: setup } = await import(modulePath);
	setup({
		on(name: string, fn: Handler) {
			handlers[name] = fn;
		},
		sendMessage(message: Sent["message"], options?: Sent["options"]) {
			sent.push({ message, options });
		},
	});
}

/** Một lượt của Agent: tùy chọn có tin nhắn người dùng, rồi chạy `act` giữa agent_start và agent_end. */
async function turn(act: () => void, opts: { prompt?: string; kind?: string; id?: string } = {}) {
	const c = ctx(opts.kind, opts.id);
	if (opts.prompt !== undefined) await handlers.before_agent_start?.({ prompt: opts.prompt, reason: "prompt" }, c);
	await handlers.agent_start?.({}, c);
	act();
	await handlers.agent_end?.({}, c);
}

beforeEach(() => {
	delete process.env.CHECK_GATE_TIMEOUT_MS;
});
afterEach(() => rmSync(root, { recursive: true, force: true }));

test("chỉ sửa Markdown thì không chạy kiểm tra", async () => {
	await load();
	checkScript('echo ran > "$(dirname "$0")/../ran.txt"; exit 1');
	git("add", "-A");
	git("-c", "user.email=t@t", "-c", "user.name=t", "commit", "-qm", "check");
	await turn(() => write("README.md", "# đổi\n"), { prompt: "sửa readme" });
	expect(sent).toHaveLength(0);
	expect(Bun.file(join(root, "ran.txt")).size).toBe(0);
});

test("sửa code và kiểm tra pass thì im lặng", async () => {
	await load();
	checkScript("exit 0");
	await turn(() => write("src/a.ts", "export const a = 2;\n"), { prompt: "đổi a" });
	expect(sent).toHaveLength(0);
});

test("kiểm tra fail thì gửi đuôi lỗi và mở lượt sửa", async () => {
	await load();
	checkScript('for i in $(seq 1 100); do echo "line $i"; done; exit 1');
	await turn(() => write("src/a.ts", "export const a = 3;\n"), { prompt: "đổi a" });
	expect(sent).toHaveLength(1);
	expect(sent[0].message.customType).toBe("builder.check-gate");
	expect(sent[0].options?.triggerTurn).toBe(true);
	expect(sent[0].message.content).toContain("line 100");
	expect(sent[0].message.content).not.toContain("line 40\n");
});

test("dừng sau 2 vòng tự sửa và báo người dùng", async () => {
	await load();
	checkScript("echo boom; exit 1");
	await turn(() => write("src/a.ts", "export const a = 4;\n"), { prompt: "đổi a" });
	await turn(() => write("src/a.ts", "export const a = 5;\n"));
	await turn(() => write("src/a.ts", "export const a = 6;\n"));
	expect(sent).toHaveLength(3);
	expect(sent[0].options?.triggerTurn).toBe(true);
	expect(sent[1].options?.triggerTurn).toBe(true);
	expect(sent[2].options?.triggerTurn).toBeFalsy();
	expect(sent[2].message.content).toContain("2 vòng");
});

test("tin nhắn mới của người dùng đặt lại số vòng", async () => {
	await load();
	checkScript("echo boom; exit 1");
	await turn(() => write("src/a.ts", "export const a = 4;\n"), { prompt: "đổi a" });
	await turn(() => write("src/a.ts", "export const a = 5;\n"));
	await turn(() => write("src/a.ts", "export const a = 6;\n"));
	await turn(() => write("src/a.ts", "export const a = 7;\n"), { prompt: "thử lại" });
	expect(sent[3].options?.triggerTurn).toBe(true);
});

test("file người dùng tự sửa giữa hai lượt không tính là Agent sửa", async () => {
	await load();
	checkScript("echo boom; exit 1");
	write("src/a.ts", "export const a = 8;\n");
	await turn(() => {}, { prompt: "giải thích code" });
	expect(sent).toHaveLength(0);
});

test("thiếu scripts/check.sh thì nhắc một lần mỗi session", async () => {
	await load();
	await turn(() => write("src/a.ts", "export const a = 9;\n"), { prompt: "đổi a" });
	await turn(() => write("src/a.ts", "export const a = 10;\n"), { prompt: "đổi tiếp" });
	expect(sent).toHaveLength(1);
	expect(sent[0].options?.triggerTurn).toBeFalsy();
	expect(sent[0].message.content).toContain("scripts/check.sh");
});

test("kiểm tra quá thời gian thì báo, không mở lượt sửa", async () => {
	await load();
	process.env.CHECK_GATE_TIMEOUT_MS = "300";
	checkScript("sleep 5");
	await turn(() => write("src/a.ts", "export const a = 11;\n"), { prompt: "đổi a" });
	expect(sent).toHaveLength(1);
	expect(sent[0].options?.triggerTurn).toBeFalsy();
	expect(sent[0].message.content).toContain("quá thời gian");
});

test("thư mục không phải Git thì im lặng", async () => {
	await load(false);
	checkScript("echo boom; exit 1");
	await turn(() => write("src/a.ts", "export const a = 12;\n"), { prompt: "đổi a" });
	expect(sent).toHaveLength(0);
});

test("sub-agent không kích hoạt hook", async () => {
	await load();
	checkScript("echo boom; exit 1");
	await turn(() => write("src/a.ts", "export const a = 13;\n"), { prompt: "đổi a", kind: "task" });
	expect(sent).toHaveLength(0);
});

test("vòng lặp chưa ổn định (willContinue) thì chờ, kiểm tra ở lần kết thúc thật", async () => {
	await load();
	checkScript("echo boom; exit 1");
	const c = ctx();
	await handlers.before_agent_start?.({ prompt: "đổi a", reason: "prompt" }, c);
	await handlers.agent_start?.({}, c);
	write("src/a.ts", "export const a = 14;\n");
	await handlers.agent_end?.({ willContinue: true }, c);
	expect(sent).toHaveLength(0);
	await handlers.agent_start?.({}, c);
	await handlers.agent_end?.({}, c);
	expect(sent).toHaveLength(1);
});
