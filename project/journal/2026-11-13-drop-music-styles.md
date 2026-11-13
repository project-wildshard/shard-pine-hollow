# Drop the folk and orchestral music

> Written by: Claude (opus-au17), 2026-11-13

Meta AUDIO AU17, after J304 and engine AU16: the engine plays one music
style, piano, and no longer offers a Settings choice, so Pine's folk and
orchestral music is never read. Gone: `music/{folk,orchestral}/pine-tension-*`
and the `pine-hollow-folk/` and `pine-hollow-orchestral/` score sets
(boss stems, night calm and tension, the dawn sting, each `music.json`),
with their 16 `mounts.json` rows and two `manifest.json` input globs:
7.15 MB of source (7,145,770 bytes). `pine-hollow-piano/` stays.

- The download never held them (AU1 and AU19 cook only the piano boot
  set), so AU6's report is unchanged: 77 audio rows, 4.73 MB phone.
- The hero stamp was already stale before this change (ring-2-content
  red since `ab06865`: "the hero of pine-hollow is older than its
  content"). A capture needs a working spawn render, which is the engine
  bug opus-pinefix owns, so this change leaves that red as it was; the
  next capture covers this content too.
- A new revision for a release slot (it rides with AU10's re-encode);
  this lane uploads nothing.
