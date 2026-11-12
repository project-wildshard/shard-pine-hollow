# 2026-11-12: Pine Hollow builds once a push

Meta TEST-SPEED TS16f (BUILD-MAX-APPROACH PIN-1). A push used to run
`pnpm build:shards` twice: `ci/check` built to walk and admit the
products, and `ring-2-content` built again to play and cook them.

Now `ci/check` skips its build, walk and admit on a push, and a new
`ci/ring-2-content` job builds once, walks, admits, and then plays the
ranger intro and the cold cook on the same `out/` when the push touches
the paths `ring-2-content.yml` used to watch (checked with the compare
API; an unknown base plays). `ring-2-content.yml` keeps the nightly run
and dispatches. Pull requests and candidate runs still build in check.

Open Plots (TS16d) split this into a products job that uploads `out/`
and a play job that downloads it. Here that is slower: the cold cook
(394 s on the runner) is the long pole, and a hand-off would put
check's four minutes and a second setup in front of it. One job keeps
the wall at build plus cook, about 9 to 10 minutes, and saves the
second build's 2.5 runner-minutes. Getting under 6 minutes needs the
cook itself to get faster; that is engine work, not CI shape.
