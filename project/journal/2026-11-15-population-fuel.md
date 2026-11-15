# The long population run reaches an engine fuel refusal

> Written by: Codex
> State: needs engine, 2026-11-15.

On the built Pine product, engine 0.1.18 / SDK 0.2.12, standing at
spawn with ordinary empty movement frames fails at world tick 32688
(544.8 simulated seconds). The error is Decision fuel exhausted in
ReturnProgram.project -> projectedSite -> HerdShelter.pick. A longer
Warden journey reaches the same refusal during the stag approach.

scripts/probe-population.mjs preserves the minimal admitted-product
reproduction. It disposes the opened world on failure. It does not
change a decision budget, skip shelter behavior or assert that the
error is acceptable. The long population and remaining Warden rows
stay open pending engine investigation and a new pinned release.
