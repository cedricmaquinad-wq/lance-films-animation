# Original score + synthesized SFX + mix for "Ang Tunay na Buwaya". All sound is generated here (numpy), no samples.
import sys, numpy as np
sys.path.insert(0, "tools")
from dsp import reson, SR, TAU, ns, tt, rng, lp, hp, bp, colored, fades, place, pan, widen, phase, make_ir, convolve_st, integrated, true_peak, read_wav, write_wav, dbg
from instruments import m2f, brass, glock, vibes, pluck, snare, cymbal, timpani, brush, triangle
from sfx_gen import whoosh, bubbles, splash_big, water_bed, clink, rattle

DUR = 84.42
N = ns(DUR)
R = rng(7)

# ============================================================ MUSIC
BPM = 112.0; B = 60.0 / BPM
music = np.zeros((2, N))
# sections: (start, end, intensity) ; the groove restarts its bar grid at each start
SECTIONS = [(0.0, 2.26, 0.6), (2.26, 6.42, 1.1), (6.48, 11.58, 1.0), (11.58, 28.04, 1.0), (28.04, 33.76, 0.6),
            (33.76, 48.84, 1.1), (48.84, 56.38, 0.6), (56.38, 72.26, 1.15), (72.26, 77.8, 0.55)]
BPM = 116.0; B = 60.0 / BPM
CHORDS = [[53, 57, 60], [50, 53, 57], [46, 50, 53], [48, 52, 55]]  # F Dm Bb C
BASS = [[41, 48, 53, 48], [38, 45, 50, 45], [46, 41, 46, 50], [48, 43, 48, 52]]
MEL = [[(0, 72, .5), (0.5, 74, .5), (1, 77, .5), (2, 76, .5), (3, 72, .9)],
       [(0, 74, .5), (1, 77, .5), (1.5, 76, .5), (2, 74, .5), (3, 69, .9)],
       [(0, 70, .5), (1, 74, .5), (2, 77, .5), (2.5, 79, .5), (3, 77, .9)],
       [(0, 76, .5), (1, 79, .5), (2, 76, .5), (3, 72, .9)]]

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
for m in (53, 60, 65): place(music, pan(brass(m2f(m), 0.3, 0.85, R, "stab"), 0.0), 2.26, 0.16)
for i, t in enumerate(np.linspace(6.48, 11.4, 20)): place(music, pan(vibes(m2f(72 + [0, 4, 7, 12, 7][i % 5]), 0.5, R, 1.2), 0.3), t, 0.08)
for m in (53, 57, 60): place(music, pan(brass(m2f(m), 0.6, 0.7, R, "horn"), 0.0), 72.3, 0.12)

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

# --- event table (voice clock)
def ha(f0=210, dur=0.17):
    t = tt(dur); f = f0 * (1 - 0.25 * t / dur)
    pulses = (np.sin(phase(f)) > 0.97).astype(float)
    src = pulses + 0.35 * R.standard_normal(len(t)) * np.exp(-t / 0.03)
    y = sum(g * reson(src, fr, q) for fr, g, q in [(780, 1.0, 6), (1200, 0.7, 7), (2550, 0.3, 9)])
    return fades(y * np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 0.7, 0.005, 0.03)
def crowd(dur, amp=1.0):
    t = tt(dur); env = np.minimum(1, t / 0.3) * np.minimum(1, (dur - t) / 0.8)
    y = bp(R.standard_normal(len(t)), 300, 3000, 1) * (0.6 + 0.4 * np.abs(np.sin(TAU * 2.3 * t))) * env * 0.5
    for k in range(int(dur * 9)): place_m(y, bp(R.standard_normal(ns(0.03)), 800, 5000, 1) * np.exp(-tt(0.03) / 0.008), R.uniform(0, dur - 0.05))
    return y * amp
def whistle(dur=0.6):
    t = tt(dur); f = 2900 + 120 * np.sign(np.sin(TAU * 28 * t))
    return fades(np.sin(phase(f)) * 0.6 + 0.08 * bp(R.standard_normal(len(t)), 2000, 6000, 1), 0.01, 0.05)
def sad_trombone(t0):
    for i, m in enumerate((58, 57, 56)): S(brass(m2f(m - 12), 0.32, 0.8, R, "horn"), t0 + i * 0.36, 0.25)
    S(brass(m2f(43), 0.9, 0.8, R, "horn", fall=-2), t0 + 1.08, 0.25)
