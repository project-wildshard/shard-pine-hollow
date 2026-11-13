import { resolve } from 'node:path';
import * as v from 'valibot';
import { expect, test } from 'vitest';
import { CabinAppearanceSchema as CabinRowsSchema } from '../src/generators/sections';
import { staticOutput } from '../src/generators/sourceOutput';
import { readImagePixels } from '@wildshard/sharddev/bake/image';
import { CABIN_LIFE } from '../src/generators/cabinLook';
import { CABIN_LIGHT } from '../src/generators/cabinAssembly';
import { HEARTH_LOOKS } from '../src/generators/hearthLook';
import { createProjectGeneration } from '@wildshard/sharddev/projectGeneration';
import { hashImmutableBytes } from '@wildshard/format/immutable';
import { readPineSources } from '../src/generators/programSources';
import { forestPageRows, worldSceneRows } from '@wildshard/sharddev/worldScenes';
import { outputPlatformPayloads } from '@wildshard/sharddev/outputProduct';

// the program's sources (GR8 G37: the timber world is baked in the program, so no disk file holds it)
// SA24: src/generators/scriptSources.mjs still climbs to public/ from src/shards/pine-hollow/ and waits for the next
// hero capture, so this test (moved out of src/) reads the same sources with the single-shard src/ roots.
const project = resolve('src'), assets = resolve('public/assets');
const sources = await readPineSources(createProjectGeneration(project, hashImmutableBytes(new TextEncoder().encode('pine-cabin-shardfile-test')),
  new Map(), undefined, [{ prefix: '/assets/', directory: assets }]));
const output = await staticOutput(sources, readImagePixels);

test('native cabin carriers retain every authored material and life value and reject malformed rows', () => {
  expect(Object.hasOwn(output, 'custom')).toBe(false);
  const file = output.namedFiles.find(row => row.name === 'world/forest-page.json');
  const bytes = file === undefined ? undefined : output.assets.get(file.hash);
  if (bytes === undefined) throw new Error('Missing defining forest page');
  const page = forestPageRows(JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)));
  const scenes = worldSceneRows(outputPlatformPayloads(output.platform,['world/scenes']).get('world/scenes'));
  const look = (id:string):string => {
    const row = scenes.materials.find(material => material.id === id);
    if (row?.kind !== 'look') throw new Error(`Missing defining cabin material: ${id}`);
    return row.look;
  };
  const rows = v.parse(CabinRowsSchema,{CABIN_LIFE:page.buildings.life,CABIN_LIGHT:page.buildings.light,
    HEARTH_LOOKS:{smoke:look('cabin.smoke'),flame:look('cabin.flame'),ember:look('cabin.ember')}});
  expect(rows).toEqual({ CABIN_LIFE, CABIN_LIGHT, HEARTH_LOOKS });
  expect(() => v.parse(CabinRowsSchema, { ...rows, extra: true })).toThrow();
  expect(() => v.parse(CabinRowsSchema, { ...rows, CABIN_LIFE: { ...rows.CABIN_LIFE, fire: [0.7] } })).toThrow();
  expect(() => v.parse(CabinRowsSchema, { ...rows, CABIN_LIGHT: { ...rows.CABIN_LIGHT, count: 'two' } })).toThrow();
});
