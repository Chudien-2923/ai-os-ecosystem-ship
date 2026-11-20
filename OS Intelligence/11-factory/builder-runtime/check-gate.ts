// check-gate v0.2.0 — source: OS Intelligence/11-factory/builder-runtime/check-gate.ts
// Hook OMP cho Builder app: cuối mỗi lượt Agent chính có sửa file code (không tính Markdown và `.omp/`),
// chạy `scripts/check.sh`; fail thì gửi đuôi lỗi để Agent tự sửa tối đa 2 vòng, rồi dừng và báo người dùng.
// Cài vào repo app tại `.omp/hooks/pre/check-gate.ts`.
// Thiết kế: OS Intelligence/03-work/builder-harness-spec/DESIGN.md §5.4
import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { ExtensionAPI } from "@oh-my-pi/pi-coding-agent";

export const CUSTOM_TYPE = "builder.check-gate";
export const MAX_FIX_ROUNDS = 2;
export const TIMEOUT_MS = 600_000;
const TAIL_LINES = 60;
const MAX_OUTPUT_CHARS = 200_000;
const CHECK_SCRIPT = "scripts/check.sh";

const HOOK_DIR = import.meta.dir ?? dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HOOK_DIR, "../../..");

// Kiểu tối thiểu của phần OMP API hook này dùng.
type HookContext = {
	agent?: { kind: string };
	ui?: { notify(message: string, type?: string): void };
	sessionManager: { getSessionId(): string };
};
type EndEvent = { willContinue?: boolean; awaitingAsyncWork?: boolean };
type SessionState = { baseline?: Map<string, string> | null; fixRounds: number; reminded: boolean };
type CheckResult = { code: number | null; output: string; timedOut: boolean };

const sessions = new Map<string, SessionState>();
const stateFor = (ctx: HookContext): SessionState => {
	const id = ctx.sessionManager.getSessionId();
	let state = sessions.get(id);
	if (!state) sessions.set(id, (state = { fixRounds: 0, reminded: false }));
	return state;
};
const isMain = (ctx: HookContext) => !ctx.agent || ctx.agent.kind === "main";

/** File đang khác `HEAD` (kể cả untracked, trừ file bị ignore) → hash nội dung; `null` khi không phải Git repo. */
export function snapshot(root: string): Map<string, string> | null {
	const status = spawnSync("git", ["status", "--porcelain=v1", "-z", "--untracked-files=all"], { cwd: root, encoding: "utf8" });
	if (status.status !== 0) return null;
	const files = new Map<string, string>();
	const records = status.stdout.split("\0");
	for (let i = 0; i < records.length; i++) {
		const record = records[i];
		if (record.length < 4) continue;
		const code = record.slice(0, 2);
		const path = record.slice(3);
		if (code.includes("R") || code.includes("C")) i++; // bản ghi kế tiếp là path cũ
		if (/\.mdx?$/i.test(path) || path.startsWith(".omp/")) continue; // Markdown và cấu hình OMP không phải code
		const full = join(root, path);
		files.set(path, existsSync(full) ? createHash("sha1").update(readFileSync(full)).digest("hex") : "deleted");
	}
	return files;
}

/** Path có hash khác nhau giữa hai lần chụp (thêm, sửa, xóa, hoặc được revert về `HEAD`). */
export function changedBetween(before: Map<string, string>, after: Map<string, string>): string[] {
	const paths = new Set([...before.keys(), ...after.keys()]);
	return [...paths].filter(path => before.get(path) !== after.get(path)).sort();
}

export function tailLines(text: string, n: number): string {
	const lines = text.replace(/\s+$/, "").split("\n");
	return lines.slice(-n).join("\n");
}

function runCheck(root: string, timeoutMs: number): Promise<CheckResult> {
	const { promise, resolve: done } = Promise.withResolvers<CheckResult>();
	const child = spawn("bash", [CHECK_SCRIPT], { cwd: root, detached: true, stdio: ["ignore", "pipe", "pipe"] });
	let output = "";
	let timedOut = false;
	const collect = (chunk: Buffer) => {
		output = (output + chunk.toString("utf8")).slice(-MAX_OUTPUT_CHARS);
	};
	child.stdout.on("data", collect);
	child.stderr.on("data", collect);
	const timer = setTimeout(() => {
		timedOut = true;
		try {
			process.kill(-child.pid!, "SIGKILL"); // kill cả nhóm tiến trình con (npm, test runner…)
		} catch {
			child.kill("SIGKILL");
		}
	}, timeoutMs);
	child.on("error", error => {
		clearTimeout(timer);
		done({ code: 1, output: `${output}\n${error.message}`, timedOut });
	});
	child.on("close", code => {
		clearTimeout(timer);
		done({ code, output, timedOut });
	});
	return promise;
}

