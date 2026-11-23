import { PINE_FEATS } from './questInventory';
import { PINE_KEPT } from './kept';
import { tradeEconomy } from './trades';
import plumbing from '../data/plumbing.json' with { type: 'json' };
import identity from '../data/identity.json' with { type: 'json' };
import { pineWeatherChannelSection, pineSkyChannelSection, pineAudio, pineItems } from './channelSections';
import { emptyShardfile } from '@wildshard/sdk/author';
import { parseShardfile, type Shardfile } from '@wildshard/format/shardSchema';
import { PINE_LEDGER } from './ledger';
import { parseQuestData } from '@wildshard/sdk/quests';
import { PINE_RUNTIME_SPAWNS } from './spawns';
import { PINE_STATE } from './state';
import { PINE_EDGE_HEIGHTS } from './edges';
import PINE_RUNTIME_COST from '../data/runtimeCost.json' with { type: 'json' };
import { pineLookMaterials } from './lookMaterials';
import type { TimberWorld } from './timberWorldRows';
import { withPineGround, type PineGroundRows } from './groundTiles';
import { pineQuestNpcs } from './questNpcs';
import type { PineJournal } from './journal';
import { PINE_QUEST_HOST } from './questHost';
import { returnGuest } from './returnPrograms';
import { CONTRACT_PROGRAM_SCRIPT } from './contractProgram';
import type { PineSpeciesDeclaration } from './hullSpecies';
import { PINE_DECLARED_SPAWNS, PINE_ELITE_SPAWNS, PINE_KING_THRALLS, PINE_NIGHT_SPAWNS, PINE_KING_SPAWN, PINE_KING_ENCOUNTER } from './declaredRoster';


// GR8: called, not read from a scheduler job's output
const people = pineQuestNpcs();

// GR8: called, not read from a scheduler job's output
const weatherChannels = pineWeatherChannelSection();

// GR8: called, not read from a scheduler job's output
const skyChannels = pineSkyChannelSection();

// GR8: called, not read from a scheduler job's output
const AUDIO = pineAudio();

// GR8: called, not read from a scheduler job's output
const PINE_ITEMS = pineItems();

// GR8: called, not read from a scheduler job's output
const looks = pineLookMaterials();

// The trusted legacy entry keeps the live world; SF29 binds its existing audio to these rows.
// SF47-g edges (G93 / G99 / G103 / G131): the starter's four 8 m midpoint entryways (kind ground: Pine's terrain is the
// floor, flat at y = 0 through each canyon gap) stand on Pine's real boundary rows (./data/edges.ts, the committed bake's).
// The grid's terrain.bin reader paints no palette for Pine, so the colours stay its neutral grey.
// tile streaming P1: the ground's 80 splat tiles, the timber on its 12 L0 tiles after it
const base = emptyShardfile({ slug: 'pine-hollow', name: 'Pine Hollow', author: 'Wildshard', revision: 1, seed: identity.seed });
// The original seven one-page guests plus the admitted contract guest (G20a), with live and rewind copies (SERVER-PARITY
// SS11 folded the shelter guest into pine.life).
const scriptMemory = 14 * 65536 + CONTRACT_PROGRAM_SCRIPT.pages * 65536 * 2;
// SS11: the page's ambient guest, a view module the page alone runs, charged to the render library the same way.
const viewMemory = returnGuest('ambient').row.pages * 65536 * 2;
const row = (heights: readonly number[]): { heights: number[]; colours: [number, number, number][]; roadHeight: 0 } =>
  ({ heights: [...heights], colours: heights.map((): [number, number, number] => [0.25, 0.25, 0.25]), roadHeight: 0 });
/** Pine's declaration, admitted with the journal and the timber world its program reads (GR8: `generate.ts`; no scheduler
 *  job writes it). */
