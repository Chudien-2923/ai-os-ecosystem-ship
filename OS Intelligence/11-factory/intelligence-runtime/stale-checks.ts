// stale-checks v0.1.0 — source: OS Intelligence/11-factory/intelligence-runtime/stale-checks.ts
// Các kiểm tra dấu hiệu Markdown bị cũ trong repo Intelligence. Chỉ báo, không sửa.
// Thiết kế: OS Intelligence/03-work/intelligence-markdown-freshness/DESIGN.md §5.5.
import { spawnSync } from "node:child_process";
import { type Dirent, existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";
import { loadThresholds, type Thresholds } from "./session-ledger";

export type Finding = {
	check: "removed-name" | "version" | "stale-work" | "inbox" | "uncommitted" | "wikilink" | "considering";
	location: string;
	detail: string;
};

export type FreshnessConfig = { removedNames: string[]; historicalPaths: string[] };

const DAY_MS = 86_400_000;
const DEFAULT_HISTORICAL = ["log.md", "CHANGELOG.md", "02-daily/", "05-decisions/", "06-meetings/", "12-raw/", "07-wiki/01-sources/"];
/** Thư mục không quét: dependency và evidence thử nghiệm của WORK. */
const SKIP_DIRS: Record<string, true> = { node_modules: true, labs: true };
/** Heading lịch sử: Completed/Closed/History (nguyên từ), lịch sử, hành trình quyết định, hoặc heading phiên bản `V0.2.2`. */
const HISTORY_HEADING = /\b(completed|closed|history)\b|lịch sử|hành trình|(^|\s)V\d+\.\d+/i;
const WORK_DONE = /^\s*-\s*\*{0,2}Status\*{0,2}:\*{0,2}\s*\*{0,2}\s*(completed|closed)/i;
const SEMVER = /(\d+\.\d+\.\d+)/;

export function loadConfig(main: string): FreshnessConfig {
	let raw: Partial<FreshnessConfig> = {};
	try {
		raw = JSON.parse(readFileSync(join(main, ".omp", "freshness.json"), "utf8"));
	} catch {
		// Thiếu hoặc hỏng → mặc định.
	}
	const strings = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : undefined);
	return {
		removedNames: strings(raw.removedNames) ?? [],
		historicalPaths: strings(raw.historicalPaths) ?? DEFAULT_HISTORICAL,
	};
}

/** Ngày `YYYY-MM-DD` theo 00:00 giờ địa phương → số ngày tròn xuống tới `now`. */
function daysSinceDate(date: string, now: Date): number {
	const [y, m, d] = date.split("-").map(Number);
	return Math.floor((now.getTime() - new Date(y, m - 1, d).getTime()) / DAY_MS);
}

