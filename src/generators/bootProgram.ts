import type { ProjectGenerationContext } from '@wildshard/sdk/projectGeneration';
import { readNativeTerrain } from '@wildshard/sdk/bake/terrain';
import { nameBlob } from '@wildshard/sdk/blobs';
import manifest from '../manifest.json' with { type: 'json' };
import bindings from '../data/terrainBindings.json' with { type: 'json' };
import declared from '../data/publicInputs.json' with { type: 'json' };
import { pineBootInventory, pineKtx2Tables } from './bootInventory';

/** The declared retained terrain's URL (its public path under `/assets/`). */
const TERRAIN_URL = `/${bindings.terrain.replace(/^public\//u, '')}`;
const { day, night, phone } = manifest.horizonStrips;
const HORIZON_URLS = [...new Set([day, night, phone.day, phone.night])];

/** GR8 G35: the page-mode boot rows, GPU tables and capture poses as program discovery, as the retired
 *  bake-boot-metadata.mjs wrote them: the public inventory is listed through `ctx.inputFiles` over its declared roots
 *  (`publicInputs.json` `bootInventory`: the bake's trees, Pine's own by its authored subfolders), and each diagnostic eye keeps its probe's angles at the
 *  shipping lattice's height (the terrain read through `ctx.cached`). */
export async function pineBootProgram(ctx: Pick<ProjectGenerationContext, 'cached' | 'inputFiles'>): Promise<{
  readonly 'boot.pageModes': ReturnType<typeof pineBootInventory>; readonly 'ktx2.pageModes': ReturnType<typeof pineKtx2Tables>;
  readonly poses: Record<string, { probe: (typeof manifest.captureProbes)[number]; eye: [number, number, number]; yaw: number; pitch: number; mockup: string; frame: string }>;
}> {
  const list = ctx.inputFiles;
  if (list === undefined) throw new Error('Pine boot discovery requires the inputFiles capability');
  // the declared roots, eight to a listing (the build's prefix cap); Pine's own public folder by its authored subfolders, so
  // the program's own outputs written there (the map's public alias, map/top.webp) never enter the inventory it lists
  const roots = declared.bootInventory, listed: string[] = [];
  for (let at = 0; at < roots.length; at += 8) listed.push(...list(roots.slice(at, at + 8)));
  const inventory = Object.fromEntries(listed.filter(url => !url.endsWith('.DS_Store')).sort().map((url): [string, true] => [url, true]));
  const files = await ctx.cached({ id: 'boot-inputs', inputs: [TERRAIN_URL, ...HORIZON_URLS] }, inputs => {
    const terrain = inputs.get(TERRAIN_URL);
    if (terrain === undefined || terrain.byteLength === 0) throw new Error('Missing declared Pine boot inputs');
    const outputs = new Map([['terrain.bin', terrain]]);
    for (const [index, url] of HORIZON_URLS.entries()) {
      const bytes = inputs.get(url);
      if (bytes === undefined) throw new Error(`Missing declared Pine horizon image ${url}`);
      const { file } = nameBlob(`horizon/${index}`, 'image', bytes);
      outputs.set(`horizon-${index}.txt`, new TextEncoder().encode(`/shardfiles/${manifest.slug}/${file.path}`));
    }
    return outputs;
  });
  const terrain = files.get('terrain.bin');
  if (terrain === undefined) throw new Error('Missing cached Pine boot inputs');
  const horizonAliases = new Map<string, string>();
  for (const [index, url] of HORIZON_URLS.entries()) {
    const packed = files.get(`horizon-${index}.txt`);
    if (packed === undefined) throw new Error(`Missing cached Pine horizon image ${url}`);
    horizonAliases.set(url, new TextDecoder().decode(packed));
  }
  // meta SHARD-SOURCE S12f2b3: no hand-made 6×6 aliases are left; engine's cook makes the phone's 6×6 files
  const astc: Record<string, string> = {};
  const { heightAt } = readNativeTerrain(terrain);
  const poses = Object.fromEntries(manifest.captureProbes.map(probe => [probe.name, {
    probe, eye: [probe.x, heightAt(probe.x, probe.z) + 1.68, probe.z] as [number, number, number],
    yaw: -probe.yaw * 180 / Math.PI, pitch: probe.pitch * 180 / Math.PI, mockup: '', frame: probe.name,
  }]));
  return { 'boot.pageModes': pineBootInventory(inventory, astc), 'ktx2.pageModes': pineKtx2Tables(astc, horizonAliases), poses };
}
