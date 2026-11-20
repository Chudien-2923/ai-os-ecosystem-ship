import { afterEach, beforeEach, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, realpathSync, rmSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import {
	checkConsidering,
	checkInbox,
	checkRemovedNames,
	checkStaleWork,
	checkUncommitted,
	checkVersions,
	checkWikilinks,
	type FreshnessConfig,
	loadConfig,
	runAllChecks,
} from "./stale-checks";
import { DEFAULT_THRESHOLDS } from "./session-ledger";

const DAY = 86_400_000;
const NOW = new Date(2026, 10, 20, 12, 0, 0);
const T = DEFAULT_THRESHOLDS;
let root: string;
let cfg: FreshnessConfig;

beforeEach(() => {
	root = realpathSync(mkdtempSync(join(tmpdir(), "stale-checks-")));
	cfg = { removedNames: ["Mia", "Mia Content Writer"], historicalPaths: ["log.md", "02-daily/"] };
});
afterEach(() => rmSync(root, { recursive: true, force: true }));

function write(rel: string, text: string, ageDays?: number): void {
	const path = join(root, rel);
	mkdirSync(dirname(path), { recursive: true });
	writeFileSync(path, text);
	if (ageDays !== undefined) {
		const t = new Date(NOW.getTime() - ageDays * DAY);
		utimesSync(path, t, t);
	}
}

function git(...args: string[]): void {
	const r = spawnSync("git", ["-C", root, "-c", "user.email=t@t", "-c", "user.name=t", ...args], { encoding: "utf8" });
	if (r.status !== 0) throw new Error(r.stderr);
}

const dateAgo = (days: number) => {
	const d = new Date(NOW.getTime() - days * DAY);
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

// ------------------------------------------------------------ removed names

test("tên đã xóa: báo ở wiki active, bỏ qua câu lịch sử, mục Completed, WORK completed, file lịch sử", () => {
	write("07-wiki/x.md", "# X\n\n- Owner: Mia\n- Mia đã bị xóa 2026-11-10\n- Kimono không phải tên\n");
	write(
		"03-work/index.md",
		"# Work\n\n## Active\n\n- [[03-work/live/WORK]] — việc A\n\n## Completed\n\n- Mia bootstrap xong — [[03-work/boot/WORK]]\n\n## Quy ước\n\n- Mia Content Writer\n",
	);
	write("03-work/boot/WORK.md", "# Boot\n\n- Status: bootstrap-complete\n\nMia\n");
	write("03-work/boot/DESIGN.md", "Mia\n");
	write("03-work/live/WORK.md", "# Live\n\n- Status: active\n\nMia cũ\n");
	write("03-work/old/WORK.md", "# Old\n\n- Status: **completed** — Mia làm\n");
	write("03-work/old2/WORK.md", "# Old2\n\n- **Status:** closed\n\nMia\n");
	write("log.md", "Mia\n");
	write("02-daily/2026-10-28.md", "Mia\n");
	write("07-wiki/code.md", "```\nMia\n```\nGiá trị `\"Mia\"` trong config\n");
	const f = checkRemovedNames(root, cfg);
	expect(f.map(x => x.location).sort()).toEqual(["03-work/index.md:13", "03-work/live/WORK.md:5", "07-wiki/x.md:3"]);
});

test("tên đã xóa gom một finding mỗi file, kèm số dòng và tên", () => {
	write("07-wiki/y.md", "Mia\nMia và Mia Content Writer\n");
	const f = checkRemovedNames(root, cfg);
	expect(f.length).toBe(1);
	expect(f[0].location).toBe("07-wiki/y.md:1");
	expect(f[0].detail).toContain("2 dòng");
	expect(f[0].detail).toContain("Mia Content Writer");
	expect(f.every(x => x.check === "removed-name")).toBe(true);
});

test("tên đã xóa trong lịch sử phiên bản của spec không bị báo; heading thường vẫn báo", () => {
	write(
		"11-factory/specs/x-spec.md",
		[
			"# Spec",
			"## 3. Contract",
			"- Mia còn được route ở đây",
			"### 3.8. V0.2.2 — 2026-10-18",
			"- Feedback từ repo Mia",
			"### 14.1. Trạng thái cutover V0.1",
			"- Mia đã cutover",
			"## 17. Hành trình quyết định và nguồn nền",
			"### 17.6. Nguồn tham khảo",
			"V0.2.2 đã được áp dụng cho Mia",
			"## 18. Enclosed costs",
			"- Mia còn ở đây",
		].join("\n"),
	);
	const f = checkRemovedNames(root, cfg);
	expect(f.length).toBe(1);
	expect(f[0].location).toBe("11-factory/specs/x-spec.md:3");
	expect(f[0].detail).toContain("2 dòng");
});

// ------------------------------------------------------------ versions

function versionFixture(v: { version: string; spec: string; specRow: string; instanceRow: string; changelog: string }) {
	write("VERSION", `${v.version}\n`);
	write("11-factory/specs/os-intelligence-starter-spec.md", `# Spec\n\n- **Phiên bản hiện hành:** V${v.spec}.\n`);
	write("11-factory/specs/os-builder-app-starter-spec.md", "# Builder\n\n- Version: 0.2.0\n");
	write(
		"11-factory/registry.md",
		[
			"# Registry",
			"",
			"| OS | Version | Nguồn chính | Trạng thái |",
			"| --- | --- | --- | --- |",
			`| Intelligence | V${v.specRow} | [[11-factory/specs/os-intelligence-starter-spec]] | x |`,
			"| Playbook | Trong Intelligence | [[08-playbook/index]] | x |",
			"| Builder App | V0.2.0 | [[11-factory/specs/os-builder-app-starter-spec]] | x |",
			"",
			"| Loại | ID | Locator từ root Intelligence | Version khai báo | Trạng thái |",
			"| --- | --- | --- | --- | --- |",
			`| Intelligence | os-intelligence | \`.\` | V${v.instanceRow} | x |`,
			"| Staff | ghost | `../không-có` | V0.1.0 | x |",
			"",
		].join("\n"),
	);
	write("CHANGELOG.md", `# Changelog\n\n## [Unreleased]\n\n## [V${v.changelog}] — 2026-11-11\n`);
}

test("version khớp hết → không báo", () => {
	versionFixture({ version: "0.2.3", spec: "0.2.3", specRow: "0.2.3", instanceRow: "0.2.3", changelog: "0.2.3" });
	expect(checkVersions(root)).toEqual([]);
});

test("registry tụt so với spec/VERSION → báo đúng registry", () => {
	versionFixture({ version: "0.2.3", spec: "0.2.3", specRow: "0.2.2", instanceRow: "0.2.2", changelog: "0.2.3" });
	const f = checkVersions(root);
	expect(f.length).toBe(2);
	expect(f.every(x => x.location.startsWith("11-factory/registry.md"))).toBe(true);
});

test("VERSION không có mục CHANGELOG hoặc lệch spec → báo", () => {
	versionFixture({ version: "0.2.3", spec: "0.2.2", specRow: "0.2.2", instanceRow: "0.2.3", changelog: "0.2.2" });
	const where = checkVersions(root).map(x => x.location);
	expect(where).toContain("CHANGELOG.md");
	expect(where).toContain("VERSION");
});

// ------------------------------------------------------------ stale work + inbox

test("WORK active đứng yên quá 7 ngày", () => {
	write("03-work/index.md", "# Work\n\n## Active — chờ người dùng\n\n- [[03-work/a/WORK]] — a\n- [[03-work/b/WORK]] — b\n\n## Paused\n\n- [[03-work/c/WORK]] — c\n");
	write("03-work/a/WORK.md", "a", 8);
	write("03-work/b/WORK.md", "b", 6);
	write("03-work/c/WORK.md", "c", 30);
	expect(checkStaleWork(root, NOW, T).map(x => x.location)).toEqual(["03-work/a/WORK.md"]);
});

test("Inbox để quá 7 ngày, bỏ entry đã chuyển", () => {
	write(
		"01-inbox/README.md",
		`# Inbox\n\n## Entries\n\n- [[01-inbox/a]] — ${dateAgo(8)}: a\n- [[01-inbox/b]] — ${dateAgo(8)}: đã chuyển thành WORK\n- [[01-inbox/c]] — ${dateAgo(6)}: c\n`,
	);
	expect(checkInbox(root, NOW, T).map(x => x.location)).toEqual(["01-inbox/README.md:5"]);
});

// ------------------------------------------------------------ uncommitted

test("thay đổi chưa commit quá 3 ngày, nhóm theo thư mục, bỏ file ignore", () => {
	write(".gitignore", ".omp/state/\n");
	write("USER.md", "a\n");
	git("init", "-q");
	git("add", ".");
	git("commit", "-qm", "init");
	write("USER.md", "b\n", 4);
	write("03-work/new/WORK.md", "x", 5);
	write("03-work/new/PLAN.md", "x", 1);
	write("10-context/fresh.md", "x", 2);
	write(".omp/state/reconciled.jsonl", "{}", 10);
	const f = checkUncommitted(root, NOW, T);
	expect(f.map(x => x.location).sort()).toEqual(["03-work/new", "USER.md"]);
	expect(f.find(x => x.location === "03-work/new")?.detail).toContain("2 file");
});

// ------------------------------------------------------------ wikilinks

test("wikilink gãy file hoặc heading; bỏ link trong code", () => {
	write("a/b.md", "# B\n\n## Có thật\n");
	write("AGENTS.md", "# A\n");
	write(
		"07-wiki/x.md",
		"[[a/b]] [[AGENTS]] [[a/b#Có thật]] [[a/b|alias]]\n[[a/thiếu]]\n[[a/b#Không có]]\n`[[a/code]]`\n```\n[[a/fence]]\n```\n",
	);
	expect(checkWikilinks(root, cfg).map(x => x.location).sort()).toEqual(["07-wiki/x.md:2", "07-wiki/x.md:3"]);
});

// ------------------------------------------------------------ considering

test("Đang cân nhắc quá 30 ngày", () => {
	write(
		"10-context/x.md",
		`# X\n\n## Đang cân nhắc\n\n- ${dateAgo(31)} · Product Marketing · chưa chốt · nguồn: s\n- ${dateAgo(29)} · AI Consultant · chưa chốt · nguồn: s\n\n## Khác\n\n- ${dateAgo(90)} · không thuộc mục\n`,
	);
	expect(checkConsidering(root, cfg, NOW, T).map(x => x.location)).toEqual(["10-context/x.md:5"]);
});

// ------------------------------------------------------------ config + runAll

test("loadConfig thiếu file → removedNames rỗng và historicalPaths mặc định", () => {
	const c = loadConfig(root);
	expect(c.removedNames).toEqual([]);
	expect(c.historicalPaths).toContain("log.md");
});

test("runAllChecks: một check lỗi không làm tắt check khác", () => {
	versionFixture({ version: "0.2.3", spec: "0.2.3", specRow: "0.2.2", instanceRow: "0.2.3", changelog: "0.2.3" });
	write("01-inbox/README.md", "# Inbox\n\n## Entries\n");
	git("init", "-q");
	const r = runAllChecks(root, NOW);
	expect(r.errors.length).toBe(1);
	expect(r.errors[0]).toContain("stale-work");
	expect(r.findings.some(f => f.check === "version")).toBe(true);
});
