# App-Icon, Favicon und Splash: Blume des Lebens (Platzhalter) auf Honigbraun.
# Wenn das Original-Logo kommt: diese eine Datei anpassen (oder die PNGs in public/icons
# und resources/ ersetzen) und neu ausführen:  python3 scripts/make-icons.py
import math
from PIL import Image, ImageDraw

BG = (43, 33, 24)       # Honigbraun #2B2118
GOLD = (217, 165, 74)   # Honiggold #D9A54A


def flower(size, scale, stroke):
    """Blume des Lebens: 19 Kreise (Mitte, 6, 12) + Umkreis. scale = Anteil der Fläche."""
    s = size * 4  # Supersampling
    img = Image.new('RGB', (s, s), BG)
    d = ImageDraw.Draw(img)
    r = s * scale / 6  # Umkreis = 3r
    cx = cy = s / 2
    centers = [(0.0, 0.0)]
    for k in range(6):
        a = math.radians(k * 60 - 90)
        centers.append((r * math.cos(a), r * math.sin(a)))
    for k in range(6):
        a = math.radians(k * 60 - 90)
        centers.append((2 * r * math.cos(a), 2 * r * math.sin(a)))
        b = math.radians(k * 60 - 60)
        centers.append((r * math.sqrt(3) * math.cos(b), r * math.sqrt(3) * math.sin(b)))
    w = max(2, int(stroke * 4))
    for x, y in centers:
        d.ellipse([cx + x - r, cy + y - r, cx + x + r, cy + y + r], outline=GOLD, width=w)
    d.ellipse([cx - 3 * r, cy - 3 * r, cx + 3 * r, cy + 3 * r], outline=GOLD, width=w)
    return img.resize((size, size), Image.LANCZOS)


targets = [
    ('public/icons/icon-192.png', 192, 0.72, 2.2),
    ('public/icons/icon-512.png', 512, 0.72, 4),
    ('public/icons/maskable-512.png', 512, 0.56, 4),
    ('public/icons/apple-touch-icon.png', 180, 0.62, 2),
    ('public/icons/favicon-32.png', 32, 0.86, 1.1),
    ('resources/icon.png', 1024, 0.62, 7),
    ('resources/splash.png', 2732, 0.22, 7),
]
for path, size, scale, stroke in targets:
    flower(size, scale, stroke).save(path, optimize=True)
print('Icons und Splash erzeugt')
