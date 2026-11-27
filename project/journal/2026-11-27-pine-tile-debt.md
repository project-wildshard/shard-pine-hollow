# Pine tile debt after the images-only re-pack

- opus-pins (SF24): build:shards refused all 64 L0 tiles and 16 windows. The
  twelve terrain JPEGs (5.1 MB) now ride in every L0 tile's closure, and the
  SF20 census charges them at the cook's KTX2 size (about 11 MB a tile, cap
  0.3 MB). Recorded the exact 80 rows in lint/tile-bake-debt.json (J439).
  Follow-up: move the terrain set to the library so tiles stop carrying it.
- The file has duplicate keys in other products; edit it as text, not by
  JSON round-trip, or those rows vanish.
- The build re-stamps src/hero.json (content moved); committed with it.
- ci on 9ffbf37 stayed red on two old debts: seven CI21 candidate blobs left stale by the Node 26 move (c814c41) and d75c558, and no linux checkpoint row for engine 0.1.100-next.922b9d45. Rebound them, recorded the row CI printed, added lint:ci21 (candidate retention, run by the pre-commit lint) and test/node-strip-only.test.ts.
- ci21-source on c418c83 then reached the native originals and failed two
  ways. The oracle walked node_modules/@wildshard/engine/scripts, which the
  engine package no longer ships (ENOENT); dropped that input. The
  checkpoint witness moved its state and snapshot hashes under sdk 0.9.1,
  engine 0.1.100-next.922b9d45 and the images-only content; every tick count
  and effect is unchanged. Recorded on darwin as ci21-source does (producer
  seal, candidate 922b9d45, the witness 'checkpoints' mode), moved the
  provenance digest, rebound the three blobs; all 18 ci21 cases pass.
- The publish cook job's sparse checkout left out .node-version: stamped
  repo-kit a066ebb (both workflows and the workflow-node-major guard).
