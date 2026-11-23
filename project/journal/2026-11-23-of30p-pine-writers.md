# OF30p: Pine names no species programme or hull book file

- ONE-FORMAT OF30p1 (opus-look3). Pine's product already shipped no
  `actors/species-programs`, `look/hull-book` or `look/rigged-hulls`
  (OF23a to OF23f: every creature a declared `platform.skin`). What was
  left were their writers and the hull book's named files.
- Gone: `speciesPrograms.ts` (the programme's page and native halves,
  its spawn tables `spawnTables.ts` and King brain wrapper),
  `riggedHulls.ts` (the hull book's URLs), `coatPages.ts`, and
  `publicInputs.ts`'s `pineRigBlobs` and `pineCreatureBlobs`. The
  species rows now come from `speciesRows.ts` `pineNativeSpecies()`.
- Product: every section and `server/` byte-identical; 52 named
  `models/creatures/*` files (12.3 MB: the phone ASTC maps and coats,
  meshopt rigs, thrall extras) leave the library, and 30 more lose
  only their name (their bytes stay as the skins' own files).
- Proof: meta `project/evidence/one-format/of30p/`.
