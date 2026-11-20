/**
 * ONE-FORMAT OF23c: Pine's herd bodies as declared spawns. Every body r6's native roster stood in a herd
 * (`data/rosterR6.json`, the engine's boot census of r6) stands from the shard file's `creatures.spawns` with its id, kind,
 * variant, seed, scale, stand point and yaw, grouped by its herd; its species row is OF23a's (`hullSpecies.ts`), whose
 * hunt layer drives it. The roster rolls no herd of its own; it keeps the four elites at their lairs, the King's and the
 * thralls' reserves and the night spawns, on ids past the declared ones (engine OF23c).
 */
import type { ShardCreatures } from '@wildshard/format/creatures';
import type { Shardfile } from '@wildshard/format/shardSchema';
import roster from '../data/rosterR6.json' with { type: 'json' };
import { ELITE_RANK, PINE_ELITE_ANIMALS, PINE_ELITE_DEFS } from './eliteRoster';
import night from '../data/populationNight.json' with { type: 'json' };
import king from '../data/bossEncounter.json' with { type: 'json' };
import { KINGS_CLEARING } from './layout';

type Spawn = ShardCreatures['spawns'][number];

/** The page's seed in [0, 1) as a declared row's 32-bit seed. */
export function pageSeed(seed: number): number { return Math.floor(seed * 2 ** 32) >>> 0; }

/** r6's herd bodies, in id order, as declared spawn rows. */
export const PINE_DECLARED_SPAWNS: Spawn[] = roster.bodies.filter(body => body.herd >= 0).map(body => ({
  id: body.id, species: `pine.creature.${body.kind}`, variant: body.variant, brain: null, strike: null,
  seed: pageSeed(body.seed), scale: body.scale, at: [body.at[0] ?? 0, body.at[1] ?? 0, body.at[2] ?? 0], yaw: body.yaw,
  group: `pine.herd.${String(body.herd)}`,
}));

/** OF23c: r6's four elites as declared bodies on rank elite, each in its fight program's spawn group (`pine.elite.<id>`),
 *  which binds the program's main to it (engine OF23c); its scale is r6's over the rank's size, so it stands as large. */
export const PINE_ELITE_SPAWNS: Spawn[] = Object.entries(PINE_ELITE_ANIMALS).map(([id, who]) => {
  const body = roster.bodies.find(row => row.herd < 0 && row.kind === who.kind && row.variant === who.variant), def = PINE_ELITE_DEFS[id];
  if (body === undefined || def === undefined) throw new Error(`Pine elite ${id}: no r6 body or lair`);
  return { id: body.id, species: `pine.creature.${body.kind}`, variant: body.variant, brain: null, strike: null, seed: pageSeed(body.seed),
    scale: body.scale / ELITE_RANK.size, at: [def.lair.x, body.at[1] ?? 0, def.lair.z], yaw: body.yaw, group: `pine.elite.${id}`, rank: 'elite' };
});

/** OF23c: the night's thralls as declared bodies in the night script's group (`pine.night`), out of the world until it
 *  spawns one (engine OF23c): enough of each kind for every roaming slot and the mill race at once (four roamers of
 *  either kind, the race's two boars and one elk), on the thralls' own species (`hullSpecies.ts` PINE_THRALL_SPECIES), each
 *  standing where the race does until the night calls it. */
export const PINE_NIGHT_SPAWNS: Spawn[] = (['boar', 'elk'] as const).flatMap(kind => Array.from({ length: kind === 'boar' ? 6 : 5 }, (_, i): Spawn => ({
  id: `pine.night.${kind}.${String(i)}`, species: `pine.${kind}.thrall`, variant: night.variant, brain: null, strike: null,
  seed: pageSeed(((kind === 'boar' ? 0 : 6) + i + 1) / 16), scale: 1, at: [-194, 0, -148], yaw: 0, group: night.step,
})));

/** OF23d: the Antler King's species row id (his program row is `pine.creature.antler-king`; a skin's skeleton name is its
 *  species id, which admits no hyphen). */
export const PINE_KING_SPECIES = 'pine.creature.king';
/** OF23d: the Antler King as a declared body in his fight's spawn group (`pine.king`, the encounter's fight step): the
 *  fight raises him at night in place of the roster's parked King. His id is his decision row's actor, so his spawn
 *  replaces the runtime's boss row (`spawns.ts`); his `boss` encounter row (below) is his retained actor. */
export const PINE_KING_SPAWN: Spawn = { id: 'pine.antler-king', species: PINE_KING_SPECIES, variant: 'warden', brain: null, strike: null,
  seed: pageSeed(0.5), scale: 1, at: [KINGS_CLEARING.x, 0, KINGS_CLEARING.z], yaw: 0, group: king.steps.fight };
/** OF23d (option B, coordinator 11-20): the King's `boss` encounter row declares him. It is his retained actor (the format
 *  admits his public `king.*` decision fields on it with no runtime boss), and the native fight (`boss.ground`) owns his
 *  body and runs the encounter (engine OF23d): its labels and phase thresholds are his fight's own (`bossEncounter.json`),
 *  its steering numbers are never read. */
export const PINE_KING_ENCOUNTER: Shardfile['encounters'][number] = { id: 'pine.king.boss', entity: PINE_KING_SPAWN.id, kind: 'boss', panel: null,
  name: king.definition.name, title: king.definition.title, retry: king.definition.retryTitle,
  arena: { at: [KINGS_CLEARING.x, 0, KINGS_CLEARING.z], radius: KINGS_CLEARING.r }, intro: king.definition.intro, introShort: king.definition.introShort,
  respawn: { at: [KINGS_CLEARING.x, 0, KINGS_CLEARING.z + KINGS_CLEARING.clear], yaw: 0 },
  phases: king.definition.phases.map(phase => ({ at: phase.at, name: phase.name, caption: phase.caption, speed: 0, stopDistance: 0, turnRate: 0 })) };
/** OF23d: the King's thralls as declared bodies in his group: a summon of a kind stands a fallen or absent one of them, so
 *  each add kind has one per add lane. They wait out of the world at the clearing until the fight stands them. */
export const PINE_KING_THRALLS: Spawn[] = (['boar', 'elk'] as const).flatMap(kind => Array.from({ length: king.lanes.count }, (_, i): Spawn => ({
  id: `pine.king.${kind}.${String(i)}`, species: `pine.${kind}.thrall`, variant: king.adds.variant, brain: null, strike: null,
  seed: pageSeed(((kind === 'boar' ? 0 : 4) + i + 1) / 16 + 1 / 32), scale: 1, at: [KINGS_CLEARING.x, 0, KINGS_CLEARING.z], yaw: 0, group: king.steps.fight,
})));
