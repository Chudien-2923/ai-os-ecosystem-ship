#!/usr/bin/env bun
/**
 * io-map — vẽ bản đồ Input → AI Agent → Output (`tong-quan.excalidraw`) từ mục
 * `## Bản đồ Input/Output` trong một file Markdown (WORKSTREAM.md, WORK.md, file job).
 *
 *   bun io-map.ts <file.md> [--out <file.excalidraw>] [--force] [--check]
 *
 * Markdown là nguồn duy nhất; bản đồ chỉ là hình chiếu. Phần tử người dùng tự vẽ thêm được giữ.
 * Phần do script sinh ra mà người dùng sửa/xóa trên canvas: script dừng và liệt kê, trừ khi có --force.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join, relative } from "node:path";

export const SECTION = "Bản đồ Input/Output";

export type OutputState = "chốt" | "chờ duyệt" | "chưa";
export type RunState = "chưa chạy" | "đang chạy" | "xong" | "kẹt";
export interface Input { text: string; missing: boolean }
export interface Row {
  id: string; output: string; deliverable: string; inputs: Input[]; done: string;
  outputState: OutputState; run: RunState; link: string;
}
export interface Group { name: string; note: string; rows: Row[] }
export interface MapData {
  title: string; goal: string; goalPending: boolean; step: string; waiting: string[]; groups: Group[];
}

// ---------- ĐỌC MARKDOWN ----------

const norm = (s: string) => s.normalize("NFC").trim().toLowerCase();

/** Bỏ định dạng Markdown trong ô: **đậm**, `code`, [[wikilink|nhãn]], [nhãn](url). */
export function plain(s: string): string {
  return s
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, "$2")
    .replace(/\[\[([^\]]+)\]\]/g, "$1")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/\*\*|__|`/g, "")
    .replace(/<br\s*\/?>/gi, " ")
    .trim();
}

function linkTarget(cell: string): string {
  const md = cell.match(/\[[^\]]*\]\(([^)]+)\)/);
  if (md) return md[1].trim();
  const wiki = cell.match(/\[\[([^\]|#]+)/);
  if (wiki) return wiki[1].trim();
  return plain(cell);
}

type TextKey = "id" | "output" | "deliverable" | "done";
const COLUMNS: Record<string, TextKey | "inputs" | "outputState" | "run" | "link"> = {
  "#": "id", "id": "id",
  "output": "output", "hạng mục": "output", "hạng mục (output)": "output",
  "giao phẩm": "deliverable", "mô tả giao phẩm": "deliverable",
  "input": "inputs",
  "tiêu chí xong": "done",
  "output chốt": "outputState", "chốt output": "outputState",
  "thực thi": "run",
  "link": "link",
};

export function parseOutputState(s: string): OutputState {
  const v = norm(s);
  if (v.includes("chờ")) return "chờ duyệt";
  if (v.includes("chốt")) return "chốt";
  return "chưa";
}

export function parseRun(s: string): RunState {
  const v = norm(s);
  if (v.includes("đang")) return "đang chạy";
  if (v.includes("xong")) return "xong";
  if (v.includes("kẹt") || v.includes("chặn")) return "kẹt";
  return "chưa chạy";
}

const MISSING = /\((thiếu|chưa có)\)\s*$/i;

export function parseInputs(cell: string): Input[] {
  return plain(cell).split(";").map((t) => t.trim()).filter(Boolean)
    .map((text) => ({ text, missing: MISSING.test(text.normalize("NFC")) }));
}

function splitCells(line: string): string[] {
  const cells = line.trim().replace(/^\|/, "").replace(/\|$/, "").split(/(?<!\\)\|/);
  return cells.map((c) => c.replace(/\\\|/g, "|").trim());
}

export function parseMap(md: string): MapData {
  const lines = md.normalize("NFC").split("\n");
  const start = lines.findIndex((l) => /^##\s+/.test(l) && norm(l.replace(/^##\s+/, "")) === norm(SECTION));
  if (start < 0) throw new Error(`không thấy mục "## ${SECTION}"`);
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) if (/^#{1,2}\s/.test(lines[i])) { end = i; break; }
  const body = lines.slice(start + 1, end);

  const data: MapData = { title: "", goal: "", goalPending: true, step: "", waiting: [], groups: [] };
  let group: Group | null = null;
  let header: ((typeof COLUMNS)[string] | undefined)[] | null = null;
  let inWaiting = false;

  const field = (l: string, name: string) => {
    const m = l.match(new RegExp(`^-\\s*${name}\\s*:\\s*(.*)$`, "i"));
    return m ? plain(m[1]) : null;
  };

  for (const raw of body) {
    const l = raw.trimEnd();
    if (/^\s*<!--/.test(l)) continue;
    if (/^###\s+/.test(l)) {
      group = { name: plain(l.replace(/^###\s+/, "")), note: "", rows: [] };
      data.groups.push(group); header = null; inWaiting = false; continue;
    }
    if (l.trim().startsWith("|")) {
      inWaiting = false;
      const cells = splitCells(l);
      if (cells.every((c) => /^:?-{2,}:?$/.test(c) || c === "")) continue;
      if (!header) { header = cells.map((c) => COLUMNS[norm(plain(c))]); continue; }
      if (!group) { group = { name: data.title || "Hạng mục", note: "", rows: [] }; data.groups.push(group); }
      const row: Row = { id: "", output: "", deliverable: "", inputs: [], done: "",
        outputState: "chưa", run: "chưa chạy", link: "" };
      cells.forEach((c, i) => {
        const key = header![i];
        if (!key) return;
        if (key === "inputs") row.inputs = parseInputs(c);
        else if (key === "outputState") row.outputState = parseOutputState(c);
        else if (key === "run") row.run = parseRun(c);
        else if (key === "link") row.link = linkTarget(c);
        else row[key] = plain(c);
      });
      if (!row.id || !row.output) throw new Error(`dòng thiếu cột # hoặc Output: ${l.trim()}`);
      group.rows.push(row);
      continue;
    }
    header = l.trim() === "" ? header : null;
    if (inWaiting && /^\s+-\s+/.test(l)) { data.waiting.push(plain(l.replace(/^\s+-\s+/, ""))); continue; }
    inWaiting = false;
    let v: string | null;
    if ((v = field(l, "Tiêu đề")) !== null) { data.title = v; continue; }
    if ((v = field(l, "Mục tiêu")) !== null) {
      data.goal = v; data.goalPending = v === "" || norm(v).startsWith("chưa chốt"); continue;
    }
    if ((v = field(l, "Bước hiện tại")) !== null) { data.step = v; continue; }
    if ((v = field(l, "Chờ người dùng")) !== null) {
      inWaiting = true;
      if (v && !["không", "không có", "-", "—"].includes(norm(v)))
        data.waiting.push(...v.split(";").map((s) => s.trim()).filter(Boolean));
      continue;
    }
    if (group && !group.note && l.trim() && !l.trim().startsWith("-")) group.note = plain(l);
  }

  const ids = new Set<string>();
  for (const g of data.groups) for (const r of g.rows) {
    if (ids.has(r.id)) throw new Error(`trùng mã hạng mục "${r.id}"`);
    ids.add(r.id);
  }
  if (!ids.size) throw new Error(`mục "## ${SECTION}" chưa có bảng hạng mục`);
  return data;
}

