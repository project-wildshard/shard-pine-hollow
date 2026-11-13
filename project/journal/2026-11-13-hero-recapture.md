# Pine hero recapture

> Written by: Claude (opus-pinehero), 2026-11-13

- `ring-2-content` has been red since `ab06865`: `wildshard pack`
  refused the cut because `hero.json`'s stamp (`3f58209`,
  stamp-existing, 11-12 20:51 Cancún) named content from before the
  shard-format import swap, and `d79af39` (AU17, folk and orchestral
  music out) moved it again.
- Not recaptured earlier because Pine's spawn drew as two untextured
  tan slopes: the entered cell never admitted its ground tiles. Engine
  `93e50340` fixed that (meta QA-FEEDBACK 11-12 row 64), so the spawn
  now shows the road, grass, rocks and pines.
- Captured with `wildshard hero` from the spawn view (no declared
  camera), served the way `shard-driftwood@6b3e50b` was: a detached
  engine worktree at origin/main `c11534b8` (contains `93e50340`),
  `pnpm pins`, its `out/pine-hollow` replaced by this candidate's
  `pnpm build:shards` output (index `c9166163`), `validation.json`
  `revision` set to the engine's `shardfileValidationRevision`,
  `WILDSHARD_PREPARATION_ONLY=1 build-app.mjs` under `heavy-lane.py`,
  `preview-server.mjs` on 127.0.0.1:4877. The engine pin stays
  `867f3b96`; only the capture used the newer engine. Players see this
  card's ground only on an engine with `93e50340` (the next engine
  release after v0.1.15); release this revision with or after it.
- The old card was curated art (antler-king and cabin); the one-camera
  capture cannot reproduce it, so the card is now the spawn road shot.
- With the new thumbs the product is index `fd44be2e` (draft). A new
  revision for a release slot; nothing is uploaded here.
