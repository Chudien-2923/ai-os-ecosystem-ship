#!/usr/bin/env python3
"""Build a compact local learning hub from completed overview.md files."""

from __future__ import annotations

import argparse
import html
import os
import re
import sys
from dataclasses import dataclass
from datetime import date
from pathlib import Path


META_RE = re.compile(r"^-\s+([A-Za-z]+):\s+`?(.+?)`?\s*$")
HEADING_RE = re.compile(r"^##\s+(.+?)\s*$")


@dataclass(frozen=True)
class Card:
    title: str
    domain: str
    updated: str
    summary: str
    takeaways: tuple[str, ...]
    outcome: str
    href: str
    cover: str | None
    related: tuple[tuple[str, str], ...]


def section(lines: list[str], name: str) -> list[str]:
    start = None
    for index, line in enumerate(lines):
        match = HEADING_RE.match(line)
        if match and match.group(1).strip().casefold() == name.casefold():
            start = index + 1
            break
    if start is None:
        return []
    result: list[str] = []
    for line in lines[start:]:
        if HEADING_RE.match(line):
            break
        result.append(line)
    return result


def compact_text(lines: list[str]) -> str:
    paragraphs: list[str] = []
    current: list[str] = []
    for raw in lines:
        line = raw.strip()
        if not line:
            if current:
                paragraphs.append(" ".join(current))
                current = []
            continue
        if line.startswith("-"):
            continue
        current.append(line)
    if current:
        paragraphs.append(" ".join(current))
    return paragraphs[0] if paragraphs else ""


def bullet_items(lines: list[str], limit: int = 3) -> tuple[str, ...]:
    items = []
    for raw in lines:
        line = raw.strip()
        if line.startswith("- "):
            items.append(line[2:].strip())
        if len(items) == limit:
            break
    return tuple(items)


def parse_overview(path: Path, root: Path) -> Card | None:
    relative = path.relative_to(root)
    if len(relative.parts) != 3 or relative.name != "overview.md":
        raise ValueError(
            f"{path}: expected exact path <domain>/<topic>/overview.md below outputs root"
        )
    lines = path.read_text(encoding="utf-8").splitlines()
    title = next((line[2:].strip() for line in lines if line.startswith("# ")), "")
    metadata: dict[str, str] = {}
    for line in lines:
        match = META_RE.match(line)
        if match:
            metadata[match.group(1).casefold()] = match.group(2).strip()

    status = metadata.get("status", "").casefold()
    if status != "completed":
        return None

    domain = metadata.get("domain", "general")
    updated = metadata.get("updated", "")
    summary = compact_text(section(lines, "Tóm tắt"))
    takeaways = bullet_items(section(lines, "Điều cần nhớ"))
    outcome = compact_text(section(lines, "Kết quả"))

    missing = [
        name
        for name, value in (
            ("title", title),
            ("updated", updated),
            ("summary", summary),
            ("takeaways", takeaways),
            ("outcome", outcome),
        )
        if not value
    ]
    if missing:
        raise ValueError(f"{path}: missing required hub fields: {', '.join(missing)}")

    cover_value = metadata.get("cover")
    cover_href = None
    if cover_value:
        cover_path = (path.parent / cover_value).resolve()
        if not cover_path.is_file():
            raise ValueError(f"{path}: cover does not exist: {cover_value}")
        cover_href = Path(os.path.relpath(cover_path, root)).as_posix()
    labels = {
        "concepts": "Khái niệm",
        "applications": "Ứng dụng",
        "practice": "Bài thực hành",
        "sources": "Nguồn",
    }
    related = tuple(
        (
            labels.get(sibling.stem, sibling.stem.replace("-", " ").title()),
            Path(os.path.relpath(sibling, root)).as_posix(),
        )
        for sibling in sorted(path.parent.glob("*.md"))
        if sibling.name != "overview.md"
    )


    return Card(
        title=title,
        domain=domain,
        updated=updated,
        summary=summary,
        takeaways=takeaways,
        outcome=outcome,
        href=Path(os.path.relpath(path, root)).as_posix(),
        cover=cover_href,
        related=related,
    )


