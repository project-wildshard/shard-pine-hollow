// ONE-FORMAT OF23a: Pine's species and both thralls as ordinary rows with hull looks, admitted in a shard file.
import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { prepareAssetDecoders } from '@wildshard/format/shardfileAssets';
import { parseSkinFile, validateSkinAssets } from '@wildshard/format/skinAssets';
import { hashImmutableBytes } from '@wildshard/format/immutable';
import { prepareGlbCost } from '@wildshard/format/glbCost';
import { MeshStandardMaterial } from 'three';
import { Scope } from '@wildshard/engine/app/scope';
// the engine's skin path (the client's creature draw); not a package export, so read from the installed engine's source
import { loadSkin } from '../node_modules/@wildshard/engine/src/client/game/shardfile/skinPlayback';
import { parseShardfile, shardfileRules, ShardfileSchema } from '@wildshard/format/shardSchema';
import { safeParse } from 'valibot';
import { emptyShardfile } from '@wildshard/sharddev/author';
import { pineHullInputs, pineHullSpecies, pineSpeciesDeclaration, PINE_THRALL_SPECIES } from '../src/generators/hullSpecies';
import { PINE_SPECIES_PROGRAMS } from '../src/generators/speciesPrograms';
import { PINE_HULLS } from '../src/generators/creatureHulls';

const read = (url: string): Uint8Array => new Uint8Array(readFileSync(new URL(`../public${url}`, import.meta.url)));

describe("Pine's species are rows (ONE-FORMAT OF23a)", async () => {
  await prepareAssetDecoders();
  const { creatures, strikes } = await pineHullSpecies(read);
  // the species' declaration as Pine's shard file takes it (generators/shardfile.ts), beside the items their drops name
  const declared = pineSpeciesDeclaration({ creatures, strikes }), base = emptyShardfile({ slug: 'pine-rows', name: 'Pine rows', author: 'Test', revision: 1, seed: 7 });
  const input = { ...base, rows: { ...base.rows, ...declared.rows }, items: { ...base.items, catalogue: declared.items }, files: declared.files, library: declared.library,
    look: { ...base.look, materials: { ...base.look.materials, ...declared.materials } } };
  const checked = safeParse(ShardfileSchema, input);
  if (!checked.success) throw new Error(checked.issues.map(issue => `${issue.path?.map(step => String(step.key)).join('.')}: ${issue.message}`).join('; '));
  const shard = parseShardfile(input);
  const assets = new Map(declared.assets.map(bytes => [hashImmutableBytes(bytes), bytes]));

  test('every native species but the King, and both thralls, with the native variants', () => {
    const native = PINE_SPECIES_PROGRAMS.native.filter(row => row.kind !== 'antler-king');
    expect(creatures.map(row => row.id).sort()).toEqual([...native.map(row => row.id), ...Object.values(PINE_THRALL_SPECIES)].sort());
    for (const row of native) {
      expect(creatures.find(entry => entry.id === row.id)?.species.variants.map(variant => variant.id)).toEqual(row.variants.map(variant => variant.id));
    }
    for (const [kind, id] of Object.entries(PINE_THRALL_SPECIES)) {
      const thrall = creatures.find(entry => entry.id === id);
      expect(thrall?.species).toMatchObject({ kind, variants: [{ id: 'thrall' }], body: { skeleton: 'quadruped', look: `${id}.look` } });
    }
    // every hull rig but the King's is worn by some look
    const hulls = new Set(PINE_HULLS.rigs.filter(hull => hull !== 'antler-king-rig'));
    expect(hulls.size).toBe(7);
    expect(pineHullInputs().filter(url => url.endsWith('.rigged.glb') && !url.includes('/gpu/'))).toHaveLength(7);
  });

  test('the deer and elk hunt with only the motion numbers they author', () => {
    const deer = creatures.find(row => row.id === 'pine.creature.deer')?.species.temperament;
    expect(deer).toMatchObject({ brain: 'hunt', tuning: { motion: { walkSpeed: 1.3, trampleRadius: 0.5 } } });
    expect(Object.keys((deer?.tuning as { motion: object }).motion).sort()).toEqual(['trampleRadius', 'walkSpeed']);
    expect(creatures.find(row => row.id === 'pine.creature.boar')?.species.temperament)
      .toMatchObject({ brain: 'hunt', tuning: { motion: { walkSpeed: 1.1, chargeSpeed: 7.5, chargeWindup: 0.55, ringRadius: 6.5, trampleRadius: 0.45 } } });
    // the program's strikes are all the Antler King's: none of these species names one
    expect(strikes).toEqual([]);
  });

  test('the rows parse and admit, every skin and variant table with its files', () => {
    expect(shardfileRules(shard)).toEqual([]);
    validateSkinAssets(shard, assets);
    for (const creature of creatures) {
      expect(shard.rows.species.find(row => row.id === creature.id)).toBeDefined();
      const look = shard.rows.looks.find(row => row.id === `${creature.id}.look`);
      expect(look?.recipe).toBe('platform.skin');
      for (const key of ['skin', 'variants']) expect(assets.has(String(look?.parameters[key]))).toBe(true);
    }
  });

  test("both thralls draw their extras as the look's parts, glowing and plain", () => {
    for (const id of Object.values(PINE_THRALL_SPECIES)) {
      const creature = creatures.find(row => row.id === id);
      const { binding } = parseSkinFile(creature?.skin ?? new Uint8Array());
      expect(binding.materials).toEqual({ parts: `${id}.parts`, 'parts.glow': `${id}.parts.glow` });
      expect(Object.keys(creature?.materials ?? {}).sort()).toEqual([`${id}.parts`, `${id}.parts.glow`]);
      expect(shard.look.materials[`${id}.parts.glow`]).toBeDefined();
    }
    // no other look carries parts
    for (const creature of creatures.filter(row => !Object.values(PINE_THRALL_SPECIES).includes(row.id))) {
      expect(parseSkinFile(creature.skin).binding.materials).toBeUndefined();
    }
  });

  test('the bears press their flaps and wear the measured brown fur', () => {
    const bear = creatures.find(row => row.id === 'pine.creature.bear');
    expect(bear?.files?.glbs).toHaveLength(2);
    const brown = PINE_HULLS.fur?.['bear-brown']?.['brown'];
    const skins = (bear?.files?.skins ?? []).map(bytes => parseSkinFile(bytes).binding.material as { rim?: number[] });
    expect(skins.some(material => JSON.stringify(material.rim) === JSON.stringify(brown?.rim))).toBe(true);
  });
}, 300_000);

