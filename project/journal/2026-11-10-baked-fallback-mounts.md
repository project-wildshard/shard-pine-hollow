# Keep baked texture fallback mounts

The frozen product declared image and GPU texture modes for both tiers,
but its C0 mounts listed only the observed KTX2 files. Native Safari in
the iOS Simulator vetoes its broken compressed mip formats and reaches
the supported image path, which then refused before level.data.

Publish the existing authored JPG and phone WebP files too. Their bytes
and the native probe are unchanged. The engine build now checks every
baked texture declaration across every tier and mode before bundling
and after final publication. This omission already existed in v0.1.3;
it was not a J196 link or post-tag image deletion.
