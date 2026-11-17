# Pine Hollow phone-memory cuts

> Written by: Codex
> **State:** first cuts built 2026-11-17 (MEMORY-GATES MG9, J410).

Pine's cold boot had two 16.8 MB sky textures and decoded its full
audio and menu images while world buffers were live. The shard now
uses the packed sky path already used by grid play. Averaging the keys
in linear light halves both dimensions and carries over their original
horizon lighting readings. The two active textures total 4.2 MB.
Phone Low also caches its audio in the loader and decodes after control.

The declared library shrank from 835 to 472 MB. Pine reuses its phone
paintings as desktop image fallbacks while keeping the desktop KTX2
stand-ins. Desktop rigs and coats keep the authored UASTC mip chains
from 256 px down. The original phone rigs and coats still ship. Smaller
journal pages and menu art reduce decoded bytes when displayed. The
chalk atlas keeps its original cells and size.

| Output | Epoch-2 worst playing | Epoch-2 worst loading | Phone Low boot estimate |
| --- | ---: | ---: | ---: |
| Baseline `1ce6023a` | 1,808 MB | 1,896 MB | 2,148 MB |
| Cuts `9328c222` | 1,405 MB | 1,493 MB | 1,977–1,988 MB |

Both exact products ran through `wildshard memory` using matched
loopback preparation clients built from engine `9bc24558`, with the
`3cd2dd87` probe. The probe on this Mac uses the loading renderer peak
times 2.0. The 1.0 GB target remains open. Published shard-format 0.23.0
validates the new folder. Epoch 2 still calls for fresh runtime readings.

Both captures use the same actual spawn (x 0, z -235), a 402 × 874
Chromium touch viewport, DPR 3, phone tier and Low's 1× draw buffer.
The road, trees, horizon and composition match on inspection. Weather
and HUD timing account for some pixel differences.

[Before](2026-11-17-pine-phone-low-before.png) ·
[After](2026-11-17-pine-phone-low-after.png)

The authored horizon images are packed under content-addressed URLs.
The KTX2 table now also keys the existing stand-ins by those URLs.
The Phone Low WebGL ledger showed 11.53 → 2.89 MB for the two horizon
textures, and the decoded WebP images went from 8.65 MB to zero.
The full-resolution image fallback remains available on devices that
cannot sample the compressed textures. [Phone Low after the alias](2026-11-17-pine-horizon-ktx2.png).
