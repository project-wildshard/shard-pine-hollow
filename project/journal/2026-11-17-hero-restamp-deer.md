# Re-stamp Pine's hero after the deer numbers (SB26, buddy-engine)

- Pine's publish (run 44026227937) failed in its author check with
  `[shardfile-refused]`. The line above it named the cause: the curated
  hero's stamp no longer matched the content, since c0defd0 changed
  the deer's hunt numbers. The tool's own fix is
  `wildshard hero src --stamp-existing`: keep the art, no capture. It is
  the same step that adopted these images on 11-14.
- The coordinator asked for a bump to the current sdk (0.3.9). Tried
  first: on 0.3.9, Pine's config refuses with "config must bundle as one
  module". Pine is the only shard using the sdk's `bake/splatGround`,
  which imports engine's `world/Terrain`; that reaches
  `boot/contentRead`, whose dynamic import of `ui/downloadFailed`
  (engine a30cb9fb, in 0.1.32 and 0.1.33) splits off a second chunk
  holding the client app. That needs an sdk or engine change, so Pine
  stays on 0.2.13 for now.
- Locally on 0.2.13: `publish-shard.mjs build pine-hollow` and
  `wildshard check . tmp/publish/check` both pass.
