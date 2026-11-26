# words.json (whisper) -> captions.json with the script's real spelling, one word per caption
import json
W=json.load(open("audio/words.json"))
FIX={"buaya,":"buwaya,","buaya":"buwaya","nakaupu":"nakaupo","gobierno,":"gobyerno.","nakabarong":"Naka-barong","tarpulin.":"tarpaulin.",
"20202":"2022","20205":"2025","pinonduhan,":"pinondohan.","yan":"'yan,","bahak,":"baha?","ngayon":"nga","TV,":"TV:",
"mabuti":"mabuti","x":"x"}
out=[];i=0
while i<len(W):
    w=dict(W[i]); t=w["w"]
    nxt=W[i+1]["w"] if i+1<len(W) else ""
    if nxt=="%": w["w"]=t+"%"; w["e"]=W[i+1]["e"]; i+=2; out.append(w); continue
    if t=="pandibulakan,":
        m=(w["s"]+w["e"])/2; out+= [{"w":"Pandi,","s":w["s"],"e":m},{"w":"Bulacan,","s":m,"e":w["e"]}]; i+=1; continue
    if t=="pinaghihinala" and nxt=="ang":
        w["w"]="pinaghihinalaang"; w["e"]=W[i+1]["e"]; out.append(w); i+=2; continue
    w["w"]=FIX.get(t,t)
    if t=="ng" and nxt=="mabuti": w["w"]="nang"
    out.append(w); i+=1
json.dump(out,open("audio/captions.json","w"),ensure_ascii=False)
print(" ".join(x["w"] for x in out))
