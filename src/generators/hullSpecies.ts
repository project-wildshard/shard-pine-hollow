/**
 * ONE-FORMAT OF23a (with OF27c's Pine half): Pine's species as ordinary rows. Its native program's deer, elk, boar and
 * bear (and the two night thralls as their own species, `pine.boar.thrall` and `pine.elk.thrall`) go through the SDK's
 * `speciesProgramToRows` for their sim layers and through `hullCreature` for their looks: each Pine hull rig fitted to the
 * kit quadruped as a `platform.skin` look, its variants' coats, maps, flaps and fur as the hull book drew them, and the
 * thralls' rigid extras (`thrall-extras.glb`) as the look's `parts`. Rows only: the native roster still stands the bodies
 * (OF23c moves them). OF23d: the Antler King is a row too, his own upright rig fitted to the quadruped by a chain map
 * (`KING_CHAIN_MAP`), so his skin's chest is the lock point his fight's weak point reads.
 *
 * The fur is the hull book's (engine `AnimalFactory`): the species' fur style, a variant's fur over it, then the hull row's
 * own (`creatureHulls.json` `fur`, the fixed bears). Desktop tier only: a look with a variant table has no phone skin yet.
 */
import { hullCreature, type HullCreature, type HullFur, type HullVariant } from '@wildshard/sharddev/bake/hullLook';
import { speciesProgramToRows, type ProgramLook, type SpeciesProgramInput } from '@wildshard/sharddev/species/toRows';
import { legacyHarvestItems } from '@wildshard/kit/legacyHarvest';
import { createBoarLook } from '@wildshard/kit/geometry/boar';
import { createBearLook } from '@wildshard/kit/geometry/bear';
import * as geometry from '@wildshard/kit/geometry/species';
import type { FurStyle, SpeciesGeometryCompiler } from '@wildshard/kit/geometry/species';
import type { ShardRows } from '@wildshard/format/rows';
import type { Shardfile } from '@wildshard/format/shardSchema';
import { parseGlb } from '@wildshard/format/shardfileAssets';
import { parseKtx2 } from '@wildshard/format/ktx2Cost';
import { parseSkinFile, skinFileDependencies } from '@wildshard/format/skinAssets';
import { hashImmutableBytes } from '@wildshard/format/immutable';
import { PINE_SPECIES_PROGRAMS } from './speciesPrograms';
import { PINE_HULLS } from './creatureHulls';
import { pinePhysics } from './physics';
import { DEER } from './deerRows';
import { ELK } from './elkRows';
import speciesDims from '../data/speciesDims.json' with { type: 'json' };
import { ELITE_RANK, PINE_ELITE_ANIMALS } from './eliteRoster';
import { PINE_KING_SPECIES } from './declaredRoster';
import publicInputs from '../data/publicInputs.json' with { type: 'json' };
import { GPU_FILES } from '../ktx2.generated';
import { split, texture } from './glbParts.mjs';
import { capKtx2Edge } from './ktxMipTail.mjs';

type SpeciesRow = ShardRows['species'][number];
type Rgb = [number, number, number];
/** a fur style and the variants' own fur over it (deer and elk are Pine's rows, boar and bear the kit's looks) */
interface FurSource { readonly fur: FurStyle; readonly variants: Readonly<Record<string, Partial<FurStyle> | undefined>> }

const COMPILER: SpeciesGeometryCompiler = { loft: geometry.loft, tube: geometry.tube, skinPlain: geometry.skinPlain, S: geometry.S,
  boneIndex: geometry.boneIndex, srgb: geometry.srgb, mix: geometry.mix, paintNoise: geometry.paintNoise, setShag: geometry.setShag,
  isLowPoly: geometry.isLowPoly, toonPaint: geometry.toonPaint, paletteColors: geometry.paletteColors };
const listed = (rows: readonly { id: string; fur?: Partial<FurStyle> }[] | undefined) =>
  Object.fromEntries((rows ?? []).map(row => [row.id, row.fur]));
