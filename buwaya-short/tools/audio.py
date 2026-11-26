# Original score + synthesized SFX + mix for "Ang Tunay na Buwaya". All sound is generated here (numpy), no samples.
import sys, numpy as np
sys.path.insert(0, "tools")
from dsp import reson, SR, TAU, ns, tt, rng, lp, hp, bp, colored, fades, place, pan, widen, phase, make_ir, convolve_st, integrated, true_peak, read_wav, write_wav, dbg
from instruments import m2f, brass, glock, vibes, pluck, snare, cymbal, timpani, brush, triangle
from sfx_gen import whoosh, bubbles, splash_big, water_bed, clink, rattle

DUR = 74.0
N = ns(DUR)
R = rng(7)

# ============================================================ MUSIC
BPM = 112.0; B = 60.0 / BPM
music = np.zeros((2, N))
# sections: (start, end, intensity) ; the groove restarts its bar grid at each start
SECTIONS = [(0.0, 4.96, 0.55), (4.96, 10.86, 1.0), (10.86, 19.9, 1.1), (19.9, 30.82, 1.15), (30.82, 40.48, 1.0),
            (44.14, 48.56, 0.6), (48.56, 50.96, 1.15), (50.96, 56.26, 0.9), (56.26, 71.06, 1.1)]
CHORDS = [[50, 53, 57], [50, 53, 57], [55, 58, 62], [57, 61, 64]]  # Dm Dm Gm A7 (roots D3, G3, A3)
BASS = [[38, 45, 50, 45], [38, 45, 50, 49], [43, 50, 55, 50], [45, 52, 49, 45]]
MEL = [[(0, 74, .5), (1, 77, .5), (1.5, 76, .5), (2, 77, .5), (3, 81, .9)],
       [(0, 80, .5), (.5, 81, .5), (2, 77, .5), (3, 74, .9)],
       [(0, 79, .5), (1, 82, .5), (1.5, 81, .5), (2, 79, .5), (3, 77, .9)],
       [(0, 76, .5), (1, 73, .5), (2, 76, .5), (3, 69, .9)]]

def env_cut(x, t0, t_end):
    """truncate a note that would ring past a section end"""
    n = ns(max(0.0, t_end - t0))
    if n < x.shape[-1]:
        x = x.copy(); fl = min(n, ns(0.03)); x[..., n - fl:n] *= np.linspace(1, 0, fl); x[..., n:] = 0
    return x

