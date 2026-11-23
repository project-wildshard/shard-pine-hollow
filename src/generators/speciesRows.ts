import { bakeSpecies, commonSpeciesRows, deriveSpeciesRows } from '@wildshard/kit/bake/species';
import { DEER } from './deerRows';
import { ELK } from './elkRows';
import { species as readSpecies, type SpeciesData } from '@wildshard/sdk/species';
import { pinePhysics } from './physics';

const boar = commonSpeciesRows('boar', 'kit.creature.boar');
const boarThrall: ReturnType<typeof bakeSpecies>['variants'][number] = {
  id: 'thrall', label: 'Thrall', weight: 1, rarity: 'rare', scale: [1.1, 1.2], hp: 140, mods: { chargeDist: 1.4 },
};
if (boar.harvest === undefined) throw new Error('The kit boar needs declared harvest rows');

/** Pine adds the night-only thrall to both the spawn roster and the inherited tusk drop. */
export const PINE_BOAR: ReturnType<typeof bakeSpecies> = deriveSpeciesRows(boar, {
  id: 'pine.creature.boar',
  spawnOnly: [boarThrall],
  harvest: boar.harvest.map(drop => drop.item === 'boar-tusk' && drop.variants !== undefined
    ? { item: drop.item, count: drop.count, variants: [...drop.variants, boarThrall.id] }
    : drop),
});
/** The elk's thrall variant (the elk's one spawn-only row; the renderer-free runtime reads it beside the kit's elk). */
export const PINE_ELK_THRALL: ReturnType<typeof bakeSpecies>['variants'][number] = { id: 'thrall', label: 'Thrall', weight: 1, rarity: 'rare', scale: [1.1, 1.2], hp: 220, mods: { damageTaken: 0.8, speed: 0.9 } };
export const PINE_BEAR: ReturnType<typeof bakeSpecies> = commonSpeciesRows('bear', 'pine.creature.bear');
/** ONE-FORMAT OF30: the species Pine declares, in the roster's native order (deer, elk with its thrall, boar, bear, the
 *  Antler King), each baked under its `pine.creature.<kind>` id. The King is the elk's sim with his parked prewarm's one
 *  variant (the physics bake's), so his row needs no species programme. */
export function pineNativeSpecies(): SpeciesData[] {
  // GR8: called, not read from a scheduler job's output
  const king = pinePhysics().parked[0];
  if (king?.kind !== 'antler-king') throw new Error('Pine bake has no Antler King prewarm');
  const kingSpecies = readSpecies({ ...bakeSpecies({ ...ELK, kind: king.kind, aggressive: true }, `pine.creature.${king.kind}`),
    variants: [{ id: king.variant, label: king.spec.label, weight: 1, rarity: king.spec.rarity, scale: [king.scale, king.scale] }] });
  return [...[DEER, { ...ELK, spawnOnly: [PINE_ELK_THRALL] }, PINE_BOAR, PINE_BEAR]
    .map(row => bakeSpecies(row, `pine.creature.${row.kind}`)), kingSpecies];
}
