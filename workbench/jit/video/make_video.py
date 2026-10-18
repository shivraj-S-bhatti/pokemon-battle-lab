"""Gimmikghoul demo video: animated graph build with sprites, captions and macOS voiceover.
Run from repo root: python3 workbench/jit/video/make_video.py   -> .artifacts/video/gimmikghoul.mp4
Numbers on screen are the gk_jit results (native calculator via workbench/tools/calculator.mjs)."""
import math, os, subprocess, wave
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..'))
OUT = os.path.join(ROOT, '.artifacts/video'); os.makedirs(OUT, exist_ok=True)
W, H, FPS = 1920, 1080, 30
SPR = os.path.join(ROOT, 'data/sprites')
FONT = '/System/Library/Fonts/Avenir Next.ttc'
def font(size, bold=True):
    try: return ImageFont.truetype(FONT, size, index=8 if bold else 0)
    except Exception: return ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial Bold.ttf', size)

BG, INK, MUTED, YEL = (18, 20, 30), (240, 238, 230), (150, 150, 165), (255, 214, 64)
COL = {'CORE': (255, 214, 64), 'OHKO': (64, 156, 255), 'NOT': (120, 140, 170), 'BAD': (235, 70, 80),
       'GOOD': (70, 200, 120), 'SUPPORT': (170, 120, 240), 'ENABLES': (110, 110, 130)}

_sprites = {}
def sprite(sid, size):
    key = (sid, size)
    if key not in _sprites:
        p = os.path.join(SPR, sid + '.png')
        if not os.path.exists(p): p = os.path.join(SPR, sid.replace('mega', '') + '.png')  # e.g. Mega Staraptor has no sprite yet
        im = Image.open(p).convert('RGBA') if os.path.exists(p) else Image.new('RGBA', (96, 96), (0, 0, 0, 0))
        im.thumbnail((size, size), Image.LANCZOS); _sprites[key] = im
    return _sprites[key]

# Graph layout (pixel positions) and the order things appear.
N = {  # id: (label, x, y, kind)
 'alcremie': ('Alcremie', 760, 520, 'team'), 'garchompmegaz': ('Mega Garchomp Z', 1060, 520, 'team'),
 'torkoal': ('Torkoal', 900, 760, 'team'), 'farigiraf': ('Farigiraf', 700, 760, 'team'),
 'venusaur': ('Venusaur', 1120, 780, 'team'), 'kingambit': ('Kingambit', 640, 330, 'team'),
 'decorate': ('Decorate +2 Atk/SpA', 900, 400, 'move'), 'memento': ('Memento -2/-2', 360, 200, 'move'),
 'staraptormega': ('Mega Staraptor (Contrary)', 560, 140, 'mon'),
 'rillaboom': ('Rillaboom', 1500, 260, 'mon'), 'incineroar': ('Incineroar', 1600, 420, 'mon'),
 'archaludon': ('Archaludon', 1600, 590, 'mon'), 'charizardmegay': ('Mega Charizard Y', 1500, 760, 'mon'),
 'gholdengo': ('Gholdengo', 1330, 860, 'mon'), 'sylveon': ('Sylveon', 1300, 140, 'mon'),
 'sleep': ('Sleep (Venusaur, everywhere)', 300, 520, 'threat'),
 'indeedeef': ('Indeedee-F  Follow Me', 230, 700, 'mon'), 'sinistcha': ('Sinistcha  Rage Powder', 430, 840, 'mon'),
 'annihilape': ('Coaching (+Atk/Def, no SpA)', 560, 960, 'mon'),
}
STEPS = [
 dict(title='1  Seed', nodes=['alcremie', 'garchompmegaz', 'torkoal', 'farigiraf', 'venusaur', 'kingambit'],
      edges=[('alcremie', 'garchompmegaz', 'CORE'), ('farigiraf', 'torkoal', 'CORE')],
      say='The agent opens a fresh idea graph in FalkorDB, seeded with Alcremie and a partner.'),
 dict(title='2  What can boost a partner', nodes=['decorate', 'memento', 'staraptormega'],
      edges=[('alcremie', 'decorate', 'ENABLES'), ('decorate', 'garchompmegaz', 'ENABLES'), ('memento', 'staraptormega', 'SUPPORT')],
      say='From the game data, it indexes every move that can boost an ally. Decorate gives plus two attack and special attack. Stat drops flip into boosts on a Contrary partner.'),
 dict(title='3  What +2 actually buys', nodes=['rillaboom', 'incineroar', 'archaludon', 'charizardmegay', 'gholdengo'],
      edges=[('garchompmegaz', 'rillaboom', 'OHKO'), ('garchompmegaz', 'incineroar', 'OHKO'), ('garchompmegaz', 'archaludon', 'OHKO'),
             ('garchompmegaz', 'charizardmegay', 'OHKO'), ('garchompmegaz', 'gholdengo', 'NOT')],
      say='The damage calculator checks the payoff. With Decorate, Draco Meteor one shots Rillaboom, Incineroar, Archaludon and Mega Charizard Y. Without it, it does not.'),
 dict(title='4  The gap in the meta', nodes=['sleep'], edges=[('alcremie', 'sleep', 'GOOD')],
      say='Here is the gap. Sleep Powder is everywhere, and almost nothing answers it. Alcremie keeps itself and its partner awake.'),
 dict(title='5  What to play around', nodes=['indeedeef', 'sinistcha', 'sylveon'],
      edges=[('indeedeef', 'alcremie', 'BAD'), ('sinistcha', 'alcremie', 'BAD'), ('garchompmegaz', 'sylveon', 'BAD')],
      say='Every plan has counterplay. Follow Me and Rage Powder steal Decorate, so you lead around them. Fairy types ignore Draco Meteor.'),
 dict(title='6  Other supports', nodes=['annihilape'], edges=[('annihilape', 'decorate', 'SUPPORT')],
      say='Other supports exist, but none raises special attack, so none does this job.'),
]
TXT = {'OHKO': 'OHKO at +2', 'NOT': '2HKO at +2', 'BAD': 'counterplay', 'GOOD': 'Sweet Veil', 'CORE': 'core', 'SUPPORT': '', 'ENABLES': ''}