const plain = (s: string) =>
	s.normalize("NFD").replace(/\p{M}/gu, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();

function workIsDone(text: string): boolean {
	return text.split("\n").slice(0, 15).some(line => WORK_DONE.test(line));
}

/** Folder WORK được `03-work/index.md` liệt kê dưới heading Completed/Closed. */
function doneWorkDirs(main: string): Set<string> {
	const done = new Set<string>();
	let text: string;
	try {
		text = readFileSync(join(main, "03-work", "index.md"), "utf8").normalize("NFC");
	} catch {
		return done;
	}
	for (const line of sectionLines(text, h => HISTORY_HEADING.test(h)))
		for (const m of line.text.matchAll(/\[\[(03-work\/[^\]|#]+)\/WORK\]\]/g)) done.add(m[1]);
	return done;
}

export function listActiveMarkdown(main: string, cfg: FreshnessConfig): string[] {
	const out: string[] = [];
	const doneWorks = doneWorkDirs(main);
	const historical = (rel: string) =>
		cfg.historicalPaths.some(p => (p.endsWith("/") ? rel.startsWith(p) : rel === p));
	const walk = (dir: string) => {
		let entries: Dirent[];
		try {
			entries = readdirSync(dir, { withFileTypes: true });
		} catch {
			return;
		}
		const workFile = entries.find(e => e.isFile() && e.name === "WORK.md");
		if (workFile && dir !== main) {
			if (doneWorks.has(relative(main, dir).split(sep).join("/"))) return;
			try {
				if (workIsDone(readFileSync(join(dir, "WORK.md"), "utf8"))) return;
			} catch {
				// Đọc lỗi → coi như active.
			}
		}
		for (const e of entries) {
			if (e.name.startsWith(".")) continue;
			const path = join(dir, e.name);
			const rel = relative(main, path).split(sep).join("/");
			if (e.isDirectory()) {
				if (!SKIP_DIRS[e.name] && !historical(`${rel}/`)) walk(path);
			} else if (e.isFile() && e.name.endsWith(".md") && !historical(rel)) out.push(rel);
		}
	};
	walk(main);
	return out.sort();
}

type Line = { no: number; text: string };

/** Dòng ngoài code fence, kèm heading gần nhất theo cấp. */
function scanLines(text: string): (Line & { headings: string[] })[] {
	const out: (Line & { headings: string[] })[] = [];
	const stack: { level: number; title: string }[] = [];
	let fence = false;
	text.split("\n").forEach((raw, i) => {
		if (/^\s*(```|~~~)/.test(raw)) {
			fence = !fence;
			return;
		}
		if (fence) return;
		const h = /^(#{1,6})\s+(.*)$/.exec(raw);
		if (h) {
			const level = h[1].length;
			while (stack.length && stack[stack.length - 1].level >= level) stack.pop();
			stack.push({ level, title: h[2].trim() });
		}
		out.push({ no: i + 1, text: raw, headings: stack.map(s => s.title) });
	});
	return out;
}

export function checkRemovedNames(main: string, cfg: FreshnessConfig): Finding[] {
	if (!cfg.removedNames.length) return [];
	const patterns = cfg.removedNames.map(name => ({
		name,
		re: new RegExp(`(?<![\\p{L}\\p{N}_])${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![\\p{L}\\p{N}_])`, "u"),
	}));
	const findings: Finding[] = [];
	for (const rel of listActiveMarkdown(main, cfg)) {
		const text = readFileSync(join(main, rel), "utf8").normalize("NFC");
		if (!cfg.removedNames.some(name => text.includes(name))) continue;
		const lines: number[] = [];
		const names = new Set<string>();
		for (const line of scanLines(text)) {
			const body = line.text.replace(/`[^`]*`/g, "");
			const hits = patterns.filter(p => p.re.test(body));
			if (!hits.length) continue;
			if (line.headings.some(h => HISTORY_HEADING.test(h))) continue;
			if (/\bxoa\b|lich su/.test(plain(line.text))) continue;
			lines.push(line.no);
			for (const h of hits) names.add(h.name);
		}
		if (lines.length)
			findings.push({
				check: "removed-name",
				location: `${rel}:${lines[0]}`,
				detail: `nhắc ${[...names].join(", ")} (đã xóa) ở ${lines.length} dòng`,
			});
	}
	return findings;
}

function specVersion(text: string): string | undefined {
	const m = /Phiên bản hiện hành:\**\s*V?(\d+\.\d+\.\d+)/.exec(text) ?? /^-\s*Version:\s*V?(\d+\.\d+\.\d+)/m.exec(text);
	return m?.[1];
}

const cells = (line: string) => line.split("|").slice(1, -1).map(c => c.trim());

export function checkVersions(main: string): Finding[] {
	const findings: Finding[] = [];
	const read = (rel: string) => readFileSync(join(main, rel), "utf8").normalize("NFC");
	const version = existsSync(join(main, "VERSION")) ? read("VERSION").trim() : undefined;
	const intelSpec = specVersion(read("11-factory/specs/os-intelligence-starter-spec.md"));
	if (version && intelSpec && version !== intelSpec)
		findings.push({ check: "version", location: "VERSION", detail: `VERSION ${version} ≠ spec Intelligence V${intelSpec}` });
	if (version && !read("CHANGELOG.md").includes(`## [V${version}]`))
		findings.push({ check: "version", location: "CHANGELOG.md", detail: `thiếu mục ## [V${version}]` });

	const lines = read("11-factory/registry.md").split("\n");
	let instanceTable = false;
	lines.forEach((line, i) => {
		if (!line.startsWith("|")) {
			instanceTable = false;
			return;
		}
		const c = cells(line);
		if (c.some(x => x.includes("Locator")) && c.some(x => x.includes("Version khai báo"))) {
			instanceTable = true;
			return;
		}
		const where = `11-factory/registry.md:${i + 1}`;
		const link = /\[\[(11-factory\/specs\/[^\]|#]+)/.exec(c[2] ?? "");
		const declared = SEMVER.exec(c[1] ?? "")?.[1];
		if (link && declared) {
			const file = join(main, `${link[1]}.md`);
			const actual = existsSync(file) ? specVersion(readFileSync(file, "utf8").normalize("NFC")) : undefined;
			if (actual && actual !== declared)
				findings.push({ check: "version", location: where, detail: `${c[0]}: registry V${declared} ≠ spec V${actual}` });
			return;
		}
		if (!instanceTable) return;
		const locator = /`([^`]+)`/.exec(c[2] ?? "")?.[1];
		const instanceDeclared = SEMVER.exec(c[3] ?? "")?.[1];
		if (!locator || !instanceDeclared) return;
		const versionFile = join(resolve(main, locator), "VERSION");
		if (!existsSync(versionFile)) return;
		const actual = SEMVER.exec(readFileSync(versionFile, "utf8"))?.[1];
		if (actual && actual !== instanceDeclared)
			findings.push({ check: "version", location: where, detail: `${c[1]}: registry V${instanceDeclared} ≠ VERSION ${actual}` });
	});
	return findings;
}

/** mtime, hoặc lần commit cuối nếu muộn hơn; chỉ gọi Git khi mtime cũ hơn `staleBeforeMs`. */
function lastTouchMs(main: string, rel: string, staleBeforeMs: number): number {
	let ms = 0;
	try {
		ms = statSync(join(main, rel)).mtimeMs;
	} catch {
		return 0;
	}
	if (ms >= staleBeforeMs) return ms;
	const r = spawnSync("git", ["-C", main, "log", "-1", "--format=%ct", "--", rel], { encoding: "utf8" });
	const committed = r.status === 0 ? Number(r.stdout.trim()) * 1000 : 0;
	return Math.max(ms, Number.isFinite(committed) ? committed : 0);
}

/** Dòng trong section có heading khớp `match`, dừng ở heading cùng cấp hoặc cao hơn. */
function sectionLines(text: string, match: (heading: string) => boolean): Line[] {
	const out: Line[] = [];
	let level = 0;
	text.split("\n").forEach((raw, i) => {
		const h = /^(#{1,6})\s+(.*)$/.exec(raw);
		if (h) {
			if (level && h[1].length <= level) level = 0;
			if (!level && match(h[2].trim())) level = h[1].length;
			return;
		}
		if (level) out.push({ no: i + 1, text: raw });
	});
	return out;
}

export function checkStaleWork(main: string, now: Date, t: Thresholds): Finding[] {
	const text = readFileSync(join(main, "03-work", "index.md"), "utf8").normalize("NFC");
	const findings: Finding[] = [];
	for (const line of sectionLines(text, h => h.startsWith("Active"))) {
		for (const m of line.text.matchAll(/\[\[([^\]|#]+)/g)) {
			const rel = `${m[1].trim()}.md`;
			const touched = lastTouchMs(main, rel, now.getTime() - t.workDays * DAY_MS);
			if (!touched) continue;
			const days = Math.floor((now.getTime() - touched) / DAY_MS);
			if (days > t.workDays)
				findings.push({ check: "stale-work", location: rel, detail: `WORK active không đổi ${days} ngày` });
		}
	}
	return findings;
}

export function checkInbox(main: string, now: Date, t: Thresholds): Finding[] {
	const text = readFileSync(join(main, "01-inbox", "README.md"), "utf8").normalize("NFC");
	const findings: Finding[] = [];
	for (const line of sectionLines(text, h => h === "Entries")) {
		const m = /^- \[\[.*?\]\] — (\d{4}-\d{2}-\d{2}):/.exec(line.text);
		if (!m || line.text.includes("đã chuyển")) continue;
		const days = daysSinceDate(m[1], now);
		if (days > t.inboxDays)
			findings.push({ check: "inbox", location: `01-inbox/README.md:${line.no}`, detail: `Inbox chờ ${days} ngày` });
	}
	return findings;
}

export function checkUncommitted(main: string, now: Date, t: Thresholds): Finding[] {
	const r = spawnSync("git", ["-C", main, "status", "--porcelain", "-z", "-uall"], { encoding: "utf8" });
	if (r.status !== 0) return [];
	const tokens = r.stdout.split("\0");
	const groups = new Map<string, { count: number; oldest: number }>();
	for (let i = 0; i < tokens.length; i++) {
		const token = tokens[i];
		if (token.length < 4) continue;
		const status = token.slice(0, 2);
		const path = token.slice(3);
		if (status.includes("R") || status.includes("C")) i++;
		let mtime: number;
		try {
			mtime = statSync(join(main, path)).mtimeMs;
		} catch {
			continue;
		}
		const key = path.split("/").slice(0, 2).join("/");
		const g = groups.get(key) ?? { count: 0, oldest: Number.POSITIVE_INFINITY };
		g.count++;
		g.oldest = Math.min(g.oldest, mtime);
		groups.set(key, g);
	}
	const findings: Finding[] = [];
	for (const [key, g] of groups) {
		const days = Math.floor((now.getTime() - g.oldest) / DAY_MS);
		if (days > t.uncommittedDays)
			findings.push({ check: "uncommitted", location: key, detail: `${g.count} file chưa commit, cũ nhất ${days} ngày` });
	}
	return findings.sort((a, b) => a.location.localeCompare(b.location));
}

export function checkWikilinks(main: string, cfg: FreshnessConfig): Finding[] {
	const findings: Finding[] = [];
	const headingCache = new Map<string, Set<string> | null>();
	const headingsOf = (rel: string) => {
		if (!headingCache.has(rel)) {
			const file = join(main, rel);
			headingCache.set(
				rel,
				existsSync(file)
					? new Set(scanLines(readFileSync(file, "utf8").normalize("NFC")).flatMap(l => {
							const h = /^#{1,6}\s+(.*)$/.exec(l.text);
							return h ? [h[1].trim()] : [];
						}))
					: null,
			);
		}
		return headingCache.get(rel);
	};
	for (const rel of listActiveMarkdown(main, cfg)) {
		const text = readFileSync(join(main, rel), "utf8").normalize("NFC");
		for (const line of scanLines(text)) {
			const body = line.text.replace(/`[^`]*`/g, "");
			for (const m of body.matchAll(/\[\[([^\]|#]+)(?:#([^\]|]+))?(?:\|[^\]]*)?\]\]/g)) {
				const target = m[1].trim();
				const targetRel = target.endsWith(".md") ? target : `${target}.md`;
				const headings = headingsOf(targetRel);
				const where = `${rel}:${line.no}`;
				if (!headings) findings.push({ check: "wikilink", location: where, detail: `[[${target}]] không tồn tại` });
				else if (m[2] && !headings.has(m[2].trim()))
					findings.push({ check: "wikilink", location: where, detail: `[[${target}#${m[2].trim()}]] thiếu heading` });
			}
		}
	}
	return findings;
}

export function checkConsidering(main: string, cfg: FreshnessConfig, now: Date, t: Thresholds): Finding[] {
	const findings: Finding[] = [];
	for (const rel of listActiveMarkdown(main, cfg)) {
		const text = readFileSync(join(main, rel), "utf8").normalize("NFC");
		if (!text.includes("Đang cân nhắc")) continue;
		for (const line of sectionLines(text, h => h.includes("Đang cân nhắc"))) {
			const m = /^- (\d{4}-\d{2}-\d{2}) · /.exec(line.text);
			if (!m) continue;
			const days = daysSinceDate(m[1], now);
			if (days > t.consideringDays)
				findings.push({ check: "considering", location: `${rel}:${line.no}`, detail: `chưa chốt ${days} ngày` });
		}
	}
	return findings;
}

export function runAllChecks(main: string, now: Date): { findings: Finding[]; errors: string[] } {
	const cfg = loadConfig(main);
	const t = loadThresholds(main);
	const checks: [Finding["check"], () => Finding[]][] = [
		["removed-name", () => checkRemovedNames(main, cfg)],
		["version", () => checkVersions(main)],
		["stale-work", () => checkStaleWork(main, now, t)],
		["inbox", () => checkInbox(main, now, t)],
		["uncommitted", () => checkUncommitted(main, now, t)],
		["wikilink", () => checkWikilinks(main, cfg)],
		["considering", () => checkConsidering(main, cfg, now, t)],
	];
	const findings: Finding[] = [];
	const errors: string[] = [];
	for (const [name, run] of checks) {
		try {
			findings.push(...run());
		} catch (e) {
			errors.push(`${name}: ${e instanceof Error ? e.message : String(e)}`);
		}
	}
	return { findings, errors };
}
