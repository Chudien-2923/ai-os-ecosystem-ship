import { describe, expect, test } from "bun:test";
import {
	appendMemoryChanges,
	appendUserMessage,
	brandIdsIn,
	classifyOpenSessions,
	closeInstruction,
	countLines,
	diffSnapshots,
	excerptChunk,
	formatInjection,
	isCloseCommand,
	isLoggable,
	isTopicFile,
	matchedKeyword,
	matchKeywords,
	messageKey,
	newSessionLog,
	normalizeVi,
	parseBrandConfig,
	parseSnapshot,
	parseTopic,
	rankChunks,
	readFrontmatter,
	reconstructState,
	renderTopicIndex,
	REVIEWED_MARKER,
	searchTerms,
	serializeSnapshot,
	setFrontmatter,
	splitChunks,
	splitExpired,
	summarizeInjections,
	truncateForInjection,
} from "./learning-loop.ts";

const HOUR = 3_600_000;
const brandMau = { id: "brand-mau", keywords: ["brand-mau"], file: "x.md" };

describe("lệnh chốt", () => {
	test("nhận có dấu, không dấu, hoa thường và /chot", () => {
		expect(isCloseCommand("Chốt bài học nhé")).toBe(true);
		expect(isCloseCommand("ok giờ CHOT BAI HOC")).toBe(true);
		expect(isCloseCommand("/chot")).toBe(true);
	});
	test("không nhầm câu khác có chữ chốt", () => {
		expect(isCloseCommand("chốt video này nhé")).toBe(false);
		expect(isCloseCommand("/chotx")).toBe(false);
	});
	test("lệnh chốt và slash command không được ghi vào log", () => {
		expect(isLoggable("chốt bài học")).toBe(false);
		expect(isLoggable("/model")).toBe(false);
		expect(isLoggable("   ")).toBe(false);
		expect(isLoggable("caption to hơn chút")).toBe(true);
	});
	test("đường dẫn dán vào không bị coi là slash command", () => {
		expect(isLoggable("/tmp/a.mp4 dựng cái này")).toBe(true);
		expect(isLoggable("/chot")).toBe(false);
	});
});

describe("brand", () => {
	test("khớp theo từ, không phân biệt hoa thường", () => {
		expect(matchKeywords("làm video BRAND-MAU golf", [brandMau])).toEqual([brandMau]);
	});
	test("không khớp khi chỉ là một phần của từ khác", () => {
		expect(matchKeywords("brandMauo shop", [brandMau])).toEqual([]);
	});
});

