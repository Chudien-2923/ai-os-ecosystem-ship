// learning-loop v0.2.15 — source: OS Intelligence/11-factory/staff-runtime/learning-loop.ts
// Hook OMP cho OS Staff: ghi lời người dùng, hỗ trợ "chốt bài học", tự nạp bài học chung, chủ đề và brand,
// ghi lại thay đổi memory, ẩn dòng hết hạn, tìm lại đoạn liên quan trong knowledge/ và jobs/.
// Cài vào Staff tại `.omp/hooks/pre/learning-loop.ts`; dữ liệu là Markdown trong repo Staff.
// Thiết kế và quy tắc vòng học nằm trong Factory spec OS Staff và OS Projects.
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, lstatSync, realpathSync, writeFileSync } from "node:fs";
import { basename, dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import type { ExtensionAPI } from "@oh-my-pi/pi-coding-agent";

/** `file`: sổ feedback brand Staff ghi ngay (`brand/feedback.md`); `context`: node rule đã chốt hook chèn kèm khi nhắc brand (Staff không ghi, Team Lead biên tập). */
export type BrandConfig = { id: string; keywords: string[]; file: string; context?: string[] };
/** File bài học theo chủ đề `memory/<file>`; từ khóa = title + aliases + slug. */
export type TopicInfo = { slug: string; file: string; title: string; description: string; keywords: string[]; lines: number };
export type LoopState = {
	memoryHash?: string;
	brandHashes: Record<string, string>;
	topicHashes: Record<string, string>;
	reminded: boolean;
	closePending: string[];
	closeNudges: number;
	/** Id các đoạn knowledge/jobs đã chèn trong phiên (mỗi đoạn chèn một lần; quên khi compaction). */
	recalled: string[];
	recallVersions: Record<string, string>;
};
// Kiểu tối thiểu của phần OMP API hook này dùng (ExtensionContext/event đầy đủ ở package OMP).
type BranchEntry = { type: string; customType?: string; details?: unknown; timestamp?: string; message?: { role?: string } };
type HookContext = {
	agent?: { kind: string };
	hasUI?: boolean;
	ui: { notify(message: string, type?: string): void; editor(title: string, prefill?: string): Promise<string | undefined> };
	sessionManager: { getBranch(): BranchEntry[]; getSessionId(): string };
};
type StartEvent = { prompt?: string; reason?: string };

const MESSAGE_TYPE = "ai-os.learning-loop";
const STALE_MS = 6 * 3_600_000;
const EXPIRE_MS = 7 * 24 * 3_600_000;
const MAX_CLOSE_NUDGES = 2;
const MAX_LOG_CHARS = 2_000;
const MAX_LINES = 200;
const RESULT_HEADING = "## Kết quả chốt";
export const REVIEWED_MARKER = "- ⎯⎯ đã chốt tới đây ⎯⎯";

export function normalizeVi(text: string): string {
	return text
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[đĐ]/g, "d")
		.toLowerCase()
		.replace(/\s+/g, " ")
		.trim();
}

export function isCloseCommand(text: string): boolean {
	const trimmed = text.trim();
	const command = /^\/([A-Za-z][\w:-]*)(?=\s|$)/.exec(trimmed);
	if (command) return command[1].toLowerCase() === "chot";
	return normalizeVi(trimmed).includes("chot bai hoc");
}

/** Không ghi: tin rỗng, slash command (`/model`, `/chot` — không phải đường dẫn `/path/to/file`), tin chỉ là lệnh chốt. */
export function isLoggable(text: string): boolean {
	const trimmed = text.trim();
	if (!trimmed || /^\/[A-Za-z][\w:-]*(\s|$)/.test(trimmed)) return false;
	if (!isCloseCommand(trimmed)) return true;
	const rest = normalizeVi(trimmed).replace("chot bai hoc", "").replace(/[^a-z0-9]/g, "");
	return rest.length >= 12;
}

export function messageKey(turnIndex: number, text: string): string {
	return createHash("sha1").update(`${turnIndex}:${text}`).digest("hex").slice(0, 8);
}

export function contentHash(text: string): string {
	return createHash("sha1").update(text).digest("hex").slice(0, 16);
}

export function newSessionLog(startedIso: string, heading: string): string {
	return [
		"---",
		"status: open",
		`started: ${startedIso}`,
		`last: ${startedIso}`,
		"---",
		`# ${heading}`,
		"",
		"## Lời người dùng (nguyên văn)",
		"",
		RESULT_HEADING,
		"<!-- Staff điền khi chốt: bài học người dùng đồng ý (→ đích) và bài học người dùng bỏ. -->",
		"",
	].join("\n");
}