// ---------- DỰNG EXCALIDRAW ----------

const FONT = 5;            // Excalifont: nét tay, đủ dấu tiếng Việt
const FS = 20, LH = 1.25;
const CHAR_W = 0.55;       // bề rộng trung bình 1 ký tự / cỡ chữ
const INK = "#1e1e1e", GREY = "#868e96", RED = "#e03131";

export const RUN_COLORS: Record<RunState, string> = {
  "chưa chạy": "transparent", "đang chạy": "#a5d8ff", "xong": "#b2f2bb", "kẹt": "#ffc9c9",
};
export const OUTPUT_COLORS: Record<OutputState, string> = {
  "chốt": "#b2f2bb", "chờ duyệt": "#ffec99", "chưa": "transparent",
};

/** Phần tử Excalidraw: các trường io-map đọc/ghi được khai kiểu, phần còn lại giữ nguyên khi ghi lại. */
export interface El {
  id: string; type: string; x: number; y: number; width: number; height: number;
  text?: string; strokeColor?: string; fontSize?: number; backgroundColor?: string; strokeStyle?: string;
  boundElements: { type: string; id: string }[]; isDeleted?: boolean;
  customData?: { gen?: string; ids?: string[] };
  [field: string]: unknown;
}
type Kw = { [field: string]: unknown; fontSize?: number; width?: number };
export interface Doc { type: string; version: number; source: string; elements: El[]; appState: unknown; files: unknown }

