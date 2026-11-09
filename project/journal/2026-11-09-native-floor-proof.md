# Preserve the authored native floor intake

The pending SDK native-floor-shards test belongs with the actual floor
sources. This repo now calls its real authoring generator and compares
the public raw intake against the independent pre-B6 inline control.
Every byte hash, every Object.is float value, scale, origin, friction
and collision group assertion remains. There is no tolerance, planted
runtime floor, content change or engine/SDK pin change.

The explicit case is in CI only with a 9.5-second limit. The inherited
SDK file and its registry remain until both owners are exact CI green
and a one-shot review maps all original assertions. No file deleted.

J206 review maps all original assertions. Its MUST-FIX is addressed
with an elapsed-time assertion around the complete body, alongside
Node's timeout, so synchronous work cannot falsely pass an overrun.
The ownership SHOULD is also addressed: raw output cannot share the
caller buffer, and clearing that input leaves every decoded value and
hash intact. The one-shot report is under session-keep/reviews/
sharddev-SDK-native-floor-20261109T234848Z-14122.md. No deletion.
