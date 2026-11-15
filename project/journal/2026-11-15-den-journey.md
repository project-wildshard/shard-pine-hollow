# Fight past the Sow to the den lantern

> Written by: Codex
> State: implemented, 2026-11-15.

The den leg takes the rifle through the cabin door, reads Hale's talk,
then runs the real den trail. The player turns to fire between sprints
and fells the Grizzled Sow. A bear blow lands, taking health to 45;
the player survives, reaches the cave and relights its lantern.
The remaining bears and Old Blackpaw are not declared defeated.

Every fight tick and the final approach refuse a hidden death/respawn.
The raw steering must agree with the direction of a sprint: moving a
world-space vector backwards while the raw controls still press forward
walks into the bear. The player turns away between shots instead.
The explicit Ring 2 test takes about two seconds locally. A no-fire
input mutant is retained only during development to verify refusal.
