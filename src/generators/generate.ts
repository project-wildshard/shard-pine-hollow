import { withPlainNormals } from './plainNormals';
import type { GeneratedProject, ProjectGenerationContext } from '@wildshard/sdk/projectGeneration';
import { parseShardfile } from '@wildshard/format/shardSchema';
import { pineShardfile } from './shardfile';
import { pineJournal } from './journal';
import { pineGroundTiles } from './groundTileInputs';
import { canoeMovers } from './canoe';
import { prepareOutput } from './sourceOutput';
import { PINE_MODES } from './zipline';
import { readPineSources } from './programSources';
import { timberWorld } from './timberWorldRows';
import { pineGeographyRows } from './geographyRows';
import { pineBootProgram } from './bootProgram';
import { pineMapPixels } from './mapProgram';
import { pineLateMaterialFiles } from './lateMaterials';
import { pineHullInputs, pineHullSpecies, pineSpeciesDeclaration } from './hullSpecies';

/** GR8 (G19, G30): Pine's source program. It computes the rows the declaration reads from committed inputs through
 *  `ctx` (the journal from its art, the canoe mover from the retained terrain), admits the declaration with them and
 *  the mode rows, and prepares the output (`sourceOutput.ts`) in the same program: there is no output sidecar. */
export async function generate(ctx: ProjectGenerationContext): Promise<GeneratedProject> {
  const ground = await pineGroundTiles(ctx);
  for (const bytes of ground.assets) ctx.asset(bytes);
  // GR8 G37: the timber world is baked in the program (readPineSources); its hash-named assets are the declaration's files
  const sources = await readPineSources(ctx);
  for (const key of sources.list('assets/')) ctx.asset(sources.bytes(key));
  // OF23a: the species and thralls as rows with hull looks, from the hull rigs, maps, coats and thrall extras
  const urls = pineHullInputs();
  const writeImage = ctx.writeImagePixels;
  if (writeImage === undefined) throw new Error('Pine species rows need the build context PNG writer');
  // a cached step names its files relative (`assets/...`), not by their URL
  const hullInputs = await ctx.cached({ id: 'pine-hull-species', inputs: urls }, inputs => new Map(urls.map(url => {
    const bytes = inputs.get(url);
    if (bytes === undefined || bytes.byteLength === 0) throw new Error(`Missing declared Pine hull input ${url}`);
    return [url.slice(1), bytes];
  })));
  // OF23e5: plain float normals on every skin until Pine pins an engine whose far herd takes interleaved ones (500b4213c)
  const species = pineSpeciesDeclaration(await withPlainNormals(await pineHullSpecies(url => {
    const bytes = hullInputs.get(url.slice(1));
    if (bytes === undefined) throw new Error(`Undeclared Pine hull input ${url}`);
    return bytes;
  }, { read: ctx.readImagePixels, write: writeImage })));
  for (const bytes of species.assets) ctx.asset(bytes);
  const output = await prepareOutput(ctx), journal = await pineJournal(ctx);
  const declaration = pineShardfile(journal, ground.rows, timberWorld(sources), species);
  // D71: the SDK charges each named critical file (the tree rest pool, the guests) to the sim budget as it admits the
  // output; the server holds the same bytes, so the declared server memory covers them too
  const critical = output.namedFiles.reduce((n, file) => file.critical ? n + file.decoded + file.gpu : n, 0);
  const shard = parseShardfile({ ...declaration, serverBudget: { ...declaration.serverBudget, memory: declaration.serverBudget.memory + critical },
    movers: canoeMovers(sources), modes: PINE_MODES });
  // G33b: the declared ground, forest-query and pond-clip rows the manifest binds as program discovery; G35: the
  // page-mode boot rows, GPU tables and capture poses
  const geography = pineGeographyRows();
  // GR8: the map lattice, painted from the map assembly over the same sources (the SDK publishes it as the shard file map)
  const scheduled = new Set(output.late?.map(row => row.hash));
  const late = [...output.late ?? [], ...[...journal.late, ...pineLateMaterialFiles(output.namedFiles, timberWorld(sources).landmarks)]
    .filter(row => { if (scheduled.has(row.hash)) return false; scheduled.add(row.hash); return true; })];
  return { shard, output: { ...output, late }, map: { pixels: await pineMapPixels(sources, ctx), name: 'ui/images/map' },
    discovery: { 'ground.rows': geography.ground, 'forestQueries.rows': geography.forestQueries, 'pondClip.rows': geography.pondClip,
      ...await pineBootProgram(ctx) } };
}
