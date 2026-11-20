// ONE-FORMAT OF23c: Pine's herd bodies are declared spawns. Every body the native roster stood in r6's herds (ids, kinds,
// variants, seeds, scales, stand points and yaws, `data/rosterR6.json` from the engine's boot census) is a row of the
// shard file's `creatures.spawns`, grouped by its herd, and so are the four elites, on rank elite at their lairs, each in
// its fight program's spawn group; the roster stands no body of its own.
import { describe, expect, test } from 'vitest';
import roster from '../src/data/rosterR6.json' with { type: 'json' };
import physicsRows from '../src/data/physicsRows.json' with { type: 'json' };
import { PINE_DECLARED_SPAWNS, PINE_ELITE_SPAWNS, PINE_NIGHT_SPAWNS, pageSeed } from '../src/generators/declaredRoster';
import { NIGHT_SPAWN } from '../src/generators/nightSpawn';
import { PINE_THRALL_SPECIES } from '../src/generators/hullSpecies';
import { ELITE_FEATURE_ROWS } from '../src/generators/eliteFeatureRows';
import { PINE_LANES } from '../src/generators/strikes';
import { creatureRank } from '@wildshard/format/creatureRanks';
import { POPULATION_ROSTER } from '../src/generators/population';
import { PINE_ELITE_DEFS, PINE_ELITE_ANIMALS } from '../src/generators/eliteRoster';

const herds = roster.bodies.filter(body => body.herd >= 0), elites = roster.bodies.filter(body => body.herd < 0);

describe("Pine's herd bodies are declared spawns (ONE-FORMAT OF23c)", () => {
  test("r6's boot roster: 164 bodies, 160 in 52 herds and the four elites at their lairs", () => {
    expect(roster.bodies).toHaveLength(164);
    expect(new Set(herds.map(body => body.herd)).size).toBe(52);
    expect(elites.map(body => [body.kind, body.variant, body.at[0], body.at[2]])).toEqual(Object.entries(PINE_ELITE_DEFS)
      .map(([id, row]) => [PINE_ELITE_ANIMALS[id]?.kind, PINE_ELITE_ANIMALS[id]?.variant, row.lair.x, row.lair.z]));
  });

  test('every r6 herd body is a declared spawn with its id, species, variant, seed, scale, stand point, yaw and herd', () => {
    expect(PINE_DECLARED_SPAWNS.map(row => ({ id: row.id, species: row.species, variant: row.variant, seed: row.seed, scale: row.scale,
      at: row.at, yaw: row.yaw, group: row.group }))).toEqual(herds.map(body => ({ id: body.id, species: `pine.creature.${body.kind}`,
      variant: body.variant, seed: pageSeed(body.seed), scale: body.scale, at: body.at, yaw: body.yaw, group: `pine.herd.${String(body.herd)}` })));
    for (const row of PINE_DECLARED_SPAWNS) { expect(row.brain).toBeNull(); expect(row.strike).toBeNull(); }
  });

  test('the roster stands no body: it keeps only the reserves, on their r6 ids', () => {
    expect(POPULATION_ROSTER.fauna).toEqual([]);
    expect(POPULATION_ROSTER.bodyCount).toBe(0);
    expect(POPULATION_ROSTER.homes).toEqual([]);
    expect(physicsRows.actors).toEqual([]);
    expect(physicsRows.herds).toEqual([]);
    expect(physicsRows.parked.map(row => row.id)).toEqual(['creature:161', 'creature:162', 'creature:163']);
  });

  test("the four elites are declared bodies on rank elite, in their fight's spawn group, as large and as strong as r6's", () => {
    const rank = creatureRank('elite');
    expect(PINE_ELITE_SPAWNS.map(row => [row.id, row.species, row.variant, row.rank, row.group, row.seed, row.yaw])).toEqual(Object.entries(PINE_ELITE_ANIMALS)
      .map(([id, who]) => { const body = elites.find(row => row.kind === who.kind && row.variant === who.variant);
        return [body?.id, `pine.creature.${who.kind}`, who.variant, 'elite', `pine.elite.${id}`, pageSeed(body?.seed ?? 0), body?.yaw]; }));
    for (const row of PINE_ELITE_SPAWNS) {
      const body = elites.find(entry => entry.id === row.id), def = Object.values(PINE_ELITE_DEFS).find(entry => `pine.elite.${entry.id}` === row.group);
      expect(row.scale * rank.size).toBeCloseTo(body?.scale ?? 0, 9);
      expect([row.at[0], row.at[2]]).toEqual([def?.lair.x, def?.lair.z]);
      expect(row.brain).toBeNull();
    }
    // the fight programs' main strikes land through the rank; the Imperial Bull's rivals are ordinary bulls
    for (const fight of ELITE_FEATURE_ROWS.fights) for (const strike of fight.program.strikes)
      if (strike.id !== 'rival') expect(strike.row.damage * rank.damage).toBeGreaterThan(0);
    expect(ELITE_FEATURE_ROWS.fights.find(fight => fight.def.id === 'ironhide')?.program.strikes.find(strike => strike.id === 'charge')?.row.damage)
      .toBeCloseTo(PINE_LANES.ironhide.damage / rank.damage, 9);
  });

  test("the night's thralls are declared bodies in its script's group: enough of each kind for every slot at once", () => {
    const slots = NIGHT_SPAWN.slots.length, race = NIGHT_SPAWN.spawns.filter(row => row.id.startsWith('race.')).map(row => NIGHT_SPAWN.species.find(species => species.id === row.species)?.kind);
    for (const row of PINE_NIGHT_SPAWNS) { expect(row.group).toBe(NIGHT_SPAWN.step); expect(row.brain).toBeNull(); }
    for (const kind of ['boar', 'elk'] as const) {
      const rows = PINE_NIGHT_SPAWNS.filter(row => row.species === PINE_THRALL_SPECIES[kind]);
      expect(rows.length).toBe(4 + race.filter(entry => entry === kind).length);
      for (const row of rows) expect(NIGHT_SPAWN.species.some(species => species.kind === kind && species.variant === row.variant)).toBe(true);
    }
    expect(PINE_NIGHT_SPAWNS).toHaveLength(slots + 4);
  });
});
