import type { ProjectGenerationContext } from '@wildshard/sdk/projectGeneration';
import { emitNamedBlobs, nameBlob, nameMeshoptBlob, type EmittedBlobs } from '@wildshard/sdk/blobs';
import declared from '../data/publicInputs.json' with { type: 'json' };
import { rigMapPng } from './rigImages';
import { bakeBirds, parseBirdSidecar, type PackedRange } from './birds';
import { geometry, split } from './glbParts.mjs';

/** GR8: the ambient birds, as the retired bake-birds.mjs and birdBlobs.mjs made them. Both tiers' GLBs, the sidecar and
 *  the desktop atlas are read through `ctx.cached`; the posed rest bakes and the geometry are named
 *  meshopt-packed (as their `meshopt: true` sources were), the desktop atlas from the twin (the phone's is birdAtlas.ts). */
export async function pineBirds(ctx: Pick<ProjectGenerationContext, 'cached' | 'readImagePixels' | 'writeImagePixels'>): Promise<{ files: EmittedBlobs; ranges: PackedRange[] }> {
  const urls = declared.birds, write = ctx.writeImagePixels;
  if (write === undefined) throw new Error('Pine birds need the build context PNG writer');
  const inputs = { 'desktop.glb': urls.desktop, 'phone.glb': urls.phone, 'birds.json': urls.sidecar };
  const files = await ctx.cached({ id: 'bird-inputs', inputs: Object.values(inputs) }, read => new Map(Object.entries(inputs).map(([name, url]) => {
    const bytes = read.get(url);
    if (bytes === undefined || bytes.byteLength === 0) throw new Error(`Missing declared Pine bird input ${url}`);
    return [name, bytes];
  })));
  const file = (name: keyof typeof inputs): Uint8Array => {
    const bytes = files.get(name);
    if (bytes === undefined) throw new Error(`Missing cached Pine bird input ${name}`);
    return bytes;
  };
  const sidecar = parseBirdSidecar(JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(file('birds.json'))));
  const desktop = await bakeBirds(file('desktop.glb'), sidecar), phone = await bakeBirds(file('phone.glb'), sidecar);
  return { ranges: desktop.ranges, files: emitNamedBlobs([
    // The live posed library and its cold Explorer cards both select tiers[TIER].
    // Keep the unused device's immutable bodies out of this tier's admission/pack.
    // SF5 (J525): the atlas is the GLB's own image as a lossless PNG; the cook makes its KTX2 (SF17)
    nameBlob('models/life/birds.base.png', 'image', await rigMapPng(file('desktop.glb'), 'base', 4096, { read: ctx.readImagePixels, write }), { tier: 'desktop' }),
    await nameMeshoptBlob('models/life/birds.glb', geometry(split(file('desktop.glb'))), { tier: 'desktop' }),
    await nameMeshoptBlob('models/life/birds-rest.glb', desktop.glb, { tier: 'desktop' }),
    await nameMeshoptBlob('models/life/birds.phone.glb', geometry(split(file('phone.glb'))), { tier: 'phone' }),
    await nameMeshoptBlob('models/life/birds-rest.phone.glb', phone.glb, { tier: 'phone' }),
  ]) };
}
