"""
Builds the two Farnsher faces from open-license sources (SIL OFL 1.1).

  Farnsher Display  Fraunces, cut at opsz 144 / SOFT 30 / WONK 1, with the
                    ss01 shapes (h m n s &) made default and the "horizon":
                    a hairline gap through every letter at the same height,
                    so a headline reads as one line drawn across the words.
  Farnsher Text     Geist, variable weight kept, with a fixed mix of
                    alternates (a, l, R, G, 0, 1) made default.

The OFL allows modified versions as long as they are renamed, which is why
the output carries its own family names. Sources are not committed; fetch:
  Fraunces[SOFT,WONK,opsz,wght].ttf, Fraunces-Italic[...].ttf  (google/fonts ofl/fraunces)
  Geist[wght].ttf                                              (google/fonts ofl/geist)

Run:  python tools/build-font.py <folder with the three source files>
Out:  assets/fonts/farnsher-display.woff2, -display-italic.woff2, farnsher-text.woff2
Needs: pip install fonttools brotli skia-pathops
"""
import sys
from pathlib import Path

import pathops
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.pens.cu2quPen import Cu2QuPen
from fontTools import subset

SRC = Path(sys.argv[1])
OUT = Path(__file__).resolve().parent.parent / "assets" / "fonts"
OUT.mkdir(parents=True, exist_ok=True)

# Latin, Latin-1, common punctuation, arrows used on the page
UNICODES = "U+0020-007E,U+00A0-00FF,U+0131,U+0152-0153,U+2013-2014,U+2018-201E,U+2022,U+2026,U+2032-2033,U+20AC,U+2122,U+2190-2193,U+2197,U+2212"


def single_subst(font, tags):
    """Every single-substitution pair the given GSUB features apply."""
    gsub = font["GSUB"].table
    out = {}
    for fr in gsub.FeatureList.FeatureRecord:
        if fr.FeatureTag not in tags:
            continue
        for li in fr.Feature.LookupListIndex:
            for st in gsub.LookupList.Lookup[li].SubTable:
                st = getattr(st, "ExtSubTable", st)
                out.update(getattr(st, "mapping", {}))
    return out


def make_default(font, tags):
    """Point the character map at the alternates, so they show without CSS."""
    alt = single_subst(font, tags)
    for table in font["cmap"].tables:
        for cp, g in list(table.cmap.items()):
            if g in alt:
                table.cmap[cp] = alt[g]


def rename(font, family, style="Regular"):
    full = f"{family} {style}".replace(" Regular", "") if style != "Regular" else family
    ps = f"{family.replace(' ', '')}-{style.replace(' ', '')}"
    name = font["name"]
    keep = {0, 7, 8, 9, 11, 13, 14}  # copyright, trademark, maker, designer, urls, licence
    for rec in list(name.names):
        if rec.nameID not in keep:
            name.removeNames(nameID=rec.nameID)
    for nid, val in {1: family, 2: style, 3: f"{ps};farnsher", 4: full, 6: ps,
                     5: "Version 1.000; built for farnsherstudio.com", 16: family, 17: style}.items():
        name.setName(val, nid, 3, 1, 0x409)
    name.setName(
        "Farnsher Display and Farnsher Text are modified versions of Fraunces "
        "(Undercase Type) and Geist (Vercel), used under the SIL Open Font License 1.1.",
        10, 3, 1, 0x409)


def horizon_cut(font, y_mid, thickness):
    """Subtract a full-width band from every outline glyph."""
    glyf, hmtx = font["glyf"], font["hmtx"]
    gs = font.getGlyphSet()
    y0, y1 = y_mid - thickness / 2, y_mid + thickness / 2
    cut = 0
    for gname in font.getGlyphOrder():
        g = glyf[gname]
        if g.numberOfContours <= 0:
            continue  # empty, or composite: composites inherit the cut from their parts
        src = pathops.Path()
        gs[gname].draw(src.getPen())
        if src.bounds[1] > y0 or src.bounds[3] < y1:
            continue  # glyph does not reach through the band
        band = pathops.Path()
        p = band.getPen()
        w = hmtx[gname][0]
        p.moveTo((-200, y0)); p.lineTo((w + 200, y0)); p.lineTo((w + 200, y1)); p.lineTo((-200, y1)); p.closePath()
        res = pathops.op(src, band, pathops.PathOp.DIFFERENCE)
        pen = TTGlyphPen(None)
        res.draw(Cu2QuPen(pen, max_err=1.0, reverse_direction=False))
        glyf[gname] = pen.glyph()
        glyf[gname].recalcBounds(glyf)
        cut += 1
    return cut


def finish(font, path):
    opts = subset.Options()
    opts.layout_features = ["kern", "liga", "case", "tnum", "ss01", "ss07"]
    opts.flavor = "woff2"
    opts.name_IDs = ["*"]
    opts.notdef_outline = True
    s = subset.Subsetter(opts)
    s.populate(unicodes=subset.parse_unicodes(UNICODES))
    s.subset(font)
    font.flavor = "woff2"
    font.save(path)
    print(f"  {path.name:32} {path.stat().st_size / 1024:6.1f} KB")


def display(src, out, style):
    f = TTFont(src)
    f = instancer.instantiateVariableFont(f, {"opsz": 144, "wght": 380, "SOFT": 30, "WONK": 1})
    make_default(f, {"ss01"})
    # x-height is 964/2000; the band sits at 37% of it, under the e's bar
    n = horizon_cut(f, y_mid=360, thickness=34)
    print(f"  horizon cut through {n} glyphs ({style})")
    rename(f, "Farnsher Display", style)
    finish(f, out)


def text(src, out):
    f = TTFont(src)
    make_default(f, {"ss01", "ss03", "ss04", "ss06", "ss09"})
    rename(f, "Farnsher Text")
    finish(f, out)


print("Building Farnsher")
display(SRC / "fraunces.ttf", OUT / "farnsher-display.woff2", "Regular")
display(SRC / "fraunces-italic.ttf", OUT / "farnsher-display-italic.woff2", "Italic")
text(SRC / "geist.ttf", OUT / "farnsher-text.woff2")
