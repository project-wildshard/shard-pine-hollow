# CI admits npm next engine pins (opus-pine4)

- ci21-source's producer check asserted an x.y.z engine pin; J475/FS28
  publishes an exact prerelease (0.1.54-next.6bab8fcc) to npm next, which
  Pine main pins since d0c21f9. Ported shard-driftwood 3eed7ab: the check
  admits `-next.<sha>`.
- ring-2-content's "missing admitted skin GLB" on the same run is the
  engine's (f03adaf029, rides v0.1.55), not this script.
