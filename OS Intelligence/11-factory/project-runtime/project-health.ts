// project-health v0.2.0 — source: OS Intelligence/11-factory/project-runtime/project-health.ts
// Hook OMP cho một OS Project: đầu session Team Lead (cwd root Project), đếm sổ `brand/feedback.md`,
// Git chưa commit và WORKSTREAM quá dài; chỉ chèn đề xuất tổng hợp (Skill `brand-curation`) khi vượt ngưỡng.
// Cài bằng copy vào `<project>/.omp/hooks/pre/project-health.ts` (xem `11-factory/project-runtime/README.md`).
// Thiết kế: OS Intelligence/03-work/project-team-lead-feedback/DESIGN.md §5.4.
import { spawnSync } from "node:child_process";
import { existsSync, lstatSync, readdirSync, readFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { ExtensionAPI } from "@oh-my-pi/pi-coding-agent";

export const THRESHOLDS = { feedbackLines: 10, feedbackDays: 7, uncommittedDays: 3, workstreamLines: 200 };
const MESSAGE_TYPE = "ai-os.project-health";
const DAY_MS = 86_400_000;
const PENDING_HEADING = "## Feedback chờ tổng hợp";
const FEEDBACK_LINE = /^- (\d{4}-\d{2}-\d{2}) · /;
const UNTIL = /· đến (\d{4}-\d{2}-\d{2})\b/;

export type ProjectHealth = {
	id: string;
	dir: string;
	feedbackCount: number;
	feedbackFirm: number;
	feedbackOldestDays?: number;
	uncommittedCount: number;
	uncommittedOldestDays?: number;
	longWorkstreams: { path: string; lines: number }[];
};

/** Bỏ dấu tiếng Việt + lower-case để `dứt khoát`, `dut khoat`, `Dứt Khoát` cùng khớp. */
const fold = (text: string) => text.normalize("NFD").replace(/\p{M}/gu, "").replace(/đ/gi, "d").toLowerCase();

/**
 * Chỉ dòng trong mục `## Feedback chờ tổng hợp` là chờ tổng hợp: ví dụ định dạng ở phần đầu và nhóm
 * `## Đang chờ thêm` (người dùng đã xem) không tính. Dòng `· đến` còn hạn ở lại sổ nên cũng không tính.
 */
export function parseFeedback(text: string, now = new Date()): { count: number; firm: number; oldest?: string } {
	const today = [now.getFullYear(), now.getMonth() + 1, now.getDate()].map(n => String(n).padStart(2, "0")).join("-");
	let inPending = false;
	const dates: string[] = [];
	let firm = 0;
	for (const line of text.split("\n")) {
		if (line.startsWith("## ")) {
			inPending = line.trim() === PENDING_HEADING;
			continue;
		}
		if (!inPending) continue;
		const date = FEEDBACK_LINE.exec(line)?.[1];
		const until = UNTIL.exec(line)?.[1];
		if (!date || (until && until >= today)) continue;
		dates.push(date);
		if (fold(line.split(" · ")[2] ?? "").trim() === "dut khoat") firm++;
	}
	return dates.length ? { count: dates.length, firm, oldest: dates.sort()[0] } : { count: 0, firm: 0 };
}

const daysSince = (ms: number, now: Date) => Math.floor((now.getTime() - ms) / DAY_MS);

/** Ngày `YYYY-MM-DD` hiểu theo 00:00 giờ địa phương. */
function localDateMs(date: string): number {
	const [y, m, d] = date.split("-").map(Number);
	return new Date(y, m - 1, d).getTime();
}

/** Path chưa commit (đã tự loại path ignore); `null` khi không phải Git repo hoặc git lỗi/quá 3 giây. */
function uncommittedPaths(dir: string): string[] | null {
	// `--no-optional-locks`: chỉ đọc, không giành `index.lock` với Staff đang thao tác Git.
	const result = spawnSync(
		"git",
		["--no-optional-locks", "-c", "core.quotePath=false", "-C", dir, "status", "--porcelain=v1", "-z", "--untracked-files=all"],
		{ encoding: "utf8", timeout: 3_000 },
	);
	if (result.error || result.status !== 0) return null;
	const entries = result.stdout.split("\0");
	const paths: string[] = [];
	for (let i = 0; i < entries.length; i++) {
		const entry = entries[i];
		if (!entry) continue;
		paths.push(entry.slice(3));
		// Rename/copy (cột index hoặc worktree) có thêm một entry path gốc phía sau.
		if (/[RC]/.test(entry.slice(0, 2))) i++;
	}
	return paths;
}

export function assessProject(dir: string, now: Date): ProjectHealth | null {
	const projectFile = join(dir, "PROJECT.md");
	if (!existsSync(projectFile)) return null;
	const id = /^- Project ID: *(\S+)/m.exec(readFileSync(projectFile, "utf8"))?.[1] ?? basename(dir);

	const feedbackFile = join(dir, "brand", "feedback.md");
	const feedback = existsSync(feedbackFile) ? parseFeedback(readFileSync(feedbackFile, "utf8"), now) : { count: 0, firm: 0 };

	const paths = uncommittedPaths(dir) ?? [];
	const mtimes = paths.flatMap(path => {
		try {
			return [lstatSync(join(dir, path)).mtimeMs];
		} catch {
			return []; // File đã xóa: không có tuổi.
		}
	});

	const longWorkstreams: ProjectHealth["longWorkstreams"] = [];
	const workDir = join(dir, "work");
	if (existsSync(workDir)) {
		for (const name of readdirSync(workDir).sort()) {
			const file = join(workDir, name, "WORKSTREAM.md");
			if (!existsSync(file)) continue;
			const text = readFileSync(file, "utf8");
			const lines = text.split("\n").length - (text.endsWith("\n") ? 1 : 0);
			if (lines > THRESHOLDS.workstreamLines) longWorkstreams.push({ path: `work/${name}/WORKSTREAM.md`, lines });
		}
	}

	return {
		id,
		dir,
		feedbackCount: feedback.count,
		feedbackFirm: feedback.firm,
		feedbackOldestDays: feedback.oldest ? daysSince(localDateMs(feedback.oldest), now) : undefined,
		uncommittedCount: paths.length,
		uncommittedOldestDays: mtimes.length ? daysSince(Math.min(...mtimes), now) : undefined,
		longWorkstreams,
	};
}

export function curationReasons(h: ProjectHealth, t = THRESHOLDS): string[] {
	const reasons: string[] = [];
	const old = h.feedbackOldestDays !== undefined && h.feedbackOldestDays > t.feedbackDays;
	if (h.feedbackFirm > 0 || h.feedbackCount >= t.feedbackLines || old) {
		const suggest = h.feedbackCount - h.feedbackFirm;
		const age = h.feedbackOldestDays !== undefined ? `, cũ nhất ${h.feedbackOldestDays} ngày` : "";
		reasons.push(`\`brand/feedback.md\` có ${h.feedbackFirm} dòng dứt khoát + ${suggest} dòng gợi ý chờ tổng hợp${age}`);
	}
	if (h.uncommittedOldestDays !== undefined && h.uncommittedOldestDays > t.uncommittedDays) {
		reasons.push(`${h.uncommittedCount} thay đổi chưa commit, cũ nhất ${h.uncommittedOldestDays} ngày`);
	}
	for (const ws of h.longWorkstreams) {
		if (ws.lines > t.workstreamLines) reasons.push(`\`${ws.path}\` dài ${ws.lines} dòng (ngưỡng ${t.workstreamLines})`);
	}
	return reasons;
}

export function formatReport(id: string, reasons: string[]): string | undefined {
	if (!reasons.length) return undefined;
	return [
		`[project-health — hook tự chèn] Project \`${id}\` cần tổng hợp/dọn:`,
		...reasons.map(reason => `- ${reason}`),
		"",
		"Trong câu trả lời tiếp theo, đề xuất người dùng một phiên tổng hợp theo Skill `brand-curation` (một câu, sau phần trả lời chính). Người dùng đồng ý mới chạy; người dùng từ chối thì không nhắc lại trong session này.",
	].join("\n");
}

// ---------------------------------------------------------------- wiring OMP

type BranchEntry = { type: string; customType?: string };
type HookContext = {
	agent?: { kind: string };
	hasUI?: boolean;
	ui: { notify(message: string, type?: string): void };
	sessionManager: { getBranch(): BranchEntry[] };
};
type StartEvent = { reason?: string };

const HOOK_DIR = import.meta.dir ?? dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HOOK_DIR, "../../..");

export default function projectHealth(pi: ExtensionAPI): void {
	pi.on("before_agent_start", async (event: StartEvent, ctx: HookContext) => {
		if (ctx.agent && ctx.agent.kind !== "main") return;
		if (event.reason === "revive") return;
		try {
			if (ctx.sessionManager.getBranch().some(entry => entry.customType === MESSAGE_TYPE)) return;
			// Project chưa nâng V0.2.1 (chưa có sổ) không có Skill `brand-curation` để đề xuất.
			if (!existsSync(join(ROOT, "brand", "feedback.md"))) return;
			const health = assessProject(ROOT, new Date());
			if (!health) return;
			const content = formatReport(health.id, curationReasons(health));
			if (!content) return;
			return { message: { customType: MESSAGE_TYPE, content, display: false, attribution: "agent" } };
		} catch (error) {
			if (ctx.hasUI) ctx.ui.notify(`project-health: ${(error as Error).message}`, "warning");
		}
	});
}
