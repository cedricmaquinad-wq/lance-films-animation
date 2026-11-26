import sys, numpy as np
sys.path.insert(0, "tools")
from dsp import SR, TAU, ns, tt, rng, lp, hp, bp, fades, place, pan, widen, phase, integrated, write_wav, dbg
from instruments import m2f, brass, glock, pluck, cymbal, brush, timpani
from sfx_gen import whoosh, clink
R = rng(11); DUR = 6.5; N = ns(DUR); buf = np.zeros((2, N))
def S(x, t, g=1.0, p=0.0): place(buf, pan(x, p) if np.ndim(x) == 1 else x, t, g)
def pop(f0=900):
    t = tt(0.09); f = f0 * (1 + 1.5 * np.exp(-t / 0.01)); return fades(np.sin(phase(f)) * np.exp(-t / 0.025), 0.0005, 0.02)
def tick(f=2400):
    t = tt(0.05); return fades(np.sin(TAU * f * t) * np.exp(-t / 0.012) + 0.3 * hp(R.standard_normal(len(t)), 3000) * np.exp(-t / 0.004), 0.0003, 0.01)
def thump(f0=70, dur=0.35):
    t = tt(dur); return fades(np.sin(phase(f0 * (1 + 1.2 * np.exp(-t / 0.02)))) * np.exp(-t / 0.09), 0.0005, 0.05)
# bouncy pizz groove (D major, 120 bpm) under everything
B = 0.5
bass = [50, 57, 55, 57, 50, 57, 54, 57]
for i in range(int(DUR / B)):
    t = i * B
    if t > 6.0: break
    S(pluck(m2f(bass[i % 8] - 12), 0.8, R, 0.5, 0.4), t, 0.35, -0.1)
    S(brush(0.5, R), t + B / 2, 0.25, 0.2)
# logo pop + cta whoosh
S(pop(700), 0.18, 0.6); S(pop(1000), 0.25, 0.4)
S(widen(whoosh(0.45, R, 0.25, 400, 2600, 0.8, 0.1), R), 0.45, 0.4)
# confetti hit on the Follow press
S(thump(60, 0.6), 4.12, 0.9); S(widen(cymbal(0.7, R, 2.0), R), 4.15, 0.35)
for m in (62, 66, 69, 74): S(brass(m2f(m), 0.7, 0.9, R, "stab" if m > 66 else "horn"), 4.15, 0.15)
for i in range(25): S(clink(R, R.uniform(2500, 6500), 0.12) * R.uniform(0.3, 1), 4.17 + R.exponential(0.25), 0.22, R.uniform(-0.7, 0.7))
# croc footsteps
for i, t in enumerate(np.arange(1.65, 2.75, 0.33)): S(lp(R.standard_normal(ns(0.15)), 1500) * np.exp(-tt(0.15) / 0.04), t, 0.35, (-0.2, 0.2)[i % 2])
# button press + ding
S(tick(1200) * 2, 4.06, 0.7); S(thump(140, 0.15), 4.06, 0.4); S(glock(m2f(88), 0.7, R, 1.2) + glock(m2f(84), 0.6, R, 1.2), 4.15, 0.35)
for i in range(7): S(glock(m2f([86, 90, 93, 98, 93, 98, 102][i]), 0.5, R, 0.7), 4.5 + i * 0.06, 0.1, 0.3)
# end chord
for m in (50, 57, 62, 66): S(brass(m2f(m), 1.0, 0.7, R, "horn"), 5.2, 0.12)
S(timpani(m2f(38), 0.7, R, 1.5), 5.2, 0.4)
buf *= dbg(-18.0 - integrated(buf))
fo = ns(0.35); buf[:, -fo:] *= np.linspace(1, 0, fo)
write_wav("audio/outro_bus.wav", buf); print("outro", round(integrated(buf), 1), "LUFS")
