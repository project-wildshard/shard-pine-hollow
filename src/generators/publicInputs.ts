import type { ProjectGenerationContext } from '@wildshard/sdk/projectGeneration';
import declared from '../data/publicInputs.json' with { type: 'json' };
import { bakeKingKit, type KingKitRows } from './kingKit';
import { nameMeshoptBlob, type NamedBlob } from '@wildshard/sdk/blobs';

/** The King kit pool's path in the shard file. */
const KING_KIT_NAME = 'models/king/kit.glb';
/** GR8: the Antler King's kit, baked from both tiers' rigs (read through `ctx.cached` by their declared URLs) as the
 *  retired bake-king-kit.mjs did; the pool is named and meshopt-packed as its `meshopt: true` source was. */
export async function pineKingKit(ctx: Pick<ProjectGenerationContext, 'cached'>): Promise<{ blob: NamedBlob; rows: KingKitRows }> {
  const rigs = declared.king;
  const files = await ctx.cached({ id: 'king-kit-rigs', inputs: [rigs.desktop, rigs.phone] }, inputs => {
    const desktop = inputs.get(rigs.desktop), phone = inputs.get(rigs.phone);
    if (desktop === undefined || phone === undefined) throw new Error('Missing declared Antler King rig');
    return new Map([['desktop.glb', desktop], ['phone.glb', phone]]);
  });
  const made = await bakeKingKit(tier => {
    const bytes = files.get(`${tier}.glb`);
    if (bytes === undefined) throw new Error(`Missing cached Antler King rig ${tier}`);
    return bytes;
  });
  return { blob: await nameMeshoptBlob(KING_KIT_NAME, made.glb), rows: { ...made.rows, pool: { ...made.rows.pool, url: KING_KIT_NAME } } };
}
