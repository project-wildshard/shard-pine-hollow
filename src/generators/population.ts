
import { pineKingCollision } from './kingCollision';
import blend from '../data/kingBlend.json' with { type: 'json' };
import { pineKingClips } from './kingClips';
import { parseNativePopulationRoster as parseNativePopulationRows } from '@wildshard/sdk/nativePopulationRows';
import * as LAYOUT from './layout';
import { PINE_ELITE_ANIMALS, ORDINARY } from './eliteRoster';
import { PINE_NATIVE_HUNT } from './nativeHunt';
import { PINE_KING_SPECIES } from './declaredRoster';

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
  // OF23e4 (engine OF30): with no species programme the roster runs the declared species in the programme's native order
  // (the thralls lend their variants as their kind's spawn-only ones) and the programme's hunt
  species: [{ id: 'pine.creature.deer' }, { id: 'pine.creature.elk', spawnOnly: ['pine.elk.thrall'] },
    { id: 'pine.creature.boar', spawnOnly: ['pine.boar.thrall'] }, { id: 'pine.creature.bear' }, { id: PINE_KING_SPECIES }],
  hunt: { ...PINE_NATIVE_HUNT, fight: { ...PINE_NATIVE_HUNT.fight }, bands: { ...PINE_NATIVE_HUNT.bands, states: [...PINE_NATIVE_HUNT.bands.states], legacyKinds: [] },
    hit: { ...PINE_NATIVE_HUNT.hit, tags: [...PINE_NATIVE_HUNT.hit.tags] } },
});
