// ecosystem-catalog v0.1.1 — source: OS Intelligence/11-factory/shared-runtime/ecosystem-catalog.ts
// Hook OMP cho Staff, Project (Team Lead) và app Builder: chèn danh bạ Staff/Project/app từ `OS Intelligence/11-factory/catalog.md`
// (tìm ngược từ thư mục cha) ở đầu phiên, sau compaction và khi danh bạ đổi; chỉ để biết, không đọc sâu repo khác.
// Cài vào repo tại `.omp/hooks/pre/ecosystem-catalog.ts`; không ghi file nào. Thiếu danh bạ hoặc lỗi → im lặng.
// Thiết kế: OS Intelligence/03-work/ecosystem-catalog/DESIGN.md
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { ExtensionAPI } from "@oh-my-pi/pi-coding-agent";

export const MESSAGE_TYPE = "ai-os.ecosystem-catalog";
const CATALOG_PATH = join("OS Intelligence", "11-factory", "catalog.md");
const SECTIONS = ["Staff", "Projects", "Builder"] as const;
const HEADER =
	"[ecosystem-catalog — hook tự chèn]\n\nHệ sinh thái AI OS hiện có — chỉ để biết. Làm việc cho repo nào thì theo Project Context Gate hoặc locator của assignment; không tự đọc sâu repo chưa được giao, không sửa repo khác, không chép danh sách này vào file sẽ commit. Đường dẫn tính từ root repo hiện tại.";

export type CatalogEntry = { section: (typeof SECTIONS)[number]; id: string; description: string; locator: string };
type BranchEntry = { type: string; customType?: string; details?: unknown };

/** Dòng `- <id> — <mô tả> — <locator>` dưới `## Staff|Projects|Builder`; dòng khác bị bỏ qua. */
export function parseCatalog(text: string): CatalogEntry[] {
	const entries: CatalogEntry[] = [];
	let section: CatalogEntry["section"] | undefined;
	for (const line of text.split("\n")) {
		const heading = /^##\s+(.+?)\s*$/.exec(line);
		if (heading) {
			section = SECTIONS.find(name => name === heading[1]);
			continue;
		}
		if (!section || !line.startsWith("- ")) continue;
		const parts = line.slice(2).split(" — ").map(part => part.trim());
		if (parts.length < 3 || parts.some(part => !part)) continue;
		entries.push({ section, id: parts[0], description: parts.slice(1, -1).join(" — "), locator: parts[parts.length - 1] });
	}
	return entries;
}

/** Đi từ `start` lên các thư mục cha tới khi gặp `OS Intelligence/11-factory/catalog.md`. */
export function findCatalog(start: string): { ecosystemRoot: string; file: string } | undefined {
	let dir = resolve(start);
	while (true) {
		const file = join(dir, CATALOG_PATH);
		if (existsSync(file)) return { ecosystemRoot: dir, file };
		const parent = dirname(dir);
		if (parent === dir) return undefined;
		dir = parent;
	}
}

/** ID của repo đang chạy: `- ID:` (Staff), `- Project ID:` (Project) hoặc heading đầu một từ `# <id>` (Builder). */
export function selfId(agentsText: string): string | undefined {
	return /^- (?:Project )?ID: *`?([^`\s]+?)`?\.?\s*$/m.exec(agentsText)?.[1] ?? /^# (\S+)\s*$/m.exec(agentsText)?.[1];
}

export function renderCatalog(entries: CatalogEntry[], opts: { self?: string; repoRoot: string; ecosystemRoot: string }): string {
	const blocks: string[] = [];
	for (const section of SECTIONS) {
		const lines = entries
			.filter(entry => entry.section === section && entry.id !== opts.self)
			.map(entry => `- ${entry.id} — ${entry.description} — ${relative(opts.repoRoot, join(opts.ecosystemRoot, entry.locator))}`);
		if (lines.length) blocks.push(`${section}:\n${lines.join("\n")}`);
	}
	return blocks.length ? `${HEADER}\n\n${blocks.join("\n\n")}` : "";
}

/** Cần chèn khi chưa chèn trong nhánh, có compaction sau lần chèn cuối, hoặc hash danh bạ đã đổi. */
export function needsInject(branch: BranchEntry[], hash: string): boolean {
	let last: string | undefined;
	for (const entry of branch) {
		if (entry.type === "compaction") last = undefined;
		else if (entry.type === "custom_message" && entry.customType === MESSAGE_TYPE)
			last = (entry.details as { hash?: string } | undefined)?.hash;
	}
	return last !== hash;
}

const HOOK_DIR = import.meta.dir ?? dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HOOK_DIR, "../../..");

type HookContext = { agent?: { kind: string }; sessionManager: { getBranch(): BranchEntry[] } };

export default function ecosystemCatalog(pi: ExtensionAPI): void {
	pi.on("before_agent_start", async (event: { reason?: string }, ctx: HookContext) => {
		if (ctx.agent && ctx.agent.kind !== "main") return;
		if (event.reason === "revive") return;
		try {
			const found = findCatalog(REPO_ROOT);
			if (!found) return;
			const raw = readFileSync(found.file, "utf8");
			const hash = createHash("sha256").update(raw).digest("hex");
			if (!needsInject(ctx.sessionManager.getBranch(), hash)) return;
			const agents = join(REPO_ROOT, "AGENTS.md");
			const self = existsSync(agents) ? selfId(readFileSync(agents, "utf8")) : undefined;
			const content = renderCatalog(parseCatalog(raw), { self, repoRoot: REPO_ROOT, ecosystemRoot: found.ecosystemRoot });
			if (!content) return;
			return { message: { customType: MESSAGE_TYPE, content, display: false, details: { hash }, attribution: "agent" } };
		} catch {
			return;
		}
	});
}
