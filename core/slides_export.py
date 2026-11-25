"""Native binary PowerPoint (.pptx) and 16:9 PDF (.pdf) exporters for SourceBook Slide Decks.

Zero mandatory third-party Python dependencies:
- `.pptx` is generated directly via Python's stdlib `zipfile` + OOXML (PresentationML 2007+ widescreen 16:9),
  supporting BOTH full-bleed art-directed ImageGen slides AND natively editable vector shapes, styled cards,
  stat spotlights, comparisons, timelines, hybrid embedded illustrations, AND real PowerPoint Speaker Notes XML.
- `.pdf` uses PyMuPDF (`fitz`) when available for crisp 16:9 vector/image slides, with a clean pure-Python
  PDF 1.4 fallback so `.pdf` export works on every Hermes installation regardless of optional extras.
"""
from __future__ import annotations

import base64
import io
import math
import re
import struct
import textwrap
import zipfile
from pathlib import Path
from typing import Any, Optional
from xml.sax.saxutils import escape as xml_escape

# Widescreen 16:9 slide geometry (13.333 in x 7.5 in in EMUs: 1 in = 914400 EMU)
SLIDE_W = 12192000
SLIDE_H = 6858000

THEMES: dict[str, dict[str, str]] = {
    "editorial": {
        "bg": "0F131C",
        "card": "161C29",
        "accent": "3B82F6",
        "secondary": "10B981",
        "fg": "F4F6FA",
        "muted": "A8B3C7",
        "dim": "6C7A93",
        "border": "26324A",
    },
    "keynote": {
        "bg": "0B101E",
        "card": "131C31",
        "accent": "38BDF8",
        "secondary": "6366F1",
        "fg": "F4F7FB",
        "muted": "A6B3C8",
        "dim": "6C7A93",
        "border": "243352",
    },
    "midnight": {
        "bg": "0A0F0E",
        "card": "101B18",
        "accent": "10B981",
        "secondary": "14B8A6",
        "fg": "ECFDF5",
        "muted": "9CB5AA",
        "dim": "5E786E",
        "border": "1E3A31",
    },
    "paper": {
        "bg": "FAF8F4",
        "card": "EFEAE0",
        "accent": "2563EB",
        "secondary": "0D9488",
        "fg": "18181B",
        "muted": "52525B",
        "dim": "71717A",
        "border": "D6CFC2",
    },
}


def _theme(name: Optional[str]) -> dict[str, str]:
    k = str(name or "editorial").strip().lower()
    if k in ("noir", "bold", "hermes"):
        k = "keynote" if k == "bold" else "editorial"
    return THEMES.get(k, THEMES["editorial"])


def _hex_rgb01(h: str) -> tuple[float, float, float]:
    h = h.lstrip("#")
    return (int(h[0:2], 16) / 255.0, int(h[2:4], 16) / 255.0, int(h[4:6], 16) / 255.0)


def _sniff_image_ext(data: bytes) -> str:
    if data.startswith(b"\x89PNG\r\n\x1a\n"):
        return "png"
    if data.startswith(b"\xff\xd8\xff"):
        return "jpeg"
    if data.startswith(b"RIFF") and data[8:12] == b"WEBP":
        return "webp"
    return "png"


def _load_slide_image_bytes(slide: dict[str, Any], media_dir: Optional[Path]) -> Optional[tuple[bytes, str]]:
    """Resolve local cached media file or inline data URI for a slide (never makes live network calls during export)."""
    fname = slide.get("image_file")
    if fname and media_dir is not None:
        safe = Path(str(fname)).name
        p = media_dir / safe
        if p.is_file():
            raw = p.read_bytes()
            ext = _sniff_image_ext(raw)
            if ext == "webp":
                raw = _convert_to_png(raw)
                ext = "png"
            return raw, ext

    url = str(slide.get("image_url") or "").strip()
    if url.startswith("data:image/") and "," in url:
        try:
            raw = base64.b64decode(url.split(",", 1)[1])
            ext = _sniff_image_ext(raw)
            if ext == "webp":
                raw = _convert_to_png(raw)
                ext = "png"
            return raw, ext
        except Exception:
            return None
    return None


def _convert_to_png(raw: bytes) -> bytes:
    try:
        from PIL import Image

        im = Image.open(io.BytesIO(raw)).convert("RGBA")
        out = io.BytesIO()
        im.save(out, format="PNG")
        return out.getvalue()
    except Exception:
        return raw


def _emu(in_x: float) -> int:
    return int(round(in_x * 914400))


def _rect_xml(
    sp_id: int,
    name: str,
    x: int,
    y: int,
    w: int,
    h: int,
    fill_hex: str,
    *,
    border_hex: Optional[str] = None,
    border_emu: int = 12700,
    rounded: bool = False,
) -> str:
    geom = "roundRect" if rounded else "rect"
    av = '<a:avLst><a:gd name="adj" fmla="val 6500"/></a:avLst>' if rounded else "<a:avLst/>"
    ln = (
        f'<a:ln w="{border_emu}"><a:solidFill><a:srgbClr val="{border_hex}"/></a:solidFill></a:ln>'
        if border_hex
        else "<a:ln><a:noFill/></a:ln>"
    )
    return (
        f'<p:sp><p:nvSpPr><p:cNvPr id="{sp_id}" name="{xml_escape(name)}"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>'
        f'<p:spPr><a:xfrm><a:off x="{x}" y="{y}"/><a:ext cx="{w}" cy="{h}"/></a:xfrm>'
        f'<a:prstGeom prst="{geom}">{av}</a:prstGeom>'
        f'<a:solidFill><a:srgbClr val="{fill_hex}"/></a:solidFill>{ln}</p:spPr>'
        f'<p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:endParaRPr lang="en-US"/></a:p></p:txBody></p:sp>'
    )


