# 2026-11-18: 20 hand-made phone rows go to the cook (S12f1)

Meta SHARD-SOURCE S12f1. Of the 35 `astc6.generated.json` rows that are
not `#layer` twins, 20 now have a `GPU_FILES.phone` row naming the
master Pine already carries under `/assets/gpu` (engine
`scripts/ktx2-engine-map.json` phone targets): the four `_lod.phone.glb`
props and the 16 `/assets/tex/` building maps. Engine main's phone tier
(`phoneTier` with the 6x6 encode) cooks all 20 from Pine's built product.
They leave the hand-made table, their `astc6/` files leave the mounts,
and six masters the mounts lacked are added.

The other 15 stay hand-made: the five glTF prop recipes (hatchet, stone
fire pit, wine barrel, bucket, crate) and their ten maps. The cook has
no glTF path, so their phone recipe would read the 1k UASTC maps rather
than a cooked 512 file. The files stay on disk until S12f4.
