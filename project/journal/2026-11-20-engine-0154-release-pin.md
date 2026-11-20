# Pine pins engine 0.1.54, not its prerelease

OF23a's staging publish (run 44722185353) built and prepared, then the
upload refused: the sharddev uploader takes only an X.Y.Z engine, and
Pine pinned 0.1.54-next.6bab8fcc. That prerelease is the v0.1.54 release
commit (6bab8fcc4), so the pin moves to 0.1.54 with no code change and
the linux checkpoints recorded for the prerelease carry over to the
release's key.
