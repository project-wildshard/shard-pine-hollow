# OF23c: elites and night thralls are declared bodies (opus-pine4)

- The four elites stand as `creatures.spawns` rows on r6's ids
  (creature:164 to 167), on OF28's rank elite, each in its fight
  program's spawn group (`pine.elite.<id>`), which binds the program's
  main to it (engine OF23c). Their authored numbers are r6's over the
  rank (variant health /4, scale /1.2, the mains' strike damage /1.5;
  the Imperial Bull's rivals stay unranked), so they fight as r6's did.
- The night's thralls are eleven rows in the night script's group
  (`pine.night`), enough of each kind for every roaming slot and the
  mill race at once; the script stands them, the roster makes none.
- The roster stands no body (bodyCount 0, no homes, the bake's actors
  empty) and keeps only the reserves, still creature:161 to 163. Each
  kind's body dimensions move to `data/speciesDims.json`.
- Proof (packed engine with 6766454ab and the roster/night change):
  boot census equals r6 (164 ids, kinds, variants, stand points);
  elites scripted with r6's health and size; Ironhide fights; a night
  call stands a declared thrall; a save restores. The Pine journeys
  that use the rider stay red from the Ring 1 skin GLB gap (another
  lane's), and population-journey's rain shelter and den-journey also
  fail on main's declared herds without this change.