const kitLook = (look: ReturnType<typeof createBoarLook>): FurSource =>
  ({ fur: look.fur, variants: Object.fromEntries(Object.entries(look.variants ?? {}).map(([id, row]) => [id, row.fur])) });

/** The kinds Pine's hulls dress, each with its fur source (the King wears the elk's fur, as his species is the elk's). */
const FUR: Readonly<Record<string, FurSource>> = {
  deer: { fur: DEER.fur as FurStyle, variants: listed(DEER.variants as { id: string; fur?: Partial<FurStyle> }[]) },
  elk: { fur: ELK.fur as FurStyle, variants: listed(ELK.variants as { id: string; fur?: Partial<FurStyle> }[]) },
  boar: kitLook(createBoarLook(COMPILER)),
  bear: kitLook(createBearLook(COMPILER)),
  'antler-king': { fur: ELK.fur as FurStyle, variants: {} },
};

/** OF23d: the King's rig (`kingRig.ts`, 22 bones) in the quadruped's chains: the hump, neck and head are its neck, each
 *  limb's top three joints its leg chain (the hips and the hooves ride along unmapped). */
const KING_CHAIN_MAP = { root: 'body', chains: {
  neck: ['chest', 'neck', 'head'], tail: ['tail'],
  'front.L': ['armL_sh', 'armL_el', 'armL_wr'], 'front.R': ['armR_sh', 'armR_el', 'armR_wr'],
  'back.L': ['legL_hip', 'legL_knee', 'legL_hock'], 'back.R': ['legR_hip', 'legR_knee', 'legR_hock'],
} };

/** The hull book's fur numbers out of a fur style (only those the skin material reads). */
function hullFur(style: Partial<FurStyle>): Partial<HullFur> {
  const out: Record<string, unknown> = {};
  for (const key of ['roughness', 'sheen', 'sheenColor', 'envMapIntensity', 'rim', 'emissive', 'emissiveIntensity'] as const) {
    if (style[key] !== undefined) out[key] = style[key];
  }
  return out as Partial<HullFur>;
}

/** Each kind's body dimensions, r6's physics bake's (the native roster's own, so the rows' bodies collide the same); the
 *  King's are his parked body's (OF23d), its row's fields only. */
function dimsOf(kind: string): SpeciesRow['dims'] {
  const parked = pinePhysics().parked.find(row => row.kind === kind);
  if (kind === 'antler-king' && parked !== undefined && 'dims' in parked.spec) {
    const { bodyY, bodyHalfLen, bodyRadius, headRadius, legLen, feet, halfWidth } = parked.spec.dims;
    return { bodyY, bodyHalfLen, bodyRadius, headRadius, legLen, halfWidth, feet: feet.map(([x, z]) => [x, z] as [number, number]) };
  }
  const dims = (speciesDims.dims as Record<string, unknown>)[kind];
  if (dims === undefined) throw new Error(`Pine species rows: no body dimensions of kind ${kind}`);
  return dims as SpeciesRow['dims'];
}

/** OF23c: an elite's variant health, r6's over its rank (it stands on rank elite, `declaredRoster.ts`). */
function eliteVariantHealth<V extends { readonly id: string; readonly hp?: number | undefined }>(kind: string, variant: V): V {
  const elite = Object.values(PINE_ELITE_ANIMALS).some(row => row.kind === kind && row.variant === variant.id);
  return !elite || variant.hp === undefined ? variant : { ...variant, hp: variant.hp / ELITE_RANK.hp };
}
function eliteHealth<R extends { readonly kind: string; readonly variants: readonly { readonly id: string; readonly hp?: number | undefined }[] }>(row: R): R {
  const variants = row.variants.map(variant => eliteVariantHealth(row.kind, variant));
  return { ...row, variants };
}