describe("chủ đề", () => {
	const topicText = ["---", "title: Phụ đề", "description: Phụ đề cho video dọc", "aliases: caption, , sub", "---", "# Phụ đề", "", "- 2026-11-10 · x"].join("\n");
	const topic = parseTopic("phu-de.md", topicText);

	test("chỉ file .md bài học, bỏ README, archive, forgotten và file ẩn", () => {
		expect(
			["phu-de.md", "README.md", "archive.md", "Archive.md", "forgotten.md", "x.txt", "._phu-de.md", ".nhap.md"].map(isTopicFile),
		).toEqual([true, false, false, false, false, false, false, false]);
	});
	test("đọc frontmatter: từ khóa gồm title, aliases, slug; bỏ alias rỗng và trùng khi bỏ dấu", () => {
		expect(topic).toMatchObject({ slug: "phu-de", title: "Phụ đề", description: "Phụ đề cho video dọc", lines: 8 });
		expect(topic.keywords).toEqual(["Phụ đề", "caption", "sub"]);
	});
	test("alias trong dấu nháy, ngoặc vuông, file CRLF/BOM vẫn đọc được", () => {
		const quoted = parseTopic("phu-de.md", '---\ntitle: "Phụ đề"\naliases: ["caption", \'sub\']\n---\n- x');
		expect(quoted.title).toBe("Phụ đề");
		expect(quoted.keywords).toEqual(["Phụ đề", "caption", "sub"]);
		const crlf = parseTopic("phu-de.md", "\uFEFF---\r\ntitle: Phụ đề\r\naliases: caption\r\n---");
		expect(crlf.keywords).toEqual(["Phụ đề", "caption"]);
		expect(matchKeywords("làm caption", [quoted, crlf])).toEqual([quoted, crlf]);
	});
	test("giữ đúng tên file thật cho đường dẫn", () => {
		const upper = parseTopic("Render.MD", "- x");
		expect(upper.file).toBe("Render.MD");
		expect(renderTopicIndex([upper])).toContain("`memory/Render.MD`");
	});
	test("không có frontmatter vẫn dùng được slug", () => {
		expect(parseTopic("render-remotion.md", "- 2026-11-10 · x")).toMatchObject({ title: "render remotion", keywords: ["render remotion"] });
	});
	test("khớp alias hoa thường, không dấu; không khớp giữa từ", () => {
		expect(matchKeywords("làm CAPTION nhé", [topic])).toEqual([topic]);
		expect(matchKeywords("phu de cho clip", [topic])).toEqual([topic]);
		expect(matchKeywords("đi subway", [topic])).toEqual([]);
	});
	test("trả đúng từ khóa đã khớp để giải thích vì sao chèn", () => {
		expect(matchedKeyword("làm CAPTION nhé", topic.keywords)).toBe("caption");
		expect(matchedKeyword("đi subway", topic.keywords)).toBeUndefined();
	});
	test("đếm dòng", () => {
		expect(countLines(" \n ")).toBe(0);
		expect(countLines("a\n\nb\n")).toBe(3);
	});
});