def tts(text, name):
    aiff, wav = os.path.join(OUT, name + '.aiff'), os.path.join(OUT, name + '.wav')
    subprocess.run(['say', '-v', 'Samantha', '-r', '185', '-o', aiff, text], check=True)
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', aiff, '-ar', '44100', '-ac', '1', wav], check=True)
    with wave.open(wav) as w: return wav, w.getnframes() / w.getframerate()

def ease(t): t = max(0.0, min(1.0, t)); return 1 - (1 - t) ** 3

def bg():
    im = Image.new('RGB', (W, H), BG); d = ImageDraw.Draw(im)
    for x in range(0, W, 60): d.line([(x, 0), (x, H)], fill=(24, 27, 40))
    for y in range(0, H, 60): d.line([(0, y), (W, y)], fill=(24, 27, 40))
    return im

def draw_graph(im, shown_nodes, shown_edges, pulse=None):
    d = ImageDraw.Draw(im, 'RGBA')
    for (a, b, k, p) in shown_edges:
        (xa, ya), (xb, yb) = N[a][1:3], N[b][1:3]
        xe, ye = xa + (xb - xa) * p, ya + (yb - ya) * p
        w = 8 if k in ('OHKO', 'CORE', 'BAD', 'GOOD') else 5
        d.line([(xa, ya), (xe, ye)], fill=COL[k] + (230,), width=w)
        if p >= 1 and TXT[k]:
            mx, my = (xa + xb) / 2, (ya + yb) / 2; f = font(22); tw = d.textlength(TXT[k], font=f)
            d.rounded_rectangle([mx - tw / 2 - 10, my - 16, mx + tw / 2 + 10, my + 16], 8, fill=(18, 20, 30, 220), outline=COL[k] + (255,), width=2)
            d.text((mx, my), TXT[k], font=f, fill=COL[k], anchor='mm')
    for nid, p in shown_nodes:
        label, x, y, kind = N[nid]; s = 0.4 + 0.6 * ease(p); r = int(62 * s)
        ring = YEL if kind == 'team' else (COL['BAD'] if kind == 'threat' else (COL['SUPPORT'] if kind == 'move' else (90, 100, 130)))
        if pulse == nid: d.ellipse([x - r - 14, y - r - 14, x + r + 14, y + r + 14], outline=ring + (120,), width=6)
        d.ellipse([x - r, y - r, x + r, y + r], fill=(30, 34, 50, 255), outline=ring + (255,), width=5)
        if kind in ('team', 'mon'):
            sp = sprite(nid, int(110 * s)); im.paste(sp, (int(x - sp.width / 2), int(y - sp.height / 2)), sp)
        elif kind == 'move':
            d.text((x, y), 'MOVE', font=font(int(24 * s)), fill=COL['SUPPORT'], anchor='mm')
        else:
            d.text((x, y), 'Zz', font=font(int(44 * s)), fill=COL['BAD'], anchor='mm')
        if p > 0.5:
            f = font(24); d.text((x, y + r + 22), label, font=f, fill=INK, anchor='mm', stroke_width=3, stroke_fill=BG)