for si, (s0, s1, k) in enumerate(SECTIONS):
    nbars = int(np.ceil((s1 - s0) / (4 * B)))
    for bar in range(nbars):
        c = bar % 4
        for beat in range(4):
            t = s0 + (bar * 4 + beat) * B
            if t >= s1: break
            # walking pizz bass on every beat
            place(music, env_cut(pan(pluck(m2f(BASS[c][beat]), 0.9, R, 0.6, 0.35), -0.15), t, s1), t, 0.55 * k)
            # tuba on 1 and 3
            if beat in (0, 2) and k > 0.7:
                place(music, env_cut(pan(brass(m2f(BASS[c][beat] - 12 + 12), B * 0.6, 0.55, R, "tuba"), 0.0), t, s1), t, 0.22 * k)
            # offbeat staccato chord (pizz) on the "and"
            if k > 0.7:
                ta = t + B / 2
                if ta < s1:
                    for m in CHORDS[c]:
                        place(music, pan(pluck(m2f(m + 12), 0.45, R, 0.25, 0.55), 0.35), ta, 0.16 * k)
            # brushes: 2 and 4 + light ticks
            if k > 0.7:
                if beat in (1, 3): place(music, pan(brush(0.7, R), 0.2), t, 0.5 * k)
                place(music, pan(hp(brush(0.25, R, 0.08), 6000), -0.3), t + B / 2, 0.35 * k)
        # melody: bell for the first 8 bars of a section, then horn answers
        if k >= 1.0 and (bar % 8) < 8:
            inst = glock if (bar // 4) % 2 == 0 else vibes
            for (b, m, d) in MEL[c]:
                t = s0 + (bar * 4 + b) * B
                if t >= s1 - 0.05: continue
                x = inst(m2f(m), 0.55, R) if inst is glock else vibes(m2f(m - 12), 0.6, R, 1.2)
                place(music, env_cut(pan(x, 0.25), t, s1), t, 0.2 * k)
# money stab + rising counter arpeggio while projects pop
for t in (19.9, 20.04):
    for m in (50, 57, 62): place(music, pan(brass(m2f(m), 0.25, 0.85, R, "stab"), 0.0), t, 0.18)
for i, t in enumerate(np.linspace(11.3, 18.7, 24)):
    place(music, pan(glock(m2f(74 + (i % 8) + (i // 8) * 2), 0.4, R, 0.6), 0.4), t, 0.08)
# shock stab (judge CU) + final sting
for m in (49, 55, 58): place(music, pan(brass(m2f(m), 0.5, 0.9, R, "stab", fall=-3), 0.0), 47.3, 0.2)
place(music, timpani(m2f(38), 0.9, R, 2.6), 71.38, 0.7)
place(music, widen(cymbal(0.7, R, 2.6), R), 71.38, 0.35)
for m in (38, 45, 50, 53): place(music, pan(brass(m2f(m), 1.6, 0.9, R, "tuba" if m < 45 else "horn"), 0.0), 71.38, 0.2)
for i, m in enumerate((62, 65, 69, 74)): place(music, pan(glock(m2f(m), 0.6, R), 0.3), 71.06 + i * 0.08, 0.12)

# small room reverb on music
ir = make_ir(1.1, 3, hf=0.6)
music = music + 0.18 * convolve_st(music, ir)[:, :N]

# ============================================================ SFX
sfx = np.zeros((2, N))
def S(x, t, g=1.0, p=0.0):
    place(sfx, pan(x, p) if np.ndim(x) == 1 else x, t, g)

def boing(f0=220, dur=0.5):
    t = tt(dur); f = f0 * (1 + 0.6 * np.exp(-t / 0.06)) * (1 + 0.12 * np.sin(TAU * 18 * t) * np.exp(-t / 0.25))
    return fades(np.sin(phase(f)) * np.exp(-t / 0.18), 0.002, 0.05)
def pop(f0=900):
    t = tt(0.09); f = f0 * (1 + 1.5 * np.exp(-t / 0.01))
    return fades(np.sin(phase(f)) * np.exp(-t / 0.025) + 0.3 * hp(R.standard_normal(len(t)), 2000) * np.exp(-t / 0.004), 0.0005, 0.02)
def thump(f0=70, dur=0.35, click=0.5):
    t = tt(dur); y = np.sin(phase(f0 * (1 + 1.2 * np.exp(-t / 0.02)))) * np.exp(-t / 0.09)
    return fades(y + click * bp(R.standard_normal(len(t)), 800, 5000, 1) * np.exp(-t / 0.008), 0.0005, 0.05)
def knock():
    t = tt(0.25); y = sum(a * np.sin(TAU * f * t) * np.exp(-t / d) for f, a, d in [(520, 1, 0.05), (1180, 0.5, 0.03), (2300, 0.3, 0.015)])
    return fades(y + 0.4 * bp(R.standard_normal(len(t)), 1000, 6000, 1) * np.exp(-t / 0.004), 0.0003, 0.03)
def ding(f=2093):
    return glock(f, 0.8, R, 1.4) + 0.5 * glock(f * 1.5, 0.6, R, 1.4)
def sparkle(dur=0.9):
    y = np.zeros(ns(dur + 1))
    for i in range(9): place_m(y, glock(m2f(84 + [0, 4, 7, 12, 16, 19, 24, 19, 24][i]), 0.5, R, 0.8), i * dur / 9)
    return y
def place_m(buf, x, t):
    i = ns(t); b = min(len(buf), i + len(x)); buf[i:b] += x[: b - i]
def scratch():
    t = tt(0.45); f = 300 + 900 * np.abs(np.sin(TAU * 3.2 * t)) ** 0.7
    y = bp(R.standard_normal(len(t)), 400, 5000, 1) * (0.5 + 0.5 * np.sin(phase(f)))
    return fades(y * np.exp(-t / 0.3), 0.002, 0.08)
def crickets(dur):
    t = tt(dur); y = np.zeros(len(t))
    for f, rate, ph in [(4300, 2.6, 0), (4700, 3.1, 1.3), (5100, 2.2, 2.0)]:
        gate = (np.sin(TAU * rate * t + ph) > 0.55).astype(float)
        chirp = (np.sin(TAU * 32 * t) > 0).astype(float)
        y += np.sin(TAU * f * t) * lp(gate * chirp, 300, 1) * 0.3
    return fades(y, 0.3, 0.4)
def clang():
    t = tt(2.2); y = np.zeros(len(t))
    for f, a, d in [(196, 1, 0.9), (452, 0.7, 0.6), (731, 0.5, 0.5), (1210, 0.35, 0.35), (1680, 0.25, 0.25), (2510, 0.15, 0.15)]:
        y += a * np.sin(TAU * f * t + R.uniform(0, 6)) * np.exp(-t / d)
    y += bp(R.standard_normal(len(t)), 300, 6000, 1) * np.exp(-t / 0.03) * 1.2
    return fades(y * 0.5, 0.0005, 0.2)
def paper(dur=0.12):
    t = tt(dur); return fades(bp(R.standard_normal(len(t)), 1500, 9000, 1) * np.sin(np.pi * t / dur) ** 2, 0.001, 0.01)
def step_grass():
    t = tt(0.18); return fades(lp(R.standard_normal(len(t)), 1800, 1) * np.exp(-t / 0.05) + 0.4 * bp(R.standard_normal(len(t)), 2000, 7000, 1) * np.exp(-t / 0.03), 0.001, 0.02)
def ghost_woo(dur=1.6, f0=520):
    t = tt(dur); f = f0 * (1 - 0.35 * t / dur) * (1 + 0.04 * np.sin(TAU * 5.5 * t))
    src = np.sin(phase(f)) + 0.3 * np.sin(2 * phase(f)) + 0.05 * R.standard_normal(len(t))
    y = bp(src, 250, 1400, 1) * np.sin(np.pi * t / dur) ** 1.2
    return fades(y, 0.05, 0.1)
def horn():
    t = tt(0.75); y = np.zeros(len(t))
    for f in (392, 494):
        y += np.sign(np.sin(TAU * f * t)) * 0.3
    y = lp(y, 2500, 2) * np.where(t < 0.3, 1.0, np.where(t < 0.38, 0.0, 1.0)) * (t < 0.72)
    return fades(y, 0.005, 0.03)
def engine(dur=2.3):
    t = tt(dur); f = 38 + 26 * np.clip(t / 0.6, 0, 1) - 4 * np.sin(t * 2)
    saw = 2 * ((np.cumsum(f / SR)) % 1) - 1
    return fades(lp(saw, 500, 2) * 0.6 + lp(R.standard_normal(len(t)), 200) * 0.2, 0.2, 0.4)
def coin_shower(dur=1.6, rate=40):
    y = np.zeros(ns(dur + 0.3)); tm = 0
    while tm < dur:
        place_m(y, clink(R, R.uniform(2500, 6000), 0.12) * R.uniform(0.3, 1) * (1 - tm / dur * 0.6), tm); tm += R.exponential(1 / rate)
    return y
def cha_ching():
    y = np.zeros(ns(1.6)); place_m(y, thump(160, 0.15, 1.0) * 0.6, 0); place_m(y, ding(2637), 0.08); place_m(y, coin_shower(0.6, 50) * 0.6, 0.1); return y

wh = lambda d=0.5, p=0.25: whoosh(d, R, p, 300, 2400, 0.9, 0.18)

# --- event table (times on the voice clock)
S(bubbles(1.0, R, 22, 300, 1400), 0.25, 0.55)
S(widen(whoosh(0.7, R, 0.35, 150, 900, 1.0, 0.2), R), 0.9, 0.35)
S(water_bed(1.6, R, 1.2, 2.5) * np.linspace(1, 0.2, ns(1.6)), 1.0, 0.35)
for tc in (1.86, 2.02): S(knock() * 1.2 + thump(110, 0.25, 0.9) * 0.6, tc, 0.75)
for tc in (2.96, 3.1, 3.24): S(hp(knock(), 2500), tc, 0.4)
S(splash_big(R), 3.42, 0.6); S(widen(whoosh(0.5, R, 0.25, 300, 2000, 0.8, 0.12), R), 3.45, 0.35)
S(thump(75, 0.35, 0.7), 3.95, 0.7)
for i, tc in enumerate(np.arange(4.12, 4.95, 0.34)): S(step_grass(), tc, 0.55, (-0.3, 0.3)[i % 2])
S(thump(55, 0.5, 0.4) + 0.5 * lp(R.standard_normal(ns(0.5)), 600) * np.exp(-tt(0.5) / 0.08), 5.2, 0.75)
S(boing(140, 0.45), 5.22, 0.25)
S(sparkle(0.6), 7.0, 0.4)
for i, m in enumerate((67, 74)): S(brass(m2f(m), 0.22 if i == 0 else 0.5, 0.8, R, "horn"), 7.02 + i * 0.16, 0.18)
S(ding(2349), 10.45, 0.45); S(sparkle(0.5), 10.5, 0.3)
S(widen(whoosh(0.4, R, 0.3, 400, 2200, 0.8, 0.08), R), 33.85, 0.3)
def ha(f0=210, dur=0.17):
    t = tt(dur); f = f0 * (1 - 0.25 * t / dur)
    pulses = (np.sin(phase(f)) > 0.97).astype(float) * 1.0
    src = pulses + 0.35 * R.standard_normal(len(t)) * np.exp(-t / 0.03)
    y = sum(g * reson(src, fr, q) for fr, g, q in [(780, 1.0, 6), (1200, 0.7, 7), (2550, 0.3, 9)])
    return fades(y * np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 0.7, 0.005, 0.03)
for i, tc in enumerate(np.arange(59.98, 61.5, 0.19)): S(ha(230 - i * 6), tc, 0.5)
for tc in np.arange(62.6, 67.2, 0.75): S(splash_big(R) * 0.25, tc + R.uniform(0, 0.2), 0.3, R.uniform(-0.6, 0.6))
S(ding(1760), 70.25, 0.4)
for t in (4.9, 10.8, 19.82, 30.75, 50.9, 56.2, 59.76, 62.48, 65.0, 67.2):
    S(widen(wh(0.45, 0.32), R), t - 0.12, 0.45)
S(knock(), 5.05, 0.6); S(knock(), 5.25, 0.5)
S(sparkle(0.9), 8.52, 0.5)
S(widen(whoosh(0.6, R, 0.4, 500, 3000, 0.7, 0.1), R), 10.0, 0.4); S(thump(90, 0.3, 0.8), 10.55, 0.5)
pops = np.sort(11.3 + 7.4 * (R.random(46) ** 0.75))
for i, t in enumerate(pops): S(pop(700 + R.uniform(-150, 500)), t, 0.32 * (1 - i / 80), R.uniform(-0.6, 0.6))
S(cha_ching(), 20.0, 0.75)
for i in range(5): S(widen(whoosh(0.35, R, 0.12, 400, 1800, 0.8, 0.12), R), 23.35 + i * 0.05, 0.25)
S(boing(330), 23.52, 0.45)
S(widen(whoosh(0.8, R, 0.5, 300, 1600, 0.8, 0.2), R), 28.1, 0.45)
S(coin_shower(1.8, 55), 28.9, 0.55); S(cha_ching(), 29.05, 0.5)
S(thump(65, 0.4, 1.0), 34.52, 0.9); S(knock(), 34.53, 0.4)
for i in range(12): S(paper(0.1), 36.85 + i * 0.09, 0.35, R.uniform(-0.4, 0.4))
for i, t in enumerate(np.arange(38.75, 40.4, 0.39)): S(step_grass(), t, 0.5, (-0.3, 0.3)[i % 2]); S(step_grass(), t + 0.13, 0.35)
S(scratch(), 40.4, 0.7)
S(crickets(3.7), 40.55, 0.18)
S(clang(), 43.3, 0.6); S(thump(80, 0.3, 0.6), 43.33, 0.5)
S(pop(1100), 44.2, 0.45); S(ding(1568), 44.25, 0.3)
S(boing(180, 0.6), 47.25, 0.4)
S(lp(colored(ns(1.0), R, 2.0), 120, 2) * np.sin(np.pi * tt(1.0)), 48.8, 0.8)
S(water_bed(2.6, R, 1.4, 2.0) * np.linspace(0.2, 1, ns(2.6)), 48.9, 0.45)
S(splash_big(R), 49.35, 0.55); S(widen(whoosh(1.2, R, 0.6, 200, 1500, 1.0, 0.4), R), 49.0, 0.5)
for i, t in enumerate((51.3, 52.1, 52.9, 53.7, 54.6, 55.4)): S(ghost_woo(1.5, 480 + (i % 3) * 70), t, 0.3, (-0.5, 0.5, 0)[i % 3])
S(lp(colored(ns(3.6), R, 1.5), 900, 1) * 0.12 + 0.08 * np.sin(TAU * 100 * tt(3.6)), 56.26, 0.4)
S(thump(70, 0.3, 1.0), 58.48, 0.5); S(thump(70, 0.3, 1.0), 58.95, 0.4)
S(widen(whoosh(0.3, R, 0.2, 800, 3000, 0.6, 0.06), R), 61.6, 0.35); S(sparkle(0.6), 61.84, 0.45)
S(water_bed(4.8, R, 1.2, 1.6), 62.54, 0.4)
for t in (62.7, 63.6, 64.3): S(splash_big(R) * 0.4, t, 0.35, R.uniform(-0.5, 0.5))
S(engine(2.3), 65.0, 0.45); S(horn(), 66.36, 0.5); S(splash_big(R), 66.0, 0.45)
S(paper(0.3), 67.3, 0.3)
S(widen(whoosh(0.5, R, 0.25, 300, 2000, 0.9, 0.1), R), 71.15, 0.45)

# ============================================================ MIX
voice, vsr = read_wav("audio/voice.wav"); voice = voice[0]
assert vsr == SR
vbuf = np.zeros(N); vbuf[: min(N, len(voice))] = voice[:N]
# duck music under the voice (smoothed envelope)
from scipy.ndimage import uniform_filter1d
env = np.sqrt(np.maximum(uniform_filter1d(vbuf ** 2, ns(0.05)), 0))
gate = np.clip((20 * np.log10(env + 1e-9) + 45) / 12, 0, 1)
gate = uniform_filter1d(gate, ns(0.25))
duck = dbg(-7.0 * gate)
# fix levels: voice target ~ -16 LUFS, music ~ -27 (pre-duck), sfx peaks below voice
vI = integrated(vbuf); mI = integrated(music);
vbuf *= dbg(-16.0 - vI)
music *= dbg(-23.5 - mI)
from dsp import momentary_max
from scipy.ndimage import maximum_filter1d, minimum_filter1d
sfx *= dbg(momentary_max(np.stack([vbuf, vbuf])) - 5.0 - momentary_max(sfx))
mix = np.stack([vbuf, vbuf]) + music * duck + sfx
I = integrated(mix); mix *= dbg(-14.0 - I)
# look-ahead peak limiter at -1 dBFS (centred windows = ~5 ms look-ahead)
thr = dbg(-1.0)
pk = maximum_filter1d(np.max(np.abs(mix), axis=0), ns(0.01))
g = np.minimum(1.0, thr / np.maximum(pk, 1e-9))
g = uniform_filter1d(minimum_filter1d(g, ns(0.01)), ns(0.006))
g = np.minimum(g, uniform_filter1d(g, ns(0.08)) + 0.0)  # gentle release
mix *= g
mix = np.clip(mix, -thr, thr)
# fade out tail
fo = ns(0.4); mix[:, -fo:] *= np.linspace(1, 0, fo)
write_wav("audio/mix.wav", mix)
write_wav("audio/stem_music.wav", music * duck); write_wav("audio/stem_sfx.wav", sfx)
print(f"mix: {integrated(mix):.1f} LUFS, peak {20*np.log10(np.max(np.abs(mix))):.1f} dBFS, {mix.shape[1]/SR:.2f}s")