export function pineShardfile(journal: PineJournal, ground: PineGroundRows, timbers: Pick<TimberWorld, 'props' | 'shardfile'>,
  species: PineSpeciesDeclaration): Shardfile {
  const criticalFiles = timbers.shardfile.files.filter(file => timbers.shardfile.critical.includes(file.hash));
  const world = withPineGround(timbers.props, timbers.shardfile, ground);
  const libraryFiles = [...world.shardfile.files.filter(file => world.shardfile.library.includes(file.hash)), ...journal.files, ...species.files];
  return parseShardfile({
  ...base, ...world.shardfile, plumbing, props: world.props,
  // DL17 (G1000, G872): the level is complete at control: the entered cell attaches every fine tile before control and none
  // retires in play
  ring: 'cell',
  // OF23a: the species' rigs, maps, skins and variant tables load with the shard (the library)
  files: [...world.shardfile.files, ...journal.files, ...species.files],
  library: [...world.shardfile.library, ...journal.files.map(file => file.hash), ...species.library],
  budgets: { ...base.budgets, tier: 'large', sim: { resident: scriptMemory + criticalFiles.reduce((n, file) => n + file.decoded + file.gpu, 0), compressed: criticalFiles.reduce((n, file) => n + file.compressed, 0) }, library: { resident: viewMemory + libraryFiles.reduce((n, file) => n + file.decoded + file.gpu, 0), compressed: libraryFiles.reduce((n, file) => n + file.compressed, 0) } },
  // OF23c: the declared herds and the roster's own bodies share the roster's 512
  // ONE-FORMAT OF31h3: the awake cost, engine's measured SC8 table (v0.1.19): 1.594 ms per tick with one player
  serverBudget: { ...base.serverBudget, entities: 512, awakeMicros: 1594, memory: base.serverBudget.memory + scriptMemory + criticalFiles.reduce((n, file) => n + file.decoded, 0) },
  // OF23a: Pine's species and thralls as rows with hull looks (rows only: the native roster still stands the bodies)
  // OF23e3: the weather primitive runs Pine's weather program from its row (no native weather.program host)
  accent: 'moss', rows: { ...base.rows, ...species.rows, weather: [{ id: 'pine.weather', program: 'world/weather.json' }], compendiums: [journal.row], loot: [{ id: 'barter', economy: tradeEconomy() }] },
  // the material graphs the runtime draws its own meshes in, built at build time (generators/lookMaterials.ts)
  look: { ...base.look, materials: { ...base.look.materials, ...Object.fromEntries(Object.entries(looks.graphs).map(([id, graph]) => [id, { family: 'graph' as const, graph }])),
    ...species.materials } },
  // OF23c: r6's herd bodies, its four elites (rank elite) and the night's thralls are declared spawns (declaredRoster.ts);
  // OF23d: so are the Antler King and his thralls, and his `boss` encounter row declares him (declaredRoster.ts)
  creatures: { ...base.creatures, spawns: [...PINE_DECLARED_SPAWNS, ...PINE_ELITE_SPAWNS, ...PINE_NIGHT_SPAWNS, PINE_KING_SPAWN, ...PINE_KING_THRALLS] },
  encounters: [PINE_KING_ENCOUNTER],
  edge: { north: row(PINE_EDGE_HEIGHTS.north), east: row(PINE_EDGE_HEIGHTS.east), south: row(PINE_EDGE_HEIGHTS.south), west: row(PINE_EDGE_HEIGHTS.west) },
  runtime: { kind: 'client-plan', cost: PINE_RUNTIME_COST, binds: ['terrain', 'props', 'quests', 'ledger', 'items', 'spawns', 'state', 'modes', 'movers', 'clientChannels'], spawns: PINE_RUNTIME_SPAWNS },
  clientChannels: [...weatherChannels.clientChannels, ...skyChannels.clientChannels],
  quests: parseQuestData({ ...people.quests, achievements: PINE_FEATS }),
  questHost: PINE_QUEST_HOST, questNpcs: people.rows, ledger: PINE_LEDGER,
  // OF23a: the species' drops name the kit's harvest items
  // OF31f4: the two kept guns are Pine's own rows, not the engine's `OWNED`
  items: { ...PINE_ITEMS, kept: PINE_KEPT, catalogue: [...PINE_ITEMS.catalogue ?? [], ...species.items.filter(drop => !(PINE_ITEMS.catalogue ?? []).some(item => item.id === drop.id))] }, state: PINE_STATE, audio: AUDIO.audio, spawn: { x: 0, y: 0, z: -235, yaw: Math.PI },
  });
}
