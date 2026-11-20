// freshness-cli v0.1.0 — source: OS Intelligence/11-factory/intelligence-runtime/freshness-cli.ts
// Dùng: bun 11-factory/intelligence-runtime/freshness-cli.ts <pending | check | mark <id> [--until ISO] [--note text] | baseline --since YYYY-MM-DD>
import { baselineEntries, cacheFile, sessionsDir } from "./freshness";
import { listSessions, loadThresholds, markSession, pendingSessions, readLedger, resolveRoots } from "./session-ledger";
import { runAllChecks } from "./stale-checks";

const [command, ...args] = process.argv.slice(2);
const flag = (name: string) => {
	const i = args.indexOf(`--${name}`);
	return i >= 0 ? args[i + 1] : undefined;
};

const now = new Date();
const roots = resolveRoots();
const all = () => listSessions(sessionsDir(), cacheFile(roots));

switch (command) {
	case "pending": {
		const list = pendingSessions(all(), readLedger(roots.main), {
			sessionsDir: sessionsDir(),
			roots,
			now,
			thresholds: loadThresholds(roots.main),
			currentFile: process.env.OMP_SESSION_FILE,
		});
		console.log(`${list.length} session chờ đối soát (cũ → mới)`);
		for (const s of list)
			console.log(`${(s.lastUserAt ?? s.startedAt).slice(0, 10)}\t${s.id}\t${s.userMessages} tin\t${s.title ?? ""}\t${s.cwd}\t${s.file}`);
		break;
	}
	case "check": {
		const { findings, errors } = runAllChecks(roots.main, now);
		for (const f of findings) console.log(`${f.check}\t${f.location}\t${f.detail}`);
		for (const e of errors) console.log(`error\t${e}`);
		console.log(`${findings.length} finding, ${errors.length} lỗi`);
		break;
	}
	case "mark": {
		const id = args[0];
		const matches = id ? all().filter(s => s.id === id || s.id.endsWith(id)) : [];
		if (matches.length !== 1) {
			console.error(`mark: cần đúng một session khớp "${id ?? ""}" (khớp ${matches.length})`);
			process.exit(1);
		}
		const s = matches[0];
		const until = flag("until") ?? s.lastUserAt ?? s.startedAt;
		markSession(roots.main, { id: s.id, until, at: now.toISOString(), note: flag("note") ?? "đối soát" });
		console.log(`đã ghi sổ ${s.id} tới ${until}`);
		break;
	}
	case "baseline": {
		const since = flag("since");
		if (!since || !/^\d{4}-\d{2}-\d{2}$/.test(since)) {
			console.error("baseline: cần --since YYYY-MM-DD");
			process.exit(1);
		}
		const sessions = all();
		const ledger = readLedger(roots.main);
		const entries = baselineEntries(sessions, roots, since, now).filter(e => !ledger.has(e.id));
		for (const e of entries) markSession(roots.main, e);
		const kept = pendingSessions(sessions, readLedger(roots.main), {
			sessionsDir: sessionsDir(),
			roots,
			now,
			thresholds: loadThresholds(roots.main),
		});
		console.log(`baseline: ghi ${entries.length} session; còn ${kept.length} session chờ đối soát`);
		break;
	}
	default:
		console.error("Dùng: freshness-cli.ts <pending | check | mark <id> [--until ISO] [--note text] | baseline --since YYYY-MM-DD>");
		process.exit(1);
}
