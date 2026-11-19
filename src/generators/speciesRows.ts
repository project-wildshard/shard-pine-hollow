import { bakeSpecies, commonSpeciesRows, deriveSpeciesRows } from '@wildshard/kit/bake/species';
import { DEER } from './deerRows';
import { ELK } from './elkRows';

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
/** The elk's thrall variant (pineElk's one spawn-only row; the renderer-free runtime reads it beside the kit's elk). */
export const PINE_ELK_THRALL: ReturnType<typeof bakeSpecies>['variants'][number] = { id: 'thrall', label: 'Thrall', weight: 1, rarity: 'rare', scale: [1.1, 1.2], hp: 220, mods: { damageTaken: 0.8, speed: 0.9 } };
export const PINE_BEAR: ReturnType<typeof bakeSpecies> = commonSpeciesRows('bear', 'pine.creature.bear');
/** Pine's elk: the kit's (its simulation fields, read at registration) plus the Antler King's thrall, spawned by id at
 *  night and in his fight, never rolled (PH-U9 / PH-M2; E405: the thrall is Pine's, not the engine's or the kit's); its coat
 *  and stiff gait are the elk look's (./looks.ts) */
export function pineElk(): ReturnType<typeof bakeSpecies> {
  const { fur: _fur, rigContract: _rig, pose: _pose, gait: _gait, postPose: _postPose, rig: _rigKind, animate: _animate, ...sim } = ELK;
  return bakeSpecies({ ...sim, spawnOnly: [PINE_ELK_THRALL] }, 'pine.creature.elk');
}
/** Pine's deer: the deer's simulation fields (its look and baked body are ./looks.ts's). */
export function pineDeer(): ReturnType<typeof bakeSpecies> {
  const { fur: _fur, rigContract: _rig, pose: _pose, gait: _gait, postPose: _postPose, rig: _rigKind, animate: _animate, ...sim } = DEER;
  return bakeSpecies(sim, 'pine.creature.deer');
}
export const PINE_SPECIES: ReturnType<typeof bakeSpecies>[] = [PINE_BOAR, PINE_BEAR];
