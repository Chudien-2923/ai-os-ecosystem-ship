// create-app v0.2.2 — dựng repo Builder app mới theo Builder App Starter V0.2.2.
// Dùng: bun 11-factory/builder-runtime/create-app.ts --name <kebab> --purpose "<1–2 câu>" [--project "<locator>"] [--root <container>]
// Không commit, không remote; kiểm chứng OMP + root commit do Intelligence làm theo spec.
// Spec: OS Intelligence/11-factory/specs/os-builder-app-starter-spec.md
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { parseArgs } from "node:util";

const HERE = import.meta.dir;
const TEMPLATE = join(HERE, "template");
const MIN_NODE = [24, 22, 1];
const REA_VERSION = "6.8.0";
const PLUGINS = ["superpowers@superpowers-marketplace", "impeccable@impeccable", "logo-design@logo-design-skill", "ponytail@ponytail"];
const MARKETPLACES = ["superpowers-marketplace", "impeccable", "logo-design-skill", "ponytail"];

function fail(message: string): never {
	console.error(`✘ ${message}`);
	process.exit(1);
}

function run(cmd: string, args: string[], cwd?: string): string {
	const result = spawnSync(cmd, args, { cwd, encoding: "utf8" });
	if (result.status !== 0) fail(`${cmd} ${args.join(" ")} thất bại:\n${result.stderr || result.stdout}`);
	return result.stdout.trim();
}

const { values } = parseArgs({
	options: {
		name: { type: "string" },
		purpose: { type: "string" },
		project: { type: "string" },
		root: { type: "string" },
	},
});
const name = values.name ?? fail("thiếu --name");
const purpose = values.purpose?.trim() || fail("thiếu --purpose");
if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) fail(`tên "${name}" phải là kebab-case (a-z, 0-9, dấu gạch ngang)`);
const container = resolve(values.root ?? join(HERE, "../../../OS Builder"));
const target = join(container, name);
if (existsSync(target)) fail(`${target} đã tồn tại; không ghi đè`);
if (!existsSync(container)) fail(`container ${container} không tồn tại`);

// Điều kiện máy. Script chạy bằng Bun; điều kiện thật là Node hệ thống mà REA dùng.
const [major, minor, patch] = run("node", ["--version"]).replace(/^v/, "").split(".").map(Number);
const nodeOk = major !== MIN_NODE[0] ? major > MIN_NODE[0] : minor !== MIN_NODE[1] ? minor > MIN_NODE[1] : patch >= MIN_NODE[2];
if (!nodeOk) fail(`Node hệ thống ${major}.${minor}.${patch} < ${MIN_NODE.join(".")} (REA yêu cầu); người dùng cần nâng Node trước`);
const rea = run("rea", ["--version"]);
if (rea !== REA_VERSION) fail(`rea ${rea} khác bản spec ${REA_VERSION}; cập nhật spec hoặc cài đúng bản (npm install --global rea-agents@${REA_VERSION})`);
const marketplaces = run("omp", ["plugin", "marketplace", "list"]);
for (const id of MARKETPLACES) if (!new RegExp(`^\\s+${id}\\s`, "m").test(marketplaces)) fail(`thiếu marketplace "${id}" (omp plugin marketplace add …)`);
const reaSkill = join(run("npm", ["root", "-g"]), "rea-agents/skills/reverse-engineer-anything");
if (!existsSync(join(reaSkill, "SKILL.md"))) fail(`không tìm thấy Skill REA tại ${reaSkill}`);

// Dựng repo
mkdirSync(target);
run("git", ["init", "-q", "-b", "main"], target);
const date = new Date().toISOString().slice(0, 10);
const fill = (text: string) =>
	text
		.replaceAll("{{APP_NAME}}", name)
		.replaceAll("{{PURPOSE}}", purpose)
		.replaceAll("{{PROJECT}}", values.project?.trim() || "Không có")
		.replaceAll("{{DATE}}", date);
for (const file of ["AGENTS.md", "README.md", "CHANGELOG.md"]) writeFileSync(join(target, file), fill(readFileSync(join(TEMPLATE, file), "utf8")));
writeFileSync(join(target, ".gitignore"), readFileSync(join(TEMPLATE, "gitignore"), "utf8"));
symlinkSync("AGENTS.md", join(target, "CLAUDE.md"));
mkdirSync(join(target, ".omp/hooks/pre"), { recursive: true });
cpSync(join(TEMPLATE, "mcp.json"), join(target, ".omp/mcp.json"));
cpSync(join(HERE, "check-gate.ts"), join(target, ".omp/hooks/pre/check-gate.ts"));
cpSync(join(HERE, "../shared-runtime/ecosystem-catalog.ts"), join(target, ".omp/hooks/pre/ecosystem-catalog.ts"));
cpSync(reaSkill, join(target, ".agents/skills/reverse-engineer-anything"), { recursive: true });
for (const plugin of PLUGINS) run("omp", ["plugin", "install", plugin, "--scope", "project"], target);

console.log(`✔ Đã dựng ${target}`);
console.log(`  Plugin: ${PLUGINS.join(", ")} (project scope); REA ${REA_VERSION} khai báo tắt; hook check-gate + ecosystem-catalog.`);
console.log("  Nhớ thêm dòng app vào OS Intelligence/11-factory/catalog.md.");
console.log("  Tiếp theo (Intelligence): kiểm chứng OMP theo spec §7, root commit local, đăng ký Orca.");