export function wrap(s: string, max: number): string {
  const out: string[] = [];
  for (const para of s.split("\n")) {
    let line = "";
    for (const w of para.split(/\s+/).filter(Boolean)) {
      if (line && (line + " " + w).length > max) { out.push(line); line = w; }
      else line = line ? line + " " + w : w;
    }
    out.push(line);
  }
  return out.join("\n");
}

/** Ước bề rộng Excalifont: chữ hoa rộng hơn chữ thường khoảng 1,4 lần (đo trên canvas Orca). */
const textW = (s: string, size = FS) => Math.max(...s.split("\n").map((l) =>
  [...l].reduce((w, ch) => w + (ch !== ch.toLowerCase() ? 1.4 : 1), 0))) * size * CHAR_W;
const textH = (s: string, size = FS) => s.split("\n").length * size * LH;

export function buildElements(data: MapData, opts: { date: string; source: string; version: number }): El[] {
  const els: El[] = [];
  let seed = 1;
  const base = (id: string, type: string, x: number, y: number, width: number, height: number, kw: Kw = {}): El => {
    seed += 1;
    const e: El = { id, type, x, y, width, height, angle: 0, strokeColor: INK, backgroundColor: "transparent",
      fillStyle: "solid", strokeWidth: 1, strokeStyle: "solid", roughness: 1, opacity: 100, groupIds: [],
      frameId: null, roundness: null, seed, version: opts.version, versionNonce: seed, isDeleted: false,
      boundElements: [], updated: 1, link: null, locked: false, ...kw };
    els.push(e);
    return e;
  };
  const text = (id: string, x: number, y: number, s: string, kw: Kw = {}) => {
    const size = kw.fontSize ?? FS;
    return base(id, "text", x, y, kw.width ?? textW(s, size), textH(s, size), {
      text: s, originalText: s, fontSize: size, fontFamily: FONT, textAlign: "left", verticalAlign: "top",
      containerId: null, autoResize: true, lineHeight: LH, ...kw, width: kw.width ?? textW(s, size) });
  };
  const box = (id: string, x: number, y: number, w: number, h: number, label: string, kw: Kw = {}, tkw: Kw = {}) => {
    const b = base(id, "rectangle", x, y, w, h, { roundness: { type: 3 }, ...kw,
      boundElements: [{ type: "text", id: `${id}-t` }] });
    const size = tkw.fontSize ?? FS;
    text(`${id}-t`, x + 10, y + (h - textH(label, size)) / 2, label,
      { containerId: id, width: w - 20, textAlign: "center", verticalAlign: "middle", ...tkw });
    return b;
  };
  const arrow = (id: string, p: number[], q: number[], o: { start?: El; end?: El; bow?: number; kw?: Kw } = {}) => {
    const dx = q[0] - p[0], dy = q[1] - p[1];
    const pts = [[0, 0], [dx, dy]];
    if (o.bow) pts.splice(1, 0, [dx / 2, (o.bow < 0 ? Math.min(0, dy) : Math.max(0, dy)) + o.bow]);
    const xs = pts.map((t) => t[0]), ys = pts.map((t) => t[1]);
    const a = base(id, "arrow", p[0], p[1], Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys), {
      points: pts, lastCommittedPoint: null, startArrowhead: null, endArrowhead: "arrow", elbowed: false,
      roundness: { type: 2 },
      startBinding: o.start ? { elementId: o.start.id, focus: 0, gap: 6 } : null,
      endBinding: o.end ? { elementId: o.end.id, focus: 0, gap: 6 } : null, ...(o.kw ?? {}) });
    for (const b of [o.start, o.end]) if (b) b.boundElements.push({ type: "arrow", id });
    return a;
  };
  /** Các dòng chữ bên trái chụm vào ô đích bằng mũi tên cong, như mẫu người dùng vẽ. */
  const fanIn = (prefix: string, items: { text: string; red?: boolean }[], left: number, target: El) => {
    const cy = target.y + target.height / 2;
    const step = 44, first = cy - (step * (items.length - 1)) / 2;
    items.forEach((it, i) => {
      const y = first + i * step;
      const color = it.red ? RED : INK;
      const t = text(`${prefix}-${i}`, left, y - textH(it.text) / 2, it.text, { strokeColor: color });
      const bow = y < cy - 1 ? -22 : y > cy + 1 ? 22 : 0;
      arrow(`${prefix}-arr-${i}`, [left + t.width + 16, y], [target.x - 6, cy + (y - cy) * 0.3],
        { end: target, bow, kw: it.red ? { strokeColor: RED, strokeStyle: "dashed" } : {} });
    });
  };

  // ----- Đầu trang: tiêu đề, bước hiện tại, chờ người dùng, chú thích -----
  text("title", 0, -40, `${data.title || "Bản đồ"}: Input → Output`, { fontSize: 32 });
  text("sub", 0, 10, `Cập nhật ${opts.date} · dữ liệu: ${opts.source} (mục "${SECTION}")`, { fontSize: 16, strokeColor: GREY });
  const stepLabel = wrap(`Bước hiện tại: ${data.step || "chưa ghi"}`, 48);
  const bannerH = Math.max(60, textH(stepLabel) + 24);
  box("now", 0, 50, 620, bannerH, stepLabel,
    { backgroundColor: "#ffd43b", fillStyle: "hachure", strokeColor: "#f08c00" });
  const shown = data.waiting.slice(0, 3);
  const extra = data.waiting.length - shown.length;
  const waitLabel = data.waiting.length
    ? ["Chờ người dùng:", ...shown.map((q, i) => wrap(`${i + 1}. ${q}`, 52)), ...(extra > 0 ? [`… và ${extra} câu nữa`] : [])].join("\n")
    : "Chờ người dùng: không có";
  const waitH = Math.max(bannerH, textH(waitLabel, 18) + 24);
  box("wait", 660, 50, 600, waitH, waitLabel,
    { strokeColor: data.waiting.length ? RED : GREY, backgroundColor: data.waiting.length ? "#fff5f5" : "transparent" },
    { fontSize: 18, textAlign: "left", strokeColor: data.waiting.length ? RED : GREY });

  let y = 50 + Math.max(bannerH, waitH) + 30;
  const legend = (prefix: string, label: string, colors: Record<string, string>) => {
    text(`${prefix}`, 0, y + 4, label, { fontSize: 16, strokeColor: GREY });
    let lx = 260;
    Object.entries(colors).forEach(([name, bg], i) => {
      base(`${prefix}-${i}`, "rectangle", lx, y, 24, 24, { backgroundColor: bg, roundness: { type: 3 } });
      text(`${prefix}-${i}-t`, lx + 32, y + 2, name, { fontSize: 16 });
      lx += 60 + textW(name, 16);
    });
    y += 36;
  };
  legend("lg-run", "Ô AI Agent = thực thi:", RUN_COLORS);
  legend("lg-out", "Ô vuông trước Output:", { "Output đã chốt": OUTPUT_COLORS["chốt"],
    "chờ người dùng duyệt": OUTPUT_COLORS["chờ duyệt"], "chưa làm rõ": OUTPUT_COLORS["chưa"] });
  text("lg-miss", 0, y + 4, "Input chữ đỏ, mũi tên nét đứt = còn thiếu", { fontSize: 16, strokeColor: RED });
  y += 70;

  // ----- Mức 1: tổng quan — hạng mục lớn → mục tiêu -----
  text("ov-label", 0, y, "TỔNG QUAN", { fontSize: 24, strokeColor: "#495057" });
  y += 50;
  const blockW = 400, blockH = 84, blockGap = 24;
  const goalLabel = wrap(data.goalPending ? `MỤC TIÊU\n${data.goal || "chưa chốt"}` : `MỤC TIÊU\n${data.goal}`, 30);
  const blocksH = data.groups.length * blockH + (data.groups.length - 1) * blockGap;
  const goalH = Math.max(110, textH(goalLabel) + 30);
  const goal = box("ov-goal", blockW + 220, y + Math.max(0, (blocksH - goalH) / 2), 340, goalH, goalLabel,
    data.goalPending ? { strokeColor: RED, strokeStyle: "dashed", backgroundColor: "#fff5f5" }
      : { backgroundColor: "#e7f5ff", strokeColor: "#1971c2" },
    { strokeColor: data.goalPending ? RED : INK });
  data.groups.forEach((g, gi) => {
    const by = y + gi * (blockH + blockGap);
    const n = g.rows.length;
    const locked = g.rows.filter((r) => r.outputState === "chốt").length;
    const done = g.rows.filter((r) => r.run === "xong").length;
    const stuck = g.rows.some((r) => r.run === "kẹt") || g.rows.some((r) => r.inputs.some((i) => i.missing));
    const label = `${wrap(g.name, 34)}\nOutput chốt ${locked}/${n} · xong ${done}/${n}`;
    const b = box(`ov-g${gi}`, 0, by, blockW, blockH, label,
      { backgroundColor: done === n ? RUN_COLORS["xong"] : "#f8f9fa", strokeColor: stuck ? RED : INK },
      { fontSize: 16 });
    const cy = by + blockH / 2, gy = goal.y + goal.height / 2;
    arrow(`ov-arr-${gi}`, [blockW + 8, cy], [goal.x - 6, gy + (cy - gy) * 0.3],
      { start: b, end: goal, bow: cy < gy - 1 ? -22 : cy > gy + 1 ? 22 : 0 });
  });
  y += Math.max(blocksH, goalH) + 80;

  // ----- Mức 2: chi tiết — mỗi hạng mục lớn một khung, mỗi hạng mục một hàng -----
  text("dt-label", 0, y, "CHI TIẾT TỪNG HẠNG MỤC", { fontSize: 24, strokeColor: "#495057" });
  y += 50;
  const allRows = data.groups.flatMap((g) => g.rows);
  const inLines = (r: Row) => r.inputs.map((i) => wrap(i.text, 40));
  const inW = Math.max(200, ...allRows.flatMap((r) => inLines(r).map((s) => textW(s))));
  const BOX_X = inW + 110, BOX_W = 220, BOX_H = 100, OUT_LEN = 150;
  const outX = BOX_X + BOX_W + 8 + OUT_LEN + 14;
  const outTitle = (r: Row) => wrap(`${r.id} · ${r.output}`, 40);
  const outDetail = (r: Row) => (r.deliverable ? wrap(r.deliverable, 46) : "");
  const outW = Math.max(240, ...allRows.map((r) => Math.max(textW(outTitle(r)), textW(outDetail(r) || " ", 16)) + 34));
  const G_X = -40, G_PAD = 30, G_W = outX + outW + G_PAD - G_X;

  data.groups.forEach((g, gi) => {
    const head = g.note ? `${g.name}\n${g.note}` : g.name;
    const headH = textH(wrap(head, 90), 24);
    const rowsH = g.rows.map((r) => Math.max(BOX_H, r.inputs.length * 44,
      textH(outTitle(r)) + (outDetail(r) ? textH(outDetail(r), 16) + 4 : 0)));
    const gH = G_PAD + headH + 40 + rowsH.reduce((a, b) => a + b, 0) + (g.rows.length - 1) * 70 + G_PAD;
    base(`grp-${gi}`, "rectangle", G_X, y, G_W, gH,
      { strokeColor: GREY, backgroundColor: "#f8f9fa", strokeStyle: "dashed", roundness: { type: 3 } });
    text(`grp-${gi}-t`, G_X + G_PAD, y + G_PAD, wrap(head, 90), { fontSize: 24, strokeColor: "#495057" });
    let ry = y + G_PAD + headH + 40;
    g.rows.forEach((r, ri) => {
      const rid = r.id.replace(/[^\p{L}\p{N}_-]+/gu, "_"), h = rowsH[ri];
      const top = ry + (h - BOX_H) / 2, cy = top + BOX_H / 2;
      const agent = box(`box-${rid}`, BOX_X, top, BOX_W, BOX_H, "AI Agent", { backgroundColor: RUN_COLORS[r.run] });
      fanIn(`in-${rid}`, r.inputs.map((i, k) => ({ text: inLines(r)[k], red: i.missing })), 0, agent);
      const ox = BOX_X + BOX_W + 8;
      arrow(`arr-out-${rid}`, [ox, cy], [ox + OUT_LEN, cy], { start: agent });
      const t = outTitle(r), d = outDetail(r);
      const blockH = textH(t) + (d ? textH(d, 16) + 4 : 0);
      const ty = cy - blockH / 2;
      base(`mark-${rid}`, "rectangle", outX, ty + 3, 20, 20,
        { backgroundColor: OUTPUT_COLORS[r.outputState], roundness: { type: 3 } });
      text(`out-${rid}`, outX + 30, ty, t, r.link ? { link: r.link, strokeColor: "#1971c2" } : {});
      if (d) text(`out-${rid}-d`, outX + 30, ty + textH(t) + 4, d, { fontSize: 16, strokeColor: GREY });
      ry += h + 70;
    });
    y += gH + 70;
  });
  return els;
}

