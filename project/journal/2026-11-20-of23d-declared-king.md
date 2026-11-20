# The Antler King on a declared body (ONE-FORMAT OF23d, Pine half)

> Written by: Claude (opus-pine7), 2026-11-20

Engine `db7dc9a38` lets a `boss.ground` fight raise a declared spawn in its spawn group as
its boss and stand its thralls from the same group. This is Pine's half.

- **The King is a species row.** `hullSpecies.ts` no longer drops `antler-king-rig`: his
  upright 22-bone rig fits the kit quadruped through a chain map (hump, neck, head as the
  neck; each limb's top three joints as its leg), so his skin's `chest` socket is his lock
  point, which is the weak point the fight reads for a declared body. His row id is
  `pine.creature.king`, because a skin's skeleton name is its species id and admits no
  hyphen. His dims are his parked body's from the physics bake.
- **His thralls are declared.** Three boar and three elk thralls (one per add lane of each
  kind) wait out of the world in `pine.king`; a summon stands a free one of its kind.
- **His own body is not declared yet.** With his runtime boss row gone, the format and the
  engine refuse Pine's public `king.*` decision fields: they are runtime-bound public
  numeric fields, admitted only beside a runtime boss or a declared `boss` encounter's
  body. `PINE_KING_SPAWN` is written and `test/ci/king-declared.test.mjs` proves the move
  in memory on the built product: night raise, the chest lock point, group thralls as
  adds, three phases, an exact mid-fight restore, and retirement once the player walks out.
  The open half is an admission rule that counts a declared ground boss as a retained
  actor, or a `boss` encounter row the native fight takes over.

## The King's own spawn (opus-pine8, option B)

- The coordinator picked option B: the King keeps the format's retained-actor rule through a
  `boss` encounter row on his declared spawn (`pine.king.boss`), and engine `247cdbf5a`'s native
  fight runs that row (no PhaseEncounter stands beside it).
- `PINE_KING_SPAWN` joins `creatures.spawns`, the runtime stands no boss, and
  `king-declared` now proves the built product itself (no in-memory move), on a pack of engine
  main `247cdbf5a`: the build admits his public `king.*` fields, and all journeys but warden pass.