export default function checkGate(pi: ExtensionAPI): void {
	const send = (content: string, triggerTurn: boolean, details: Record<string, unknown>) =>
		pi.sendMessage(
			{ customType: CUSTOM_TYPE, content, display: true, details },
			triggerTurn ? { triggerTurn: true, deliverAs: "followUp" } : { deliverAs: "nextTurn" },
		);

	pi.on("before_agent_start", async (_event: unknown, ctx: HookContext) => {
		// Chỉ việc của người dùng mới kích hoạt event này; lượt tự sửa do hook mở thì không.
		if (isMain(ctx)) stateFor(ctx).fixRounds = 0;
	});

	pi.on("agent_start", async (_event: unknown, ctx: HookContext) => {
		if (!isMain(ctx)) return;
		const state = stateFor(ctx);
		// Giữ baseline của vòng lặp chưa ổn định (willContinue) để không mất thay đổi của phần đầu lượt.
		if (state.baseline === undefined) state.baseline = snapshot(ROOT);
	});

	pi.on("agent_end", async (event: EndEvent, ctx: HookContext) => {
		if (!isMain(ctx) || event?.willContinue || event?.awaitingAsyncWork) return;
		const state = stateFor(ctx);
		try {
			const before = state.baseline;
			state.baseline = undefined;
			const after = snapshot(ROOT);
			if (!before || !after) return;
			const changed = changedBetween(before, after);
			if (changed.length === 0) return;

			if (!existsSync(join(ROOT, CHECK_SCRIPT))) {
				if (state.reminded) return;
				state.reminded = true;
				send(
					`[check-gate] Repo chưa có \`${CHECK_SCRIPT}\`. Khi đã chọn stack, task đầu tiên của plan đầu tiên phải tạo lệnh kiểm tra này (gộp typecheck/lint/test/build). Từ lúc có file, hook sẽ tự chạy nó cuối mỗi lượt sửa code.`,
					false,
					{ kind: "missing", changed },
				);
				return;
			}

			const timeoutMs = Number(process.env.CHECK_GATE_TIMEOUT_MS) || TIMEOUT_MS;
			const result = await runCheck(ROOT, timeoutMs);
			const tail = tailLines(result.output, TAIL_LINES);
			if (result.timedOut) {
				send(
					`[check-gate] \`${CHECK_SCRIPT}\` chạy quá thời gian (${Math.round(timeoutMs / 1000)} giây) nên đã bị dừng. Không tự sửa; cần người dùng xem.\n\n\`\`\`\n${tail}\n\`\`\``,
					false,
					{ kind: "timeout", changed },
				);
				return;
			}
			if (result.code === 0) {
				state.fixRounds = 0;
				return;
			}
			if (state.fixRounds < MAX_FIX_ROUNDS) {
				state.fixRounds++;
				send(
					`[check-gate] Tin nhắn tự động của hook, không phải người dùng. \`${CHECK_SCRIPT}\` fail (exit ${result.code}) sau lượt sửa code. Đọc lỗi bên dưới, sửa nguyên nhân rồi kết thúc lượt để hook kiểm tra lại (vòng ${state.fixRounds}/${MAX_FIX_ROUNDS}). Không báo xong khi kiểm tra còn fail. Nếu sửa lỗi này phải làm điều người dùng đã dặn không làm (ví dụ lỗi có từ trước và người dùng giới hạn phạm vi), không tự sửa: dừng lại, nói rõ lỗi và hỏi người dùng.\n\n\`\`\`\n${tail}\n\`\`\``,
					true,
					{ kind: "fail", round: state.fixRounds, changed },
				);
				return;
			}
			send(
				`[check-gate] \`${CHECK_SCRIPT}\` vẫn fail sau ${MAX_FIX_ROUNDS} vòng tự sửa. Đã dừng tự sửa; cần người dùng xem lỗi dưới đây và quyết định hướng xử lý.\n\n\`\`\`\n${tail}\n\`\`\``,
				false,
				{ kind: "stopped", changed },
			);
		} catch (error) {
			ctx.ui?.notify(`check-gate: ${(error as Error).message}`, "warning");
		}
	});
}
