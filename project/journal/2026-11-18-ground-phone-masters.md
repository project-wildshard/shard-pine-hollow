# 2026-11-18: the ground's phone layers are the UASTC masters (S12f2b3)

Meta SHARD-SOURCE S12f2b3. The ground's eight `#layer` rows (colour and
normal of forest ground, leafy grass, rock ground and stony dirt path)
leave the hand-made `astc6.generated.json` for `GPU_FILES.phone` rows
naming the UASTC masters engine's table names (already mounted). The
table is empty now, so `groundTileInputs.ts`, `bootProgram.ts` and
`heroMaterialFiles.mjs` read it no more; their eight `astc6/` files left
the mounts.

The masters are the desktop layers' own files, so the props section's
phone set now shares its colour and normal with the desktop set (ARM
stays the phone's own). Engine's cook (S12f1b/S12f2b1) encodes each 6x6
beside the product and names it in the discovery table under the blob's
URL plus `#layer`; the phone reads that file and never the blob. On a
cook before that, the phone transcodes the UASTC layers (4x4), as a
desktop does.

`astc-twins` now holds that no hand-made raw ground layer is left and
every phone ground layer is Basis.
