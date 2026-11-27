import type { ProjectGenerationContext } from '@wildshard/sdk/projectGeneration';
import { emitNamedBlobs, nameBlob, type EmittedBlobs } from '@wildshard/sdk/blobs';
import declared from '../data/publicInputs.json' with { type: 'json' };
import { rigMapPng } from './rigImages';

/** SF5 (J525): the phone birds atlas is the phone GLB's own base colour image as a lossless PNG; the cook encodes it. */
export const PHONE_BIRDS_INPUTS: readonly string[] = [declared.birds.phone];
const file = 'birds.phone.base.png';

/** The phone birds atlas as an owned-byte build output, read from the tracked phone GLB at shard file build (GR0). */
export async function phoneBirdsAtlasOutput(ctx: Pick<ProjectGenerationContext, 'cached' | 'readImagePixels' | 'writeImagePixels'>): Promise<EmittedBlobs> {
  const write = ctx.writeImagePixels;
  if (write === undefined) throw new Error('Phone birds atlas needs the build context PNG writer');
  const glb = (await ctx.cached({ id: 'phone-birds-glb', inputs: PHONE_BIRDS_INPUTS }, inputs => {
    const bytes = inputs.get(PHONE_BIRDS_INPUTS[0] ?? '');
    if (inputs.size !== 1 || bytes === undefined) throw new Error('Phone birds input inventory differs');
    return new Map([['glb', bytes]]);
  })).get('glb');
  if (glb === undefined || glb.byteLength === 0) throw new Error('Phone birds GLB cache inventory differs');
  return emitNamedBlobs([nameBlob(`models/life/${file}`, 'image', await rigMapPng(glb, 'base', 4096, { read: ctx.readImagePixels, write }), { tier: 'phone' })]);
}