/** OF27c: the thralls' extras node in `thrall-extras.glb`, per kind. */
const THRALL_NODES: Readonly<Record<string, string>> = { boar: 'boar_thrall', elk: 'elk_thrall' };
/** The thralls' own species ids (OF23a: a variant table shares one material contract, so parts get their own species). */
export const PINE_THRALL_SPECIES: Readonly<Record<string, string>> = { boar: 'pine.boar.thrall', elk: 'pine.elk.thrall' };
/** The desktop thrall extras, as Pine's public inputs declare them (`pineCreatureBlobs` publishes the same file). */
const THRALL_EXTRAS = publicInputs.creatures.find(row => row.name === 'models/creatures/thrall-extras.glb')?.url;

/** A hull's raw rig and its KTX2 twin (the URLs `pineRigBlobs` reads; ktx2.generated.ts names the twin). */
function rigUrls(hull: string): { raw: string; twin: string } {
  const entry = Object.entries(GPU_FILES.desktop).find(([url]) => url.endsWith(`/creatures/${hull}.rigged.glb`));
  if (entry === undefined) throw new Error(`Pine species rows: no KTX2 twin for ${hull}`);
  return { raw: entry[0], twin: entry[1] };
}
/** A variant's baked coat (KTX2), if the coat bake made one. */
function coatUrl(hull: string, kind: string, variant: string): string | undefined {
  return Object.entries(GPU_FILES.desktop).find(([url]) => url.endsWith(`/creatures/${hull}.${kind}.${variant}.coat.png`))?.[1];
}
/** The hulls these species wear (every rig, the Antler King's too since OF23d). */
const HULLS = PINE_HULLS.rigs;

/** The input URLs the looks read: every hull rig and its KTX2 twin, every baked coat and the thrall extras. */
export function pineHullInputs(): string[] {
  if (THRALL_EXTRAS === undefined) throw new Error('Pine species rows: no declared thrall extras');
  const coats = Object.entries(PINE_HULLS.hulls).flatMap(([variant, hull]) => {
    const [kind = '', id = ''] = variant.split(':'), url = coatUrl(hull, kind, id);
    return url === undefined ? [] : [url];
  });
  return [...new Set([...HULLS.flatMap(hull => Object.values(rigUrls(hull))), ...coats, THRALL_EXTRAS])].sort();
}

export interface PineHullSpecies {
  /** every species' look, rig, skin files and variant table, for the shard file's library */
  readonly creatures: HullCreature[];
  /** the converted strike rows the species' abilities name */
  readonly strikes: ShardRows['strikes'];
}

/** OF23c: r6's native rows name no reaction, and the hunt reads a non-aggressive one as a body that bolts (hit or
 *  crowded), never a provoked charger. The converter's `neutral` would turn Pine's deer and elk on the player (an elk
 *  herd charged the den journey's rifleman), so a converted `neutral` is `passive`, as r6 played. */
function bolting<T extends { temperament?: { reaction: string } | undefined }>(row: T): T {
  return row.temperament?.reaction !== 'neutral' ? row : { ...row, temperament: { ...row.temperament, reaction: 'passive' } };
}

