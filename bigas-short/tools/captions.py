import json
W = json.load(open("audio/words.json"))
FIX = {"20": "₱20", "posibling": "posibleng", "mangyare": "mangyari", "bilis": "bili", "gobierno": "gobyerno", "ane.": "ani.", "ane": "ani",
       "800": "₱800", "46": "₱46", "16": "₱16", "22": "₱22", "kadiwa": "Kadiwa", "nalang": "na lang", "eleksyon.": "eleksyon.", "Yan": "'Yan", "yan?": "'yan?"}
out = []; i = 0
while i < len(W):
    w = dict(W[i]); t = w["w"]; nxt = W[i + 1]["w"] if i + 1 < len(W) else ""
    if t == "four" and nxt == "-piece": out.append({"w": "4Ps", "s": w["s"], "e": W[i + 1]["e"]}); i += 2; continue
    if t == "9" and nxt == ",000": out.append({"w": "9,000", "s": w["s"], "e": W[i + 1]["e"]}); i += 2; continue
    if t == "Kapagsigurado": m = (w["s"] + w["e"]) / 2; out += [{"w": "Kapag", "s": w["s"], "e": m}, {"w": "sigurado", "s": m, "e": w["e"]}]; i += 1; continue
    if t == "siguro" and nxt == "na": w["w"] = "sigurado"; out.append(w); i += 1; continue
    if t == "mas" and nxt == "shout": out.append({"w": "ma-shout", "s": w["s"], "e": W[i + 1]["e"]}); i += 2; continue
    if t == "out" and out and out[-1]["w"] == "ma-shout": out[-1]["w"] = "ma-shout"; out.append(w); i += 1; continue
    if t == "May" and nxt.startswith("2025"): w["w"] = "Mayo"
    w["w"] = FIX.get(t, w["w"])
    if w["w"].startswith("₱") and nxt.startswith("pesos"): w["w"] = w["w"][1:]
    out.append(w); i += 1
json.dump(out, open("audio/captions.json", "w"), ensure_ascii=False)
print(" ".join(x["w"] for x in out))
