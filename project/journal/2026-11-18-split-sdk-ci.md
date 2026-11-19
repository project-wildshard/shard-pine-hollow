# Qualify the split SDK in hosted CI

The split SDK uses engine 0.1.44 for the installed runtime. Record the
observed Linux and macOS checkpoint for that engine and retain the
resume comparison. The Linux value came from run 44445794442.

The source-candidate graph uses the engine's declared wire version,
matching the original lock rather than the latest compatible release.
