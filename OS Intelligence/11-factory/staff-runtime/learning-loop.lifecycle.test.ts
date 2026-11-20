import { afterEach, beforeEach, expect, test } from "bun:test";
import { mkdtempSync, mkdirSync, copyFileSync, writeFileSync, readFileSync, readdirSync, rmSync, symlinkSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

type Message = { customType: string; content: string; details: { memoryHash?: string; recalled: string[]; injected: string[]; topicHashes: Record<string, string> } };
type Entry = { type: string; message?: { role: string }; customType?: string; content?: string; details?: Message["details"] };
type Context = { agent: { kind: string }; hasUI: boolean; ui: { notify: (message: string) => void }; sessionManager: { getBranch: () => Entry[]; getSessionId: () => string } };
type Handler = (event: { prompt?: string }, ctx: Context) => Promise<{ message: Message } | undefined>;
let root: string;
let handler: Handler;
let end: (event: object, ctx: Context) => Promise<void>;
const warnings: string[] = [];

beforeEach(async () => {
  root = mkdtempSync(join(tmpdir(), "ll-lifecycle-"));
  for (const dir of [".omp/hooks/pre", "memory", "knowledge"]) mkdirSync(join(root, dir), { recursive: true });
  const modulePath = join(root, ".omp/hooks/pre/learning-loop.ts");
  copyFileSync(join(import.meta.dir, "learning-loop.ts"), modulePath);
  writeFileSync(join(root, "MEMORY.md"), "# Memory\n- current-general\n");
  writeFileSync(join(root, ".omp/learning-loop.json"), '{"brands":[]}');
  writeFileSync(join(root, "memory/captions.md"), "---\ntitle: Captions\naliases: caption\n---\n- current-caption\n");
  writeFileSync(join(root, "knowledge/render.md"), "## Render CLI\nRender cli codec h264.\n## Render tutorial\nRender cli remotion video.\n## Render troubleshooting\nRender cli codec troubleshooting.\n");
  // The temporary installed module path is runtime-selected; loading it exercises production ROOT resolution.
  const { default: setup } = await import(modulePath);
  warnings.length = 0;
  setup({ on(name: string, fn: Handler) { if (name === "before_agent_start") handler = fn; else if (name === "agent_end") end = fn; }, registerCommand() {} });
});
afterEach(() => rmSync(root, { recursive: true, force: true }));

function session(id: string, branch: Entry[] = []) {
  const ctx: Context = { agent: { kind: "main" }, hasUI: true, ui: { notify: text => warnings.push(text) }, sessionManager: { getBranch: () => branch, getSessionId: () => id } };
  return {
    branch, ctx,
    async turn(prompt: string) {
      branch.push({ type: "message", message: { role: "user" } });
      const result = await handler({ prompt }, ctx);
      if (result) branch.push({ type: "custom_message", ...result.message });
      return result?.message;
    },
  };
}

test("resume không nạp thêm section kém hơn chỉ vì hai section tốt đã nạp", async () => {
  const first = session("session-11111111");
  const loaded = await first.turn("render cli codec h264");
  expect(loaded!.details.recalled).toHaveLength(2);
  const resumed = session("session-11111111", JSON.parse(JSON.stringify(first.branch)));
  const again = await resumed.turn("render cli codec h264");
  expect(again?.details.recalled ?? loaded!.details.recalled).toEqual(loaded!.details.recalled);
});

test("phiên mới nạp riêng; compaction nạp lại đúng bài học và recall", async () => {
  const first = session("session-11111111");
  const loaded = await first.turn("caption render cli codec h264");
  const second = session("session-22222222");
  expect((await second.turn("caption render cli codec h264"))!.content).toContain("current-caption");
  first.branch.push({ type: "compaction" });
  const afterCompact = await first.turn("caption render cli codec h264");
  expect(afterCompact!.content).toContain("current-general");
  expect(afterCompact!.content).toContain("current-caption");
  expect(afterCompact!.details.recalled).toEqual(loaded!.details.recalled);
});

test("attempt không publish không làm mất lần nạp sau hoặc ghi trùng lời người dùng", async () => {
  const current = session("session-11111111");
  current.branch.push({ type: "message", message: { role: "user" } });
  const discarded = await handler({ prompt: "caption" }, current.ctx);
  const published = await handler({ prompt: "caption" }, current.ctx);
  expect(published!.message.details).toEqual(discarded!.message.details);
  expect(published!.message.content).toContain("current-caption");
  const path = readdirSync(join(root, "journal/sessions")).find(name => name.endsWith(".md"))!;
  expect(readFileSync(join(root, "journal/sessions", path), "utf8").match(/— caption /g)).toHaveLength(1);
});

test("hai phiên giữ journal riêng khi cùng file bài học đổi", async () => {
  const a = session("session-11111111");
  const b = session("session-22222222");
  await a.turn("alpha caption"); await b.turn("beta caption");
  writeFileSync(join(root, "MEMORY.md"), "# Memory\n- current-general\n- updated-general\n");
  await Promise.all([end({}, a.ctx), end({}, b.ctx)]);
  const logs = readdirSync(join(root, "journal/sessions")).filter(name => name.endsWith(".md"));
  expect(logs).toHaveLength(2);
  const la = readFileSync(join(root, "journal/sessions", logs.find(name => name.includes("11111111"))!), "utf8");
  const lb = readFileSync(join(root, "journal/sessions", logs.find(name => name.includes("22222222"))!), "utf8");
  expect(la).toContain("alpha caption"); expect(la).not.toContain("beta caption");
  expect(lb).toContain("beta caption"); expect(lb).not.toContain("alpha caption");
  for (const log of [la, lb]) expect(log.match(/MEMORY.md: 2 → 3 dòng/g)).toHaveLength(1);
  expect(warnings).toEqual([]);
});

test("xóa hoặc làm rỗng MEMORY đã nạp phải thu hồi bản cũ", async () => {
  const current = session("session-11111111");
  await current.turn("caption");
  writeFileSync(join(root, "MEMORY.md"), "");
  const empty = await current.turn("tiếp tục");
  expect(empty!.content).not.toContain("current-general");
  expect(empty!.content).toContain("Không còn bài học có hiệu lực");
  rmSync(join(root, "memory/captions.md"));
  const deleted = await current.turn("tiếp tục");
  expect(deleted!.content).not.toContain("current-caption");
  expect(deleted!.details.topicHashes.captions).toBe("missing");
});

test("file knowledge bị xóa không còn được tìm ở phiên mới", async () => {
  await session("session-11111111").turn("render cli codec h264");
  rmSync(join(root, "knowledge/render.md"));
  const result = await session("session-22222222").turn("render cli codec h264");
  expect(result!.details.recalled).toEqual([]);
  expect(result!.content).not.toContain("codec h264");
});

test("config brand hỏng không được biến thành danh sách brand rỗng để recall", async () => {
  writeFileSync(join(root, "knowledge/private.md"), "## Render CLI\nbrand-mau SECRET render cli codec h264.");
  for (const config of ['{ invalid', '{"brands":[{"id":"brand-mau","file":"x.md","keywords":"brand-mau"}]}']) {
    writeFileSync(join(root, ".omp/learning-loop.json"), config);
    const result = await session("session-11111111").turn("render cli codec h264");
    expect(result!.content).toContain("current-general");
    expect(result!.content).not.toContain("SECRET");
    expect(result!.details.recalled).toEqual([]);
  }
});

test("khôi phục phiên bản tài liệu A sau B phải nạp lại A", async () => {
  const file = join(root, "knowledge/render.md");
  const original = "## Render CLI\nrestored-A render cli codec h264.";
  const current = session("session-11111111");
  writeFileSync(file, original);
  expect((await current.turn("render cli codec h264"))!.content).toContain("restored-A");
  writeFileSync(file, "## Render CLI\nrestored-B-updated render cli codec h264.");
  expect((await current.turn("render cli codec h264"))!.content).toContain("restored-B-updated");
  writeFileSync(file, original);
  expect((await current.turn("render cli codec h264"))!.content).toContain("restored-A");
});

test("symlink tới journal không được đưa lời thô vào recall; link hỏng không làm mất kho còn lại", async () => {
  mkdirSync(join(root, "journal/sessions"), { recursive: true });
  const journal = join(root, "journal/sessions/private.md");
  writeFileSync(journal, "## Render CLI codec h264\nRAW_SECRET render cli codec h264.");
  symlinkSync(journal, join(root, "knowledge/raw.md"));
  symlinkSync(join(root, "does-not-exist.md"), join(root, "knowledge/broken.md"));
  const result = await session("session-11111111").turn("render cli codec h264");
  expect(result!.content).not.toContain("RAW_SECRET");
  expect(result!.details.recalled.some(id => id.startsWith("knowledge/render.md#"))).toBe(true);
});

test("hai UUID trùng tám ký tự cuối không chia sẻ journal hoặc dedupe", async () => {
  await session("11111111-1111-4111-8111-0000deadbeef").turn("caption");
  await session("22222222-2222-4222-8222-0000deadbeef").turn("caption");
  const logs = readdirSync(join(root, "journal/sessions")).filter(name => name.endsWith(".md"));
  expect(logs).toHaveLength(2);
  for (const log of logs) expect(readFileSync(join(root, "journal/sessions", log), "utf8").match(/— caption /g)).toHaveLength(1);
});

test("sau compact câu tiếp tục không nhắc keyword vẫn nhận lại chủ đề đã nạp", async () => {
  const current = session("session-11111111");
  await current.turn("caption");
  current.branch.push({ type: "compaction" });
  expect((await current.turn("tiếp tục"))!.content).toContain("current-caption");
});

test("config hỏng trong lượt không được làm mất lịch sử sửa MEMORY", async () => {
  writeFileSync(join(root, "brand.md"), "- brand lesson\n");
  writeFileSync(join(root, ".omp/learning-loop.json"), '{"brands":[{"id":"t","keywords":["brand-mau"],"file":"brand.md"}]}');
  const current = session("session-11111111");
  await current.turn("caption");
  writeFileSync(join(root, ".omp/learning-loop.json"), "{ invalid");
  writeFileSync(join(root, "MEMORY.md"), "# Memory\n- current-general\n- extra\n");
  await end({}, current.ctx);
  const log = readdirSync(join(root, "journal/sessions")).find(name => name.endsWith(".md"))!;
  const text = readFileSync(join(root, "journal/sessions", log), "utf8");
  expect(text).toContain("MEMORY.md: 2 → 3 dòng");
  expect(text).not.toContain("brand.md: bị xóa");
});

test("nhắc brand chèn sổ feedback kèm hướng dẫn ghi ngay và rule đã chốt trong `context`; file context đổi thì chèn lại", async () => {
  mkdirSync(join(root, "p/brand/formats"), { recursive: true });
  writeFileSync(join(root, "p/brand/feedback.md"), "# Sổ feedback\n\n## Đang chờ thêm\n\n## Feedback chờ tổng hợp\n");
  writeFileSync(join(root, "p/brand/guidelines.md"), "- caption-khong-vien\n");
  writeFileSync(join(root, "p/brand/formats/video.md"), "- outro-black-fade\n");
  writeFileSync(
    join(root, ".omp/learning-loop.json"),
    '{"brands":[{"id":"t","keywords":["brand-mau"],"file":"p/brand/feedback.md","context":["p/brand/guidelines.md","p/brand/formats/video.md"]}]}',
  );
  const current = session("session-11111111");
  const first = (await current.turn("dựng video brand-mau voice off"))!.content;
  expect(first).toContain("Feedback chờ tổng hợp");
  expect(first).toContain("GHI NGAY");
  expect(first).toContain("caption-khong-vien");
  expect(first).toContain("outro-black-fade");
  expect(first).not.toContain("pending-rules");
  expect(first).not.toContain("OS Intelligence");
  expect((await current.turn("brand-mau tiếp"))?.content ?? "").not.toContain("caption-khong-vien");
  writeFileSync(join(root, "p/brand/formats/video.md"), "- outro-moi\n");
  const changed = (await current.turn("tiếp tục"))!.content;
  expect(changed).toContain("outro-moi");
  expect(changed).not.toContain("caption-khong-vien");
});
