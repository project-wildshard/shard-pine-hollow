# CI21 runs r10 on the v0.1.65 engine source

OF23e5 (opus-of-pine): r10 ships no `actors/species-programs`, which the v0.1.62 candidate (f9d13cda5) still required, so
ci21-source failed on 10af024. The candidate moves to v0.1.65's release commit 9c91846e65, the source of the npm pin.
