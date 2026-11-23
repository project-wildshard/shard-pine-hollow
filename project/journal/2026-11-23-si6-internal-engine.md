# 2026-11-23 SI6: engine internals through the sdk

> Written by: Claude (opus-compat-w12)

- SHARD-COMPAT SI6 with the SI5 tail and SI7: tests, fixtures and scripts read engine internals through
  `@wildshard/sdk/internal/engine` and the harness through `@wildshard/sdk/headless`; CI21 records move only the
  blobs that swap changed; source comments cite engine paths as plain text; the unused `RngStreams` loot
  augmentation is gone. Left: `pine-species-rows` reads `skinPlayback` from the engine source (no export), candidate
  plumbing, and the tsconfig `types` lines (sdk 0.4.28's `@wildshard/sdk/headless/game/types`).
