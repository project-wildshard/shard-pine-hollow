# Pine drops its species programs, hull book and rigged hulls (OF23e4)

ONE-FORMAT OF23e4, built ahead (J475) by opus-of-pine. Pine stops writing
the `actors/species-programs`, `look/hull-book` and `look/rigged-hulls`
platform rows and the `population.hull-book` page feature. The species,
hull and rig sources stay: `hullSpecies.ts` still turns them into the
declared species rows and skins that already ship (OF23a, OF23d).

On engine 0.1.58 the product builds, validates and passes all 19 vitest
files. Every journey that boots the native assembly stops at
`boss.ground` (and would stop next at `population.roster`), which still
read the section. Those hosts move to declared rows in OF30's engine half
and OF29e's population primitive; this branch lands when they ship.

The hull book's own sources go with it: `SPECIES_LOOKS` (nativeView),
`PINE_HULL_BOOK` (riggedHulls) and the grazer rows that only fed them.
The skins keep `pineHullResources` and the thrall clips. The rebuilt product
is unchanged apart from the three dropped sections; 19 of 19 vitest files.

Built ahead on engine 0.1.64, format 0.64.0 and SDK 0.4.22 (as Nalati's OF24
pin): build, validate and 19 of 19 vitest files pass. The M8 release
replaces this pin before Pine publishes (OF23e5).

OF38d (opus-of-m8-host, engine 804fb3655): the native plan names no held
hosts any more (`loadout`, `combat.motion`, the three `item.ranged` and
`ammunition`); the engine stands the ranged kit from `combat/items` and
`held/loadout`. Needs an engine pin carrying 804fb3655.

OF30 shape (opus-of-m8-species, engine plan/of-m8-species a21496788,
format 968b2bf): the roster rows name the declared species in the
programme's native order (the thralls as spawn-only) and carry the
programme's hunt; the King's boss binding carries his decision brain and
body; his and the elites' twelve strikes are `actors/strikes`. On packs of
that engine and format (its hunt tag patched to a regex, the format fix is
owed) the product builds, vitest is 19 of 19, and owned, den, king,
population, warden, ranged, pond, ridge, intro and product-play pass. Both
checkpoints equal the 0.1.58 programme product's hashes, so the declared
rows run Pine tick for tick; the 0.1.64 keys are recorded for the pin.

Engine v0.1.65 (the M8 cut A) lacks 500b4213c, so its far herd refuses a skin whose normals are int8 on a 4-byte stride
("farHerd: attribute 'normal' is interleaved"). Until Pine pins an engine with that fix, `plainNormals.ts` gives every
declared skin GLB a plain float32 normal channel and renames the hashes that name it (skin files, with their cost grown by
the new channel, variant tables, look rows). 34 skin primitives now carry plain normals; vitest 19 of 19.
