# Held tools: retire or rewire (opus-held125, meta QA 11-25 row 126)

- `king-rig-gate.mjs` is retired: nothing ran it, and it needs engine's `limbRig.ts` and `limbBlend.ts`, which the
  sdk does not export (limbBlend not even engine's package). The King's rig stays covered by the fixtures' tests.
- `pine-hollow-gpu.mjs` keeps working without engine internals: its overdraw read is `heat-frame.mjs`, this tool's
  own glue over the sdk's exported `browserBakeBytes` (engine's `parity/heat-bytes.mjs`), and the GPU census branch
  (`--mode=`, Nine Dragon) says to run engine's own `src/scripts/perf/gpu-census.mjs` instead.
- `scripts/blender/targets.json` keeps only Pine Hollow's seven targets (the other 36 were the old monorepo's). It
  stays there for now: the installed engine lint finds the registered Blender helpers only through the old place.
  The move to `src/blender/` waits on engine's fix reaching the SDK pin (meta QA 11-25 row 129).
- `check-test-boundary.mjs` no longer walks `scripts/`; the script-paths baseline holds that one entry.