def _text_xml(
    sp_id: int,
    name: str,
    x: int,
    y: int,
    w: int,
    h: int,
    paragraphs: list[dict[str, Any]],
    *,
    anchor: str = "t",
    fill_hex: Optional[str] = None,
    border_hex: Optional[str] = None,
    rounded: bool = False,
    pad: int = 91440,
) -> str:
    fill_xml = f'<a:solidFill><a:srgbClr val="{fill_hex}"/></a:solidFill>' if fill_hex else "<a:noFill/>"
    ln_xml = (
        f'<a:ln w="12700"><a:solidFill><a:srgbClr val="{border_hex}"/></a:solidFill></a:ln>'
        if border_hex
        else "<a:ln><a:noFill/></a:ln>"
    )
    geom = "roundRect" if rounded else "rect"
    av = '<a:avLst><a:gd name="adj" fmla="val 6000"/></a:avLst>' if rounded else "<a:avLst/>"
    p_xml_parts: list[str] = []
    for para in paragraphs:
        txt = str(para.get("text") or "")
        size_pt = int(para.get("size", 16))
        color = str(para.get("color", "F4F6FA"))
        bold = "1" if para.get("bold") else "0"
        italic = "1" if para.get("italic") else "0"
        align = str(para.get("align", "l"))
        font = xml_escape(str(para.get("font", "Calibri")))
        spc_after = int(para.get("space_after", 600))
        p_xml_parts.append(
            f'<a:p><a:pPr algn="{align}"><a:spcAft><a:spcPts val="{spc_after}"/></a:spcAft></a:pPr>'
            f'<a:r><a:rPr lang="en-US" sz="{size_pt * 100}" b="{bold}" i="{italic}" dirty="0">'
            f'<a:solidFill><a:srgbClr val="{color}"/></a:solidFill>'
            f'<a:latin typeface="{font}"/></a:rPr>'
            f"<a:t>{xml_escape(txt)}</a:t></a:r></a:p>"
        )
    if not p_xml_parts:
        p_xml_parts.append('<a:p><a:endParaRPr lang="en-US"/></a:p>')
    return (
        f'<p:sp><p:nvSpPr><p:cNvPr id="{sp_id}" name="{xml_escape(name)}"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr>'
        f'<p:spPr><a:xfrm><a:off x="{x}" y="{y}"/><a:ext cx="{w}" cy="{h}"/></a:xfrm>'
        f'<a:prstGeom prst="{geom}">{av}</a:prstGeom>{fill_xml}{ln_xml}</p:spPr>'
        f'<p:txBody><a:bodyPr wrap="square" anchor="{anchor}" lIns="{pad}" rIns="{pad}" tIns="{pad}" bIns="{pad}"/>'
        f'<a:lstStyle/>{"".join(p_xml_parts)}</p:txBody></p:sp>'
    )


def _pic_xml(sp_id: int, name: str, rel_id: str, x: int, y: int, w: int, h: int) -> str:
    return (
        f'<p:pic><p:nvPicPr><p:cNvPr id="{sp_id}" name="{xml_escape(name)}"/>'
        f'<p:cNvPicPr><a:picLocks noChangeAspect="0"/></p:cNvPicPr><p:nvPr/></p:nvPicPr>'
        f'<p:blipFill><a:blip r:embed="{rel_id}"/><a:stretch><a:fillRect/></a:stretch></p:blipFill>'
        f'<p:spPr><a:xfrm><a:off x="{x}" y="{y}"/><a:ext cx="{w}" cy="{h}"/></a:xfrm>'
        f'<a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr></p:pic>'
    )


