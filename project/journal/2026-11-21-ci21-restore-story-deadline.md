# Restore the Pine CI21 story deadline

The same sealed Pine source passed all 12 CI21 files on two hosted Linux
runners with engine v0.1.62 at f9d13cda54. Runs 44894341481 and 44894853501
completed the whole 33,090-tick story in 24.787 and 24.943 seconds. Recording
and replay took 17.434 and 17.504 seconds. The earlier v0.1.54 and v0.1.57
hosted timings overlapped and did not give an engine bisect boundary.

Pin the CI21 source job to the proved candidate and restore the original
30-second child and 35-second case limits. The producer keeps its own pin.

The push-triggered run 44895466206 reached the 30-second deadline and the
other eleven originals passed. Product-session and replay-worker readiness
were both slower before recording began. Keep the exact v0.1.62 candidate
and retain the existing temporary 45-second child and 50-second case limits
until the whole journey has headroom on the slower runner.
