# 2026-11-27 Pine 0.0.18 names its own art paths (SF5d)

The images-only Pine pack cooked, but its desktop entry asked engine paths (`/assets/tex/rock_ground`, the bark layers,
the cabin scans, the tree set) that the page no longer serves, so the textures 404ed. Every one now names
`/assets/pine-hollow/...`, where the pack mounts them. The shard declares `shardVersion` 0.0.18 (`src/shard.json`), and
the water ripples bin, left over from the engine commons and read by nothing, leaves the mounts. Cooked on engine
7fd1804b8, a headless desktop enters in 17.2 s with no zone art from the page. The phone waits on a cook fix for the
`arm.jpg` phone key.