def _build_slide_xml(
    slide: dict[str, Any],
    idx: int,
    total: int,
    deck_title: str,
    th: dict[str, str],
    img_rel_id: Optional[str],
) -> str:
    layout = str(slide.get("layout") or "bullets").lower()
    image_mode = str(slide.get("image_mode") or "").lower()
    title = str(slide.get("title") or "")
    body = str(slide.get("body") or "")
    bullets = [str(b) for b in (slide.get("bullets") or []) if str(b).strip()]
    stat = slide.get("stat") if isinstance(slide.get("stat"), dict) else None
    columns = slide.get("columns") if isinstance(slide.get("columns"), list) else []
    steps = slide.get("steps") if isinstance(slide.get("steps"), list) else []

    shapes: list[str] = []
    nid = 2

    def next_id() -> int:
        nonlocal nid
        nid += 1
        return nid

    # Full-bleed NotebookLM-style generated slide image!
    if img_rel_id and (image_mode == "full_slide" or layout == "image-full"):
        shapes.append(_pic_xml(next_id(), f"SlideImage{idx}", img_rel_id, 0, 0, SLIDE_W, SLIDE_H))
    else:
        # Top accent bar + slide header metadata
        shapes.append(_rect_xml(next_id(), "TopRibbon", 0, 0, SLIDE_W, _emu(0.08), th["accent"]))
        shapes.append(
            _text_xml(
                next_id(),
                "SlideCounter",
                _emu(11.3),
                _emu(0.28),
                _emu(1.5),
                _emu(0.35),
                [{"text": f"{idx:02d} / {total:02d}", "size": 11, "color": th["dim"], "bold": True, "align": "r", "font": "Consolas"}],
                pad=0,
            )
        )
        shapes.append(
            _text_xml(
                next_id(),
                "LayoutBadge",
                _emu(0.65),
                _emu(0.28),
                _emu(3.2),
                _emu(0.35),
                [{"text": layout.upper(), "size": 10, "color": th["accent"], "bold": True, "font": "Consolas"}],
                pad=0,
            )
        )

        if layout in ("title", "section"):
            if img_rel_id:
                shapes.append(_pic_xml(next_id(), "CoverArt", img_rel_id, _emu(7.5), _emu(1.0), _emu(5.2), _emu(5.3)))
                tw = _emu(6.4)
                align = "l"
                tx = _emu(0.75)
            else:
                tw = _emu(11.2)
                align = "ctr"
                tx = _emu(1.06)
            shapes.append(
                _text_xml(
                    next_id(),
                    "CoverTitle",
                    tx,
                    _emu(1.9),
                    tw,
                    _emu(2.2),
                    [{"text": title, "size": 40, "color": th["fg"], "bold": True, "align": align}],
                    anchor="ctr",
                )
            )
            shapes.append(_rect_xml(next_id(), "CoverRule", tx if align == "l" else _emu(5.9), _emu(4.25), _emu(1.5), _emu(0.06), th["accent"]))
            if body:
                shapes.append(
                    _text_xml(
                        next_id(),
                        "CoverSub",
                        tx,
                        _emu(4.5),
                        tw,
                        _emu(1.3),
                        [{"text": body, "size": 18, "color": th["muted"], "align": align}],
                    )
                )
        elif layout == "stat" and stat and stat.get("value"):
            # Left spotlight card with hero numeral + right action title & evidence points
            shapes.append(_rect_xml(next_id(), "StatBox", _emu(0.65), _emu(1.25), _emu(4.3), _emu(4.9), th["card"], border_hex=th["border"], rounded=True))
            shapes.append(
                _text_xml(
                    next_id(),
                    "StatValue",
                    _emu(0.85),
                    _emu(2.2),
                    _emu(3.9),
                    _emu(1.7),
                    [
                        {"text": str(stat.get("value")), "size": 52, "color": th["accent"], "bold": True, "align": "ctr", "font": "Consolas"},
                        {"text": str(stat.get("label") or ""), "size": 15, "color": th["muted"], "align": "ctr"},
                    ],
                    anchor="ctr",
                )
            )
            shapes.append(
                _text_xml(
                    next_id(),
                    "StatTitle",
                    _emu(5.35),
                    _emu(1.15),
                    _emu(7.35),
                    _emu(1.4),
                    [{"text": title, "size": 26, "color": th["fg"], "bold": True}],
                )
            )
            for b_i, btxt in enumerate(bullets[:4]):
                by = _emu(2.7 + b_i * 0.92)
                shapes.append(
                    _text_xml(
                        next_id(),
                        f"StatBullet{b_i}",
                        _emu(5.35),
                        by,
                        _emu(7.35),
                        _emu(0.78),
                        [{"text": f"0{b_i + 1}   {btxt}", "size": 14, "color": th["fg"]}],
                        fill_hex=th["card"],
                        border_hex=th["border"],
                        rounded=True,
                        anchor="ctr",
                    )
                )
        elif layout == "quote":
            shapes.append(_rect_xml(next_id(), "QuoteBar", _emu(1.15), _emu(2.0), _emu(0.09), _emu(3.1), th["accent"]))
            shapes.append(
                _text_xml(
                    next_id(),
                    "QuoteText",
                    _emu(1.55),
                    _emu(1.85),
                    _emu(10.6),
                    _emu(3.4),
                    [
                        {"text": title.upper(), "size": 12, "color": th["accent"], "bold": True, "font": "Consolas", "space_after": 1200},
                        {"text": f'"{body or (bullets[0] if bullets else title)}"', "size": 28, "color": th["fg"], "italic": True},
                    ],
                    anchor="ctr",
                )
            )
        elif layout == "comparison" and len(columns) >= 2:
            shapes.append(_text_xml(next_id(), "CompTitle", _emu(0.65), _emu(0.8), _emu(12.0), _emu(1.0), [{"text": title, "size": 28, "color": th["fg"], "bold": True}]))
            for c_i, col in enumerate(columns[:2]):
                cx = _emu(0.65 + c_i * 6.15)
                col_acc = th["accent"] if c_i == 0 else th["secondary"]
                shapes.append(_rect_xml(next_id(), f"CompTop{c_i}", cx, _emu(2.0), _emu(5.85), _emu(0.07), col_acc))
                paras = [{"text": str(col.get("heading") or f"Column {c_i + 1}"), "size": 18, "color": col_acc, "bold": True, "space_after": 900}]
                for item in (col.get("points") or [])[:5]:
                    paras.append({"text": f"•  {item}", "size": 14, "color": th["fg"], "space_after": 650})
                shapes.append(
                    _text_xml(next_id(), f"CompCol{c_i}", cx, _emu(2.07), _emu(5.85), _emu(4.25), paras, fill_hex=th["card"], border_hex=th["border"], rounded=True)
                )
        elif layout == "timeline" and steps:
            shapes.append(_text_xml(next_id(), "TimeTitle", _emu(0.65), _emu(0.8), _emu(12.0), _emu(1.0), [{"text": title, "size": 28, "color": th["fg"], "bold": True}]))
            show_steps = steps[:4]
            n_st = max(1, len(show_steps))
            gap = 0.25
            cw = (12.0 - gap * (n_st - 1)) / n_st
            shapes.append(_rect_xml(next_id(), "TimelineRail", _emu(0.65), _emu(2.45), _emu(12.0), _emu(0.04), th["border"]))
            for s_i, st in enumerate(show_steps):
                sx = _emu(0.65 + s_i * (cw + gap))
                step_acc = th["accent"] if s_i % 2 == 0 else th["secondary"]
                shapes.append(_rect_xml(next_id(), f"StepBadge{s_i}", sx, _emu(2.25), _emu(0.55), _emu(0.42), step_acc, rounded=True))
                shapes.append(_text_xml(next_id(), f"StepNum{s_i}", sx, _emu(2.25), _emu(0.55), _emu(0.42), [{"text": f"0{s_i + 1}", "size": 12, "color": "FFFFFF", "bold": True, "align": "ctr", "font": "Consolas"}], anchor="ctr", pad=0))
                paras = [
                    {"text": str(st.get("label") or st.get("title") or f"Step {s_i + 1}"), "size": 16, "color": th["fg"], "bold": True, "space_after": 600},
                    {"text": str(st.get("detail") or st.get("summary") or ""), "size": 13, "color": th["muted"]},
                ]
                shapes.append(_text_xml(next_id(), f"StepCard{s_i}", sx, _emu(2.9), _emu(cw), _emu(3.4), paras, fill_hex=th["card"], border_hex=th["border"], rounded=True))
        elif img_rel_id:
            # Hybrid split visual slide (image right, crisp editable action title + cards left!)
            shapes.append(_text_xml(next_id(), "SplitTitle", _emu(0.65), _emu(0.85), _emu(6.2), _emu(1.3), [{"text": title, "size": 27, "color": th["fg"], "bold": True}]))
            shapes.append(_pic_xml(next_id(), "HeroVisual", img_rel_id, _emu(7.15), _emu(1.1), _emu(5.55), _emu(5.2)))
            if body:
                shapes.append(_text_xml(next_id(), "SplitBody", _emu(0.65), _emu(2.15), _emu(6.2), _emu(0.85), [{"text": body, "size": 14, "color": th["muted"]}]))
            y_start = 3.05 if body else 2.25
            for b_i, btxt in enumerate(bullets[:4]):
                shapes.append(
                    _text_xml(
                        next_id(),
                        f"SplitCard{b_i}",
                        _emu(0.65),
                        _emu(y_start + b_i * 0.86),
                        _emu(6.2),
                        _emu(0.76),
                        [{"text": f"0{b_i + 1}  {btxt}", "size": 13, "color": th["fg"]}],
                        fill_hex=th["card"],
                        border_hex=th["border"],
                        rounded=True,
                        anchor="ctr",
                    )
                )
        else:
            # Modular Bento / Two-Col / Closing / Bullets editable grid
            shapes.append(_text_xml(next_id(), "SlideTitle", _emu(0.65), _emu(0.8), _emu(12.0), _emu(1.15), [{"text": title, "size": 28, "color": th["fg"], "bold": True}]))
            y_top = 2.05
            if body:
                shapes.append(_text_xml(next_id(), "SlideBody", _emu(0.65), _emu(1.95), _emu(12.0), _emu(0.75), [{"text": body, "size": 15, "color": th["muted"]}]))
                y_top = 2.85
            if bullets:
                two_col = layout in ("two-col", "bento", "closing") or len(bullets) >= 3
                cols = 2 if two_col else 1
                rows = math.ceil(min(len(bullets), 6) / cols)
                gap_x, gap_y = 0.28, 0.24
                card_w = (12.0 - gap_x * (cols - 1)) / cols
                card_h = min(1.85, (6.45 - y_top - gap_y * (rows - 1)) / max(1, rows))
                for b_i, btxt in enumerate(bullets[:6]):
                    r_i, c_i = divmod(b_i, cols)
                    bx = _emu(0.65 + c_i * (card_w + gap_x))
                    by = _emu(y_top + r_i * (card_h + gap_y))
                    acc = th["accent"] if b_i % 2 == 0 else th["secondary"]
                    shapes.append(_rect_xml(next_id(), f"CardAcc{b_i}", bx, by, _emu(0.08), _emu(card_h), acc))
                    shapes.append(
                        _text_xml(
                            next_id(),
                            f"Card{b_i}",
                            bx + _emu(0.08),
                            by,
                            _emu(card_w) - _emu(0.08),
                            _emu(card_h),
                            [
                                {"text": f"0{b_i + 1}", "size": 11, "color": acc, "bold": True, "font": "Consolas", "space_after": 300},
                                {"text": btxt, "size": 14, "color": th["fg"]},
                            ],
                            fill_hex=th["card"],
                            border_hex=th["border"],
                            anchor="ctr",
                        )
                    )

        # Clean footer
        shapes.append(_rect_xml(next_id(), "FooterRule", _emu(0.65), _emu(6.82), _emu(12.0), _emu(0.015), th["border"]))
        shapes.append(
            _text_xml(
                next_id(),
                "DeckFooter",
                _emu(0.65),
                _emu(6.92),
                _emu(9.5),
                _emu(0.35),
                [{"text": f"{deck_title}  ·  SourceBook for Hermes", "size": 10, "color": th["dim"]}],
                pad=0,
            )
        )

    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" '
        'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" '
        'xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">'
        f'<p:cSld><p:bg><p:bgPr><a:solidFill><a:srgbClr val="{th["bg"]}"/></a:solidFill><a:effectLst/></p:bgPr></p:bg>'
        '<p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>'
        '<p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>'
        f'{"".join(shapes)}'
        "</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sld>"
    )


