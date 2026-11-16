# Goldens: pine-hollow

> Written by: Claude (opus-k9, REPO-KIT K9, 2026-11-11). Carried from singleplayer `art/shardfile-goldens/` and
> `art/legacy-goldens/` (`08e4a21f69`). Jake, 2026-11-11 (J273): "goldens has to go into each major shard".

The look to hold for `pine-hollow`: 24 cameras. The skill `goldens` runs them; the rules are engine `docs/goldens.md`.

- `shardfile/<nn>-<camera>.jpg`: the SHARDFILE goldens (G859, G873 L5), 22 px label strip on top.
- `legacy/<nn>-<camera>.jpg`: the frozen LEGACY record (10-28, G843). Never re-captured, never updated.
- `cameras24.json`: this shard's 24 cameras (eye, yaw, pitch, FOV, probe), the `pine-hollow` entry of engine
  `scripts/perf/cameras24.json`.
- `runs/<date>-<sha10>-board.jpg`: the rerun board (<= 500 KB) a look change lands with.

## Source

The clean 144-camera rerun on `744c3ab7e2`, captured 2026-10-29 with the capture now at engine
`scripts/goldens/capture.mjs --mode=shardfile` (muted Chromium, iPhone 16 Pro portrait, phone tier, 2x, seed 357,
midday / clear). Re-encoded at 540 x 915 with a 22 px label strip, JPEG quality 72.

## Updates

- None since the source run.

Add one line per promotion: date, cameras, ruling, board path.

## Runs

Rerun boards kept in `runs/`, newest last. Captured on the Mac mini (headless Chromium, ANGLE Metal on the M5 Pro's GPU).

- 2026-11-15, engine `5e5b0b0912` with the pinned revision 5 (mini-shardgfx, meta SHARD-REPOS SH-pine-2):
  `runs/2026-11-15-5e5b0b0912-board.jpg`, ASTC on: KTX2 mode, 71 raw ASTC 6x6 files read. 23/24 green; 20 re-shot
  (a creature against the lens). `runs/2026-11-15-5e5b0b0912-noastc-board.jpg`, ASTC hidden (`--no-astc`): images mode,
  "overruled: this table names raw ASTC 6x6 and the GPU has no ASTC", 0 raw ASTC files read, 44 Basis KTX2 and 68
  images; the ground is drawn on every camera. 23/24 green. On both, 11 (bear den) is a harness miss, not a look change:
  the player stands 250 m from the camera (`drifted`, 3 of 3 runs), so the ground cover streamed round the player is
  missing at the eye.
- 2026-11-15, engine `5d4413fe9b` (engine main `4e3c68c8ce` plus the capture fix; mini-goldens2, meta SH-ALL-11):
  `runs/2026-11-15-5d4413fe9b-board.jpg`. **11 is fixed and green:** the den's bears woke, bit the player (health 45),
  knocked it down the slope and killed it, so the respawn left it at spawn; the page's damage cap never reached the
  worker's server. The capture now sends `__workerClientStill` (the server holds every creature) and errors on a player
  over 20 m from its pose; all 24 poses stand at 0.0 m. 22/24 green. **20 and 24 red, not this fix:** far trees draw
  as purple pixel blocks and the near pines take a lighter level, the same on main `4e3c68c8ce` without the fix and absent
  on `5e5b0b0912`; likely engine `80e9cb9d` (phone `placedLodScale` 0.6, placed LODs switch nearer), not bisected. Not
  promoted; waits on that change's owner.
