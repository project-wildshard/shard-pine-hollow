# The zipline on real inputs (SH-ALL-8)

The second of Pine's Ring 2 quest legs after the ridge lantern. It
sits in `test/ci/ridge-journey.test.mjs` as a second test, because it
starts the same way (the N road, the den trail, the lookout trail and
the five flights) and both CI steps already run that file.

From the hatch the player walks out of the cab's door, which is on
the launch side at the tower's local x -1.45..-0.55, onto the launch's
planks under the cable's top anchor (35.2, 209.4 in state/modes). The
cable's [E] press does nothing from inside the cab, but works at the
launch. The ride takes about 16.4 s of game time at the cable's
16 m/s cap. It raises `used:ph-zip` and sets the player down at the
landing (4, 3.3, 20) on the N road. The test finds the route through
the cab door by walking it, since a straight line from the hatch to
the launch hits the cab's wall at z 212.1.

About 1.4 s locally. The next legs are the den, the stag, the King
and dawn, plus ranged ownership.