def _notes_slide_xml(notes_text: str) -> str:
    safe = xml_escape(notes_text or "")
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<p:notes xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" '
        'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" '
        'xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">'
        "<p:cSld><p:spTree>"
        '<p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>'
        '<p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>'
        '<p:sp><p:nvSpPr><p:cNvPr id="2" name="Notes Placeholder"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr>'
        '<p:nvPr><p:ph type="body" idx="1"/></p:nvPr></p:nvSpPr><p:spPr/>'
        f'<p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:r><a:rPr lang="en-US" sz="1200"/><a:t>{safe}</a:t></a:r></a:p></p:txBody></p:sp>'
        "</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:notes>"
    )


def build_pptx_bytes(
    spec: dict[str, Any],
    *,
    media_dir: Optional[Path] = None,
    theme_override: Optional[str] = None,
) -> bytes:
    """Build a standards-compliant 16:9 PowerPoint (.pptx) binary using pure Python stdlib."""
    slides = spec.get("slides") or []
    deck_title = str(spec.get("title") or "SourceBook Deck")
    th = _theme(theme_override or spec.get("theme"))

    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        slide_overrides: list[str] = []
        notes_overrides: list[str] = []
        pres_rels: list[str] = [
            '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>',
            '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="theme/theme1.xml"/>',
        ]
        sld_id_list: list[str] = []
        used_exts: set[str] = set()

        for i, sl in enumerate(slides, start=1):
            img_data = _load_slide_image_bytes(sl, media_dir)
            s_rels = [
                '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>'
            ]
            img_rel_id: Optional[str] = None
            if img_data:
                raw_bytes, ext = img_data
                used_exts.add(ext)
                mname = f"image{i}.{ext}"
                zf.writestr(f"ppt/media/{mname}", raw_bytes)
                img_rel_id = "rId2"
                s_rels.append(
                    f'<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/{mname}"/>'
                )

            notes_txt = str(sl.get("notes") or "").strip()
            if notes_txt:
                n_rel_id = "rId3" if img_rel_id else "rId2"
                s_rels.append(
                    f'<Relationship Id="{n_rel_id}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/notesSlide" Target="../notesSlides/notesSlide{i}.xml"/>'
                )
                zf.writestr(f"ppt/notesSlides/notesSlide{i}.xml", _notes_slide_xml(notes_txt))
                zf.writestr(
                    f"ppt/notesSlides/_rels/notesSlide{i}.xml.rels",
                    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
                    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
                    f'<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="../slides/slide{i}.xml"/>'
                    "</Relationships>",
                )
                notes_overrides.append(
                    f'<Override PartName="/ppt/notesSlides/notesSlide{i}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.notesSlide+xml"/>'
                )

            zf.writestr(
                f"ppt/slides/slide{i}.xml",
                _build_slide_xml(sl, i, len(slides), deck_title, th, img_rel_id),
            )
            zf.writestr(
                f"ppt/slides/_rels/slide{i}.xml.rels",
                '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
                f'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">{"".join(s_rels)}</Relationships>',
            )
            slide_overrides.append(
                f'<Override PartName="/ppt/slides/slide{i}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>'
            )
            rid = f"rId{i + 2}"
            pres_rels.append(
                f'<Relationship Id="{rid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide{i}.xml"/>'
            )
            sld_id_list.append(f'<p:sldId id="{255 + i}" r:id="{rid}"/>')

        # Minimal valid Content_Types, _rels, theme, slideMaster, slideLayout, presentation.xml
        ext_defaults = [
            '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>',
            '<Default Extension="xml" ContentType="application/xml"/>',
        ]
        if "png" in used_exts:
            ext_defaults.append('<Default Extension="png" ContentType="image/png"/>')
        if "jpeg" in used_exts:
            ext_defaults.append('<Default Extension="jpeg" ContentType="image/jpeg"/>')

        zf.writestr(
            "[Content_Types].xml",
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
            f'{"".join(ext_defaults)}'
            '<Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>'
            '<Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>'
            '<Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>'
            '<Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>'
            f'{"".join(slide_overrides)}{"".join(notes_overrides)}'
            "</Types>",
        )
        zf.writestr(
            "_rels/.rels",
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>'
            "</Relationships>",
        )
        zf.writestr(
            "ppt/presentation.xml",
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" '
            'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" '
            'xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">'
            '<p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst>'
            f'<p:sldIdLst>{"".join(sld_id_list)}</p:sldIdLst>'
            f'<p:sldSz cx="{SLIDE_W}" cy="{SLIDE_H}" type="screen16x9"/>'
            '<p:notesSz cx="6858000" cy="9144000"/></p:presentation>',
        )
        zf.writestr(
            "ppt/_rels/presentation.xml.rels",
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            f'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">{"".join(pres_rels)}</Relationships>',
        )
        zf.writestr(
            "ppt/slideMasters/slideMaster1.xml",
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" '
            'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" '
            'xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">'
            '<p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>'
            '<p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>'
            "</p:spTree></p:cSld>"
            '<p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/>'
            '<p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst></p:sldMaster>',
        )
        zf.writestr(
            "ppt/slideMasters/_rels/slideMaster1.xml.rels",
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>'
            '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme1.xml"/>'
            "</Relationships>",
        )
        zf.writestr(
            "ppt/slideLayouts/slideLayout1.xml",
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" '
            'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" '
            'xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" type="blank">'
            '<p:cSld name="Blank"><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>'
            '<p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>'
            "</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sldLayout>",
        )
        zf.writestr(
            "ppt/slideLayouts/_rels/slideLayout1.xml.rels",
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/>'
            "</Relationships>",
        )
        zf.writestr(
            "ppt/theme/theme1.xml",
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="SourceBook">'
            '<a:themeElements><a:clrScheme name="SourceBook">'
            f'<a:dk1><a:srgbClr val="{th["bg"]}"/></a:dk1><a:lt1><a:srgbClr val="{th["fg"]}"/></a:lt1>'
            f'<a:dk2><a:srgbClr val="{th["card"]}"/></a:dk2><a:lt2><a:srgbClr val="{th["muted"]}"/></a:lt2>'
            f'<a:accent1><a:srgbClr val="{th["accent"]}"/></a:accent1><a:accent2><a:srgbClr val="{th["secondary"]}"/></a:accent2>'
            '<a:accent3><a:srgbClr val="F59E0B"/></a:accent3><a:accent4><a:srgbClr val="8B5CF6"/></a:accent4>'
            '<a:accent5><a:srgbClr val="EC4899"/></a:accent5><a:accent6><a:srgbClr val="14B8A6"/></a:accent6>'
            f'<a:hlink><a:srgbClr val="{th["accent"]}"/></a:hlink><a:folHlink><a:srgbClr val="{th["secondary"]}"/></a:folHlink>'
            "</a:clrScheme>"
            '<a:fontScheme name="SourceBook"><a:majorFont><a:latin typeface="Calibri"/><a:ea typeface=""/><a:cs typeface=""/></a:majorFont>'
            '<a:minorFont><a:latin typeface="Calibri"/><a:ea typeface=""/><a:cs typeface=""/></a:minorFont></a:fontScheme>'
            '<a:fmtScheme name="SourceBook"><a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:fillStyleLst>'
            '<a:lnStyleLst><a:ln w="9525"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln></a:lnStyleLst>'
            '<a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst>'
            '<a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:bgFillStyleLst></a:fmtScheme>'
            "</a:themeElements></a:theme>",
        )

    return buf.getvalue()