// The look check: every variant skin of every look loads on the engine's skin path (the one the client draws creatures
// with) from the declared bytes; the thralls' as the hull plus their plain and glowing part groups.
describe("Pine's species looks draw on the skin path (ONE-FORMAT OF23a)", async () => {
  await prepareAssetDecoders();
  await prepareGlbCost();
  const { creatures, strikes } = await pineHullSpecies(read);
  const declared = pineSpeciesDeclaration({ creatures, strikes });
  const assets = new Map(declared.assets.map(bytes => [hashImmutableBytes(bytes), bytes]));
  const bytes = (hash: string): Uint8Array => { const found = assets.get(hash); if (found === undefined) throw new Error(`missing ${hash}`); return found; };

  test.each(creatures.map(row => [row.id, row] as const))('%s: every variant draws', async (id, creature) => {
    const table = JSON.parse(new TextDecoder().decode(bytes(String(creature.look.parameters['variants'])))) as { skins: Record<string, string> };
    expect(Object.keys(table.skins).sort()).toEqual(creature.species.variants.map(variant => variant.id).sort());
    const thrall = Object.values(PINE_THRALL_SPECIES).includes(id);
    for (const skin of Object.values(table.skins)) {
      const { row, binding } = parseSkinFile(bytes(skin)), glb = bytes(row.file);
      const names = Object.keys(binding.materials ?? {}), material = new MeshStandardMaterial(), scope = new Scope(`of23a-${id}`);
      const player = await loadSkin(glb, row, binding, material, scope, names);
      try {
        expect(player.mesh.geometry.getAttribute('position').count).toBeGreaterThan(1000);
        // one material, or the hull plus the thralls' plain and glowing parts
        expect(Array.isArray(player.mesh.material) ? player.mesh.material.length : 1).toBe(thrall ? 3 : 1);
        if (thrall) expect(new Set(player.mesh.geometry.groups.map(group => group.materialIndex))).toEqual(new Set([0, 1, 2]));
      } finally { player.dispose(); material.dispose(); scope.dispose(); }
    }
  });
}, 300_000);
