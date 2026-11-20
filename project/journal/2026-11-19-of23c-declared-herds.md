# OF23c: Pine's herds are declared spawns (opus-sdk-pine)

- `data/rosterR6.json` is r6's boot roster as the engine's census read it:
  164 bodies, 160 in 52 herds and the four elites at their lairs, with
  ids, variants, page seeds, scales, stand points and yaws.
- `generators/declaredRoster.ts` writes the 160 herd bodies as
  `creatures.spawns` rows on OF23a's species (`pine.creature.<kind>`),
  grouped `pine.herd.<n>`; a page seed in [0, 1) becomes the row's 32-bit
  seed. Their hunt layer drives them, as OF23b proved beside the roster.
- The roster rolls no herd (`fauna: []`, `bodyCount: 4`) and keeps the
  elites, the King's and thralls' reserves and the night spawns. Engine
  OF23c starts its ids past the declared `creature:N`, so the King's and
  thralls' reserves keep 161 to 163 and the elites 164 to 167. Their
  rolls come earlier in the stream now, so the bake's seeds for those
  seven change (scales of the elites and the King do not: fixed by
  variant); `physicsRows.json` holds the four elites, no herds.
- Proven on engine main plus the roster change (packed): the boot census
  matches r6 body for body (ids, kinds, variants, stand points), 46
  vitest cases, `pnpm check`, the owned journey (which now reads a
  room's inputs, the herds' skin rigs included), grid and census tests.
- `serverBudget.entities` rises to the roster's 512.