def build_pdf_bytes(
    spec: dict[str, Any],
    *,
    media_dir: Optional[Path] = None,
    theme_override: Optional[str] = None,
) -> bytes:
    """Build a crisp 16:9 widescreen PDF document (PyMuPDF vector/image renderer with zero-dep PDF 1.4 fallback)."""
    slides = spec.get("slides") or []
    deck_title = str(spec.get("title") or "SourceBook Deck")
    th = _theme(theme_override or spec.get("theme"))

    try:
        import fitz  # type: ignore

        return _build_pdf_fitz(fitz, slides, deck_title, th, media_dir)
    except Exception:
        return _build_pdf_minimal(slides, deck_title, th)


def _build_pdf_fitz(
    fitz: Any,
    slides: list[dict[str, Any]],
    deck_title: str,
    th: dict[str, str],
    media_dir: Optional[Path],
) -> bytes:
    PW, PH = 960.0, 540.0
    bg = _hex_rgb01(th["bg"])
    card = _hex_rgb01(th["card"])
    acc = _hex_rgb01(th["accent"])
    sec = _hex_rgb01(th["secondary"])
    fg = _hex_rgb01(th["fg"])
    muted = _hex_rgb01(th["muted"])
    dim = _hex_rgb01(th["dim"])
    border = _hex_rgb01(th["border"])

    doc = fitz.open()
    for idx, sl in enumerate(slides, start=1):
        page = doc.new_page(width=PW, height=PH)
        img_data = _load_slide_image_bytes(sl, media_dir)
        layout = str(sl.get("layout") or "bullets").lower()
        image_mode = str(sl.get("image_mode") or "").lower()
        title = str(sl.get("title") or "")
        body = str(sl.get("body") or "")
        bullets = [str(b) for b in (sl.get("bullets") or []) if str(b).strip()]
        stat = sl.get("stat") if isinstance(sl.get("stat"), dict) else None
        columns = sl.get("columns") if isinstance(sl.get("columns"), list) else []
        steps = sl.get("steps") if isinstance(sl.get("steps"), list) else []

        if img_data and (image_mode == "full_slide" or layout == "image-full"):
            page.insert_image(fitz.Rect(0, 0, PW, PH), stream=img_data[0], keep_proportion=False)
            continue

        # Solid background + top ribbon
        page.draw_rect(fitz.Rect(0, 0, PW, PH), color=bg, fill=bg)
        page.draw_rect(fitz.Rect(0, 0, PW, 6), color=acc, fill=acc)
        page.insert_text(fitz.Point(44, 30), layout.upper(), fontsize=9, fontname="hebo", color=acc)
        page.insert_text(fitz.Point(PW - 78, 30), f"{idx:02d} / {len(slides):02d}", fontsize=9, fontname="hebo", color=dim)

        if layout in ("title", "section"):
            if img_data:
                page.insert_image(fitz.Rect(540, 72, 916, 454), stream=img_data[0], keep_proportion=True)
                page.insert_textbox(fitz.Rect(48, 130, 510, 310), title, fontsize=30, fontname="hebo", color=fg)
                page.draw_rect(fitz.Rect(48, 316, 148, 321), color=acc, fill=acc)
                if body:
                    page.insert_textbox(fitz.Rect(48, 336, 510, 440), body, fontsize=13.5, fontname="helv", color=muted)
            else:
                page.insert_textbox(fitz.Rect(90, 145, PW - 90, 295), title, fontsize=34, fontname="hebo", color=fg, align=1)
                page.draw_rect(fitz.Rect(PW / 2 - 54, 304, PW / 2 + 54, 309), color=acc, fill=acc)
                if body:
                    page.insert_textbox(fitz.Rect(140, 328, PW - 140, 430), body, fontsize=14, fontname="helv", color=muted, align=1)
        elif layout == "stat" and stat and stat.get("value"):
            page.draw_rect(fitz.Rect(44, 86, 354, 446), color=border, fill=card, width=1)
            page.insert_textbox(fitz.Rect(56, 175, 342, 275), str(stat.get("value")), fontsize=42, fontname="hebo", color=acc, align=1)
            if stat.get("label"):
                page.insert_textbox(fitz.Rect(64, 278, 334, 360), str(stat.get("label")), fontsize=12, fontname="helv", color=muted, align=1)
            page.insert_textbox(fitz.Rect(386, 82, PW - 44, 186), title, fontsize=21, fontname="hebo", color=fg)
            for b_i, btxt in enumerate(bullets[:4]):
                by = 196 + b_i * 64
                page.draw_rect(fitz.Rect(386, by, PW - 44, by + 54), color=border, fill=card, width=0.8)
                page.insert_textbox(fitz.Rect(400, by + 10, PW - 56, by + 50), f"0{b_i + 1}  {btxt}", fontsize=11, fontname="helv", color=fg)
        elif layout == "quote":
            page.draw_rect(fitz.Rect(84, 140, 91, 376), color=acc, fill=acc)
            page.insert_text(fitz.Point(116, 162), title.upper(), fontsize=10, fontname="hebo", color=acc)
            page.insert_textbox(fitz.Rect(116, 182, PW - 84, 385), f'"{body or (bullets[0] if bullets else title)}"', fontsize=22, fontname="heit", color=fg)
        elif layout == "comparison" and len(columns) >= 2:
            page.insert_textbox(fitz.Rect(44, 54, PW - 44, 126), title, fontsize=22, fontname="hebo", color=fg)
            for c_i, col in enumerate(columns[:2]):
                cx = 44 + c_i * 448
                cacc = acc if c_i == 0 else sec
                page.draw_rect(fitz.Rect(cx, 138, cx + 424, 464), color=border, fill=card, width=0.9)
                page.draw_rect(fitz.Rect(cx, 138, cx + 424, 144), color=cacc, fill=cacc)
                page.insert_text(fitz.Point(cx + 18, 170), str(col.get("heading") or f"Side {c_i + 1}"), fontsize=14, fontname="hebo", color=cacc)
                pts = "\n\n".join(f"•  {pt}" for pt in (col.get("points") or [])[:5])
                page.insert_textbox(fitz.Rect(cx + 18, 186, cx + 406, 452), pts, fontsize=11, fontname="helv", color=fg)
        elif layout == "timeline" and steps:
            page.insert_textbox(fitz.Rect(44, 54, PW - 44, 126), title, fontsize=22, fontname="hebo", color=fg)
            show = steps[:4]
            gap = 18.0
            cw = (PW - 88 - gap * (len(show) - 1)) / max(1, len(show))
            page.draw_rect(fitz.Rect(44, 174, PW - 44, 177), color=border, fill=border)
            for s_i, st in enumerate(show):
                sx = 44 + s_i * (cw + gap)
                sacc = acc if s_i % 2 == 0 else sec
                page.draw_rect(fitz.Rect(sx, 160, sx + 38, 190), color=sacc, fill=sacc)
                page.insert_textbox(fitz.Rect(sx, 168, sx + 38, 190), f"0{s_i + 1}", fontsize=10, fontname="hebo", color=(1, 1, 1), align=1)
                page.draw_rect(fitz.Rect(sx, 206, sx + cw, 462), color=border, fill=card, width=0.9)
                page.insert_textbox(fitz.Rect(sx + 12, 220, sx + cw - 12, 286), str(st.get("label") or st.get("title") or f"Step {s_i + 1}"), fontsize=13, fontname="hebo", color=fg)
                page.insert_textbox(fitz.Rect(sx + 12, 290, sx + cw - 12, 450), str(st.get("detail") or st.get("summary") or ""), fontsize=10.5, fontname="helv", color=muted)
        elif img_data:
            page.insert_textbox(fitz.Rect(44, 58, 496, 152), title, fontsize=21, fontname="hebo", color=fg)
            page.insert_image(fitz.Rect(522, 74, PW - 44, 462), stream=img_data[0], keep_proportion=True)
            y_cur = 160
            if body:
                page.insert_textbox(fitz.Rect(44, y_cur, 496, y_cur + 56), body, fontsize=11.5, fontname="helv", color=muted)
                y_cur += 62
            for b_i, btxt in enumerate(bullets[:4]):
                by = y_cur + b_i * 64
                page.draw_rect(fitz.Rect(44, by, 496, by + 56), color=border, fill=card, width=0.8)
                page.insert_textbox(fitz.Rect(58, by + 10, 484, by + 52), f"0{b_i + 1}  {btxt}", fontsize=10.5, fontname="helv", color=fg)
        else:
            page.insert_textbox(fitz.Rect(44, 54, PW - 44, 134), title, fontsize=22, fontname="hebo", color=fg)
            y_top = 144.0
            if body:
                page.insert_textbox(fitz.Rect(44, 138, PW - 44, 192), body, fontsize=12, fontname="helv", color=muted)
                y_top = 200.0
            if bullets:
                cols = 2 if (layout in ("two-col", "bento", "closing") or len(bullets) >= 3) else 1
                rows = math.ceil(min(len(bullets), 6) / cols)
                gx, gy = 20.0, 16.0
                cw = (PW - 88 - gx * (cols - 1)) / cols
                ch = min(132.0, (466.0 - y_top - gy * (rows - 1)) / max(1, rows))
                for b_i, btxt in enumerate(bullets[:6]):
                    r_i, c_i = divmod(b_i, cols)
                    bx = 44 + c_i * (cw + gx)
                    by = y_top + r_i * (ch + gy)
                    cacc = acc if b_i % 2 == 0 else sec
                    page.draw_rect(fitz.Rect(bx, by, bx + cw, by + ch), color=border, fill=card, width=0.9)
                    page.draw_rect(fitz.Rect(bx, by, bx + 4, by + ch), color=cacc, fill=cacc)
                    page.insert_text(fitz.Point(bx + 14, by + 20), f"0{b_i + 1}", fontsize=9, fontname="hebo", color=cacc)
                    page.insert_textbox(fitz.Rect(bx + 14, by + 26, bx + cw - 12, by + ch - 8), btxt, fontsize=11, fontname="helv", color=fg)

        # Clean footer
        page.draw_line(fitz.Point(44, PH - 44), fitz.Point(PW - 44, PH - 44), color=border, width=0.6)
        page.insert_text(fitz.Point(44, PH - 22), f"{deck_title}  ·  SourceBook for Hermes", fontsize=9, fontname="helv", color=dim)

    out = doc.tobytes(deflate=True)
    doc.close()
    return out


