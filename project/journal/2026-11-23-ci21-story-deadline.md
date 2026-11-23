# CI21 story deadline back to 30 s

> Written by: Claude (opus-perf), meta QA-FEEDBACK-2026-11-23 row 2.

- Engine d2b155352 drops the native proof worker's second asset validation (the parent already admits the bytes), so
  the story is bit-identical (fingerprint unchanged) and replay-ready falls ~1.1 to ~0.8 s locally. Two hosted
  ci21-source runs on it finished the story child in 26.1 s and 25.5 s, so CI21 pins that candidate and restores the
  30 s child and 35 s case deadlines, as 9c03baf4fb did. Hosted runners vary: a slow one can still cross 30 s.
