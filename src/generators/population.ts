
import { pineKingCollision } from './kingCollision';
import blend from '../data/kingBlend.json' with { type: 'json' };
import { pineKingClips } from './kingClips';
import { parseNativePopulationRoster as parseNativePopulationRows } from '@wildshard/sharddev/nativePopulationRows';
import * as LAYOUT from './layout';
import { PINE_ELITE_ANIMALS, ORDINARY } from './eliteRoster';

// GR8: called, not read from a scheduler job's output
const collision = pineKingCollision();

// GR8: called, not read from a scheduler job's output
const clips = pineKingClips();

/** Native spawn/population rows; encounter behaviour remains with the existing elite and King owners. */
export const POPULATION_ROSTER: ReturnType<typeof parseNativePopulationRows> = parseNativePopulationRows({
  limbPose: { step: 'pine.king.pose', limit: 512, near: 140, head: 'head', collision, blend, clips },
  version: 1, environment: 'pine.habitat', step: 'pine.roster', seed: 1368, bodyCount: 0, limit: 512,
  scripted: 'sidestep', encounter: 'antler-king', poseKinds: ['antler-king'],
  // OF23c: the herds and the elites are declared spawns (declaredRoster.ts); the roster keeps the reserves and the night spawns
  fauna: [], spawn: { x: LAYOUT.SPAWN.x, z: LAYOUT.SPAWN.z },
  identities: Object.values(PINE_ELITE_ANIMALS).map(({ kind, variant }) => ({ kind, variant })),
  ordinary: ORDINARY,
  reserves: [{ kind: 'antler-king', variant: null }, { kind: 'elk', variant: 'thrall' }, { kind: 'boar', variant: 'thrall' }],
  homes: [],
});
