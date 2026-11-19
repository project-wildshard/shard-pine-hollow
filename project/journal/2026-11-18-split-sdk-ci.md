# Qualify the split SDK in hosted CI

The split SDK uses engine 0.1.44 for the installed runtime. Record the
observed Linux and macOS checkpoint for that engine and retain the
resume comparison. The Linux value came from run 44445794442.

The source-candidate graph uses the engine's declared wire version,
matching the original lock rather than the latest compatible release.

The exact c7d87608 candidate records the current snapshot wire, including
kill credit. The old fixture relabelled it as v1, which refused that field.
The immediate restore comparison reads both states through the same decoder
so schema field order matches. All six native hashes, the 1,200-tick replay,
and the old quest envelope are still checked.

The 8,000, 16,000 and 24,000 tick checkpoints held. The King and fallen
checkpoints now occur at 32,052 and 33,635 ticks. The timing cause remains
unverified. All three exact candidate witness tests passed.
