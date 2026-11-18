# Pine Hollow stops mounting its raw sky keys

> Written by: Claude (lane mini-pinemem2)
> **State:** cut built 2026-11-18 (MEMORY-GATES MG9, J410).

Pine's page policy packs the keyed sky in both page modes
(`memoryTrim` shard and grid). The keyed sky then reads only the packed
`look/sky/*.bin` keys the build makes from the 2k HDRI keys. The fourteen
key JPEGs and gain PNGs were still cook mounts and still sat in the boot's
`sky` file group. A cold phone Low boot in WebKit fetched none of them.

The build still reads the keys from `public/assets/hdri` to pack them
(`fence-reads.json` keeps them). Only the mounts and the boot group drop.
The sunset `.sky.jpg` and `.gain.png` pair stays, because the boot's
`skyHdr` row still names it.

The epoch-4 estimate charges a mounted image at its decoded size. The cut
removes 124.8 MB of decoded bitmaps from its content term:

| Product | Content term | Playing estimate | Loading estimate |
| --- | ---: | ---: | ---: |
| `81c5661` main | 554.4 MB | 1,243.5 MB | 1,739.5 MB |
| Sky keys unmounted | 429.6 MB | 1,181.1 MB | 1,639.7 MB |

Both use shard-format 0.31.0's terms over the built folder and the
committed runtime reading (GL 156.7 MB). Nothing a phone draws changes:
four alternating cold WebKit pairs at phone Low read the same within noise
(WebContent settled 932–983 MB against 937–989 MB [K]).
