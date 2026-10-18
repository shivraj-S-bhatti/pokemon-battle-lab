"""Gimmikghoul hero: the conspiracy-board meme with both wacky teams pinned and strung by their real combos."""
import random
from PIL import Image, ImageDraw, ImageFont

K = 2  # work at 2x
base = Image.open("meme.webp").convert("RGBA").resize((1024 * K, 768 * K), Image.LANCZOS)
font = lambda s: ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", s * K)
random.seed(7)

pos = {  # card centers, 1024x768 frame, kept on open wall around Charlie
    "banette-mega": (62, 68), "sneasler": (200, 62), "sylveon": (335, 52), "politoed": (470, 60),
    "corviknight": (58, 232), "archaludon": (58, 470),
    "arbok": (600, 66), "farfetchd": (750, 66), "alcremie": (930, 70),
    "torterra": (880, 262), "farigiraf": (690, 405), "chimecho-mega": (900, 430),
}
strings = [  # real interactions from the two teams
    ("farfetchd", "torterra", "Simple Beam"), ("farfetchd", "arbok", "Simple Beam"), ("alcremie", "torterra", "Decorate"),
    ("farigiraf", "torterra", "Ally Switch"), ("chimecho-mega", "torterra", "Heal Pulse"),
    ("banette-mega", "sneasler", "Swagger"), ("banette-mega", "politoed", "Destiny Bond"),
    ("politoed", "archaludon", "rain"), ("corviknight", "banette-mega", None), ("sylveon", "politoed", None),
    ("sneasler", "torterra", "???"), ("archaludon", "farigiraf", "???"),
]
d = ImageDraw.Draw(base)
P = lambda xy: (xy[0] * K, xy[1] * K)
for a, b, _ in strings:  # strings first, cards cover their ends
    d.line([P(pos[a]), P(pos[b])], fill=(214, 30, 60, 255), width=4 * K)

for name, (x, y) in pos.items():
    card = Image.new("RGBA", (112 * K, 118 * K), (250, 248, 240, 255))
    ImageDraw.Draw(card).rectangle([0, 0, card.width - 1, card.height - 1], outline=(190, 185, 170, 255), width=K)
    spr = Image.open(f"sprites/{name}.png").convert("RGBA").resize((104 * K, 104 * K), Image.LANCZOS)
    card.alpha_composite(spr, (4 * K, 8 * K))
    card = card.rotate(random.uniform(-7, 7), expand=True, resample=Image.BICUBIC)
    base.alpha_composite(card, (x * K - card.width // 2, y * K - card.height // 2))
    d.ellipse([x * K - 7 * K, (y - 55) * K - 7 * K, x * K + 7 * K, (y - 55) * K + 7 * K], fill=(200, 20, 40, 255), outline=(90, 0, 10, 255), width=K)

for a, b, label in strings:  # move tags on the strings
    if not label:
        continue
    (x1, y1), (x2, y2) = pos[a], pos[b]
    mx, my = (x1 + x2) / 2, (y1 + y2) / 2
    if my < 140:  # top-row strings run between touching cards: hang the tag on the wall below
        my = 168
    f = font(15)
    w = d.textlength(label, font=f)
    d.rectangle([mx * K - w / 2 - 6 * K, my * K - 12 * K, mx * K + w / 2 + 6 * K, my * K + 12 * K], fill=(255, 236, 120, 255), outline=(60, 50, 0, 255), width=K)
    d.text((mx * K, my * K), label, font=f, fill=(20, 20, 20, 255), anchor="mm")

base.convert("RGB").save("gimmikghoul-hero.png", optimize=True)

# titled variant: a band below the frame
band = 150 * K
t = Image.new("RGB", (base.width, base.height + band), (22, 22, 28))
t.paste(base.convert("RGB"), (0, 0))
td = ImageDraw.Draw(t)
logo = Image.open("gimmighoul-smug.webp").convert("RGBA")
logo.thumbnail((130 * K, 130 * K))
t.paste(logo, (24 * K, base.height + 10 * K), logo)
td.text((170 * K, base.height + 30 * K), "GIMMIKGHOUL", font=font(52), fill=(255, 214, 64))
td.text((172 * K, base.height + 95 * K), "any team can work. find the tweaks that steelman it.", font=font(22), fill=(235, 235, 240))
t.save("gimmikghoul-hero-titled.png", optimize=True)
print("ok", base.size, t.size)
