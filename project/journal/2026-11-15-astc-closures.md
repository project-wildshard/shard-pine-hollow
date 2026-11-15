# 2026-11-15: the raw ASTC closures (SH-pine-2, SH-pine-3)

> Written by: Claude (mini-shardgfx)

A phone GPU without ASTC must still draw Pine. The page knows a raw ASTC
6x6 file only by its name (engine `gpuFiles.ts` RAW_ASTC): on such a GPU
it loads images instead of the KTX2 table, and draws the ground from the
desktop tier's Basis layers. `test/ci/astc-twins.test.mjs` checks what
that relies on, on the built product in 0.1 s: all 44 ASTC KTX2 files are
named raw, the 106 raw table rows (shard and grid) name carried files
with image keys, and the 20 raw phone ground layers each have a Basis
desktop layer for the same material and map. Three planted mutants fail
it.

`cook-play.test.mjs` now also reads the real cook's manifests: the phone
entry carries 40 raw ASTC files (9.7 MB), and no ground layer goes to the
phone in both forms. Two findings are printed, not gated: the desktop
entry manifest carries 32 of the phone's raw ASTC files (5.0 MB; engine
`shardCook.ts` lists a fence shard's entry set from `fence.mounts`
without `onTier`), and 2 raw phone ground layers (the second rock_ground
set) sit in no phone manifest and load loose.

The boot itself, with ASTC hidden on the Mac mini's real GPU, is in meta
SHARD-REPOS.
