# Shard source moves to src/ (SA24, opus-sa24b)

> Written by: Claude (opus-sa24b), 2026-11-13

- `src/shards/pine-hollow/` is now `src/` (meta SHARD-AUTHORING SA24, J317):
  a single-shard repo keeps its shard at the top of `src/`.
- Pins: sharddev `7681ecb` (`@wildshard/sdk` v0.2.8, SA44: finds the
  repo root from `src/`) and engine `dbc3f7cc` (SA45: author lint reads
  a single-shard `src/`), same github-SHA style.
- Outside `src/`: the `lint:shards` target, format and lint globs,
  `.oxlintrc.author.json` globs, `.gitattributes`, `.gitignore`, the
  vitest include, `scripts/publish-public.mjs`, the test-boundary walk,
  this shard's `scripts/blender/targets.json` entries, docs and the test
  imports.
- Kept: `src/` is byte-identical, so the hero stamp stays fresh. Path
  labels that reach the shard file (`file:` provenance, `"source"`,
  manifest URLs) stay `src/shards/pine-hollow/...`; sdk v0.2.8 resolves them.
  `lint/ratchet.json` keys stay too (engine lint maps `src/x` to them).
- `pnpm build:shards` gives the same shard file as before the move
  (every file but `validation.json`'s build key).
- Files inside `src/` that climb out of the shard by relative path
  (`generators/scriptSources.mjs`, `blender/crags/export-cave.mjs`, and the `bake/` tools: `bake-hdri-keys`, `bake-pine-code-parts`, `bake-pine-painted`, `bake-pine-rain`, `bake-pine-spray`, `bake-pine-thrall-extras`, `bake-pine-trophies`, `king-rig-bake`, `pineCoats`) are left for the next hero capture, since any byte change
  there stales it.
- `generators/pine-cabin-shardfile.test.ts` moves to `test/`: it read its
  sources through `generators/scriptSources.mjs`, whose public/ path
  climbs out of the shard, so it now builds the same roots itself.
