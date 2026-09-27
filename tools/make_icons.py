#!/usr/bin/env python3
"""Draw the app logo: a date palm with the word نخلة, in the app's olive and sand colours.

Usage: python3 tools/make_icons.py path/to/Tajawal-Bold.(ttf|woff)
Needs Pillow built with raqm (for Arabic shaping). Tajawal: npm pack @fontsource/tajawal.
"""
import math, os, sys
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OLIVE = (95, 122, 58)
SAND = (244, 236, 220)
DATES = (201, 150, 80)


def bezier(p0, p1, p2, n=40):
    return [((1-t)**2*p0[0] + 2*(1-t)*t*p1[0] + t*t*p2[0],
             (1-t)**2*p0[1] + 2*(1-t)*t*p1[1] + t*t*p2[1]) for t in (i/n for i in range(n+1))]


def ribbon(pts, width, taper_start=True):
    """Polygon around a polyline, thickest in the middle, pointed at the tip."""
    left, right = [], []
    for i, (x, y) in enumerate(pts):
        a = pts[max(i-1, 0)]; b = pts[min(i+1, len(pts)-1)]
        dx, dy = b[0]-a[0], b[1]-a[1]
        l = math.hypot(dx, dy) or 1
        nx, ny = -dy/l, dx/l
        t = i/(len(pts)-1)
        w = width * (math.sin(math.pi*t) ** 0.6 if taper_start else (1-t) ** 0.8)
        left.append((x+nx*w, y+ny*w)); right.append((x-nx*w, y-ny*w))
    return left + right[::-1]


def draw_logo(S, font_path, safe):
    """safe: fraction of the canvas the artwork should fit inside (smaller for maskable)."""
    im = Image.new("RGB", (S, S), OLIVE)
    d = ImageDraw.Draw(im)
    u = S * safe  # artwork box size
    ox = (S - u) / 2; oy = (S - u) / 2
    P = lambda x, y: (ox + x*u, oy + y*u)

    # Trunk: gently curved and tapered, with ring marks.
    top = P(0.50, 0.24)
    spine = bezier(P(0.50, 0.74), P(0.53, 0.50), top, 30)
    left, right = [], []
    for i, (x, y) in enumerate(spine):
        t = i/(len(spine)-1)
        w = u*(0.055 - 0.028*t)
        left.append((x-w, y)); right.append((x+w, y))
    d.polygon(left + right[::-1], fill=SAND)
    for i in range(3, len(spine)-3, 3):
        x, y = spine[i]; t = i/(len(spine)-1); w = u*(0.055-0.028*t)
        d.line([(x-w, y), (x+w, y+u*0.012)], fill=OLIVE, width=max(1, int(u*0.009)))

    # Fronds arching out of the crown.
    cx, cy = top
    for ang, length, bend in [(-160, 0.34, 0.14), (-125, 0.35, 0.12), (-90, 0.24, 0.0),
                              (-55, 0.35, -0.12), (-20, 0.34, -0.14), (-178, 0.28, 0.16), (2, 0.28, -0.16)]:
        a = math.radians(ang)
        end = (cx + math.cos(a)*length*u, cy + math.sin(a)*length*u + abs(math.cos(a))*0.10*u)
        mid = (cx + math.cos(a)*length*u*0.5 - math.sin(a)*bend*u*0.3,
               cy + math.sin(a)*length*u*0.5 - abs(math.cos(a))*0.06*u)
        pts = bezier((cx, cy), mid, end)
        d.polygon(ribbon(pts, u*0.045), fill=SAND)
        # centre rib
        d.line(pts[2:-4], fill=OLIVE, width=max(1, int(u*0.008)))

    # Date clusters under the crown.
    for dx, dy in [(-0.06, 0.03), (-0.035, 0.055), (-0.075, 0.065), (0.05, 0.035), (0.075, 0.06), (0.04, 0.065)]:
        x, y = cx + dx*u, cy + dy*u
        r = u*0.02
        d.ellipse([x-r, y-r*1.2, x+r, y+r*1.2], fill=DATES)

    # Ground line
    d.rounded_rectangle([*P(0.30, 0.735), *P(0.70, 0.755)], radius=u*0.01, fill=SAND)

    # Word
    font = ImageFont.truetype(font_path, int(u*0.20), layout_engine=ImageFont.Layout.RAQM)
    text = "نخلة"
    bbox = d.textbbox((0, 0), text, font=font, direction="rtl", language="ar")
    tw, th = bbox[2]-bbox[0], bbox[3]-bbox[1]
    tx = S/2 - tw/2 - bbox[0]
    ty = oy + u*0.80 - bbox[1]
    d.text((tx, ty), text, font=font, fill=SAND, direction="rtl", language="ar")
    return im


def save(S, safe, name, font):
    big = draw_logo(S*4, font, safe)
    big.resize((S, S), Image.LANCZOS).save(os.path.join(ROOT, "icons", name), optimize=True)


if __name__ == "__main__":
    font = sys.argv[1]
    save(192, 0.86, "icon-192.png", font)
    save(512, 0.86, "icon-512.png", font)
    save(180, 0.86, "apple-touch-icon.png", font)
    save(512, 0.70, "icon-maskable-512.png", font)
