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

S12f1b (later the same day): the other 15 move too. Each prop's phone
recipe is now the `/assets/gpu` one; its `.gltf` row and each map's
`.phone.webp` row name the gpu recipe and the 1k UASTC masters, and a
row keyed by each master itself is what the page reads in its place
(engine `tierUrl`, S12f1b), so the cook's 512 6x6 file reaches the
recipe. Engine main's phone tier cooks all ten maps (vkFormat 165/166,
512x512) from the built product; no `astc6/` row is left for them, and
`cabinMaterialFolders` no longer lists the `astc6/` recipes. The fire
pit's gpu phone recipe joins the mounts.

S12f2a: the ten bark `#layer` twins (birch, fir, metasequoia, willow,
pine) are table rows, not product blobs, so they move the same way:
their phone rows name the UASTC masters the engine table names (eight
newly mounted) and engine main's phone tier encodes each 6x6 at its own
size (512, pine bark 1024). Eight `#layer` rows stay hand-made: the four
ground layers' colour and normal, which the ground program carries as
product blobs (S12f2b).