def card_html(card: Card) -> str:
    image = ""
    if card.cover:
        image = (
            f'<img class="card__image" src="{html.escape(card.cover, quote=True)}" '
            f'alt="" loading="lazy">'
        )
    takeaways = "".join(f"<li>{html.escape(item)}</li>" for item in card.takeaways)
    related_links = "".join(
        f'<a href="{html.escape(href, quote=True)}">{html.escape(label)}</a>'
        for label, href in card.related
    )
    related_nav = (
        f'<nav class="card__links" aria-label="Tài liệu liên quan">{related_links}</nav>'
        if related_links
        else ""
    )
    return f"""
<article class="card" data-domain="{html.escape(card.domain.casefold(), quote=True)}">
  {image}
  <div class="card__body">
    <p class="eyebrow">{html.escape(card.domain)} · {html.escape(card.updated)}</p>
    <h2><a href="{html.escape(card.href, quote=True)}">{html.escape(card.title)}</a></h2>
    <p class="summary">{html.escape(card.summary)}</p>
    <ul>{takeaways}</ul>
    <p class="outcome"><strong>Kết quả</strong> {html.escape(card.outcome)}</p>
    {related_nav}
  </div>
</article>""".strip()


def render(cards: list[Card]) -> str:
    domains = sorted({card.domain for card in cards}, key=str.casefold)
    chips = "".join(
        f'<button class="chip" type="button" data-filter="{html.escape(domain.casefold(), quote=True)}">{html.escape(domain)}</button>'
        for domain in domains
    )
    cards_markup = "\n".join(card_html(card) for card in cards)
    return f"""<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Learning Hub</title>
<style>
:root {{ color-scheme: light; --ink:#111; --muted:#6a6a64; --line:#d9d8d1; --paper:#f7f6f1; --card:#fff; }}
* {{ box-sizing:border-box; }}
body {{ margin:0; background:var(--paper); color:var(--ink); font:15px/1.55 ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; }}
a {{ color:inherit; text-decoration-thickness:1px; text-underline-offset:3px; }}
.shell {{ width:min(1500px,100%); margin:auto; padding:24px; }}
header {{ display:grid; grid-template-columns:minmax(220px,1fr) minmax(280px,2fr); gap:28px; align-items:end; padding:20px 0 24px; border-bottom:1px solid var(--ink); }}
h1 {{ margin:0; font:700 clamp(2.2rem,6vw,5.8rem)/.86 ui-serif,Georgia,serif; letter-spacing:-.055em; }}
.intro {{ max-width:62ch; margin:0; color:var(--muted); }}
.controls {{ display:flex; flex-wrap:wrap; gap:8px; padding:16px 0; border-bottom:1px solid var(--line); }}
.search {{ flex:1 1 260px; min-height:42px; border:1px solid var(--ink); background:var(--card); padding:0 13px; font:inherit; }}
.chip {{ min-height:42px; border:1px solid var(--ink); border-radius:999px; background:transparent; padding:0 14px; font:inherit; cursor:pointer; }}
.chip[aria-pressed="true"] {{ background:var(--ink); color:var(--card); }}
.grid {{ display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,250px),1fr)); border-left:1px solid var(--line); }}
.card {{ display:flex; flex-direction:column; min-width:0; background:var(--card); border-right:1px solid var(--line); border-bottom:1px solid var(--line); }}
.card__image {{ width:100%; aspect-ratio:4/3; object-fit:cover; filter:saturate(.72) contrast(1.02); border-bottom:1px solid var(--line); }}
.card__body {{ display:flex; flex-direction:column; height:100%; padding:18px; }}
.eyebrow {{ margin:0 0 18px; color:var(--muted); font-size:.75rem; letter-spacing:.08em; text-transform:uppercase; }}
h2 {{ margin:0 0 12px; font:650 clamp(1.35rem,2.6vw,2rem)/1 ui-serif,Georgia,serif; letter-spacing:-.025em; }}
.summary {{ margin:0 0 14px; }}
ul {{ margin:0 0 18px; padding-left:1.15rem; }}
.outcome {{ margin:auto 0 0; padding-top:14px; border-top:1px solid var(--line); }}
.outcome strong {{ display:block; font-size:.72rem; letter-spacing:.08em; text-transform:uppercase; }}
.card__links {{ display:flex; flex-wrap:wrap; gap:8px 14px; margin-top:14px; font-size:.85rem; }}
.empty {{ display:none; padding:48px 0; color:var(--muted); }}
footer {{ padding:22px 0; color:var(--muted); font-size:.82rem; }}
:focus-visible {{ outline:3px solid var(--ink); outline-offset:3px; }}
@media (max-width:700px) {{ .shell {{ padding:16px; }} header {{ grid-template-columns:1fr; }} .grid {{ grid-template-columns:repeat(2,minmax(0,1fr)); }} .card__body {{ padding:14px; }} }}
@media (max-width:470px) {{ .grid {{ grid-template-columns:1fr; }} }}
@media (prefers-color-scheme:dark) {{ :root {{ color-scheme:dark; --ink:#f3f2ed; --muted:#aaa9a3; --line:#3d3d38; --paper:#141412; --card:#1b1b18; }} }}
</style>
</head>
<body>
<div class="shell">
<header>
  <h1>Learning<br>Hub</h1>
  <p class="intro">Những điều quan trọng đã học, kết quả có thể áp dụng và đường dẫn tới ghi chú chi tiết. Hub này ưu tiên đọc nhanh; tri thức đầy đủ nằm trong Markdown liên kết.</p>
</header>
<section class="controls" aria-label="Lọc learning outputs">
  <input class="search" id="search" type="search" placeholder="Tìm chủ đề hoặc ý cần nhớ…" aria-label="Tìm learning outputs">
  <button class="chip" type="button" data-filter="all" aria-pressed="true">Tất cả</button>
  {chips}
</section>
<main class="grid" id="grid">{cards_markup}</main>
<p class="empty" id="empty">Không có kết quả phù hợp.</p>
<footer>Cập nhật {date.today().isoformat()} · Mở tiêu đề để đọc Markdown chi tiết.</footer>
</div>
<script>
const search=document.querySelector('#search');
const cards=[...document.querySelectorAll('.card')];
const chips=[...document.querySelectorAll('.chip')];
let filter='all';
function apply(){{
  const query=search.value.trim().toLocaleLowerCase('vi'); let visible=0;
  cards.forEach(card=>{{
    const okDomain=filter==='all'||card.dataset.domain===filter;
    const okQuery=!query||card.textContent.toLocaleLowerCase('vi').includes(query);
    card.hidden=!(okDomain&&okQuery); if(!card.hidden) visible++;
  }});
  document.querySelector('#empty').style.display=visible?'none':'block';
}}
search.addEventListener('input',apply);
chips.forEach(chip=>chip.addEventListener('click',()=>{{
  filter=chip.dataset.filter;
  chips.forEach(item=>item.setAttribute('aria-pressed',String(item===chip)));
  apply();
}}));
</script>
</body>
</html>
"""


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--outputs-root", required=True, type=Path)
    args = parser.parse_args()
    root = args.outputs_root.resolve()
    if not root.is_dir():
        print(f"outputs root does not exist: {root}", file=sys.stderr)
        return 2

    cards = []
    try:
        for path in sorted(root.rglob("overview.md")):
            card = parse_overview(path, root)
            if card:
                cards.append(card)
    except (OSError, ValueError) as error:
        print(error, file=sys.stderr)
        return 2

    if not cards:
        print("no completed overview.md files; refusing to create an empty hub", file=sys.stderr)
        return 2

    cards.sort(key=lambda card: (card.updated, card.title.casefold()), reverse=True)
    output = root / "index.html"
    output.write_text(render(cards), encoding="utf-8")
    print(f"wrote {output} with {len(cards)} card(s)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