/** Chấp nhận BOM, CRLF và `---` đóng ở cuối file (file chủ đề do Staff/người viết tay). */
export function readFrontmatter(text: string): Record<string, string> {
	const match = /^---\n([\s\S]*?)\n---(?:\n|$)/.exec(text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n"));
	const fields: Record<string, string> = {};
	if (!match) return fields;
	for (const line of match[1].split("\n")) {
		const sep = line.indexOf(": ");
		if (sep > 0) fields[line.slice(0, sep).trim()] = line.slice(sep + 2).trim();
	}
	return fields;
}

export function setFrontmatter(text: string, patch: Record<string, string>): string {
	text = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
	const match = /^---\n([\s\S]*?)\n---(?:\n|$)/.exec(text);
	if (!match) return text;
	const fields = { ...readFrontmatter(text), ...patch };
	const body = Object.entries(fields)
		.map(([key, value]) => `${key}: ${value}`)
		.join("\n");
	return `---\n${body}\n---\n${text.slice(match[0].length)}`;
}

/**
 * Trả nội dung mới, hoặc null nếu tin (cùng key) đã được ghi — chống ghi trùng khi OMP chạy lại lượt.
 * Phiên đã chốt/bỏ nhận tin mới: thêm dòng mốc REVIEWED_MARKER rồi mở lại `open`, để lần chốt sau chỉ xét phần mới.
 */
export function appendUserMessage(
	log: string,
	entry: { time: string; iso: string; text: string; key: string },
): string | null {
	const marker = `<!-- k:${entry.key} -->`;
	if (log.includes(marker)) return null;
	let text = entry.text.trim().replace(/\s*\r?\n\s*/g, " / ");
	if (text.length > MAX_LOG_CHARS) text = `${text.slice(0, MAX_LOG_CHARS)} […cắt]`;
	const status = readFrontmatter(log).status;
	const reopen = status !== "open";
	const reviewed = status === "chốt" || status === "bỏ";
	const lines = [...(reviewed ? [REVIEWED_MARKER] : []), `- ${entry.time} — ${text} ${marker}`].join("\n");
	const at = log.indexOf(`\n${RESULT_HEADING}`);
	const next = at < 0 ? `${log.trimEnd()}\n${lines}\n` : `${log.slice(0, at).trimEnd()}\n${lines}\n${log.slice(at)}`;
	return setFrontmatter(next, reopen ? { status: "open", last: entry.iso } : { last: entry.iso });
}

export function classifyOpenSessions(
	files: { path: string; status: string; last: string }[],
	nowMs: number,
	currentPath: string,
): { stale: string[]; expired: string[] } {
	const stale: string[] = [];
	const expired: string[] = [];
	for (const file of files) {
		if (file.status !== "open" || file.path === currentPath) continue;
		const idle = nowMs - Date.parse(file.last);
		if (!Number.isFinite(idle)) continue;
		if (idle >= EXPIRE_MS) expired.push(file.path);
		else if (idle >= STALE_MS) stale.push(file.path);
	}
	return { stale, expired };
}

export function countLines(text: string): number {
	const trimmed = text.trim();
	return trimmed ? trimmed.split("\n").length : 0;
}

export function truncateForInjection(
	text: string,
	maxLines = MAX_LINES,
	maxBytes = 16_384,
): { text: string; truncated: boolean } | null {
	const trimmed = text.trim();
	if (!trimmed) return null;
	let lines = trimmed.split("\n");
	let truncated = lines.length > maxLines;
	if (truncated) lines = lines.slice(0, maxLines);
	let out = lines.join("\n");
	if (Buffer.byteLength(out, "utf8") > maxBytes) {
		out = Buffer.from(out, "utf8").subarray(0, maxBytes).toString("utf8").replace(/\uFFFD+$/, "");
		truncated = true;
	}
	return { text: out, truncated };
}

/** Khớp nguyên từ; cả hai chuỗi đã qua `normalizeVi`. */
function hasWord(haystackNorm: string, needleNorm: string): boolean {
	if (!needleNorm || !haystackNorm.includes(needleNorm)) return false;
	const needle = needleNorm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	return new RegExp(`(^|[^a-z0-9])${needle}($|[^a-z0-9])`).test(haystackNorm);
}

/** Từ khóa đầu tiên khớp nguyên từ trên chuỗi đã bỏ dấu; dùng để giải thích vì sao một file được chèn. */
export function matchedKeyword(prompt: string, keywords: string[]): string | undefined {
	const haystack = normalizeVi(prompt);
	return keywords.find(keyword => hasWord(haystack, normalizeVi(keyword)));
}

/** Khớp nguyên từ trên chuỗi đã bỏ dấu; dùng cho cả brand lẫn chủ đề. */
export function matchKeywords<T extends { keywords: string[] }>(prompt: string, items: T[]): T[] {
	return items.filter(item => matchedKeyword(prompt, item.keywords) !== undefined);
}

/**
 * Không phải file chủ đề: `README.md` (hướng dẫn), `archive.md` (dòng đã chuyển ra), `forgotten.md` (ý người dùng đã bảo quên)
 * và file ẩn (`._x.md` của macOS) — không bao giờ vào mục lục hay được chèn theo từ khóa.
 */
export function isTopicFile(name: string): boolean {
	return /\.md$/i.test(name) && !name.startsWith(".") && !/^(readme|archive|forgotten)\.md$/i.test(name);
}

const unquote = (value: string) => value.trim().replace(/^(["'])(.*)\1$/, "$2").trim();

export function parseTopic(fileName: string, text: string): TopicInfo {
	const slug = fileName.replace(/\.md$/i, "");
	const fields = readFrontmatter(text);
	const title = unquote(fields.title ?? "") || slug.replace(/-/g, " ");
	const aliases = (fields.aliases ?? "").trim().replace(/^\[(.*)\]$/, "$1").split(",").map(unquote);
	const seen = new Set<string>();
	const keywords = [title, ...aliases, slug.replace(/-/g, " ")].filter(keyword => {
		const key = normalizeVi(keyword);
		if (!key || seen.has(key)) return false;
		seen.add(key);
		return true;
	});
	return { slug, file: fileName, title, description: unquote(fields.description ?? ""), keywords, lines: countLines(text) };
}

export function renderTopicIndex(topics: TopicInfo[]): string {
	return topics
		.map(topic => `- \`memory/${topic.file}\` — ${topic.title}${topic.description ? `: ${topic.description}` : ""}`)
		.join("\n");
}

/**
 * Phần chèn của một file; vượt giới hạn thì dặn Staff báo người dùng và đề xuất chuyển ở lần chốt tới (hook không tự chuyển).
 * `hiddenExpired`: số dòng `· đến YYYY-MM-DD` đã quá hạn bị hook ẩn.
 */
export function formatInjection(label: string, relPath: string, raw: string, hiddenExpired = 0): string | undefined {
	const cut = truncateForInjection(raw);
	if (!cut && !hiddenExpired) return undefined;
	const note = cut?.truncated
		? `\n[Đã cắt bớt: file vượt ${MAX_LINES} dòng / 16 KB. Báo người dùng một dòng trong câu trả lời; ở lần chốt tới đề xuất chuyển bớt dòng sang file chủ đề phù hợp hoặc \`memory/archive.md\`. Đọc phần còn lại trực tiếp khi cần.]`
		: "";
	const expiredNote = hiddenExpired
		? `\n[Đã ẩn ${hiddenExpired} dòng hết hạn (\`· đến YYYY-MM-DD\` đã qua); lần chốt tới đề xuất chuyển sang \`memory/archive.md\`.]`
		: "";
	return `${label} (\`${relPath}\`) — bản hiện hành thay thế bản đã nạp trước của file này:\n\n${cut?.text ?? "(Không còn bài học có hiệu lực.)"}${note}${expiredNote}`;
}

/** `null` là config hỏng, khác với `[]` hợp lệ; recall phải đóng khi không xác định được ranh giới brand. */
export function parseBrandConfig(text: string): BrandConfig[] | null {
	let parsed: unknown;
	try { parsed = JSON.parse(text); } catch { return null; }
	const brands = parsed && typeof parsed === "object" && "brands" in parsed ? parsed.brands : undefined;
	if (!Array.isArray(brands)) return null;
	const nonEmptyStrings = (value: unknown): value is string[] =>
		Array.isArray(value) && value.length > 0 && value.every(item => typeof item === "string" && !!item.trim());
	const valid = brands.filter(
		(brand): brand is BrandConfig =>
			typeof brand?.id === "string" && !!brand.id.trim() &&
			typeof brand?.file === "string" && !!brand.file.trim() &&
			nonEmptyStrings(brand?.keywords) &&
			(brand?.context === undefined || nonEmptyStrings(brand.context)),
	);
	return valid.length === brands.length ? valid : null;
}

/**
 * State nằm trong `details` của chính message hook chèn, nên chỉ tồn tại khi message thật sự được publish
 * (OMP có thể chạy lại before_agent_start và bỏ attempt cũ). Gặp compaction thì quên hash để chèn lại.
 */
export function reconstructState(entries: BranchEntry[]): LoopState {
	let state: LoopState = { brandHashes: {}, topicHashes: {}, reminded: false, closePending: [], closeNudges: 0, recalled: [], recallVersions: {} };
	for (const entry of entries) {
		if (entry.type === "compaction") {
			state = {
				...state,
				memoryHash: undefined,
				brandHashes: Object.fromEntries(Object.keys(state.brandHashes).filter(id => state.brandHashes[id] !== "missing").map(id => [id, "reload"])),
				topicHashes: Object.fromEntries(Object.keys(state.topicHashes).filter(id => state.topicHashes[id] !== "missing").map(id => [id, "reload"])),
				recalled: [], recallVersions: {},
			};
		} else if (
			entry.type === "custom_message" &&
			entry.customType === MESSAGE_TYPE &&
			entry.details &&
			typeof entry.details === "object"
		) {
			// details do chính hook này ghi, cùng shape LoopState.
			const saved = entry.details as Partial<LoopState>;
			state = {
				memoryHash: saved.memoryHash,
				brandHashes: { ...(saved.brandHashes ?? {}) },
				topicHashes: { ...(saved.topicHashes ?? {}) },
				reminded: saved.reminded ?? false,
				closePending: [...(saved.closePending ?? [])],
				closeNudges: saved.closeNudges ?? 0,
				recalled: [...(saved.recalled ?? [])],
				recallVersions: { ...(saved.recallVersions ?? {}) },
			};
		}
	}
	return state;
}

/** Dòng cho lệnh `/nap`: lý do hook đã chèn theo thứ tự thời gian, kèm mốc compaction. */
export function summarizeInjections(entries: BranchEntry[]): string[] {
	const at = (entry: BranchEntry) => {
		const time = new Date(entry.timestamp ?? "");
		return Number.isFinite(time.getTime()) ? `${pad(time.getHours())}:${pad(time.getMinutes())}` : "--:--";
	};
	const lines: string[] = [];
	for (const entry of entries) {
		if (entry.type === "compaction") {
			lines.push(`- ${at(entry)} · — compaction: hook chèn lại MEMORY/chủ đề/brand ở lượt sau khi cần —`);
		} else if (
			entry.type === "custom_message" &&
			entry.customType === MESSAGE_TYPE &&
			entry.details &&
			typeof entry.details === "object" &&
			"injected" in entry.details &&
			Array.isArray(entry.details.injected)
		) {
			const injected: unknown[] = entry.details.injected;
			for (const reason of injected) if (typeof reason === "string") lines.push(`- ${at(entry)} · ${reason}`);
		}
	}
	return lines;
}

// ---------------------------------------------------------------- lịch sử sửa memory

export type FileStamp = { hash: string; lines: number };
export type Snapshot = Record<string, FileStamp>;
export const MEMORY_CHANGES_HEADING = "## Memory đổi trong buổi";

/** Đường dẫn được URI-encode để dấu `;`, `=`, xuống dòng không phá frontmatter. */
export function serializeSnapshot(snapshot: Snapshot): string {
	return Object.entries(snapshot)
		.map(([path, stamp]) => `${encodeURIComponent(path)}=${stamp.hash}:${stamp.lines}`)
		.join(";");
}

export function parseSnapshot(value: string): Snapshot {
	const snapshot: Snapshot = {};
	for (const part of value.split(";")) {
		const eq = part.lastIndexOf("=");
		if (eq <= 0) continue;
		const [hash, lines] = part.slice(eq + 1).split(":");
		if (!hash || !/^\d+$/.test(lines ?? "")) continue;
		try {
			snapshot[decodeURIComponent(part.slice(0, eq))] = { hash, lines: Number(lines) };
		} catch {
			// Snapshot hỏng không được làm mất các mục hợp lệ khác.
		}
	}
	return snapshot;
}

export function diffSnapshots(previous: Snapshot, current: Snapshot): string[] {
	const changes: string[] = [];
	for (const path of [...new Set([...Object.keys(previous), ...Object.keys(current)])].sort()) {
		const before = previous[path];
		const after = current[path];
		if (!before && after) changes.push(`${path}: mới (${after.lines} dòng)`);
		else if (before && !after) changes.push(`${path}: bị xóa`);
		else if (before && after && before.hash !== after.hash)
			changes.push(
				before.lines === after.lines ? `${path}: sửa nội dung (${after.lines} dòng)` : `${path}: ${before.lines} → ${after.lines} dòng`,
			);
	}
	return changes;
}

/** Mục riêng ở cuối file phiên (sau "Kết quả chốt") để lúc chốt không bị đọc nhầm thành lời người dùng. */
export function appendMemoryChanges(log: string, time: string, changes: string[]): string {
	if (!changes.length) return log;
	const lines = changes.map(change => `- ${time} · ${change}`).join("\n");
	const base = log.trimEnd();
	return base.includes(`\n${MEMORY_CHANGES_HEADING}`)
		? `${base}\n${lines}\n`
		: `${base}\n\n${MEMORY_CHANGES_HEADING}\n\n${lines}\n`;
}

// ---------------------------------------------------------------- hạn dùng từng dòng

const UNTIL = /·\s*đến\s+(\d{4}-\d{2}-\d{2})\s*$/;

/** Dòng bài học `· đến YYYY-MM-DD` còn hiệu lực hết ngày đó; ngày sai định dạng thì giữ nguyên. */
export function splitExpired(text: string, today: string): { text: string; expired: string[] } {
	const kept: string[] = [];
	const expired: string[] = [];
	for (const line of text.split("\n")) {
		const match = /^\s*- /.test(line) ? UNTIL.exec(line.normalize("NFC")) : null;
		const until = match?.[1];
		const date = until ? new Date(`${until}T00:00:00Z`) : undefined;
		const valid = date && Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === until;
		if (valid && until! < today) expired.push(line.trim());
		else kept.push(line);
	}
	return { text: kept.join("\n"), expired };
}

// ---------------------------------------------------------------- tìm lại trong knowledge/ và jobs/

export type Chunk = { id: string; path: string; heading: string; context: string; text: string; norm: string };
export type RankedChunk = { chunk: Chunk; hits: string[]; score: number };

/**
 * Âm tiết phổ biến (đã bỏ dấu): cặp có chứa một âm tiết này không dùng làm từ khóa. Không có "de" vì "đề" mang nghĩa
 * (phụ đề, chủ đề, đề xuất) mà sau khi bỏ dấu trùng với "để".
 */
const STOPWORDS = new Set(
	"anh em toi minh ban cho cua la va voi nay do thi mot cac nhung khi se da dang co khong duoc lam nhe nha ra vao len xuong roi gi nao the nhu trong ngoai tren duoi hay ma neu vi nen cung con lai nua muon can phai giup xem thu di o tai tu den theo bang ve sau truoc ok oke chi xin chao".split(
		" ",
	),
);

/** Bỏ lời điều khiển hội thoại trước khi lấy từ khóa; không ghép cặp qua dấu câu. */
export function searchTerms(prompt: string): string[] {
	const terms = new Set<string>();
	const text = prompt.replace(/\r\n/g, "\n");
	for (const raw of text.split(/[.!?;:\n]/)) {
		const segment = normalizeVi(raw).replace(/\b(?:kiem tra|giai thich|tra loi|cam on|tiep tuc|tien do|cong viec|hom nay)\b/g, " ");
		const tokens = segment.split(/[^a-z0-9]+/).filter(Boolean);
		for (let i = 0; i + 1 < tokens.length; i++) {
			if (!STOPWORDS.has(tokens[i]) && !STOPWORDS.has(tokens[i + 1])) terms.add(`${tokens[i]} ${tokens[i + 1]}`);
		}
		for (const token of tokens) if (token.length >= 3 && !STOPWORDS.has(token)) terms.add(token);
	}
	return [...terms];
}

/** Chia theo heading Markdown (bỏ qua `#` trong code block); đoạn chỉ có heading thì bỏ. */
export function splitChunks(path: string, text: string): Chunk[] {
	const chunks: Chunk[] = [];
	let heading = path;
	let lines: string[] = [];
	let hasBody = false;
	let fence: string | undefined;
	const headings: string[] = [];
	const flush = () => {
		if (hasBody) {
			const body = lines.join("\n").trim();
			const context = headings.slice(0, -1).filter(Boolean).join("\n");
			chunks.push({ id: `${path}#${contentHash(`${context}\n${heading}\n${body}`)}`, path, heading, context, text: body, norm: normalizeVi(`${context}\n${body}`) });
		}
		lines = [];
		hasBody = false;
	};
	for (const line of text.replace(/\r\n/g, "\n").split("\n")) {
		const marker = /^\s{0,3}(`{3,}|~{3,})(.*)$/.exec(line);
		if (fence) {
			lines.push(line);
			if (line.trim()) hasBody = true;
			if (marker && marker[1][0] === fence[0] && marker[1].length >= fence.length && !marker[2].trim()) fence = undefined;
			continue;
		}
		if (marker) {
			fence = marker[1];
			lines.push(line);
			hasBody = true;
			continue;
		}
		const match = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line);
		if (match) {
			flush();
			heading = match[2];
			headings.length = match[1].length - 1;
			headings.push(heading);
			lines = [line];
			continue;
		}
		lines.push(line);
		if (line.trim()) hasBody = true;
	}
	flush();
	return chunks;
}

/** Khớp ít nhất hai từ nội dung độc lập và ≥50% chủ đề hỏi; ưu tiên heading, giảm lợi thế của section dài. */
export function rankChunks(terms: string[], chunks: Chunk[]): RankedChunk[] {
	if (!chunks.length) return [];
	const queryWords = new Set(terms.flatMap(term => term.split(" ")));
	const hitsByChunk = chunks.map(chunk => terms.filter(term => hasWord(chunk.norm, term)));
	const lengths = chunks.map(chunk => chunk.norm.split(/\W+/).length);
	const averageLength = lengths.reduce((sum, length) => sum + length, 0) / chunks.length;
	const df = new Map<string, number>();
	for (const hits of hitsByChunk) for (const term of hits) df.set(term, (df.get(term) ?? 0) + 1);
	const results: RankedChunk[] = [];
	for (let i = 0; i < chunks.length; i++) {
		const hits = hitsByChunk[i];
		const matchedWords = new Set(hits.flatMap(term => term.split(" ")));
		if (matchedWords.size < 2 || matchedWords.size < queryWords.size / 2) continue;
		const heading = normalizeVi(chunks[i].heading);
		const context = normalizeVi(chunks[i].context);
		if (!hits.some(term => term.includes(" ") || (term.length >= 5 && hasWord(heading, term)))) continue;
		const lengthFactor = 2.2 / (1 + 1.2 * (0.25 + 0.75 * lengths[i] / averageLength));
		const score = hits.reduce((sum, term) => {
			const count = df.get(term)!;
			const idf = Math.log(1 + (chunks.length - count + 0.5) / (count + 0.5));
			return sum + idf * (term.includes(" ") ? 1.5 : 1) *
				(lengthFactor + (hasWord(heading, term) ? 2 : 0) + (hasWord(context, term) ? 0.75 : 0));
		}, 0);
		results.push({ chunk: chunks[i], hits, score });
	}
	return results.sort((a, b) => b.score - a.score);
}

export function excerptChunk(chunk: Chunk, maxLines = 12, maxChars = 1_200, terms: string[] = []): string {
	const lines = chunk.text.split("\n").filter(line => line.trim());
	let best = 0;
	let score = 0;
	for (let i = 0; i < lines.length && terms.length; i++) {
		const norm = normalizeVi(lines[i]);
		const hits = terms.filter(term => hasWord(norm, term)).length;
		if (hits > score) { score = hits; best = i; }
	}
	const start = Math.max(0, best - 2);
	const out = lines.slice(start, start + maxLines).join("\n");
	return out.length > maxChars ? `${out.slice(0, Math.max(0, maxChars - 1))}${maxChars > 0 ? "…" : ""}` : out;
}

/** Brand đã khai báo mà văn bản (đã bỏ dấu) có nhắc tới. */
export function brandIdsIn(textNorm: string, brands: BrandConfig[]): string[] {
	return brands.filter(brand => brand.keywords.some(keyword => hasWord(textNorm, normalizeVi(keyword)))).map(brand => brand.id);
}

// ---------------------------------------------------------------- wiring OMP

const HOOK_DIR = import.meta.dir ?? dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HOOK_DIR, "../../..");
const SESSIONS_DIR = join(ROOT, "journal", "sessions");
const MEMORY_DIR = join(ROOT, "memory");
// staff-id lấy từ dòng `- ID:` trong AGENTS.md (đúng cả khi chạy trong worktree); thiếu thì dùng tên folder.
const STAFF_ID = (() => {
	const agents = join(ROOT, "AGENTS.md");
	const id = existsSync(agents) ? /^- ID: *`?([^`\s]+)`?/m.exec(readFileSync(agents, "utf8"))?.[1] : undefined;
	return id ?? basename(ROOT);
})();
const pad = (n: number) => String(n).padStart(2, "0");

function loadBrands(): BrandConfig[] {
	const file = join(ROOT, ".omp", "learning-loop.json");
	if (!existsSync(file)) throw new Error("Thiếu .omp/learning-loop.json; tạm dừng recall để giữ ranh giới brand.");
	const brands = parseBrandConfig(readFileSync(file, "utf8"));
	if (brands === null) throw new Error(".omp/learning-loop.json không hợp lệ; tạm dừng recall để giữ ranh giới brand.");
	return brands;
}

/** File chủ đề đọc không được thì bỏ qua. */
function listTopics(): TopicInfo[] {
	if (!existsSync(MEMORY_DIR)) return [];
	const topics: TopicInfo[] = [];
	for (const name of readdirSync(MEMORY_DIR).sort()) {
		if (!isTopicFile(name)) continue;
		try {
			topics.push(parseTopic(name, readFileSync(join(MEMORY_DIR, name), "utf8")));
		} catch {}
	}
	return topics;
}

/** File phiên đọc không được thì bỏ qua, không làm hỏng cả lượt. */
function listSessionFiles(): { path: string; status: string; last: string }[] {
	if (!existsSync(SESSIONS_DIR)) return [];
	const files: { path: string; status: string; last: string }[] = [];
	for (const name of readdirSync(SESSIONS_DIR)) {
		if (!name.endsWith(".md")) continue;
		const path = join(SESSIONS_DIR, name);
		try {
			const fm = readFrontmatter(readFileSync(path, "utf8"));
			files.push({ path, status: fm.status ?? "", last: fm.last ?? "" });
		} catch {}
	}
	return files;
}

function ensureSessionsDir(): void {
	mkdirSync(SESSIONS_DIR, { recursive: true });
	// Log thô không bao giờ vào Git, kể cả khi `.gitignore` của Staff thiếu dòng `journal/sessions/`.
	const guard = join(SESSIONS_DIR, ".gitignore");
	if (!existsSync(guard)) writeFileSync(guard, "*\n");
}

function logMessage(path: string, text: string, turnIndex: number, now: Date): void {
	const iso = now.toISOString();
	const time = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
	const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
	ensureSessionsDir();
	const current = existsSync(path) ? readFileSync(path, "utf8") : newSessionLog(iso, `Buổi ${date} ${time}`);
	const next = appendUserMessage(current, { time, iso, text, key: messageKey(turnIndex, text) });
	if (next !== null) writeFileSync(path, next);
}

export type CloseContext = {
	brands: BrandConfig[];
	topics: TopicInfo[];
	memoryLines: number;
	forgotten: string;
	/** "`<file>`: <dòng>" — dòng bài học đã quá hạn `· đến`. */
	expired: string[];
	/** File bài học đang có thay đổi chưa commit (đường dẫn từ root Staff). */
	uncommitted: string[];
};

export function closeInstruction(
	files: string[],
	{ brands, topics, memoryLines, forgotten, expired, uncommitted }: CloseContext,
): string {
	const forgottenLines = forgotten.split("\n").filter(line => line.startsWith("- "));
	const list = files.map(file => `- \`${relative(ROOT, file)}\``).join("\n");
	const topicTargets = topics.length
		? topics
				.map(topic => `    - \`memory/${topic.file}\` — từ khóa: ${topic.keywords.join(", ")} · ${topic.lines}/${MAX_LINES} dòng`)
				.join("\n")
		: "    - (chưa có chủ đề)";
	const brandTargets = brands.length
		? brands.map(brand => `    - \`${brand.id}\` → \`${brand.file}\``).join("\n")
		: "    - (chưa khai báo brand trong `.omp/learning-loop.json`; brand mới → hỏi người dùng nơi lưu và từ khóa)";
	return [
		"Đọc phần \"Lời người dùng (nguyên văn)\" trong các file phiên sau — chỉ phần SAU dòng mốc \"đã chốt tới đây\" cuối cùng nếu có (mở job liên quan nếu cần bối cảnh):",
		list,
		"",
		"Trả người dùng MỘT danh sách đánh số, mỗi dòng: bài học viết dạng sự thật/điều kiện (không mệnh lệnh) · scope · đích · trích ngắn lời người dùng làm nguồn. Không ghi tên/mã file phiên vào bài học.",
		"Scope và đích (mỗi bài học ghi một dòng `- YYYY-MM-DD · bài học · nguồn: \"…\"`; bài học chỉ đúng tới một mốc như campaign/mùa thì thêm `· đến YYYY-MM-DD`):",
		`  - \`chung\` (đúng ở mọi buổi, không phụ thuộc loại việc) → \`MEMORY.md\` (hiện ${memoryLines}/${MAX_LINES} dòng)`,
		"  - `chủ đề <slug>` (chỉ đúng khi làm một loại việc) → `memory/<slug>.md`. Chủ đề đang có:",
		topicTargets,
		"    Chủ đề mới: đề xuất slug (không dấu, nối gạch ngang), title, description, aliases (các từ người dùng hay dùng, cách nhau dấu phẩy) ngay trong dòng; người dùng đồng ý mới tạo file, đầu file có frontmatter `title`/`description`/`aliases`.",
		`  - \`brand <project-id>\` → KHÔNG đưa vào danh sách đánh số và không cần người dùng duyệt: feedback mang tính brand ghi ngay vào sổ chung \`brand/feedback.md\` của Project (mọi Staff cùng đọc; Team Lead của Project tổng hợp và biên tập \`brand/\`, Staff không sửa file nào khác trong \`brand/\`). Feedback brand trong các phiên trên mà sổ chưa có thì ghi ngay bây giờ: đọc lại file, chỉ thêm dòng ở cuối file, dạng \`- YYYY-MM-DD · ${STAFF_ID} · <gợi ý | dứt khoát> · <phạm vi: video | graphic | copy | mọi kênh> · <feedback> · việc: <workstream>/<sản phẩm> · nguồn: "…"\` (\`${STAFF_ID}\` là staff-id, không thay bằng Project ID; \`dứt khoát\` khi người dùng nói rõ là luật, không rõ thì \`gợi ý\`), rồi báo "Đã ghi sổ feedback <brand>: <tóm tắt> (<mức>)". Gỡ một rule đang có trong \`brand/\`: dòng cùng dạng với \`· bỏ: <rule cũ> · lý do: <…>\` trước \`nguồn\`. Sổ theo brand:`,
		brandTargets,
		"  - procedure nhiều bước → chỉ ghi đề xuất Skill vào \"Kết quả chốt\", không sửa Skill lúc này",
		"  - không lưu (chỉ đúng cho một job)",
		`Nếu ghi các dòng đề xuất xong mà \`MEMORY.md\` hoặc một file chủ đề vượt ${MAX_LINES} dòng hoặc 16 KB: thêm vào cùng danh sách các dòng đề xuất CHUYỂN (trích dòng · đích) — ưu tiên sang file chủ đề phù hợp, không có thì sang \`memory/archive.md\` (giữ nguyên văn, thêm \` · chuyển YYYY-MM-DD từ <file>\`). Chỉ chuyển dòng người dùng đồng ý.`,
		...(forgottenLines.length
			? [
					"Người dùng đã yêu cầu QUÊN các ý sau (`memory/forgotten.md`) — không đề xuất lại. Nếu lời người dùng mới nói lại đúng một ý trong đây: nêu rõ \"người dùng đã bảo quên ngày …\" và chỉ đề xuất khi người dùng xác nhận; người dùng xác nhận thì ghi bài học và xóa dòng tương ứng trong `memory/forgotten.md`.",
					...forgottenLines.slice(-MAX_LINES),
				]
			: []),
		...(expired.length
			? [
					"Các dòng đã hết hạn (hook không còn chèn) — đề xuất chuyển sang `memory/archive.md` trong cùng danh sách, người dùng đồng ý mới chuyển:",
					...expired.map(line => `  - ${line}`),
				]
			: []),
		...(uncommitted.length
			? [`File bài học đang có thay đổi chưa commit: ${uncommitted.map(path => `\`${path}\``).join(", ")} — đề xuất commit cùng kết quả chốt.`]
			: []),
		"Không có gì đáng học → nói \"không có bài học mới\", ghi đúng câu đó vào \"Kết quả chốt\" và đặt `status: chốt` ngay cho mọi file phiên trên.",
		"Có bài học → chờ người dùng trả lời (vd \"đồng ý 1, 3; bỏ 2\"); chỉ ghi đúng các dòng người dùng đồng ý, điền \"Kết quả chốt\" và đặt `status: chốt` trong frontmatter mỗi file phiên trên. Người dùng nói bỏ thì đặt `status: bỏ`.",
		"Ghi xong thì đề xuất người dùng commit các file bài học vừa đổi theo quy tắc Git trong AGENTS.md.",
	].join("\n");
}

/** `extra` (mục lục chủ đề) được chèn kèm và tính vào hash: mục lục đổi thì chèn lại. Dòng hết hạn bị ẩn trước khi tính hash. */
function injectFile(
	label: string,
	file: string,
	previousHash: string | undefined,
	extra = "",
): { text?: string; hash: string } {
	const exists = existsSync(file);
	const raw = exists ? readFileSync(file, "utf8") : "";
	if (!exists && !extra) {
		return previousHash && previousHash !== "missing"
			? { text: `${label} (\`${relative(ROOT, file)}\`) — file đã bị xóa; bản đã nạp trước không còn hiệu lực.`, hash: "missing" }
			: { hash: "missing" };
	}
	const { text, expired } = splitExpired(raw, todayString());
	const hash = contentHash(extra ? `${text}\n${extra}` : text);
	if (hash === previousHash) return { hash };
	const lesson = formatInjection(label, relative(ROOT, file), text, expired.length) ??
		(previousHash && !text.trim() ? formatInjection(label, relative(ROOT, file), "(Không còn bài học có hiệu lực.)") : undefined);
	const parts = [lesson, extra].filter(Boolean);
	return parts.length ? { text: parts.join("\n\n"), hash } : { hash };
}

const todayString = (now = new Date()) => `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

/** File bài học: `MEMORY.md`, `memory/*.md` (trừ README) và file bài học brand trong config. */
function lessonFiles(brands: BrandConfig[]): string[] {
	const files = [join(ROOT, "MEMORY.md")];
	if (existsSync(MEMORY_DIR)) {
		for (const name of readdirSync(MEMORY_DIR).sort()) {
			if (/\.md$/i.test(name) && !name.startsWith(".") && !/^readme\.md$/i.test(name)) files.push(join(MEMORY_DIR, name));
		}
	}
	for (const brand of brands) files.push(resolve(ROOT, brand.file));
	return files;
}

const SNAPSHOT_FIELD = "memory-files";

/** So file bài học với snapshot trong file phiên; có đổi thì ghi vào mục "Memory đổi trong buổi". */
function trackMemoryChanges(logPath: string, brands: BrandConfig[] | null, now: Date): void {
	if (!existsSync(logPath)) return;
	const log = readFileSync(logPath, "utf8");
	const fields = readFrontmatter(log);
	const previous = parseSnapshot(fields[SNAPSHOT_FIELD] ?? "");
	const current: Snapshot = {};
	for (const file of lessonFiles(brands ?? [])) {
		if (!existsSync(file)) continue;
		const raw = readFileSync(file, "utf8");
		current[relative(ROOT, file)] = { hash: contentHash(raw), lines: countLines(raw) };
	}
	if (brands === null) {
		// Config hỏng không chứng minh file brand đã bị xóa; vẫn theo dõi MEMORY và memory/.
		for (const [path, stamp] of Object.entries(previous)) {
			if (path !== "MEMORY.md" && !path.startsWith("memory/")) current[path] = stamp;
		}
	}
	const serialized = serializeSnapshot(current);
	if (fields[SNAPSHOT_FIELD] === serialized) return;
	const changes = SNAPSHOT_FIELD in fields ? diffSnapshots(parseSnapshot(fields[SNAPSHOT_FIELD]), current) : [];
	const time = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
	writeFileSync(logPath, setFrontmatter(appendMemoryChanges(log, time, changes), { [SNAPSHOT_FIELD]: serialized }));
}

function gitStatus(dir: string, paths: string[]): string[] {
	const result = spawnSync(
		"git",
		["-c", "core.quotePath=false", "-C", dir, "status", "--porcelain=v1", "-z", "--untracked-files=all", "--", ...paths],
		{ encoding: "utf8", timeout: 3_000 },
	);
	if (result.error) throw result.error;
	if (result.status !== 0) throw new Error(`git status: ${result.stderr.trim()}`);
	const entries = result.stdout.split("\0");
	const pathsOut: string[] = [];
	for (let i = 0; i < entries.length; i++) {
		const entry = entries[i];
		if (!entry) continue;
		pathsOut.push(entry.slice(3));
		if (/[RC]/.test(entry.slice(0, 2)) && entries[i + 1]) pathsOut.push(entries[++i]);
	}
	return pathsOut;
}

function uncommittedLessons(brands: BrandConfig[]): string[] {
	const out = gitStatus(ROOT, ["MEMORY.md", "memory"]).filter(path => !/(^|\/)readme\.md$/i.test(path));
	for (const brand of brands) {
		const file = resolve(ROOT, brand.file);
		if (existsSync(dirname(file)) && gitStatus(dirname(file), [basename(file)]).length) out.push(relative(ROOT, file));
	}
	return out;
}

function expiredLessons(brands: BrandConfig[], topics: TopicInfo[]): string[] {
	const today = todayString();
	const files = [join(ROOT, "MEMORY.md"), ...topics.map(topic => join(MEMORY_DIR, topic.file)), ...brands.map(brand => resolve(ROOT, brand.file))];
	return files.flatMap(file =>
		existsSync(file) ? splitExpired(readFileSync(file, "utf8"), today).expired.map(line => `\`${relative(ROOT, file)}\`: ${line}`) : [],
	);
}

const RECALL_DIRS = ["knowledge", "jobs"];
const MAX_RECALL_CHUNKS = 2;
const MAX_RECALL_FILE_BYTES = 512 * 1024;
type IndexedFile = { path: string; mtimeMs: number; size: number; version: string; chunks: Chunk[]; norm: string };
/** Chỉ mục giữ trong bộ nhớ tiến trình OMP; file đổi `mtime`/size thì đọc lại. */
const recallCache = new Map<string, IndexedFile>();

function recallCorpus(): IndexedFile[] {
	const files: IndexedFile[] = [];
	const seen = new Set<string>();
	for (const dir of RECALL_DIRS) {
		const base = join(ROOT, dir);
		if (!existsSync(base) || !lstatSync(base).isDirectory()) continue;
		const boundary = realpathSync(base) + sep;
		for (const entry of readdirSync(base, { recursive: true, encoding: "utf8" })) {
			if (!/\.md$/i.test(entry) || /^readme\.md$/i.test(basename(entry)) || entry.split(/[\\/]/).some(part => part.startsWith("."))) continue;
			const path = join(base, entry);
			try {
				const stat = lstatSync(path);
				if (!stat.isFile() || stat.size > MAX_RECALL_FILE_BYTES || !realpathSync(path).startsWith(boundary)) continue;
				seen.add(path);
				let cached = recallCache.get(path);
				if (!cached || cached.mtimeMs !== stat.mtimeMs || cached.size !== stat.size) {
					const text = readFileSync(path, "utf8");
					const relPath = relative(ROOT, path);
					cached = { path: relPath, mtimeMs: stat.mtimeMs, size: stat.size, version: contentHash(text), chunks: splitChunks(relPath, text), norm: normalizeVi(text) };
					recallCache.set(path, cached);
				}
				files.push(cached);
			} catch {
				// Một file biến mất/link hỏng không được làm mất cả kho.
			}
		}
	}
	for (const key of recallCache.keys()) if (!seen.has(key)) recallCache.delete(key);
	return files;
}

/** Mọi brand được nhắc trong file đều phải có trong tin nhắn; không trộn cả file nhiều brand chỉ vì khớp một brand. */
type RecallResult = { matches: RankedChunk[]; recalled: string[]; versions: Record<string, string> };
function recallChunks(prompt: string, brands: BrandConfig[], state: LoopState): RecallResult {
	const terms = searchTerms(prompt);
	if (terms.length < 2) return { matches: [], recalled: state.recalled, versions: state.recallVersions };
	const promptBrands = new Set(matchKeywords(prompt, brands).map(brand => brand.id));
	const corpus = recallCorpus().filter(file => brandIdsIn(file.norm, brands).every(id => promptBrands.has(id)));
	const versions = Object.fromEntries(corpus.map(file => [file.path, file.version]));
	const recalled = state.recalled.filter(id => {
		const path = id.slice(0, id.lastIndexOf("#"));
		return versions[path] !== undefined && state.recallVersions[path] === versions[path];
	});
	const done = new Set(recalled);
	// Chọn top-2 trước khi bỏ đoạn đã nạp; phiên bản A→B→A vẫn nạp lại A vì source version đã đổi.
	const matches = rankChunks(terms, corpus.flatMap(file => file.chunks)).slice(0, MAX_RECALL_CHUNKS).filter(item => !done.has(item.chunk.id));
	return { matches, recalled: [...recalled, ...matches.map(item => item.chunk.id)], versions };
}

function sessionLogFor(ctx: HookContext): string | undefined {
	const sessionKey = encodeURIComponent(ctx.sessionManager.getSessionId());
	return listSessionFiles().find(file => file.path.endsWith(`-${sessionKey}.md`))?.path;
}

const quoteHits = (hits: string[]) => hits.slice(0, 4).map(hit => `"${hit}"`).join(", ");

const rel = (paths: string[]) => paths.map(path => `\`${relative(ROOT, path)}\``).join(", ");

export default function learningLoop(pi: ExtensionAPI): void {
	pi.on("before_agent_start", async (event: StartEvent, ctx: HookContext) => {
		if (ctx.agent && ctx.agent.kind !== "main") return;
		if (event.reason === "revive") return;
		const failures: string[] = [];
		// Mỗi phần tách lỗi riêng: một phần hỏng không được làm mất các phần còn lại.
		const guard = <T>(name: string, fallback: T, run: () => T): T => {
			try {
				return run();
			} catch (error) {
				failures.push(`${name}: ${(error as Error).message}`);
				return fallback;
			}
		};

		const prompt = String(event.prompt ?? "");
		const branch = guard("branch", [] as BranchEntry[], () => ctx.sessionManager.getBranch());
		const state = reconstructState(branch);
		const now = new Date();
		const suffix = encodeURIComponent(ctx.sessionManager.getSessionId());
		const sessions = guard("sessions", [], listSessionFiles);
		const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
		const logPath = sessions.find(file => file.path.endsWith(`-${suffix}.md`))?.path ?? join(SESSIONS_DIR, `${date}-${suffix}.md`);
		const closing = isCloseCommand(prompt);

		if (isLoggable(prompt)) {
			guard("log", undefined, () => {
				const userTurns = branch.filter(entry => entry.type === "message" && entry.message?.role === "user").length;
				logMessage(logPath, prompt, userTurns, now);
			});
		}

		const brandConfig = guard("brands", null as BrandConfig[] | null, loadBrands);
		const brands = brandConfig ?? [];
		guard("memory history", undefined, () => trackMemoryChanges(logPath, brandConfig, now));

		const { stale, expired } = classifyOpenSessions(sessions, now.getTime(), logPath);
		guard("expire", undefined, () => {
			for (const path of expired) writeFileSync(path, setFrontmatter(readFileSync(path, "utf8"), { status: "hết hạn" }));
		});

		const topics = guard("topics", [] as TopicInfo[], listTopics);
		const memoryFile = join(ROOT, "MEMORY.md");
		const memoryLines = guard("memory lines", 0, () => (existsSync(memoryFile) ? countLines(readFileSync(memoryFile, "utf8")) : 0));
		const forgottenFile = join(MEMORY_DIR, "forgotten.md");
		const forgotten = guard("forgotten", "", () => (existsSync(forgottenFile) ? readFileSync(forgottenFile, "utf8") : ""));
		let closeCached: CloseContext | undefined;
		/** Dòng hết hạn và `git status` chỉ tính khi cần chỉ dẫn chốt. */
		const closeContext = (): CloseContext =>
			(closeCached ??= {
				brands,
				topics,
				memoryLines,
				forgotten,
				expired: guard("expired", [] as string[], () => expiredLessons(brands, topics)),
				uncommitted: guard("git status", [] as string[], () => uncommittedLessons(brands)),
			});
		const parts: string[] = [];
		/** Lý do của từng phần chèn, lưu trong `details` để lệnh `/nap` hiển thị. */
		const injected: string[] = [];
		const next: LoopState = {
			...state,
			brandHashes: { ...state.brandHashes },
			topicHashes: { ...state.topicHashes },
			recalled: [...state.recalled],
			recallVersions: { ...state.recallVersions },
		};

		if (closing) {
			const files = [logPath, ...stale].filter(path => existsSync(path));
			parts.push(`Người dùng yêu cầu CHỐT BÀI HỌC. ${closeInstruction(files, closeContext())}`);
			injected.push("chỉ dẫn chốt bài học (người dùng yêu cầu)");
			next.closePending = files;
			next.closeNudges = 0;
		} else if (state.closePending.length) {
			const open = guard("pending", [] as string[], () =>
				state.closePending.filter(
					path => existsSync(path) && readFrontmatter(readFileSync(path, "utf8")).status === "open",
				),
			);
			if (open.length && state.closeNudges < MAX_CLOSE_NUDGES) {
				parts.push(
					`Lượt chốt bài học trước chưa hoàn tất: ${rel(open)} vẫn \`status: open\`. Nếu người dùng đã trả lời danh sách, ghi đúng các dòng người dùng đồng ý, điền "Kết quả chốt" và đặt \`status: chốt\`.`,
				);
				next.closeNudges = state.closeNudges + 1;
				injected.push("nhắc hoàn tất lượt chốt trước");
			} else {
				next.closePending = [];
			}
		}

		if (!state.reminded && stale.length && !closing) {
			parts.push(
				[
					`Có ${stale.length} buổi làm việc trước chưa chốt bài học: ${rel(stale)}.`,
					"Trước tiên tự xem phần lời người dùng sau dòng mốc \"đã chốt tới đây\" cuối cùng (nếu có): nếu chỉ là chào hỏi/xác nhận, không có lời sửa hay yêu cầu, tự đặt `status: chốt` cho file đó và không hỏi người dùng.",
					"Còn lại thì trước khi làm việc hỏi người dùng đúng một câu: chốt luôn, để sau, hay bỏ. Người dùng nói bỏ → đặt `status: bỏ`. Người dùng nói chốt luôn → làm như sau.",
					closeInstruction(stale, closeContext()),
				].join("\n"),
			);
			next.reminded = true;
			injected.push(`nhắc ${stale.length} buổi chưa chốt bài học`);
		}

		const index = renderTopicIndex(topics);
		const memory = guard("memory", { hash: state.memoryHash ?? "error" } as { text?: string; hash: string }, () =>
			injectFile(
				"Bài học chung đã được người dùng duyệt — MEMORY.md của Staff, áp dụng khi liên quan",
				memoryFile,
				state.memoryHash,
				index
					? `Mục lục bài học theo chủ đề (\`memory/\`) — hook tự chèn file khi tin nhắn khớp từ khóa; việc đang làm thuộc chủ đề nào mà file chưa được chèn thì tự mở đọc:\n${index}`
					: "",
			),
		);
		next.memoryHash = memory.hash;
		if (memory.text) {
			parts.push(memory.text);
			injected.push(
				`MEMORY.md ${memoryLines}/${MAX_LINES} dòng${index ? ` + mục lục ${topics.length} chủ đề` : ""} (${state.memoryHash ? "nội dung đổi" : "đầu phiên hoặc sau compaction"})`,
			);
		}

		for (const slug of Object.keys(state.topicHashes)) {
			if (state.topicHashes[slug] === "missing" || topics.some(topic => topic.slug === slug)) continue;
			parts.push(`Chủ đề \`${slug}\` không còn trong kho memory; bản bài học của chủ đề này đã nạp trước không còn hiệu lực.`);
			next.topicHashes[slug] = "missing";
			injected.push(`thu hồi chủ đề ${slug} — file không còn`);
		}

		for (const brand of brands) {
			const hit = matchedKeyword(prompt, brand.keywords);
			const reason = hit ? `khớp "${hit}"` : "kiểm tra lại file đã nạp (nội dung/hạn dùng đổi)";
			// Node đã chốt trước, sổ feedback sau: chỉ dòng `dứt khoát` trong sổ thắng khi mâu thuẫn.
			const sources = [
				...(brand.context ?? []).map(path => ({
					key: `${brand.id} › ${path}`,
					path,
					label: `Rule brand \`${brand.id}\` đã chốt (${reason}) — nguồn chính trong \`brand/\` của Project, Team Lead biên tập; chỉ áp dụng cho brand này; chỉ dòng \`dứt khoát\` trong sổ feedback thắng khi mâu thuẫn`,
				})),
				{
					key: brand.id,
					path: brand.file,
					label: `Sổ feedback brand \`${brand.id}\` (${reason}) — \`dứt khoát\`: phải theo ngay, thắng rule cũ trong \`brand/\`; \`gợi ý\`: tham khảo chưa chốt, không thắng rule brand. Khi người dùng feedback mang tính brand (đúng cho bài/việc khác: giọng, từ, xưng hô, trình bày, thẩm mỹ, nhận diện, claim, quy cách định dạng), GHI NGAY một dòng vào cuối file này theo định dạng ở đầu file, không hỏi duyệt, rồi báo một dòng; feedback chỉ cho một deliverable (chính tả, giá/số liệu bài đó, chọn ảnh cụ thể) ở lại workstream. Chỉ áp dụng cho brand này`,
				},
			];
			for (const source of sources) {
				if (!hit && !state.brandHashes[source.key]) continue;
				const lessons = guard(`brand ${source.key}`, { hash: state.brandHashes[source.key] ?? "error" } as { text?: string; hash: string }, () =>
					injectFile(source.label, resolve(ROOT, source.path), state.brandHashes[source.key]),
				);
				next.brandHashes[source.key] = lessons.hash;
				if (lessons.text) {
					parts.push(lessons.text);
					injected.push(`brand ${source.key} — ${reason}`);
				}
			}
		}

		for (const topic of topics) {
			const hit = matchedKeyword(prompt, topic.keywords);
			if (!hit && !state.topicHashes[topic.slug]) continue;
			const reason = hit ? `khớp "${hit}"` : "kiểm tra lại file đã nạp (nội dung/hạn dùng đổi)";
			const lessons = guard(`topic ${topic.slug}`, { hash: state.topicHashes[topic.slug] ?? "error" } as { text?: string; hash: string }, () =>
				injectFile(
					`Bài học chủ đề \`${topic.slug}\` (${reason}) đã được người dùng duyệt — áp dụng khi làm loại việc này`,
					join(MEMORY_DIR, topic.file),
					state.topicHashes[topic.slug],
				),
			);
			next.topicHashes[topic.slug] = lessons.hash;
			if (lessons.text) {
				parts.push(lessons.text);
				injected.push(`chủ đề ${topic.slug} — ${reason}`);
			}
		}

		if (!closing && brandConfig !== null) {
			const result = guard("recall", { matches: [], recalled: state.recalled, versions: state.recallVersions } as RecallResult, () => recallChunks(prompt, brands, state));
			const recalled = result.matches;
			next.recalled = result.recalled;
			next.recallVersions = result.versions;
			if (recalled.length) {
				parts.push(
					[
						"Có thể liên quan — hook tìm theo từ khóa trong `knowledge/` và `jobs/` (tham khảo, KHÔNG phải bài học đã duyệt; đọc file đầy đủ nếu cần; job của brand khác không áp dụng cho việc đang làm):",
						...recalled.map(({ chunk, hits }) => `\n### \`${chunk.path}\` § ${chunk.heading} (khớp ${quoteHits(hits)})\n${excerptChunk(chunk, 12, 1_200, hits)}`),
					].join("\n"),
				);
				for (const { chunk, hits } of recalled) {
					injected.push(`tìm lại: ${chunk.path} § ${chunk.heading} — khớp ${quoteHits(hits)}`);
				}
			}
		}

		if (failures.length && ctx.hasUI) ctx.ui.notify(`learning-loop: ${failures.join("; ")}`, "warning");
		if (!parts.length) return;
		return {
			message: {
				customType: MESSAGE_TYPE,
				content: `[learning-loop — hook tự chèn]\n\n${parts.join("\n\n---\n\n")}`,
				display: false,
				details: { ...next, injected },
				attribution: "agent",
			},
		};
	});

	/** Chụp lại file bài học cuối mỗi lượt để ghi thay đổi Staff vừa làm (trước lượt kế tiếp ghi thay đổi người dùng sửa tay). */
	pi.on("agent_end", async (_event: unknown, ctx: HookContext) => {
		if (ctx.agent && ctx.agent.kind !== "main") return;
		try {
			const logPath = sessionLogFor(ctx);
			if (logPath) {
				let brands: BrandConfig[] | null = null;
				try { brands = loadBrands(); } catch { /* Giữ snapshot brand cũ khi config hỏng. */ }
				trackMemoryChanges(logPath, brands, new Date());
			}
		} catch (error) {
			if (ctx.hasUI) ctx.ui.notify(`learning-loop: memory history: ${(error as Error).message}`, "warning");
		}
	});

	pi.registerCommand("chot", {
		description: "Chốt bài học của buổi làm việc",
		handler: async () => {
			pi.sendUserMessage("chốt bài học");
		},
	});

	pi.registerCommand("nap", {
		description: "Xem hook learning-loop đã nạp gì vào phiên này và vì sao (toàn bộ context: /context)",
		handler: async (_args: string, ctx: HookContext) => {
			if (!ctx.hasUI) return;
			const lines = summarizeInjections(ctx.sessionManager.getBranch());
			let status: string;
			try {
				const memoryFile = join(ROOT, "MEMORY.md");
				const memoryLines = existsSync(memoryFile) ? countLines(readFileSync(memoryFile, "utf8")) : 0;
				const topics = listTopics().map(topic => `${topic.slug} ${topic.lines}/${MAX_LINES}`);
				status = `Hiện có: MEMORY.md ${memoryLines}/${MAX_LINES} dòng; chủ đề: ${topics.join(", ") || "chưa có"}.`;
			} catch (error) {
				status = `Không đọc được trạng thái memory: ${(error as Error).message}`;
			}
			const text = [
				lines.length ? "Hook learning-loop đã chèn vào phiên này (cũ → mới):" : "Hook learning-loop chưa chèn gì vào phiên này.",
				...lines,
				"",
				status,
				"Xem toàn bộ context (system prompt, tool, mọi message): /context",
			].join("\n");
			await ctx.ui.editor("learning-loop · /nap (Esc để đóng)", text);
		},
	});
}
