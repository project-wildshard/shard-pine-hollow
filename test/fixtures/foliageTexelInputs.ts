import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { readImagePixels } from '@wildshard/sdk/bake/image';
import PAINTED from '../../src/data/paintedTextures.json' with { type: 'json' };
import { foliageTexels, UNDER_KINDS, type FoliageTexels, type Raster, type UnderKind } from '../../src/generators/foliageTexels';

/** The tree card atlas and the undergrowth paintings, read from the repo's public files (build and test time only). */
export async function foliageTexelsFromRepo(root: string): Promise<FoliageTexels> {
  const read = async (url: string): Promise<Raster> => readImagePixels(new Uint8Array(readFileSync(resolve(root, 'src/static', url.replace(/^\//u, '')))));
  const atlas = await read('/assets/pine-hollow/models/pine-hollow-trees/cards-albedo.png');
  const textures: Record<string, { url: string }> = PAINTED.textures;
  const under = Object.fromEntries(await Promise.all(UNDER_KINDS.map(async kind => {
    const row = textures[kind]; if (row === undefined) throw new Error(`[foliage] no painted ${kind}`);
    return [kind, await read(row.url)] as const;
  }))) as Record<UnderKind, Raster>;
  return foliageTexels(atlas, under);
}
