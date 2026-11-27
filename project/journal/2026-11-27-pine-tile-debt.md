# Pine tile debt after the images-only re-pack

- opus-pins (SF24): build:shards refused all 64 L0 tiles and 16 windows. The
  twelve terrain JPEGs (5.1 MB) now ride in every L0 tile's closure, and the
  SF20 census charges them at the cook's KTX2 size (about 11 MB a tile, cap
  0.3 MB). Recorded the exact 80 rows in lint/tile-bake-debt.json (J439).
  Follow-up: move the terrain set to the library so tiles stop carrying it.
- The file has duplicate keys in other products; edit it as text, not by
  JSON round-trip, or those rows vanish.
- The build re-stamps src/hero.json (content moved); committed with it.
