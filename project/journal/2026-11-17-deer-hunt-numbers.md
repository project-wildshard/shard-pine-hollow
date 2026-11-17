# The deer authors its hunting numbers (meta STAGING-BUGBASH SB26, opus-killcredit)

- Pine's deer was the one species it spawns with no `tuning`, so the
  engine filled in its built-in grazer numbers (huntPattern
  LEGACY_GRAZER_TUNING) and 60 health (registry LEGACY_HEALTH, SB25).
- `DEER_TUNING` in deerRows.ts copies those numbers unchanged, so play
  does not change; boar, bear, elk and the King already had theirs.
- `test/pine-hunt-numbers.test.ts` (red first) checks every page and
  native species row declares tuning with health, and pins the deer's
  numbers to the old engine values. The engine drops its fallbacks
  in ONE-FORMAT OF5b once this ships.
