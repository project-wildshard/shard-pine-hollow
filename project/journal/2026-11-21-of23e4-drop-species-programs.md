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