// ---------- GHI FILE, GIỮ NÉT NGƯỜI DÙNG VẼ ----------

/** Các trường người dùng có thể sửa trên canvas; bỏ qua trường Excalidraw tự chỉnh khi mở file. */
export function fingerprint(e: El): string {
  if (e.type === "text") return JSON.stringify([e.text, e.strokeColor, e.fontSize]);
  if (e.type === "rectangle") return JSON.stringify([Math.round(e.x), Math.round(e.y), Math.round(e.width),
    Math.round(e.height), e.backgroundColor, e.strokeColor, e.strokeStyle]);
  return JSON.stringify([e.type]);
}


export interface MergeResult { doc: Doc; edited: string[]; generated: number; kept: number }

export function merge(els: El[], old: Partial<Doc> | null): MergeResult {
  for (const e of els) e.customData = { gen: fingerprint(e) };
  els[0].customData = { ...els[0].customData, ids: els.map((e) => e.id) };
  const ours = new Set(els.map((e) => e.id));
  const kept: El[] = [], edited: string[] = [];
  let files: unknown = {};
  if (old) {
    files = old.files ?? {};
    const alive = (old.elements ?? []).filter((e) => !e.isDeleted);
    const aliveIds = new Set(alive.map((e) => e.id));
    for (const e of alive) {
      const gen = e.customData?.gen;
      if (gen === undefined) { if (!ours.has(e.id)) kept.push(e); continue; }
      // So theo giá trị: bản đồ dựng bằng script Python cũ ghi dấu kiểm có dấu cách sau dấu phẩy.
      let stored = gen;
      try { stored = JSON.stringify(JSON.parse(gen)); } catch { /* dấu kiểm hỏng: so nguyên chuỗi */ }
      if (fingerprint(e) !== stored) edited.push(`người dùng sửa: ${e.id} (${e.type}${e.text ? `: ${JSON.stringify(e.text)}` : ""})  ${gen} → ${fingerprint(e)}`);
    }
    const title = alive.find((e) => e.id === "title");
    for (const id of title?.customData?.ids ?? [])
      if (!aliveIds.has(id)) edited.push(`người dùng xóa: ${id}`);
  }
  return {
    doc: { type: "excalidraw", version: 2, source: "io-map", elements: [...els, ...kept],
      appState: { gridSize: null, viewBackgroundColor: "#ffffff" }, files },
    edited, generated: els.length, kept: kept.length,
  };
}