/** Pine's species and thralls as rows with hull looks, from the declared inputs (`pineHullInputs`) read by URL. */
export async function pineHullSpecies(read: (url: string) => Uint8Array): Promise<PineHullSpecies> {
  const rig = (hull: string): Uint8Array => read(rigUrls(hull).raw);
  // the maps the hull book draws: its KTX2 twin's base and normal, capped at 256 texels a side (`pineRigBlobs`)
  const maps = (hull: string): { base: Uint8Array; normal: Uint8Array } => {
    const baked = split(read(rigUrls(hull).twin));
    return { base: capKtx2Edge(texture(baked, 'base'), 256), normal: capKtx2Edge(texture(baked, 'normal'), 256) };
  };
  const coat = (hull: string, kind: string, variant: string): Uint8Array | undefined => {
    const url = coatUrl(hull, kind, variant);
    return url === undefined ? undefined : read(url);
  };
  const hullOf = (kind: string, variant: string): string => {
    const hull = PINE_HULLS.hulls[`${kind}:${variant}`];
    if (hull === undefined) throw new Error(`Pine species rows: no hull for ${kind}:${variant}`);
    return hull;
  };
  const flapOf = (hull: string) => PINE_HULLS.flaps?.[hull];
  // a drop names the variants it falls from: each species keeps only its own (the boar's tusk names its thrall too)
  const ownDrops = <T extends { variants: readonly { id: string }[]; harvest?: readonly { variants?: readonly string[] }[] }>(row: T): T => {
    if (row.harvest === undefined) return row;
    const ids = new Set(row.variants.map(variant => variant.id));
    const harvest = row.harvest.flatMap(drop => drop.variants === undefined ? [drop]
      : drop.variants.some(id => ids.has(id)) ? [{ ...drop, variants: drop.variants.filter(id => ids.has(id)) }] : []);
    return { ...row, harvest };
  };
  // the King's row takes its own id: a skin's skeleton name is its species id, which admits no hyphen
  const program = PINE_SPECIES_PROGRAMS.native.filter(row => row.kind in FUR).map(row => row.kind === 'antler-king' ? Object.assign(structuredClone(row), { id: PINE_KING_SPECIES }) : row);
  // the strikes these species name (a `creature.<kind>` tag): the program's others are the Antler King's fight's
  const strikes = PINE_SPECIES_PROGRAMS.program.strikes.filter(strike => strike.tags.some(tag => tag.startsWith('creature.') && tag.slice(9) in FUR));
  const looks = (suffix: (row: (typeof program)[number]) => string) =>
    new Map<string, ProgramLook>(program.map(row => [row.kind, { look: suffix(row), dims: dimsOf(row.kind) }]));
  const programmed = speciesProgramToRows({ species: program.map(ownDrops), strikes } as unknown as SpeciesProgramInput, looks(row => `${row.id}.look`));
  // OF23c: an elite's variant stands on rank elite (declaredRoster.ts), whose multiplier gives back r6's health
  const converted = { ...programmed, species: programmed.species.map(eliteHealth).map(bolting) };
  // the thralls: the spawn-only variant as its kind's own species
  const thrallProgram = program.flatMap(row => row.spawnOnly === undefined || PINE_THRALL_SPECIES[row.kind] === undefined ? []
    : [{ ...row, id: PINE_THRALL_SPECIES[row.kind] ?? '', label: `${row.label} thrall`, variants: row.spawnOnly, spawnOnly: undefined }]);
  const thrallRows = speciesProgramToRows({ species: thrallProgram.map(ownDrops), strikes } as unknown as SpeciesProgramInput, looks(row => `${row.id}.look`));
  const thralls = { ...thrallRows, species: thrallRows.species.map(bolting) };
  if (THRALL_EXTRAS === undefined) throw new Error('Pine species rows: no declared thrall extras');
  const extras = read(THRALL_EXTRAS);

  const creatures = await Promise.all([...converted.species, ...thralls.species].map((row): Promise<HullCreature> => {
    const { id, body: _body, ...species } = row, fur = FUR[row.kind];
    if (fur === undefined) throw new Error(`Pine species rows: no fur for ${row.kind}`);
    const first = row.variants[0]?.id ?? '', home = hullOf(row.kind, first), thrall = Object.values(PINE_THRALL_SPECIES).includes(id);
    const variants: Record<string, HullVariant> = {};
    for (const variant of row.variants) {
      const hull = hullOf(row.kind, variant.id), own = hull === home ? {} : { rig: rig(hull), maps: maps(hull), ...flapOf(hull) === undefined ? {} : { flap: flapOf(hull) } };
      const baked = coat(hull, row.kind, variant.id), hullRow = PINE_HULLS.fur?.[hull]?.[variant.id];
      const overrides = { ...hullFur(fur.variants[variant.id] ?? {}), ...hullRow === undefined ? {} : { rim: hullRow.rim as Rgb, sheenColor: hullRow.sheenColor as Rgb } };
      const entry: HullVariant = { ...own, ...baked === undefined ? {} : { coat: baked }, ...Object.keys(overrides).length === 0 ? {} : { fur: overrides },
        ...thrall ? { parts: { glb: extras, node: THRALL_NODES[row.kind] ?? '' } } : {} };
      if (Object.keys(entry).length > 0) variants[variant.id] = entry;
    }
    const flap = flapOf(home);
    const king = row.kind === 'antler-king';
    return hullCreature(id, rig(home), { species: species as Omit<SpeciesRow, 'id' | 'body'>, size: king ? 'large' : 'medium', skeleton: 'quadruped',
      ...king ? { map: KING_CHAIN_MAP } : {},
      look: { maps: maps(home), surface: { family: 'pbr', fur: hullFur(fur.fur) as HullFur }, ...flap === undefined ? {} : { flap },
        ...Object.keys(variants).length === 0 ? {} : { variants } } });
  }));
  return { creatures, strikes: converted.strikes };
}

