# Lance Films animation: rules for every new video

Owner: Lance Films (Filipino creator). Scripts are Taglish, always about the Philippines, satirical/informative, built on real, sourced facts. Never name or depict real politicians; use generic characters (crocodile = corrupt official).

## Workflow
1. Write the script: short, copy-paste only (no extra explanations unless asked). Verify facts with sources.
2. User records the voice in ElevenLabs and uploads the MP3.
3. Remove dead air (`tools/trim_voice.py`, max pause 0.2 s), transcribe with word timings, build captions with correct spelling.
4. Build sets + shot list in a new folder (copy the newest video folder as a template).
5. Check stills of every shot, then render, mix, and deliver the MP4 + thumbnails (vertical 1080x1920 + 16:9) + title/caption on request.

## Style rules
- Vertical 1080x1920, 30 fps, word-by-word captions (white, black outline, center-lower).
- **Every action in the voice must be acted on screen at that word** (sitting, swimming, stamping, laughing...).
- **Cut every 2-4 seconds (never longer than ~4 s)**; cut on words; soft swish on each cut.
- The buwaya character: green croc head, barong, clawed hands/feet, tail. People: bean heads, stick limbs.
- End every video with the Lance Films outro (`src/outro.js`): page with logo, follower count fixed at **965.5M**, croc presses Follow on the word "follow", confetti.
- Music and SFX are synthesized originals (Epidemic Sound downloads are not available on this account).
- Mix: voice clear, music ducked under voice, final loudness about -14 LUFS.

## Upgrade ideas (requested)
Match the reference look more closely: real CC0 3D models (Kenney, Poly Pizza, Poly Haven are allowed on the network), constantly moving camera, motion blur, dust/impact particles, softer lighting.