export function defaultOut(mdPath: string): string {
  const name = basename(mdPath);
  if (/^(WORKSTREAM|WORK)\.md$/i.test(name)) return join(dirname(mdPath), "tong-quan.excalidraw");
  return join(dirname(mdPath), name.replace(/\.md$/i, "") + ".tong-quan.excalidraw");
}

function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function run(argv: string[]): number {
  const args = argv.filter((a) => !a.startsWith("--"));
  const flag = (f: string) => argv.includes(f);
  const outIdx = argv.indexOf("--out");
  const mdPath = args[0];
  if (!mdPath || !existsSync(mdPath)) {
    console.error("Dùng: bun io-map.ts <file.md> [--out <file.excalidraw>] [--force] [--check]");
    return 2;
  }
  let data: MapData;
  try { data = parseMap(readFileSync(mdPath, "utf8")); }
  catch (err) { console.error(`LỖI ${mdPath}: ${(err as Error).message}`); return 2; }

  if (flag("--check")) {
    const rows = data.groups.flatMap((g) => g.rows);
    console.log(`${data.groups.length} hạng mục lớn, ${rows.length} hạng mục; mục tiêu ${data.goalPending ? "chưa chốt" : "đã chốt"}; chờ người dùng ${data.waiting.length}`);
    for (const r of rows) {
      const miss = r.inputs.filter((i) => i.missing).map((i) => i.text);
      console.log(`  ${r.id}: Output ${r.outputState}, thực thi ${r.run}${miss.length ? `, thiếu: ${miss.join("; ")}` : ""}${r.done ? "" : ", chưa có tiêu chí xong"}`);
    }
    return 0;
  }

  const out = outIdx >= 0 ? argv[outIdx + 1] : defaultOut(mdPath);
  // File do io-map hoặc Excalidraw ghi; merge chỉ đọc elements/files và tự bỏ qua trường lạ.
  const old = existsSync(out) ? (JSON.parse(readFileSync(out, "utf8")) as Partial<Doc>) : null;
  const els = buildElements(data, { date: today(), source: relative(dirname(out), mdPath) || basename(mdPath),
    version: Math.floor(Date.now() / 1000) });
  const res = merge(els, old);
  if (res.edited.length && !flag("--force")) {
    console.log("DỪNG: bản đồ có chỉnh sửa tay trên phần do io-map sinh ra. Đưa vào Markdown rồi chạy lại với --force:");
    for (const x of res.edited) console.log("  " + x);
    return 1;
  }
  writeFileSync(out, JSON.stringify(res.doc, null, 1) + "\n");
  console.log(`đã ghi ${out} (${res.generated} phần tử sinh + ${res.kept} phần tử người dùng vẽ)`);
  return 0;
}

if (import.meta.main) process.exit(run(process.argv.slice(2)));