def caption(im, title, text):
    d = ImageDraw.Draw(im, 'RGBA')
    d.rectangle([0, 0, W, 90], fill=(10, 11, 18, 235))
    d.text((40, 45), 'GIMMIKGHOUL', font=font(40), fill=YEL, anchor='lm')
    d.text((W - 40, 45), title, font=font(34), fill=INK, anchor='rm')
    if text:
        d.rectangle([0, H - 110, W, H], fill=(10, 11, 18, 225))
        d.text((W / 2, H - 55), text, font=font(30, False), fill=INK, anchor='mm')

def card(lines, logo=False, bgimg=None, zoom=1.0):
    if bgimg:
        b = Image.open(bgimg).convert('RGB'); s = max(W / b.width, H / b.height) * zoom
        b = b.resize((int(b.width * s), int(b.height * s)), Image.LANCZOS)
        im = b.crop(((b.width - W) // 2, (b.height - H) // 2, (b.width - W) // 2 + W, (b.height - H) // 2 + H))
        im = Image.blend(im, Image.new('RGB', (W, H), BG), 0.55)
    else: im = bg()
    d = ImageDraw.Draw(im)
    if logo:
        lg = Image.open(os.path.join(ROOT, 'brand/gimmighoul-smug.webp')).convert('RGBA'); lg.thumbnail((360, 360))
        im.paste(lg, (W // 2 - lg.width // 2, 150), lg)
    y0 = 560 if logo else H // 2 - 40 * len(lines)
    for i, (t, size, col) in enumerate(lines):
        d.text((W / 2, y0 + i * (size + 28)), t, font=font(size), fill=col, anchor='mm', stroke_width=3 if bgimg else 0, stroke_fill=BG)
    return im

def main():
    hero = os.path.join(ROOT, 'brand/gimmikghoul-hero.png')
    scenes = [
     ('title', 'Gimmikghoul. Find your favourite Pokemon a job in the meta.', lambda t: card([('GIMMIKGHOUL', 120, YEL), ('find your favourite Pokémon a job in the meta', 44, INK)], logo=True)),
     ('problem', 'Bots can now beat top players at Pokemon battles. None of them can tell you whether your favourite has a place in the meta.',
      lambda t: card([('Bots win battles now.', 70, INK), ('Nobody tells you where your favourite fits.', 52, YEL)], bgimg=hero, zoom=1.0 + 0.08 * t)),
     ('ask', 'So we ask an agent, with a FalkorDB graph of the whole meta. I like Alcremie. Nobody runs it. Where does it have a job?',
      lambda t: ask_card(t)),
    ]
    for i, st in enumerate(STEPS): scenes.append(('step%d' % i, st['say'], ('graph', i)))
    scenes += [
     ('payoff', 'This is the core London Faust took to top sixteen at Louisville Regionals. The graph got there from the data.',
      lambda t: card([('Louisville Regionals, top 16', 64, YEL), ('Alcremie + Mega Garchomp Z + Trick Room Torkoal', 46, INK), ('The graph got there from the data.', 44, MUTED)])),
     ('formula', 'A new idea scores well when a common hole meets a rare enabler with a real payoff.',
      lambda t: card([('idea  ≈  hole × rare enabler × payoff', 66, YEL), ('÷ turns and slots it costs', 48, INK), ('counterplay is what you learn to play around', 38, MUTED)])),
     ('end', 'Gimmikghoul. Built on FalkorDB.', lambda t: card([('GIMMIKGHOUL', 110, YEL), ('Built on FalkorDB  ·  Cypher  ·  graph algorithms  ·  MCP', 40, INK), ('github.com/shivraj-S-bhatti/pokemon-battle-lab', 36, MUTED)], logo=True)),
    ]
    ff = subprocess.Popen(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                           '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', os.path.join(OUT, 'video_only.mp4')], stdin=subprocess.PIPE)
    audio = []; nodes_done, edges_done = [], []
    for name, text, render in scenes:
        wav, dur = tts(text, name); dur = max(dur + 0.8, 3.5); audio.append((wav, dur))
        frames = int(dur * FPS)
        if isinstance(render, tuple):
            st = STEPS[render[1]]
            for f in range(frames):
                t = f / FPS; im = bg()
                nshow = [(n, 1.0) for n in nodes_done] + [(n, ease((t - 0.25 * k) / 0.6)) for k, n in enumerate(st['nodes']) if t >= 0.25 * k]
                base = 0.25 * len(st['nodes']) + 0.3
                eshow = [e + (1.0,) for e in edges_done] + [(a, b, k, ease((t - base - 0.35 * j) / 0.7)) for j, (a, b, k) in enumerate(st['edges']) if t >= base + 0.35 * j]
                draw_graph(im, nshow, eshow, pulse=st['nodes'][0] if t < 1.2 else None)
                caption(im, st['title'], subtitle(st['say'], t, dur))
                ff.stdin.write(im.tobytes())
            nodes_done += st['nodes']; edges_done += st['edges']
        else:
            for f in range(frames):
                im = render(f / max(frames - 1, 1)); ff.stdin.write(im.convert('RGB').tobytes())
    ff.stdin.close(); ff.wait()
    lst = os.path.join(OUT, 'audio.txt')
    with open(lst, 'w') as fh:
        for wav, dur in audio: fh.write(f"file '{wav}'\noutpoint {dur:.3f}\n")
    pads = []
    for i, (wav, dur) in enumerate(audio):
        pw = os.path.join(OUT, f'pad{i}.wav')
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', wav, '-af', f'apad=whole_dur={dur:.3f}', '-ar', '44100', '-ac', '1', pw], check=True); pads.append(pw)
    with open(lst, 'w') as fh:
        for pw in pads: fh.write(f"file '{pw}'\n")
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, os.path.join(OUT, 'voice.wav')], check=True)
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', os.path.join(OUT, 'video_only.mp4'), '-i', os.path.join(OUT, 'voice.wav'),
                    '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-shortest', os.path.join(OUT, 'gimmikghoul.mp4')], check=True)
    print(os.path.join(OUT, 'gimmikghoul.mp4'), round(sum(d for _, d in audio), 1), 's')

def subtitle(text, t, dur):
    words = text.split(); n = max(1, int(len(words) * min(1, (t + 0.4) / dur)))
    line = ' '.join(words[:n]); return line if len(line) < 95 else '…' + line[-92:]

def ask_card(t):
    im = bg(); d = ImageDraw.Draw(im, 'RGBA')
    msg = 'I like Alcremie. Nobody runs it. Where does it have a job?'
    n = int(len(msg) * min(1, t * 1.6))
    d.rounded_rectangle([260, 380, 1660, 640], 30, fill=(32, 36, 54), outline=YEL, width=4)
    d.text((320, 430), 'you → agent', font=font(32), fill=MUTED)
    d.text((320, 520), msg[:n] + ('▌' if n < len(msg) else ''), font=font(52), fill=INK)
    sp = sprite('alcremie', 200); im.paste(sp, (1460, 170), sp)
    d.text((W / 2, 760), 'agent + FalkorDB graph of species, moves, abilities, usage, teammates', font=font(34, False), fill=MUTED, anchor='mm')
    return im

if __name__ == '__main__':
    main()
