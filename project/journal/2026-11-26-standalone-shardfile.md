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
