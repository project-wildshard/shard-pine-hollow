# 2026-11-12: Pine's pond lantern played on real inputs

Meta TEST-COVERAGE SHARD-REPOS SH-pine-1/4, pond leg.
`test/ci/pond-journey.test.mjs` plays the Warden's Hollow pond beat on
the built product: spawn, Hale's talk read through on the porch
(refused from the rail gap), the pond waystone refused without its
glass, the east log heaved (the west one refused from that bank), the
pool waded above the dam, the glass refused while the sluice is shut,
the west log heaved, the sluice lifts, the glass taken, the waystone
lit. Movement frames and the [E] routes only; nothing writes a flag.

About 6,750 ticks, under 2 s locally. Two source mutants turn it red:
the lantern lit without the glass, the sluice opened by one log. Not
covered: the logs' own need of Hale's talk. It runs in ci's
ring-2-content job and the nightly workflow, beside `pine-intro`.
`test/ci/journey-rider.mjs` is the rider later legs share, shaped
like shard-driftwood's.
