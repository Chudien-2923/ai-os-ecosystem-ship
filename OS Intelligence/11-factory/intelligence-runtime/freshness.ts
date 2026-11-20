// freshness v0.1.1 — source: OS Intelligence/11-factory/intelligence-runtime/freshness.ts
// Hook OMP cho OS Intelligence: lượt đầu mỗi session chính, liệt kê session cũ chưa đối soát,
// dấu hiệu Markdown bị cũ và session Intelligence song song; im lặng khi không có gì.
// Cài qua `.omp/hooks/pre/freshness.ts` (re-export file này). CLI: `freshness-cli.ts`.
// Thiết kế: OS Intelligence/03-work/intelligence-markdown-freshness/DESIGN.md §5.
import { homedir } from "node:os";
import { join } from "node:path";
import type { ExtensionAPI } from "@oh-my-pi/pi-coding-agent";
import {
	classifyCwd,
	concurrentSessions,
	type LedgerEntry,
	listSessions,
	loadThresholds,
	pendingSessions,
	readLedger,
	resolveRoots,
	type Roots,
	type SessionSummary,
	type Thresholds,
} from "./session-ledger";
import { type Finding, runAllChecks } from "./stale-checks";

export const MESSAGE_TYPE = "ai-os.freshness";
const MAX_FINDINGS = 8;
const CLI = "bun 11-factory/intelligence-runtime/freshness-cli.ts";

export const sessionsDir = () => join(process.env.PI_CODING_AGENT_DIR ?? join(homedir(), ".omp", "agent"), "sessions");
export const cacheFile = (roots: Roots) => join(roots.main, ".omp", "state", "session-cache.json");

const shortPath = (p: string) => (p.startsWith(homedir()) ? `~${p.slice(homedir().length)}` : p);

function sessionLine(s: SessionSummary): string {
	return `- ${(s.lastUserAt ?? s.startedAt).slice(0, 10)} · ${s.title ?? "(không tên)"} · ${shortPath(s.cwd)} · ${s.userMessages} tin · id ${s.id}`;
}

export type ReportInput = {
	pending: SessionSummary[];
	concurrent: SessionSummary[];
	findings: Finding[];
	errors: string[];
	batchSize: number;
};

export function buildReport(input: ReportInput): string | undefined {
	const { pending, concurrent, findings, errors, batchSize } = input;
	if (!pending.length && !concurrent.length && !findings.length && !errors.length) return undefined;
	const parts: string[] = ["[freshness — hook đầu session Intelligence tự chèn]"];
	if (pending.length)
		parts.push(
			[
				`Session cũ chưa đối soát: ${pending.length} session (${Math.min(batchSize, pending.length)} cũ nhất):`,
				...pending.slice(0, batchSize).map(sessionLine),
			].join("\n"),
		);
	if (findings.length) {
		const shown = findings.slice(0, MAX_FINDINGS).map(f => `- ${f.location} — ${f.detail}`);
		if (findings.length > MAX_FINDINGS) shown.push(`- +${findings.length - MAX_FINDINGS} mục khác (\`${CLI} check\`)`);
		parts.push([`Dấu hiệu Markdown cũ (${findings.length}):`, ...shown].join("\n"));
	}
	if (errors.length) parts.push([`Lỗi khi soát (hook vẫn chạy phần còn lại):`, ...errors.map(e => `- ${e}`)].join("\n"));
	if (concurrent.length)
		parts.push(
			[
				"Session Intelligence khác đang hoạt động — đọc lại bản mới nhất trước khi sửa shared file (`USER.md`, các index, `log.md`, README Daily):",
				...concurrent.map(sessionLine),
			].join("\n"),
		);
	if (pending.length || findings.length)
		parts.push(
			[
				"Chỉ dẫn: trả lời yêu cầu của người dùng trước. Cuối câu trả lời thêm mục `Việc tồn đọng` (1–3 dòng) đề xuất xử lý các mục trên; chỉ xử lý khi người dùng đồng ý.",
				`Đối soát theo Skill \`pre-compact\` chế độ đối soát session cũ; xong mỗi session chạy \`${CLI} mark <id>\`. Danh sách đủ: \`${CLI} pending\`, \`${CLI} check\`.`,
			].join("\n"),
		);
	return parts.join("\n\n");
}

/** Session đủ phạm vi bắt đầu trước `since` hoặc không thuộc nhóm rủi ro (không receipt, ≥ 3 tin thật). */
export function baselineEntries(all: SessionSummary[], roots: Roots, since: string, now: Date): LedgerEntry[] {
	return all
		.filter(s => classifyCwd(s.cwd, roots) && s.userMessages > 0 && s.lastUserAt)
		.filter(s => s.startedAt < since || s.receiptAt || s.userMessages < 3)
		.map(s => ({ id: s.id, until: s.lastUserAt!, at: now.toISOString(), note: "baseline" }));
}

// ---------------------------------------------------------------- wiring OMP

export type HookDeps = {
	roots: (cwd: string) => Roots;
	sessions: (roots: Roots) => SessionSummary[];
	checks: (main: string, now: Date) => { findings: Finding[]; errors: string[] };
	now: () => Date;
	thresholds?: (main: string) => Thresholds;
};

type BranchEntry = { type: string; customType?: string; message?: { role?: string } };
type HookContext = {
	agent?: { kind: string };
	cwd: string;
	hasUI?: boolean;
	ui: { notify(message: string, type?: string): void };
	sessionManager: { getBranch(): BranchEntry[]; getSessionFile(): string | undefined };
};
type StartEvent = { reason?: string };

export function createFreshnessHook(deps: HookDeps): (pi: ExtensionAPI) => void {
	return pi => {
		pi.on("before_agent_start", async (event: StartEvent, ctx: HookContext) => {
			if (ctx.agent && ctx.agent.kind !== "main") return;
			if (event.reason === "revive") return;
			try {
				// Chỉ lượt đầu: đã chèn, hoặc assistant đã trả lời (kể cả khi lượt đầu im lặng) → không quét lại.
				const firstTurn = !ctx.sessionManager
					.getBranch()
					.some(entry => entry.customType === MESSAGE_TYPE || entry.message?.role === "assistant");
				if (!firstTurn) return;
				const now = deps.now();
				const roots = deps.roots(ctx.cwd);
				const thresholds = (deps.thresholds ?? loadThresholds)(roots.main);
				const errors: string[] = [];
				let pending: SessionSummary[] = [];
				let concurrent: SessionSummary[] = [];
				try {
					const all = deps.sessions(roots);
					const opts = { sessionsDir: sessionsDir(), roots, now, thresholds, currentFile: ctx.sessionManager.getSessionFile() };
					pending = pendingSessions(all, readLedger(roots.main), opts);
					concurrent = concurrentSessions(all, opts);
				} catch (error) {
					errors.push(`session: ${(error as Error).message}`);
				}
				const checked = deps.checks(roots.main, now);
				const content = buildReport({
					pending,
					concurrent,
					findings: checked.findings,
					errors: [...errors, ...checked.errors],
					batchSize: thresholds.batchSize,
				});
				if (!content) return;
				return { message: { customType: MESSAGE_TYPE, content, display: false, attribution: "agent" } };
			} catch (error) {
				if (ctx.hasUI) ctx.ui.notify(`freshness: ${(error as Error).message}`, "warning");
			}
		});
	};
}

export default createFreshnessHook({
	roots: () => resolveRoots(),
	sessions: roots => listSessions(sessionsDir(), cacheFile(roots)),
	checks: runAllChecks,
	now: () => new Date(),
});
