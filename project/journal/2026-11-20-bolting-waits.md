# Bolting waits for SDK 0.4.19

The bolting fix (325b1a2) moved Pine's sim enough to break ci21-source:
the recorded native checkpoints and quest saves no longer replay, and the
story tape sticks on the King's leg (run 44715974901). The den journey it
was for now waits for engine 0.1.56 anyway, so the converter's own fix in
SDK 0.4.19 (codex-ci21) brings bolting back with its tapes re-recorded.
Back to the pre-bolting species rows and the tape checkpoint recorded for
them; the walk checkpoint is recorded fresh from the next run.
