# Pin bump, page life on a view row, hero stamp

> Written by: Claude (opus-pinebump), 2026-11-12

Pine stayed on sharddev `b9f8700` when the other six shard repos moved
to `d14580c`, because the new sharddev's build check refused it:
`side refused: script pine.life declares sim, missing its server half`.
`page.life` ran the `sim` row `pine.life`, which no server host runs
there (SERVER-PARITY SS7 and SS8, meta `docs/plans/SERVER-PARITY-PLAN.md`).

Shardfile's grandfather list admits Pine's live product, but only that
exact product (its source hash `a2555854`). A rebuild on the new
sharddev has another hash, so the grandfather can never cover it, and
teaching sharddev's build check about it would not have helped. Pine
needed SS11's split instead:

- `behaviour/ambient.as` is the page's ambient rules (scavenger arrival,
  carcass sites, the guide bird), the view row `pine.ambient`. It emits
  channels only, and `actors/page-life.json` runs it. It is a render
  library file, not critical, and its memory is charged to the library
  budget.
- `pine.life` keeps the quest's lead and its hollow-log secret, the
  rules the server also runs (SS5).
- Format allows at most nine decision modules, and Pine already had
  nine, so the shelter guest (`pine.shelter`) folds into `pine.life`.
  Its rules were already copied into `life.as`; now `life.as` calls
  `shelter.as` and the copies are gone. `actors/shelter.json` runs the
  `pine.life` row.

No upload: the live product is unchanged, and the grandfather line
stays in shardfile until SS11's re-upload.

The pins match shard-driftwood's (`5c7c44a`, `e5b945e`, `19e26b5`):
sharddev `d14580c`, shardfile `0786a04` with its override, engine
`867f3b9`, and `packageExtensions` naming `@wildshard/engine` with no
version.

The hero came with the lift on 2026-11-07, and the only commits since
are mount and fallback fixes, so the curated images still show this
content. They are stamped with `wildshard hero src/shards/pine-hollow
--stamp-existing`, and `wildshard pack` reads `hero: current`. The next
real content change needs a capture.
