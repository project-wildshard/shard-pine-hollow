# The lean-move breaks in the browser tools, fixed (opus-chunk2, meta QA 11-25 row 82)

- pine-hollow-nan-scan and pine-hollow-views took ROOT one level off (src/, so they read src/src/art); ROOT is the repo
  root again and the cameras default is art/round-0-baseline/cameras.json, copied from singleplayer where it stayed.
- The scan now skips an anchor with no cameras of its own (views frames those from the game).
- playwright 1.65.0 is a devDependency: the src/scripts browser tools import it.
- Proof on a local engine build (b9e43a2cd, preview on 127.0.0.1:4391, sdk zone-entry linked from sharddev
  plan/cp20-sdk): the scan entered pine-hollow, 27 cameras, 0 with non-finite pixels.
