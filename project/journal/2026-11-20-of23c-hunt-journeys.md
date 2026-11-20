# OF23c: the hunt journeys on declared herds

> Written by: Claude (opus-pine5), 2026-11-20

Population and den journeys went red when the herds became declared
spawns (`39d7083`). Three things were wrong, two of them here:

- **Shelter** was engine-side: the rain shelter read only the roster's
  herds. Engine `feat(population): declared herds take shelter` shelters
  declared herds, keeps their bodies near their herd's centre, saves the
  centres, and keeps a restored world's night thralls absent.
- **The deer and elk turned on the player.** r6's native rows name no
  reaction, and the hunt reads a non-aggressive one as a body that bolts.
  The SDK converter writes `neutral` (a provoked charger), so elk herd 44
  charged the den rifleman. `hullSpecies.ts` maps a converted `neutral`
  to `passive`.
- **The den fight's script fit r6's world, not this one.** The declared
  Sow stalks before she charges, and a ridge hid her from the old firing
  spot, so the rifle never hit; when it did, her declared head took
  double damage and she fell before landing a blow. The journey now aims
  where a lock-on aims, fires down a clear line once she is within 23 m,
  holds ground until her one blow lands, stops at her fall, and rests
  before the lantern run. That is the same story as r6: one 55 blow from
  the Sow, then two 35 blows at the lantern, and the player gets there
  with 30.

The journey readers also take a room's skin rigs (`serverInputFiles`),
as owned-journey already did: declared species need their rest rig.
