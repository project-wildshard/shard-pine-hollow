# The lean move, repaired where CI went red

> Written by: Claude

repo-kit lean-layout R1 changed this repo on its way to the lean layout.
`pnpm check` passed, but CI runs more than check, and some of it named the old
paths. sharddev-55 saw main red and asked for a look. Fixes:

- ci.yml: the `pnpm test:hooks` step is gone (`pnpm check` runs `test:kit`, which holds the hook tests)
- `./scripts/bake-loader.mjs` and `./scripts/sim-node-loader.mjs` in bake commands, `scripts/blender/targets.json`, `src/README.md`, fixtures and a proof now name `./src/scripts/`
- `test/ci21-candidate-ports.json`: targetBlob re-pinned for the files the move and those path edits changed
- `test/ci21-candidate-ports.json`: the `fixtureBlob` of `test/fixtures/pine-director-module.ts` re-pinned too (main CI, second run)