describe("lịch sử sửa memory", () => {
	test("snapshot đọc/ghi được, kể cả đường dẫn có dấu cách", () => {
		const snap = { "MEMORY.md": { hash: "a1", lines: 12 }, "../../OS Projects/t/brand/staff-lessons/mia-content-writer.md": { hash: "b2", lines: 3 } };
		expect(parseSnapshot(serializeSnapshot(snap))).toEqual(snap);
		expect(parseSnapshot("")).toEqual({});
	});
	test("đường dẫn chứa dấu phân cách vẫn round-trip qua frontmatter", () => {
		const snapshot = { "memory/a;b=clip: draft.md": { hash: "ab12", lines: 7 } };
		const log = setFrontmatter(newSessionLog("2026-11-10T03:00:00Z", "Buổi"), { "memory-files": serializeSnapshot(snapshot) });
		expect(parseSnapshot(readFrontmatter(log)["memory-files"])).toEqual(snapshot);
	});
	test("so sánh: đổi số dòng, sửa nội dung, file mới, file bị xóa", () => {
		const prev = { "MEMORY.md": { hash: "a", lines: 12 }, "memory/a.md": { hash: "b", lines: 4 }, "memory/old.md": { hash: "c", lines: 2 } };
		const next = { "MEMORY.md": { hash: "a2", lines: 13 }, "memory/a.md": { hash: "b2", lines: 4 }, "memory/new.md": { hash: "d", lines: 5 } };
		expect(diffSnapshots(prev, next)).toEqual([
			"MEMORY.md: 12 → 13 dòng",
			"memory/a.md: sửa nội dung (4 dòng)",
			"memory/new.md: mới (5 dòng)",
			"memory/old.md: bị xóa",
		]);
		expect(diffSnapshots(next, next)).toEqual([]);
	});
	test("ghi vào mục riêng sau Kết quả chốt; lời người dùng mới vẫn vào mục Lời người dùng", () => {
		let log = newSessionLog("2026-11-10T03:00:00.000Z", "Buổi");
		log = appendMemoryChanges(log, "10:32", ["MEMORY.md: 12 → 13 dòng"]);
		log = appendMemoryChanges(log, "10:40", ["memory/a.md: mới (1 dòng)"]);
		expect(log.match(/## Memory đổi trong buổi/g)).toHaveLength(1);
		expect(log).toContain("- 10:40 · memory/a.md: mới (1 dòng)");
		const withMessage = appendUserMessage(log, { time: "10:45", iso: "2026-11-10T03:45:00.000Z", text: "outro", key: "k1" })!;
		expect(withMessage.indexOf("- 10:45 — outro")).toBeLessThan(withMessage.indexOf("## Kết quả chốt"));
		expect(withMessage.indexOf("## Kết quả chốt")).toBeLessThan(withMessage.indexOf("## Memory đổi trong buổi"));
	});
});

describe("hạn dùng từng dòng", () => {
	const text = ["# M", "- 2026-11-01 · a · đến 2026-11-10", "- 2026-11-01 · b · đến 2026-11-09", "- 2026-11-01 · c · đến 10/11/2026", "- 2026-11-01 · d"].join("\n");
	test("còn hiệu lực trong ngày hạn, quá hạn bị ẩn, ngày sai định dạng giữ nguyên", () => {
		const result = splitExpired(text, "2026-11-10");
		expect(result.expired).toEqual(["- 2026-11-01 · b · đến 2026-11-09"]);
		expect(result.text.split("\n")).toEqual(["# M", "- 2026-11-01 · a · đến 2026-11-10", "- 2026-11-01 · c · đến 10/11/2026", "- 2026-11-01 · d"]);
	});
	test("ngày không tồn tại và ngày trong trích nguồn không làm bài học mất hiệu lực", () => {
		const lines = [
			'- 2026-11-01 · giữ · nguồn: "đã nói · đến 2026-01-01"',
			"- 2026-11-01 · giữ · đến 2026-02-30",
			"- 2026-11-01 · giữ · đến 2026-13-01",
			"- 2026-11-01 · giữ · đến 2024-02-29",
		];
		const result = splitExpired(lines.join("\n"), "2026-11-10");
		expect(result.expired).toEqual([lines[3]]);
		expect(result.text).toBe(lines.slice(0, 3).join("\n"));
	});
});

describe("tìm lại trong knowledge/ và jobs/", () => {
	const doc = [
		"# Remotion render",
		"",
		"Giới thiệu chung.",
		"",
		"## Render CLI",
		"",
		"Dùng `npx remotion render` để xuất video.",
		"Phụ đề burn-in qua caption.",
		"",
		"## Player",
		"",
		"Nhúng player vào web.",
	].join("\n");
	const chunks = splitChunks("knowledge/remotion/05.md", doc);

	test("từ khóa: cặp âm tiết bỏ dấu, bỏ cặp toàn từ phổ biến, cộng từ dài", () => {
		const terms = searchTerms("Tôi muốn render CLI cho phụ đề Remotion");
		expect(terms).toEqual(expect.arrayContaining(["render cli", "phu de", "remotion", "render"]));
		for (const noise of ["toi muon", "muon render", "cli cho", "cho phu"]) expect(terms).not.toContain(noise);
	});
	test("không ghép cặp qua dấu câu; không dùng lời điều khiển làm chủ đề", () => {
		const terms = searchTerms("Kiểm tra hook: caption cho video. Chỉ trả lời ok.");
		expect(terms).not.toContain("video chi");
		expect(terms).not.toContain("kiem tra");
		expect(terms).not.toContain("tra loi");
		expect(searchTerms("srt cli h264")).toEqual(expect.arrayContaining(["srt", "cli", "h264"]));
	});
	test("từ đơn và cặp chứa cùng từ không đủ chứng minh chủ đề hỏi rộng hơn", () => {
		const general = splitChunks("knowledge/general.md", "## General\nGiải thích vấn đề hiển thị.");
		expect(rankChunks(searchTerms("giải thích Kubernetes ingress healthcheck"), general)).toEqual([]);
		expect(rankChunks(searchTerms("render cli Kubernetes ingress healthcheck"),
			splitChunks("knowledge/render.md", "## Render CLI\nRender video."))).toEqual([]);
	});
	test("heading đúng chủ đề thắng bảng dài chỉ nhắc rải rác từ khóa", () => {
		const specific = splitChunks("knowledge/cli.md", "## Render CLI\nRemotion render video codec h264.");
		const broad = splitChunks("knowledge/general.md", "## Troubleshooting\n" +
			"Remotion render video codec cli h264 là các thuật ngữ.\n".repeat(60));
		expect(rankChunks(searchTerms("render video bằng Remotion CLI với codec h264"), [...broad, ...specific])[0].chunk.path).toBe("knowledge/cli.md");
	});
	test("khớp âm tiết rời rạc không đủ kéo tài liệu trái chủ đề", () => {
		const docs = splitChunks("knowledge/cloud.md", "## Lambda\nVận hành khoản thanh toán mua license.");
		expect(rankChunks(searchTerms("tư vấn khoản vay mua nhà"), docs)).toEqual([]);
		expect(searchTerms("kiểm tra tiến độ công việc hôm nay")).toEqual([]);
	});
	test("section con được tìm bằng ngữ cảnh heading cha", () => {
		const docs = splitChunks("knowledge/guide.md", "# Remotion\n## CLI\n### Render\nXuất video codec h264.");
		expect(rankChunks(searchTerms("Remotion CLI render"), docs).map(item => item.chunk.heading)).toContain("Render");
	});
	test("chia đoạn theo heading", () => {
		expect(chunks.map(chunk => chunk.heading)).toEqual(["Remotion render", "Render CLI", "Player"]);
	});
	test("cần khớp ít nhất 2 từ khóa; đoạn khớp nhiều hơn xếp trước", () => {
		const ranked = rankChunks(searchTerms("render cli remotion phụ đề"), chunks);
		expect(ranked[0].chunk.heading).toBe("Render CLI");
		expect(ranked[0].hits).toEqual(expect.arrayContaining(["render cli", "phu de"]));
		expect(ranked.every(item => item.hits.length >= 2)).toBe(true);
		expect(rankChunks(searchTerms("player"), chunks)).toEqual([]);
	});
	test("đoạn trích không vượt hạn ký tự tính cả dấu rút gọn", () => {
		const chunk = splitChunks("x.md", "## Render\n" + "nội dung ".repeat(400))[0];
		expect(excerptChunk(chunk, 12, 1_200).length).toBeLessThanOrEqual(1_200);
	});
	test("đoạn trích giới hạn 12 dòng", () => {
		const long = splitChunks("x.md", `## A\n${Array.from({ length: 40 }, (_, i) => `dòng ${i}`).join("\n")}`)[0];
		expect(excerptChunk(long).split("\n").length).toBeLessThanOrEqual(12);
	});
	test("đoạn trích phải chứa phần khớp dù nằm cuối section", () => {
		const body = `## Hướng dẫn\n${"Nội dung chung.\n".repeat(25)}caption burn-in dùng màu trắng`;
		const chunk = splitChunks("knowledge/caption.md", body)[0];
		const excerpt = excerptChunk(chunk, 12, 1_200, ["caption", "burn in"]);
		expect(excerpt).toContain("caption burn-in dùng màu trắng");
		expect(excerpt.split("\n").length).toBeLessThanOrEqual(12);
	});
	test("thêm section trước không đổi id của đoạn đã nhớ; sửa nội dung có id mới", () => {
		const original = splitChunks("x.md", "## B\ncaption giới hạn hai dòng")[0];
		const inserted = splitChunks("x.md", "## A\nrender video\n## B\ncaption giới hạn hai dòng")[1];
		const changed = splitChunks("x.md", "## B\ncaption giới hạn một dòng")[0];
		expect(inserted.id).toBe(original.id);
		expect(changed.id).not.toBe(original.id);
	});
	test("fence dài và fence lồng khác loại không tạo section giả", () => {
		const text = "## A\n````markdown\n```js\n# không phải heading\n```\n~~~\n# cũng không\n````\n## B\nđây là phần B";
		expect(splitChunks("x.md", text).map(chunk => chunk.heading)).toEqual(["A", "B"]);
	});
	test("nhận ra file nhắc brand nào để chắn brand khác", () => {
		const brandMau = { id: "brand-mau", keywords: ["brand-mau"], file: "x.md" };
		expect(brandIdsIn(normalizeVi("Job video brand-mau áo khoác"), [brandMau])).toEqual(["brand-mau"]);
		expect(brandIdsIn(normalizeVi("Remotion render"), [brandMau])).toEqual([]);
	});
});

describe("tóm tắt phần hook đã chèn (/nap)", () => {
	const msg = (timestamp: string, injected: string[]) => ({
		type: "custom_message",
		customType: "ai-os.learning-loop",
		timestamp,
		details: { injected },
	});
	test("liệt kê theo thứ tự, có mốc compaction, bỏ entry khác", () => {
		const lines = summarizeInjections([
			msg("2026-11-10T03:00:00.000Z", ["MEMORY.md 3/200 dòng (đầu phiên)", 'chủ đề phu-de — khớp "caption"']),
			{ type: "message" },
			{ type: "compaction", timestamp: "2026-11-10T04:00:00.000Z" },
			msg("2026-11-10T04:01:00.000Z", ["MEMORY.md 3/200 dòng (đầu phiên hoặc sau compaction)"]),
		]);
		expect(lines).toHaveLength(4);
		expect(lines[0]).toContain("MEMORY.md");
		expect(lines[1]).toContain('khớp "caption"');
		expect(lines[2]).toContain("compaction");
		expect(lines[3]).toContain("sau compaction");
	});
	test("phiên chưa chèn gì", () => {
		expect(summarizeInjections([{ type: "message" }])).toEqual([]);
	});
});

describe("định dạng phần chèn", () => {
	test("rỗng thì không chèn", () => {
		expect(formatInjection("L", "MEMORY.md", " \n")).toBeUndefined();
	});
});

describe("log phiên", () => {
	const log = newSessionLog("2026-11-10T07:00:00.000Z", "Buổi 2026-11-10 14:00");

	test("cùng key ghi lần hai thì bỏ qua", () => {
		const key = messageKey(1, "outro fade 3s");
		const once = appendUserMessage(log, { time: "14:02", iso: "2026-11-10T07:02:00.000Z", text: "outro fade 3s", key });
		expect(once).not.toBeNull();
		expect(appendUserMessage(once!, { time: "14:02", iso: "2026-11-10T07:02:00.000Z", text: "outro fade 3s", key })).toBeNull();
	});
	test("tin nhắn nhiều dòng có --- và # không phá frontmatter", () => {
		const next = appendUserMessage(log, {
			time: "14:05",
			iso: "2026-11-10T07:05:00.000Z",
			text: "a\n---\n# b",
			key: messageKey(2, "a\n---\n# b"),
		})!;
		const fm = readFrontmatter(next);
		expect(fm.status).toBe("open");
		expect(fm.last).toBe("2026-11-10T07:05:00.000Z");
		expect(Object.keys(fm)).toEqual(["status", "started", "last"]);
		expect(next).toContain("a / --- / # b");
	});
	test("tin mới vào phiên đã chốt: thêm mốc đã chốt và mở lại", () => {
		const closed = setFrontmatter(
			appendUserMessage(log, { time: "14:02", iso: "2026-11-10T07:02:00.000Z", text: "a", key: "k1" })!,
			{ status: "chốt" },
		);
		const next = appendUserMessage(closed, { time: "15:00", iso: "2026-11-10T08:00:00.000Z", text: "làm lại video 2 đi", key: "k2" })!;
		expect(readFrontmatter(next).status).toBe("open");
		const body = next.split("\n");
		expect(body.indexOf(REVIEWED_MARKER)).toBeLessThan(body.findIndex(line => line.includes("làm lại video 2 đi")));
		expect(body.indexOf(REVIEWED_MARKER)).toBeGreaterThan(body.findIndex(line => line.includes("— a <!--")));
	});
	test("tin quá dài bị cắt khi ghi log", () => {
		const next = appendUserMessage(log, { time: "14:06", iso: "2026-11-10T07:06:00.000Z", text: "x".repeat(5_000), key: "k3" })!;
		const line = next.split("\n").find(row => row.startsWith("- 14:06"))!;
		expect(line.length).toBeLessThan(2_200);
		expect(line).toContain("[…cắt]");
	});
	test("mở lại log hết hạn không đánh dấu correction cũ là đã duyệt", () => {
		const expired = setFrontmatter(appendUserMessage(log, { time: "14:00", iso: "2026-11-10T07:00:00Z", text: "sửa phụ đề", key: "old" })!, { status: "hết hạn" });
		const next = appendUserMessage(expired, { time: "15:00", iso: "2026-11-18T08:00:00Z", text: "tiếp tục việc", key: "new" })!;
		expect(readFrontmatter(next).status).toBe("open");
		expect(next).not.toContain(REVIEWED_MARKER);
		expect(next).toContain("sửa phụ đề");
	});
	test("ghi metadata log CRLF/BOM nhất quán với phần đọc", () => {
		const windows = "\uFEFF" + log.replace(/\n/g, "\r\n");
		const updated = setFrontmatter(windows, { status: "chốt", last: "2026-11-11T08:00:00Z" });
		expect(readFrontmatter(updated)).toMatchObject({ status: "chốt", last: "2026-11-11T08:00:00Z" });
	});
	test("setFrontmatter chỉ đổi khóa được nêu", () => {
		const fm = readFrontmatter(setFrontmatter(log, { status: "hết hạn" }));
		expect(fm.status).toBe("hết hạn");
		expect(fm.started).toBe("2026-11-10T07:00:00.000Z");
	});
});

describe("phân loại phiên open", () => {
	const now = Date.parse("2026-11-10T12:00:00.000Z");
	const at = (ms: number) => new Date(now - ms).toISOString();
	test("phiên song song còn sống không bị coi là bỏ dở", () => {
		const r = classifyOpenSessions([{ path: "a", status: "open", last: at(2 * HOUR) }], now, "cur");
		expect(r).toEqual({ stale: [], expired: [] });
	});
	test("im lặng ≥ 6 giờ là bỏ dở, ≥ 7 ngày là hết hạn", () => {
		const r = classifyOpenSessions(
			[
				{ path: "b", status: "open", last: at(7 * HOUR) },
				{ path: "c", status: "open", last: at(8 * 24 * HOUR) },
				{ path: "d", status: "chốt", last: at(9 * HOUR) },
			],
			now,
			"cur",
		);
		expect(r).toEqual({ stale: ["b"], expired: ["c"] });
	});
	test("phiên hiện tại không bao giờ bị nhắc", () => {
		const r = classifyOpenSessions([{ path: "cur", status: "open", last: at(9 * HOUR) }], now, "cur");
		expect(r.stale).toEqual([]);
	});
});

describe("cắt nội dung chèn", () => {
	test("rỗng thì không chèn", () => {
		expect(truncateForInjection("  \n ")).toBeNull();
	});
	test("quá 200 dòng thì cắt và báo", () => {
		const text = Array.from({ length: 250 }, (_, i) => `dòng ${i}`).join("\n");
		const r = truncateForInjection(text)!;
		expect(r.truncated).toBe(true);
		expect(r.text.split("\n").length).toBe(200);
	});
	test("quá 16 KB thì cắt theo byte", () => {
		const r = truncateForInjection("ộ".repeat(10_000))!;
		expect(r.truncated).toBe(true);
		expect(Buffer.byteLength(r.text, "utf8")).toBeLessThanOrEqual(16_384);
	});
});

describe("config brand", () => {
	test("phân biệt config hỏng với danh sách brand rỗng hợp lệ", () => {
		expect(parseBrandConfig("{ hỏng")).toBeNull();
		expect(parseBrandConfig('{"brands":[{"id":1}]}')).toBeNull();
		expect(parseBrandConfig('{"brands":[]}')).toEqual([]);
		expect(parseBrandConfig('{"brands":[{"id":"t","keywords":["brand-mau"],"file":"x.md"}]}')).toEqual([
			{ id: "t", keywords: ["brand-mau"], file: "x.md" },
		]);
	});

	test("`context` tùy chọn phải là danh sách path không rỗng", () => {
		expect(parseBrandConfig('{"brands":[{"id":"t","keywords":["brand-mau"],"file":"p.md","context":["g.md","v.md"]}]}')).toEqual([
			{ id: "t", keywords: ["brand-mau"], file: "p.md", context: ["g.md", "v.md"] },
		]);
		expect(parseBrandConfig('{"brands":[{"id":"t","keywords":["brand-mau"],"file":"p.md","context":"g.md"}]}')).toBeNull();
		expect(parseBrandConfig('{"brands":[{"id":"t","keywords":["brand-mau"],"file":"p.md","context":[""]}]}')).toBeNull();
	});
});

describe("dựng lại state từ lịch sử phiên", () => {
	const msg = (details: object) => ({ type: "custom_message", customType: "ai-os.learning-loop", details });
	test("chỉ lấy state từ message đã thật sự được chèn", () => {
		const state = reconstructState([
			msg({
				memoryHash: "m1",
				brandHashes: { t: "b1" },
				topicHashes: { p: "t1" },
				reminded: true,
				closePending: ["f"],
				closeNudges: 1,
				recalled: ["k#a"],
				recallVersions: { k: "v1" },
			}),
			{ type: "message" },
		]);
		expect(state).toEqual({
			memoryHash: "m1",
			brandHashes: { t: "b1" },
			topicHashes: { p: "t1" },
			reminded: true,
			closePending: ["f"],
			closeNudges: 1,
			recalled: ["k#a"],
			recallVersions: { k: "v1" },
		});
	});
	test("sau compaction thì quên hash để chèn lại, giữ phần còn lại", () => {
		const state = reconstructState([
			msg({ memoryHash: "m1", brandHashes: { t: "b1" }, topicHashes: { p: "t1" }, reminded: true, closePending: [], closeNudges: 0, recalled: ["k#a"] }),
			{ type: "compaction" },
		]);
		expect(state.memoryHash).toBeUndefined();
		expect(Object.keys(state.brandHashes)).toEqual(["t"]);
		expect(state.brandHashes.t).not.toBe("b1");
		expect(Object.keys(state.topicHashes)).toEqual(["p"]);
		expect(state.topicHashes.p).not.toBe("t1");
		expect(state.recallVersions).toEqual({});
		expect(state.recalled).toEqual([]);
		expect(state.reminded).toBe(true);
	});
	test("phiên mới chưa có gì", () => {
		expect(reconstructState([])).toEqual({ brandHashes: {}, topicHashes: {}, reminded: false, closePending: [], closeNudges: 0, recalled: [], recallVersions: {} });
	});
});

describe("chốt bài học với brand", () => {
	test("brand không còn chờ người dùng duyệt: ghi ngay vào sổ feedback, không qua hộp pending của Intelligence", () => {
		const text = closeInstruction([], {
			brands: [{ id: "t", keywords: ["brand-mau"], file: "p/brand/feedback.md" }],
			topics: [],
			memoryLines: 1,
			forgotten: "",
			expired: [],
			uncommitted: [],
		});
		expect(text).toContain("brand/feedback.md");
		expect(text).toContain("dứt khoát");
		expect(text).toContain("gợi ý");
		expect(text).toContain("không cần người dùng duyệt");
		expect(text).not.toContain("pending-rules");
		expect(text).not.toContain("OS Intelligence gom");
	});
});
