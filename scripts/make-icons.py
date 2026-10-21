# Platzhalter-App-Icons: goldene Blüte auf Honigbraun. Wird durch Annas Logo ersetzt.
import math
from PIL import Image, ImageDraw

def icon(size, maskable=False):
    s = size * 4  # supersampling
    img = Image.new('RGB', (s, s), (43, 33, 24))
    d = ImageDraw.Draw(img)
    scale = 0.52 if maskable else 0.68
    r = s * scale / 2
    cx = cy = s / 2
    def petal(angle, dist, rx, ry, color):
        # Ellipse als Polygon, gedreht um die Mitte
        pts = []
        for k in range(64):
            t = 2 * math.pi * k / 64
            x, y = rx * math.cos(t), -dist + ry * math.sin(t)
            a = math.radians(angle)
            pts.append((cx + x * math.cos(a) - y * math.sin(a), cy + x * math.sin(a) + y * math.cos(a)))
        d.polygon(pts, fill=color)
    for k in range(5):
        petal(k * 72, r * 0.52, r * 0.31, r * 0.48, (217, 165, 74))
    for k in range(5):
        petal(k * 72 + 36, r * 0.38, r * 0.22, r * 0.38, (230, 189, 110))
    d.ellipse([cx - r * 0.2, cy - r * 0.2, cx + r * 0.2, cy + r * 0.2], fill=(43, 33, 24))
    d.ellipse([cx - r * 0.1, cy - r * 0.1, cx + r * 0.1, cy + r * 0.1], fill=(241, 212, 156))
    return img.resize((size, size), Image.LANCZOS)

for name, size, m in [('icon-192.png', 192, False), ('icon-512.png', 512, False), ('maskable-512.png', 512, True), ('apple-touch-icon.png', 180, True), ('favicon-32.png', 32, False)]:
    icon(size, m).save(f'public/icons/{name}', optimize=True)
print('ok')
