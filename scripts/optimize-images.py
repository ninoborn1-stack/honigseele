# Erzeugt für jedes Foto in public/images/real/ (echte Fotos) und public/images/stock/ WebP-Varianten (480–2400 px) und eine winzige
# Unschärfe-Vorschau. Ergebnis: public/images/opt/ + content/images.generated.json.
# Nach neuen Fotos (z. B. Annas Bildern) einfach erneut ausführen:  npm run images
import base64, io, json, os
from PIL import Image

SRCS = ['public/images/real', 'public/images/stock']
OUT = 'public/images/opt'
WIDTHS = [480, 960, 1600, 2400]
os.makedirs(OUT, exist_ok=True)
manifest = {}
for SRC, name in [(d, n) for d in SRCS if os.path.isdir(d) for n in sorted(os.listdir(d))]:
    if not name.lower().endswith(('.jpg', '.jpeg', '.png')):
        continue
    img = Image.open(os.path.join(SRC, name)).convert('RGB')
    w, h = img.size
    base = ('real-' if SRC.endswith('real') else '') + os.path.splitext(name)[0]
    variants = []
    for target in [x for x in WIDTHS if x < w] + [w]:
        if any(v[0] == target for v in variants):
            continue
        out = img.resize((target, round(h * target / w)), Image.LANCZOS) if target != w else img
        path = f'{OUT}/{base}-{target}.webp'
        out.save(path, 'WEBP', quality=72, method=6)
        variants.append([target, '/' + path.removeprefix('public/')])
    tiny = img.resize((24, max(1, round(h * 24 / w))), Image.LANCZOS)
    buf = io.BytesIO()
    tiny.save(buf, 'WEBP', quality=40)
    manifest['/' + SRC.removeprefix('public/') + '/' + name] = {
        'width': w,
        'height': h,
        'variants': variants,
        'blur': 'data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode(),
    }
json.dump(manifest, open('content/images.generated.json', 'w'), indent=2)
print(f'{len(manifest)} Bilder optimiert')
