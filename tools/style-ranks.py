#!/usr/bin/env python3
"""Turns the flat rank icons into the badges in assets/rank/, using the layer recipe of SSS+ in the PSD:
a face with a satin highlight over a darker side, and a shadow. SSS+ comes styled from the PSD, so it is not made here.

Run it with: python tools/style-ranks.py <folder> [--out <folder>]     Then: node tools/optimize-images.mjs
<folder> holds the flat icons on the 20000x10000 canvas, named after the rank (SS.png, SS3.png...). Ranks with no file are left alone.
After it, raise the ?v= number of the rank art in web() in app.js: browsers keep the old badge for 7 days under the same name.
Needs: pip install pillow numpy scipy
"""
import os, sys
import numpy as np
from PIL import Image
from scipy import ndimage as ni

Image.MAX_IMAGE_PIXELS = None
HERE = os.path.dirname(os.path.abspath(__file__))
K = 8  # works at 1/K of the canvas
W, H = 20000 // K, 10000 // K
CUT = 480  # a gap taller than this (full-scale px) is the cut through the S, not a notch
SIZE = (360, 235)
BOX = (3540, 120, 17940, 9520)  # the part of the canvas every badge shows, so all of them line up

# side and shade are the darker colours of each tier. The face and the digit are read from the art.
# lift: Overlay barely moves a pure red, so the highlight adds this much lightness to each channel
TIERS = {
    "S": dict(side=(140, 24, 8), shade=(52, 0, 2), lift=None, digit_at=13450),
    "SS": dict(side=(150, 0, 8), shade=(58, 0, 2), lift=(1, .27, .2), digit_at=15820),
    "SSS": dict(side=(240, 120, 20), shade=(125, 30, 0), lift=None, digit_at=16540),
}
# Rank, tier, whether it has a digit, and how far right the source sits from its place (S.png is drawn 5000px to the left)
ICONS = [("S", "S", False, 5000), ("S5", "S", True, 0), ("SS", "SS", False, 0), ("SS3", "SS", True, 0), ("SS6", "SS", True, 0),
         ("SSS", "SSS", False, 0), ("SSS3", "SSS", True, 0), ("SSS6", "SSS", True, 0)]


def load(path, dx):
    """The source at 1/K scale, on a canvas of the full size."""
    im = Image.open(path).convert("RGBA")
    im = im.resize((im.width // K, im.height // K), Image.BOX)
    canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    canvas.paste(im, (dx // K, 0))
    return np.asarray(canvas)


def solid_colour(px):
    """The colour of the fully opaque part of the art."""
    return tuple(int(v) for v in np.median(px[px[..., 3] == 255][:, :3], axis=0))


def shift(a, dy):
    dy = int(round(dy / K))
    out = np.zeros_like(a)
    if dy > 0: out[dy:] = a[:-dy]
    elif dy < 0: out[:dy] = a[-dy:]
    else: out[:] = a
    return out


def satin(a, dist, blur):
    """Photoshop Satin at 90 degrees: the blurred shape against itself, moved up and down."""
    b = ni.gaussian_filter(a, blur * .5 / K)
    return np.clip(np.abs(shift(b, dist) - shift(b, -dist)), 0, 1)


def overlay(base, s, lift):
    """White in Overlay mode, with the satin as its opacity."""
    white = np.where(base < .5, 2 * base, 1.0)
    if lift: white = np.maximum(white, np.minimum(base + np.array(lift, np.float32), 1))
    return base * (1 - s) + white * s


def rgb(c):
    return np.array(c, np.float32) / 255


def over(dst, col, a):
    da = dst[..., 3]
    oa = a + da * (1 - a)
    dst[..., :3] = (col * a[..., None] + dst[..., :3] * (da * (1 - a))[..., None]) / np.maximum(oa, 1e-6)[..., None]
    dst[..., 3] = oa


def close_notches(a, r):
    """The side has no notches (Camada 1 in the PSD paints them over). Closes small slots, leaves the long cut through each S open."""
    grown = ni.distance_transform_edt(a <= .5) <= r
    closed = ni.distance_transform_edt(grown) > r
    gaps, n = ni.label(closed & (a <= .5))
    small = np.zeros(n + 1, bool)
    for i, o in enumerate(ni.find_objects(gaps)):
        small[i + 1] = (o[0].stop - o[0].start) * K < CUT
    return np.maximum(a, small[gaps].astype(np.float32))


def block(dst, a, face, tier, mask, depth=315, sat=(121, 250), sat2=(87, 250), closer=120):
    """One shape: the side (shade satin, flat colour through the painted mask) under a face with a white Overlay satin."""
    raised = 75
    sa = shift(close_notches(a, closer / K), depth - raised)
    inv = (1 - satin(sa, *sat2))[..., None]
    col = rgb(tier["side"]) * (1 - inv) + rgb(tier["shade"]) * inv
    col = col * (1 - mask[..., None]) + rgb(tier["side"]) * mask[..., None]
    over(dst, col, sa)
    fa = shift(a, -raised)
    over(dst, overlay(rgb(face)[None, None, :], satin(fa, *sat)[..., None], tier["lift"]), fa)


def main():
    args = sys.argv[1:]
    out = os.path.join(HERE, "..", "assets", "rank")
    if "--out" in args:
        i = args.index("--out")
        out = args[i + 1]
        del args[i:i + 2]
    if len(args) != 1:
        sys.exit(__doc__)
    os.makedirs(out, exist_ok=True)
    mask = np.asarray(Image.open(os.path.join(HERE, "rank-side-mask.png")).resize((W, H), Image.BILINEAR), np.float32) / 255
    done = 0
    for name, tier_name, has_digit, dx in ICONS:
        path = os.path.join(args[0], f"{name}.png")
        if not os.path.exists(path): continue
        tier = TIERS[tier_name]
        px = load(path, dx)
        a = px[..., 3].astype(np.float32) / 255
        cut = tier["digit_at"] // K if has_digit else W
        letters = a.copy()
        letters[:, cut:] = 0
        badge = np.zeros((H, W, 4), np.float32)
        block(badge, letters, solid_colour(px[:, :cut]), tier, mask)
        if has_digit:
            digit = a.copy()
            digit[:, :cut] = 0
            block(badge, digit, solid_colour(px[:, cut:]), tier, mask * 0 + 1, depth=175, sat=(40, 85), sat2=(30, 85), closer=8)
        im = Image.fromarray((np.clip(badge, 0, 1) * 255 + .5).astype(np.uint8), "RGBA")
        im.crop(tuple(v // K for v in BOX)).resize(SIZE, Image.LANCZOS).save(os.path.join(out, f"{name}.png"), optimize=True)
        print(f"{name}.png pronto", flush=True)
        done += 1
    print(f"{done} ícone(s) gerado(s) em {os.path.normpath(out)}." if done else f"Nenhum ícone encontrado em {args[0]}.")


main()
