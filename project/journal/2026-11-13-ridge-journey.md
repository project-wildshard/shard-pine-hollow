# The ridge lantern on real inputs (SH-ALL-8)

This is the second of Pine's quest legs played on the built product
(the pond leg was first). It uses the same `journey-rider.mjs`:
movement frames toward points and the [E] press each prompt's net
route names, with no flag written.

The route runs from spawn up the south and north roads, the den trail
and the lookout trail to the fire lookout's foot. The ridge lantern
stands there, 6 m off the tower on the trail side. The test asserts
three refusals before the win:

- the lantern refuses to light without the flint;
- the flint can't be taken from the ground;
- it is still out of reach from the hatch's mouth.

Inside the cab, beside the fire finder, the flint is taken. Back at
the same spot by the lantern, the same press lights it (`lit:ridge`).

## Getting the stair right

`walk-routes.json`'s `lookout-climb` gave the five flights. The descent
was the hard part. The rider sprints, and the run's momentum carried
the player off a landing's open side to the ground under the stair.
Small timing differences decided whether it happened: an extra press
at the foot was enough. Each point on the stair is now walked and then
stood on for 20 frames. Coming back down, the hatch drops a flight at
once, so the way down has one zig-zag less than the way up.

About 1.7 s locally. It runs in ci's ring-2-content job and in the
nightly workflow, beside the pond leg. It lands through `plan/sh8`,
because Linux physics may differ: Driftwood's checkpoint hash did,
under SH-ALL-13.
