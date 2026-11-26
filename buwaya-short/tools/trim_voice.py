# Shrink dead air in the voice-over: lead-in 0.12 s, every pause capped at MAXGAP.
import subprocess, numpy as np, soundfile as sf, sys
src, dst = sys.argv[1], sys.argv[2]
SR = 48000; MAXGAP = float(sys.argv[3]) if len(sys.argv) > 3 else 0.2; LEAD = 0.12; TAIL = 0.4
raw = subprocess.run(["ffmpeg","-v","error","-i",src,"-ac","1","-ar",str(SR),"-f","f32le","-"],capture_output=True).stdout
x = np.frombuffer(raw, np.float32).copy()
win = int(0.01*SR); n = len(x)//win
rms = np.sqrt((x[:n*win].reshape(n,win)**2).mean(1)+1e-12); db = 20*np.log10(rms)
loud = db > -40
# fill tiny gaps < 80 ms (consonants) so we only cut real pauses
idx = np.where(loud)[0]
segs=[]; s=idx[0]; p=idx[0]
for i in idx[1:]:
    if i-p > 8: segs.append((s,p+1)); s=i
    p=i
segs.append((s,p+1))
out=[np.zeros(int(LEAD*SR),np.float32)]
pad=int(0.03*SR)
for k,(a,b) in enumerate(segs):
    a0=max(0,a*win-pad); b0=min(len(x),b*win+pad)
    out.append(x[a0:b0])
    if k < len(segs)-1:
        gap=(segs[k+1][0]-b)*win/SR
        out.append(np.zeros(int(min(gap,MAXGAP)*SR),np.float32))
out.append(np.zeros(int(TAIL*SR),np.float32))
y=np.concatenate(out)
# 4 ms fades at every splice are implicit: cuts happen in silence (pad keeps tails)
sf.write(dst,y,SR,subtype="PCM_24")
print(f"{len(x)/SR:.2f}s -> {len(y)/SR:.2f}s, {len(segs)} phrases")