def _pdf_escape(s: str) -> str:
    clean = s.encode("latin-1", "replace").decode("latin-1")
    return clean.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


def _build_pdf_minimal(slides: list[dict[str, Any]], deck_title: str, th: dict[str, str]) -> bytes:
    """Zero-dependency pure-Python PDF 1.4 fallback for 16:9 slide decks."""
    PW, PH = 960, 540
    bg = _hex_rgb01(th["bg"])
    fg = _hex_rgb01(th["fg"])
    acc = _hex_rgb01(th["accent"])
    objects: list[bytes] = []

    def add_obj(data: bytes) -> int:
        objects.append(data)
        return len(objects)

    catalog_id = add_obj(b"")  # placeholder
    pages_id = add_obj(b"")  # placeholder
    font_id = add_obj(b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>")
    font_reg_id = add_obj(b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")
    page_ids: list[int] = []

    for idx, sl in enumerate(slides or [{"title": deck_title}], start=1):
        lines = [
            f"{bg[0]:.3f} {bg[1]:.3f} {bg[2]:.3f} rg 0 0 {PW} {PH} re f",
            f"{acc[0]:.3f} {acc[1]:.3f} {acc[2]:.3f} rg 0 {PH - 6} {PW} 6 re f",
            f"BT /F1 22 Tf {fg[0]:.3f} {fg[1]:.3f} {fg[2]:.3f} rg 48 {PH - 90} Td ({_pdf_escape(str(sl.get('title') or '')[:95])}) Tj ET",
        ]
        y = PH - 145
        if sl.get("body"):
            for wl in textwrap.wrap(str(sl["body"]), 88)[:3]:
                lines.append(f"BT /F2 13 Tf {fg[0]:.3f} {fg[1]:.3f} {fg[2]:.3f} rg 48 {y} Td ({_pdf_escape(wl)}) Tj ET")
                y -= 22
        for b_i, b in enumerate((sl.get("bullets") or [])[:6], start=1):
            for wl in textwrap.wrap(f"{b_i}. {b}", 86)[:2]:
                lines.append(f"BT /F2 12 Tf {fg[0]:.3f} {fg[1]:.3f} {fg[2]:.3f} rg 56 {y} Td ({_pdf_escape(wl)}) Tj ET")
                y -= 20
            y -= 6
        lines.append(f"BT /F2 9 Tf {acc[0]:.3f} {acc[1]:.3f} {acc[2]:.3f} rg 48 24 Td ({_pdf_escape(deck_title)} - Slide {idx}/{len(slides)}) Tj ET")
        stream = "\n".join(lines).encode("latin-1", "replace")
        cid = add_obj(f"<< /Length {len(stream)} >>\nstream\n".encode() + stream + b"\nendstream")
        pid = add_obj(
            f"<< /Type /Page /Parent {pages_id} 0 R /MediaBox [0 0 {PW} {PH}] "
            f"/Resources << /Font << /F1 {font_id} 0 R /F2 {font_reg_id} 0 R >> >> /Contents {cid} 0 R >>".encode()
        )
        page_ids.append(pid)

    kids = " ".join(f"{p} 0 R" for p in page_ids)
    objects[pages_id - 1] = f"<< /Type /Pages /Count {len(page_ids)} /Kids [ {kids} ] >>".encode()
    objects[catalog_id - 1] = f"<< /Type /Catalog /Pages {pages_id} 0 R >>".encode()

    out = io.BytesIO()
    out.write(b"%PDF-1.4\n")
    offsets: list[int] = []
    for i, obj in enumerate(objects, start=1):
        offsets.append(out.tell())
        out.write(f"{i} 0 obj\n".encode() + obj + b"\nendobj\n")
    xref_pos = out.tell()
    out.write(f"xref\n0 {len(objects) + 1}\n0000000000 65535 f \n".encode())
    for off in offsets:
        out.write(f"{off:010d} 00000 n \n".encode())
    out.write(
        f"trailer\n<< /Size {len(objects) + 1} /Root {catalog_id} 0 R >>\nstartxref\n{xref_pos}\n%%EOF\n".encode()
    )
    return out.getvalue()
