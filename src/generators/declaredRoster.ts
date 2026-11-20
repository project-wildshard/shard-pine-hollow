/**
 * ONE-FORMAT OF23c: Pine's herd bodies as declared spawns. Every body r6's native roster stood in a herd
 * (`data/rosterR6.json`, the engine's boot census of r6) stands from the shard file's `creatures.spawns` with its id, kind,
 * variant, seed, scale, stand point and yaw, grouped by its herd; its species row is OF23a's (`hullSpecies.ts`), whose
 * hunt layer drives it. The roster rolls no herd of its own; it keeps the four elites at their lairs, the King's and the
 * thralls' reserves and the night spawns, on ids past the declared ones (engine OF23c).
 */
import type { ShardCreatures } from '@wildshard/format/creatures';
import roster from '../data/rosterR6.json' with { type: 'json' };

type Spawn = ShardCreatures['spawns'][number];

/** The page's seed in [0, 1) as a declared row's 32-bit seed. */
export function pageSeed(seed: number): number { return Math.floor(seed * 2 ** 32) >>> 0; }

/** r6's herd bodies, in id order, as declared spawn rows. */
export const PINE_DECLARED_SPAWNS: Spawn[] = roster.bodies.filter(body => body.herd >= 0).map(body => ({
  id: body.id, species: `pine.creature.${body.kind}`, variant: body.variant, brain: null, strike: null,
  seed: pageSeed(body.seed), scale: body.scale, at: [body.at[0] ?? 0, body.at[1] ?? 0, body.at[2] ?? 0], yaw: body.yaw,
  group: `pine.herd.${String(body.herd)}`,
}));
