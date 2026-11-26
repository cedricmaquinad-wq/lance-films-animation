# Lance Films Animation

Animated story shorts for **Lance Films** (Facebook / YouTube Shorts / TikTok): 2D cartoon characters in a colourful 3D world, Taglish voice-over, word-by-word captions, original synthesized music and sound effects, and the "Pa-follow" outro.

Everything is code: three.js scenes rendered frame-by-frame in headless Chromium, then ffmpeg. No AI video generator.

## Videos
| Folder | Video |
|---|---|
| `buwaya-short/` | *Ang Tunay na Buwaya*: corruption satire (crocodile politicians in barong, ghost flood-control projects) |
| `bigas-short/` | *₱20 na Bigas*: what if ₱20/kilo rice were for everyone |

## Make a video (per folder)
```bash
npm install                                   # once, at the repo root (three, esbuild, fonts)
python3 tools/trim_voice.py audio/voice_raw.mp3 audio/voice.wav 0.2    # remove dead air
python3 tools/transcribe.py audio/voice16.wav audio/words.json         # word timings (faster-whisper)
python3 tools/captions.py && cp audio/captions.json web/               # captions with correct spelling
npx esbuild src/main.js --bundle --outfile=web/bundle.js --format=iife
node tools/render.mjs stills out/st 0,300,600                          # check shots
node tools/render.mjs video out/parts/p_0.mp4 0 845                    # render (split into parts to parallelize)
python3 tools/audio.py                                                 # music + SFX + mix -> audio/mix.wav
```
Then join the parts and mux `audio/mix.wav` (see the commands in the chat history / CLAUDE.md).

## Main files
- `src/engine.js`: renderer (ink outlines, lens blur, grade)
- `src/toon.js`: character drawing (bean-head people, crocodile politicians, props, poses)
- `src/kit.js`: 3D building blocks (houses, palms, jeepneys, signs, character cards)
- `src/sets.js`: the 3D worlds of a video
- `src/story.js`: shot list, camera moves, and what every character does on every word
- `src/outro.js`: the Lance Films "Pa-follow" outro
- `tools/audio.py`: original music and SFX timeline + mix
