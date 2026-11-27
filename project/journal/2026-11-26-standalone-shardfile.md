# Pine Hollow carries all its art (meta standalone shardfiles SF5)

- Slice 1: `mounts.json` now lists the 164 files Pine names but never
  carried: 15 ground texture sets and 5 props the page read from engine
  git (`/assets/tex/`, `/assets/models/`), the creatures, NPCs and birds
  engine fetched from the singleplayer repo (`test/pins/assets.json`),
  and the 35 journal pictures. All were already in `src/static/`; they
  just never reached the shardfile. 314.4 MB to 383.0 MB, under the
  450 MB cap. URLs stay where they are until SF4's zone rule lands.
- Inventory came from the pinned 0.0.17 tarball (uploadNumber 18): every
  `/assets/` URL its text names, less what it carries.
- Next slices: images only (the cook makes the KTX2, SF15), mounts under
  `/assets/pine-hollow/` (SF4), shared sets from the kit (SF2).
- Slice 1b: the far and near views (`/assets/baked/pine-hollow/far*`,
  `near*`, in engine git) and the mid-morning and late-afternoon sky
  keys `src/data/sky.json` names were not mounted; the engine cook-entry
  proof (engine `src/scripts/zone-cook-entry.mjs`) caught the desktop
  reading `far.*` from the page. 387.5 MB.
- Images only and the hand-made KTX2 deleted (SF5b, SF5f; J525, J527):
  splat layers, creature maps and coats, bird atlases and material
  payloads are images now, and 274 MB of `src/static/assets/gpu/` goes.
  The boot bindings' KTX2 modes name Pine's own images: the engine's
  built-in table still named `/assets/gpu/` twins, which is what the
  phone 404 on `pine_bark/arm_1k` was. 226.9 MB; needs an SDK pinning
  shard-format 0.82.1 to land.
