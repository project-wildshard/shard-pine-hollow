# SA11: Pine Hollow shard text

> Written by: Codex
> **State:** in progress, 2026-11-13, lane codex-sa11.

J317 retires product from author-facing names. Pine's declaration is now
`generators/shardfile.ts` / `pineShardfile`; its held pool helper and cabin
test also use shardfile names. Coat results are `CoatPage` rows, and local
material path helpers use `shardfileName`. Comments and the shard README
use shard file, program, page or data according to what they describe.
The README edits are the narrow terminology change requested by SA11.

The installed SDK 0.2.4 and format 0.4.8 still require four `product`
options, `productFiles`, the Explorer `source: 'product'` discriminator,
and the SDK's `outputProduct` import. Keep those seven contract references
until SA23/SA25 and the package bump; hiding them in a local facade would
leave the dependency unchanged. Blender's DOT_PRODUCT and the AS comment
about integer multiplication are mathematical terms.

No package pins or generated assets change. Generator source edits change
the map input hash, so this rides the planned revision pass; no upload.

Validation: `pnpm test` passes (7 kit tests, 29 shard tests / 16 files).
`pnpm check` passes. `wildshard check` refuses the far proxy at 1,631,500
resident bytes against a 1,600,000 cap; validation/proof/report skip after
the build refusal. An unchanged-HEAD scratch check is in progress to
separate this blocker from the terminology change. No gate is bypassed.
The three renamed source files remove their previous paths as well as
adding the new ones; all imports use the new paths.
