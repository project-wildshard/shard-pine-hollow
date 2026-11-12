# 2026-11-12: CI reuses Pine's cold cook when nothing changed

Meta HOW-WE-BUILD EV10 (BUILD-MAX). The cold pack cook in
`ci/ring-2-content` takes 276-394 s and is the job's long pole, even
when a push changed nothing the cook reads.

`actions/cache` now keeps the cook. The key is the built
`out/pine-hollow` (every file's sha256), `pnpm-lock.yaml` (the engine
and sharddev pins), `test/ci/cook-play.test.mjs` (its cook options),
Node's version and the runner. `WS_COOK_CACHE` tells the test where
the cache lives: a miss cooks there and writes `report.json` last,
with every cooked file's sha256; a hit checks each file against that
list before it plays, so a cached cook is the cold cook's bytes or
the test fails. The play, resume and server-part hash checks are
unchanged. Locally: cold 88 s, from cache 6 s; one flipped byte fails.
