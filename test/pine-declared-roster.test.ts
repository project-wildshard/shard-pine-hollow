// ONE-FORMAT OF23c: Pine's herd bodies are declared spawns. Every body the native roster stood in r6's herds (ids, kinds,
// variants, seeds, scales, stand points and yaws, `data/rosterR6.json` from the engine's boot census) is a row of the
// shard file's `creatures.spawns`, grouped by its herd; the roster rolls no herd of its own and stands only the four elites
// at their lairs, on the ids r6 gave them.
import { describe, expect, test } from 'vitest';
import roster from '../src/data/rosterR6.json' with { type: 'json' };
import physicsRows from '../src/data/physicsRows.json' with { type: 'json' };
import { PINE_DECLARED_SPAWNS, pageSeed } from '../src/generators/declaredRoster';
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

  test('the roster rolls no herd and stands only the four elites, on their r6 ids', () => {
    expect(POPULATION_ROSTER.fauna).toEqual([]);
    expect(POPULATION_ROSTER.bodyCount).toBe(4);
    expect(physicsRows.actors.map(row => [row.id, row.kind, row.variant, row.scripted])).toEqual(elites.map(body => [body.id, body.kind, body.variant, true]));
    expect(physicsRows.herds).toEqual([]);
    expect(physicsRows.parked.map(row => row.id)).toEqual(['creature:161', 'creature:162', 'creature:163']);
  });
});
