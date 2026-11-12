# 2026-11-12: Pine Hollow mounts every stand-in its texture table names

Meta SENTRY-TRIAGE S10 (`WILDSHARD-GAME-89`). The live shardfile,
revision 1 (`0e246ab0`), names desktop NPC GLBs, creature rigs, birds
and phone `astc6` files in its KTX2 table that its tarball does not
hold, so production 404s them. Revision 2 is built from this repo.

A build of `4fa6dc3` already carries the NPC GLBs and the `astc6`
set, but its table still names 18 files `mounts.json` never listed:
the 16 creature rigs (`creatures/*.rigged-*.glb`, both tiers) and the
two bird GLBs. All 18 are in `public/`. sharddev's mount recorder
(`record-shard-mounts.mjs`) reads a section URL's tier and encoding
variants but not the hashed stand-in a table maps it to, so it missed
them. They are added here by hand, in the file's code-point order.

With them, every one of the table's 374 entries is a file of the
tarball (`check-ktx2-table.py`, kept with the rev-2 tar in
`~/.cache/wildshard/pine-rev2/`). Nothing is uploaded: an upload moves
every channel's pointer, so it waits for a J239 slot. The recorder fix
is sharddev's.