type ShardFileRow = Shardfile['files'][number];
/** The species' rows and files as the shard file declares them (sharddev `sceneShardfile`'s creature step): every rig GLB
 *  and KTX2 map, every skin file (after its GLB and textures, format `skinFileDependencies`) and each variant table, all in
 *  the library (they load with the shard), and the thralls' part materials. */
export interface PineSpeciesDeclaration {
  readonly rows: Pick<ShardRows, 'species' | 'looks' | 'strikes'>;
  readonly files: ShardFileRow[];
  readonly library: string[];
  readonly assets: Uint8Array[];
  readonly materials: Record<string, unknown>;
  /** the item rows the species' drops name (the kit's harvest items, as `commonCreature` gives them) */
  readonly items: NonNullable<Shardfile['items']['catalogue']>;
}
export function pineSpeciesDeclaration(species: PineHullSpecies): PineSpeciesDeclaration {
  const files = new Map<string, ShardFileRow>(), assets = new Map<string, Uint8Array>();
  const store = (bytes: Uint8Array, kind: 'glb' | 'ktx2'): void => {
    const hash = hashImmutableBytes(bytes);
    if (files.has(hash)) return;
    assets.set(hash, bytes);
    files.set(hash, { hash, kind, compressed: bytes.length, ...kind === 'glb' ? parseGlb(bytes) : parseKtx2(bytes), dependencies: [], critical: false });
  };
  const json = (bytes: Uint8Array, dependencies: string[]): string => {
    const hash = hashImmutableBytes(bytes);
    if (!files.has(hash)) {
      assets.set(hash, bytes);
      files.set(hash, { hash, kind: 'json', compressed: bytes.length, decoded: bytes.length * 2, gpu: 0, triangles: 0, draws: 0, dependencies, critical: false });
    }
    return hash;
  };
  const skinFile = (bytes: Uint8Array): string => { const { row, binding } = parseSkinFile(bytes); return json(bytes, skinFileDependencies(row, binding)); };
  const library = species.creatures.flatMap(creature => {
    store(creature.glb, 'glb');
    if (creature.files === undefined) return [skinFile(creature.skin)];
    for (const glb of creature.files.glbs) store(glb, 'glb');
    for (const map of creature.files.textures) store(map, 'ktx2');
    const variants = creature.files.skins.map(skinFile), skin = skinFile(creature.skin);
    return [skin, json(creature.files.table, [...new Set([skin, ...variants])].sort())];
  });
  return { rows: { species: species.creatures.map(row => row.species), looks: species.creatures.map(row => row.look), strikes: species.strikes },
    // every species file is a library root, its rigs and maps too: Pine's product names some of the same bytes (its baked
    // coats) as late files, and a late file must be a declared library root
    files: [...files.values()], library: [...new Set([...library, ...files.keys()])], assets: [...assets.values()],
    materials: Object.assign({}, ...species.creatures.map(row => row.materials ?? {})) as Record<string, unknown>,
    items: legacyHarvestItems(species.creatures.flatMap(row => (row.species.harvest ?? []).map(drop => drop.item))) };
}
