# 2026-11-24: Pine's weapons play as declared items (FORMAT-PRUNE FP22d)

> Written by: Claude (opus-fp21)

Pine's crossbow, longbow and lever-action dropped `legacySlot`, so they play as `declared.weapon.crossbow`,
`declared.weapon.longbow` and `declared.weapon.lever`. Every row that named a weapon by its old closed name now names
the declared id: the loadout's launcher, firearm and bow slots, the seven weapon finishes (and the held finish pack), the
ranged page's drop labels and the Antler King's skin unlock. The board toast keeps the word players read ("crossbow",
"rifle"). A worn-skin save keyed `crossbow`, `bow` or `rifle` moves to the declared key on load: state goes to version 2
with one `equipmentSlots` migration (`src/data/slotMigrations.json`, engine `legacySlotMigration`'s step).

This needs format 0.77.0 (loadout and finish slots accept declared ids, format `eb08a86`) and engine `aa22c5f95`
(server ammunition finds weapons by runtime id). It is held on branch `wip/fp22d-declared` until both ship.
