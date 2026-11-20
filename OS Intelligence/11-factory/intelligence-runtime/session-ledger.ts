// session-ledger v0.1.1 — source: OS Intelligence/11-factory/intelligence-runtime/session-ledger.ts
// Đọc transcript OMP cấp đầu (`~/.omp/agent/sessions/<dir>/*.jsonl`), xác định session thuộc Intelligence
// còn chưa được đối soát, và giữ sổ đối soát ngoài Git (`<root chính>/.omp/state/reconciled.jsonl`).
// Thiết kế: OS Intelligence/03-work/intelligence-markdown-freshness/DESIGN.md §5.2, §5.6.
import { spawnSync } from "node:child_process";
import {
	appendFileSync,
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	realpathSync,
	type Stats,
	statSync,
	writeFileSync,
} from "node:fs";
import { basename, dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

/** Thư mục OS Intelligence chứa runtime này (checkout chính hoặc worktree đang chạy). */
export const INTEL_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

export type Scope = "intel" | "intel-worktree" | "outside";
export type Roots = { main: string; ecosystem: string; worktreeBase: string };

export type Thresholds = {
	idleMinutes: number;
	batchSize: number;
	workDays: number;
	inboxDays: number;
	uncommittedDays: number;
	consideringDays: number;
	concurrentMinutes: number;
	minTailChars: number;
};

export const DEFAULT_THRESHOLDS: Thresholds = {
	idleMinutes: 30,
	batchSize: 5,
	workDays: 7,
	inboxDays: 7,
	uncommittedDays: 3,
	consideringDays: 30,
	concurrentMinutes: 15,
	minTailChars: 80,
};

export type SessionSummary = {
	id: string;
	file: string;
	cwd: string;
	title?: string;
	startedAt: string;
	mtimeMs: number;
	size: number;
	userMessages: number;
	lastUserAt?: string;
	receiptAt?: string;
	/** Mọi tin thật của người dùng: thời điểm + số ký tự (plain data để cache được). */
	userTail: { at: string; chars: number }[];
};

export type LedgerEntry = { id: string; until: string; at: string; note: string };

export type PendingOptions = {
	sessionsDir: string;
	roots: Roots;
	now: Date;
	currentFile?: string;
	thresholds: Thresholds;
	worktreeExists?: (cwd: string) => boolean;
};

const MIN_MS = 60_000;
/** Dòng trạng thái của Skill `close`/`pre-compact` (có thể kèm heading/đậm); không khớp câu nhắc tới chữ READY hay dòng mẫu `| BLOCKED`. */
const RECEIPT = /^[#>*\s]*(?:(?:Session close|Continuity check):\s*)?\**READY TO (?:CLOSE|COMPACT)\**\s*$/m;
const LEDGER = [".omp", "state", "reconciled.jsonl"];

/**
 * `intelDir` là thư mục OS Intelligence (mặc định {@link INTEL_DIR}), không phải cwd tùy ý.
 * Root chính = checkout chính của repo chứa nó + vị trí của Intelligence trong repo đó: worktree và checkout
 * chính cho cùng kết quả; ở bản Ship, Intelligence là thư mục con của repo Ship nên root là thư mục con đó.
 */
export function resolveRoots(intelDir: string = INTEL_DIR): Roots {
	const r = spawnSync(
		"git",
		["-C", intelDir, "rev-parse", "--path-format=absolute", "--show-toplevel", "--git-common-dir"],
		{ encoding: "utf8" },
	);
	const [top, common] = r.stdout.trim().split("\n");
	const main =
		r.status === 0 && top && common
			? join(dirname(common), relative(top, realpathSync(intelDir)))
			: resolve(intelDir);
	const ecosystem = dirname(main);
	return { main, ecosystem, worktreeBase: join(ecosystem, "OS Worktree", basename(main)) };
}

const isUnder = (path: string, base: string) => path === base || path.startsWith(base + sep);

export function classifyCwd(cwd: string, roots: Roots): Scope | null {
	const path = cwd.length > 1 && cwd.endsWith(sep) ? cwd.slice(0, -1) : cwd;
	if (isUnder(path, roots.main)) return "intel";
	if (isUnder(path, roots.worktreeBase)) return "intel-worktree";
	if (path === roots.ecosystem) return "outside";
	if (isUnder(path, roots.ecosystem)) return null;
	return "outside";
}

function textOf(content: unknown): string {
	if (typeof content === "string") return content;
	if (!Array.isArray(content)) return "";
	return content
		.filter((b): b is { type: string; text: string } => !!b && b.type === "text" && typeof b.text === "string")
		.map(b => b.text)
		.join("\n");
}

/** `readFile` là test seam. Stat trước khi đọc: nếu file lớn lên trong lúc đọc, size/mtime đã lưu cũ hơn file → lần sau cache miss và đọc lại. */
export function summarizeSession(
	file: string,
	readFile: (path: string) => string = path => readFileSync(path, "utf8"),
): SessionSummary | null {
	let raw: string;
	let stat: Stats;
	try {
		stat = statSync(file);
		raw = readFile(file);
	} catch {
		return null;
	}
	let header: { id: string; cwd: string; timestamp: string } | undefined;
	let title: string | undefined;
	type TranscriptLine = {
		type?: unknown;
		title?: unknown;
		id?: unknown;
		cwd?: unknown;
		timestamp?: unknown;
		message?: { role?: unknown; content?: unknown };
	} | null;
	let receiptAt: string | undefined;
	const userTail: SessionSummary["userTail"] = [];
	for (const line of raw.split("\n")) {
		if (!line.trim()) continue;
		// Dòng JSONL ngoài tầm kiểm soát: mọi field là unknown, kiểm typeof trước khi dùng.
		let entry: TranscriptLine;
		try {
			entry = JSON.parse(line) as TranscriptLine;
		} catch {
			continue;
		}
		if (!entry || typeof entry !== "object") continue;
		if (entry.type === "title" && typeof entry.title === "string") title = entry.title;
		else if (entry.type === "session" && typeof entry.id === "string" && typeof entry.cwd === "string")
			header = { id: entry.id, cwd: entry.cwd, timestamp: String(entry.timestamp ?? "") };
		else if (entry.type === "message" && entry.message && typeof entry.timestamp === "string") {
			const role = entry.message.role;
			const text = textOf(entry.message.content).trim();
			if (role === "user" && text && !text.startsWith("<")) userTail.push({ at: entry.timestamp, chars: text.length });
			else if (role === "assistant" && RECEIPT.test(text) && (!receiptAt || entry.timestamp > receiptAt))
				receiptAt = entry.timestamp;
		}
	}
	if (!header) return null;
	return {
		id: header.id,
		file,
		cwd: header.cwd,
		title,
		startedAt: header.timestamp,
		mtimeMs: stat.mtimeMs,
		size: stat.size,
		userMessages: userTail.length,
		lastUserAt: userTail.reduce<string | undefined>((max, m) => (!max || m.at > max ? m.at : max), undefined),
		receiptAt,
		userTail,
	};
}

export function charsAfter(s: SessionSummary, since: string): number {
	return s.userTail.reduce((sum, m) => (m.at > since ? sum + m.chars : sum), 0);
}

type Cache = Record<string, SessionSummary>;

function readJson<T>(file: string | undefined, fallback: T): T {
	if (!file) return fallback;
	try {
		return JSON.parse(readFileSync(file, "utf8")) as T;
	} catch {
		return fallback;
	}
}

/** Chỉ transcript cấp đầu: session sub-agent nằm ở thư mục con và bị bỏ qua. */
export function listSessions(sessionsDir: string, cacheFile?: string): SessionSummary[] {
	let dirs: string[];
	try {
		dirs = readdirSync(sessionsDir, { withFileTypes: true })
			.filter(d => d.isDirectory())
			.map(d => join(sessionsDir, d.name));
	} catch {
		return [];
	}
	const cache = readJson<Cache>(cacheFile, {});
	const next: Cache = {};
	let changed = false;
	const out: SessionSummary[] = [];
	for (const dir of dirs) {
		let names: string[];
		try {
			names = readdirSync(dir).filter(n => n.endsWith(".jsonl") && !n.startsWith("."));
		} catch {
			continue;
		}
		for (const name of names) {
			const file = join(dir, name);
			let stat: Stats;
			try {
				stat = statSync(file);
			} catch {
				continue;
			}
			if (!stat.isFile()) continue;
			const hit = cache[file];
			let summary: SessionSummary | null;
			if (hit && hit.mtimeMs === stat.mtimeMs && hit.size === stat.size) summary = hit;
			else {
				summary = summarizeSession(file);
				changed = true;
			}
			if (!summary) continue;
			next[file] = summary;
			out.push(summary);
		}
	}
	if (cacheFile && (changed || Object.keys(cache).length !== Object.keys(next).length)) {
		try {
			mkdirSync(dirname(cacheFile), { recursive: true });
			writeFileSync(cacheFile, JSON.stringify(next));
		} catch {
			// Cache chỉ để tăng tốc; ghi lỗi không ảnh hưởng kết quả.
		}
	}
	return out;
}

export function readLedger(main: string): Map<string, LedgerEntry> {
	const ledger = new Map<string, LedgerEntry>();
	let raw = "";
	try {
		raw = readFileSync(join(main, ...LEDGER), "utf8");
	} catch {
		return ledger;
	}
	for (const line of raw.split("\n")) {
		if (!line.trim()) continue;
		try {
			const e = JSON.parse(line) as LedgerEntry;
			if (typeof e.id !== "string" || typeof e.until !== "string") continue;
			const prev = ledger.get(e.id);
			if (!prev || e.until > prev.until) ledger.set(e.id, e);
		} catch {
			// Bỏ dòng hỏng, giữ phần còn lại của sổ.
		}
	}
	return ledger;
}

export function markSession(main: string, entry: LedgerEntry): void {
	const file = join(main, ...LEDGER);
	mkdirSync(dirname(file), { recursive: true });
	appendFileSync(file, `${JSON.stringify(entry)}\n`);
}

export function loadThresholds(main: string): Thresholds {
	const cfg = readJson<{ thresholds?: Record<string, unknown> }>(join(main, ".omp", "freshness.json"), {});
	const out = { ...DEFAULT_THRESHOLDS };
	for (const key of Object.keys(out) as (keyof Thresholds)[]) {
		const v = cfg?.thresholds?.[key];
		if (typeof v === "number" && Number.isFinite(v) && v >= 0) out[key] = v;
	}
	return out;
}

/** Mốc đã đối soát = receipt `READY TO …` hoặc dòng sổ, lấy cái muộn hơn. */
export function reconciledUntil(s: SessionSummary, ledger: Map<string, LedgerEntry>): string | undefined {
	const until = ledger.get(s.id)?.until;
	if (!until) return s.receiptAt;
	if (!s.receiptAt) return until;
	return until > s.receiptAt ? until : s.receiptAt;
}

export function pendingSessions(
	all: SessionSummary[],
	ledger: Map<string, LedgerEntry>,
	opts: PendingOptions,
): SessionSummary[] {
	const t = opts.thresholds;
	const worktreeExists = opts.worktreeExists ?? existsSync;
	return all
		.filter(s => {
			const scope = classifyCwd(s.cwd, opts.roots);
			if (!scope || s.userMessages === 0 || s.file === opts.currentFile) return false;
			if (opts.now.getTime() - s.mtimeMs < t.idleMinutes * MIN_MS) return false;
			if (scope === "intel-worktree" && worktreeExists(s.cwd)) return false;
			const mark = reconciledUntil(s, ledger);
			return !mark || charsAfter(s, mark) >= t.minTailChars;
		})
		.sort((a, b) => ((a.lastUserAt ?? a.startedAt) < (b.lastUserAt ?? b.startedAt) ? -1 : 1));
}

export function concurrentSessions(all: SessionSummary[], opts: PendingOptions): SessionSummary[] {
	return all.filter(s => {
		const scope = classifyCwd(s.cwd, opts.roots);
		return (
			(scope === "intel" || scope === "intel-worktree") &&
			s.file !== opts.currentFile &&
			opts.now.getTime() - s.mtimeMs < opts.thresholds.concurrentMinutes * MIN_MS
		);
	});
}