def snip():
    y = np.zeros(ns(0.3)); place_m(y, hp(knock(), 3000), 0); place_m(y, hp(knock(), 3500), 0.09); return y
def riser(dur):
    t = tt(dur); f = 300 * (1 + 4 * (t / dur) ** 2)
    return fades((np.sin(phase(f)) * 0.3 + 0.2 * bp(R.standard_normal(len(t)), 1000, 8000, 1)) * (t / dur) ** 1.5, 0.05, 0.05)
for t in (2.18, 4.42, 6.4, 11.5, 16.2, 18.55, 20.7, 27.96, 33.7, 39.25, 48.78, 56.3, 61.95, 72.2):
    S(widen(wh(0.45, 0.32), R), t - 0.08, 0.4)
S(pop(800), 0.05, 0.6); S(ding(1568), 0.1, 0.4)
S(crowd(4.0), 2.3, 0.5, 0.0)
S(pop(500) * 1.5, 2.98, 0.6); S(coin_shower(0.8, 40) * 0.3, 3.0, 0.3)
S(sparkle(0.8), 4.95, 0.4); S(riser(1.2), 5.2, 0.3); S(ding(2093), 6.42, 0.5)
S(crowd(5.0, 0.6), 6.5, 0.3)
for i, t in enumerate(np.arange(6.6, 11.4, 0.36)): S(step_grass(), t, 0.25, (-0.4, 0.4)[i % 2])
S(pop(900), 12.25, 0.5); S(snip(), 13.86, 0.6); S(crowd(1.5, 0.8), 13.95, 0.35); S(cha_ching(), 14.8, 0.6)
S(whistle(0.55), 16.6, 0.45); S(boing(200, 0.5), 16.8, 0.35)
for i, t in enumerate((22.2, 23.44, 24.56, 25.6, 26.62)): S(pop(600 + i * 120), t - 0.03, 0.55); S(ding(1760 + i * 180), t + 0.05, 0.22)
S(crowd(5.6, 0.5), 28.1, 0.25); S(thump(70, 0.4, 0.6), 31.2, 0.5); sad_trombone(32.4)
for i in range(3): S(pop(700 + i * 150), 34.73 + i * 0.3, 0.5); S(thump(90, 0.2, 0.5), 34.76 + i * 0.3, 0.3)
S(coin_shower(0.9, 45), 42.8, 0.5); S(ding(2349), 42.9, 0.35)
S(cha_ching(), 46.2, 0.65); S(boing(300, 0.5), 46.3, 0.35)
for t in np.arange(49.0, 53.0, 0.4): S(whoosh(0.18, R, 0.08, 1500, 6000, 0.6, 0.04), t, 0.25)
S(thump(70, 0.35, 0.6), 52.75, 0.5); sad_trombone(54.0)
S(engine(1.6), 56.4, 0.4); S(horn(), 57.45, 0.4)
S(cha_ching(), 59.45, 0.6)
for k in range(6): S(thump(110, 0.2, 0.5), 60.2 + k * 0.18, 0.35)
for i, t in enumerate(np.arange(60.8, 61.9, 0.19)): S(ha(260 - i * 4), t, 0.35)
for k in range(10): S(pop(500 + k * 60), 68.4 + k * 0.08, 0.3, R.uniform(-0.5, 0.5))
S(riser(1.6), 69.8, 0.35); S(sparkle(0.9), 71.4, 0.4)
for t in (8.2, 9.88, 13.86, 23.44, 25.6, 31.08, 36.18, 42.54, 45.86, 51.9, 54.6, 58.54, 60.76, 65.96, 68.46, 70.48, 74.84):
    S(widen(whoosh(0.3, R, 0.18, 600, 3200, 0.7, 0.07), R), t - 0.12, 0.2)
S(crickets(5.4), 72.4, 0.12); S(ding(1397), 73.44, 0.25); S(ding(1760), 76.76, 0.35)

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
import os
ob = np.zeros((2, N))
if os.path.exists("audio/outro_bus.wav"):
    o, _ = read_wav("audio/outro_bus.wav"); i0 = ns(77.92); L = min(o.shape[1], N - i0); ob[:, i0:i0 + L] = o[:, :L]
    ob *= dbg(-24.0 - integrated(ob[:, i0:]))
mix = np.stack([vbuf, vbuf]) + music * duck + sfx + ob * duck
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
