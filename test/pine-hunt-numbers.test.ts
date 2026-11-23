// SB26 (STAGING-BUGBASH): every species Pine Hollow spawns declares its own hunting numbers and health, so the engine's
// built-in fallbacks (huntPattern's LEGACY_GRAZER_TUNING / LEGACY_CHARGER_TUNING, species registry LEGACY_HEALTH) can go
// (ONE-FORMAT OF5b) with no change in play. The deer's numbers are the engine's old grazer values, copied as they stood.
import { expect, test } from 'vitest';
import { pineNativeSpecies } from '../src/generators/speciesRows';
import { DEER } from '../src/generators/deerRows';

/** The engine's LEGACY_GRAZER_TUNING (engine src/shared/engine/ai/huntPattern.ts) the deer read before SB26. */
const OLD_GRAZER = {
  hp: 60, sightRange: 30, sightRangeGraze: 14, sightCone: 55 * Math.PI / 180,
  hearStill: 3, hearCrouch: 6, hearWalk: 12, hearSprint: 24,
  noticeRate: 0.3, forgetRate: 0.3, alertAt: 0.45, boltAt: 1.0,
  freezeMin: 4.0, freezeMax: 7.0, relaxAfter: 3.5, panicDist: 6,
  runSpeed: 6.0, trotSpeed: 3.2, fleeMinTime: 1.5, fleeUntil: 35, fleeUntilMax: 50, fleeMaxTime: 8, lookBack: 2.5,
  waryTime: 10, waryBoost: 1.2,
  herdAlertRadius: 8, herdBoltDelayMin: 0.4, herdBoltDelayMax: 1.2,
  impactSpook: 4, impactAlert: 10,
};

test('every species Pine Hollow spawns declares its hunting numbers and health', () => {
  const rows = pineNativeSpecies();
  const bare = rows.filter(row => row.tuning === undefined || !(row.tuning.hp > 0)).map(row => row.id);
  expect(bare).toEqual([]);
});

test("the deer's numbers are the engine's old grazer numbers, so nothing changes in play", () => {
  const tuning = DEER.tuning;
  expect(tuning).toBeDefined();
  for (const [key, value] of Object.entries(OLD_GRAZER)) expect(Reflect.get(tuning ?? {}, key), key).toBeCloseTo(value, 12);
  expect(Object.keys(tuning ?? {}).sort()).toEqual(Object.keys(OLD_GRAZER).sort());
});

// OF30: one side now (the species programme's page half is gone; the declared rows are made from these)
test('Pine preserves the thrall tusk and sow exception', () => {
  const boars = pineNativeSpecies().filter(row => row.kind === 'boar');
  expect(boars).toHaveLength(1);
  for (const { harvest = [] } of boars) {
    const items = (variant: string): string[] => harvest
      .filter(drop => drop.variants === undefined || drop.variants.includes(variant))
      .flatMap(drop => Array.from({ length: drop.count }, () => drop.item));
    expect(items('thrall')).toEqual(['boar-meat', 'boar-hide', 'boar-tusk']);
    expect(items('sow')).toEqual(['boar-meat', 'boar-hide']);
  }
});
