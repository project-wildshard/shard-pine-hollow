import lead from '../data/questLead.json' with { type: 'json' };

/** One stateless return guest's declared row, before compilation names its module (the retired bake-life.mjs and
 *  bake-shelter.mjs rows; GR8: `output.ts` compiles them in the product). */
export interface ReturnScriptRow {
  id: string; abi: string; side: string; module: string; source: string; binding: { shard: boolean }; pages: number;
  onFail: string; on: string[]; tick: null; stateVersion: number; state: never[]; params: Record<string, number>;
  reads: string[]; commands: string[]; fields: Record<string, string>; channels: Record<string, string>; signals: Record<string, string>;
}
/** Each guest's authored sources (the `ctx.cached` inputs) and its declared names. */
interface ReturnGuest { sources: string[]; row: ReturnScriptRow }

const aliases = (values: readonly string[]): Record<string, string> => Object.fromEntries(values.map(name => [name, name]));
const unset = `blobs/wasm/${'0'.repeat(64)}.wasm`;
const first = lead.path[0], last = lead.path.at(-1);
if (first === undefined || last === undefined) throw new Error('Pine quest lead needs a path');

/** A guest's name: `life` is the sim row the quest's lead, its hollow-log secret and the rain shelter run on both sides;
 *  `ambient` is the page's ambient rules, a view row only `page.life` runs (SERVER-PARITY SS11). The shelter was its
 *  own guest (`pine.shelter`) until SS11 folded it into `life`, so the view row fits format's nine-module cap. */
export type ReturnGuestName = 'life' | 'ambient';

const GUESTS: Record<ReturnGuestName, ReturnGuest> = {
  life: { sources: ['behaviour/life.as', 'behaviour/stag.as', 'behaviour/shelter.as'], row: {
    id: 'pine.life', abi: '1.0', side: 'sim', module: unset, source: 'behaviour/life.as', binding: { shard: true }, pages: 1, onFail: 'hold',
    on: ['signal'], tick: null, stateVersion: 1, state: [],
    params: { firstX: first[0] ?? 0, firstZ: first[1] ?? 0, lastX: last[0] ?? 0, lastZ: last[1] ?? 0, length: lead.path.length, first: lead.first,
      near: lead.near, past: lead.past, trot: lead.trot, gone: lead.gone, nightAbove: lead.nightAbove },
    reads: ['field'], commands: ['channel'],
    fields: aliases(['candidates', 'distance', 'night', 'heightBias', 'height', 'coverBias', 'cover', 'radius', 'clear', 'homeX', 'homeZ', 'x', 'z',
      'present', 'spot', 'spotX', 'spotZ', 'hold', 'rain', 'wet', 'dry', 'homeHold', 'spotR', 'homeR',
      'i', 'mode', 'elapsed', 'begin', 'dt', 'leadStep', 'playerX', 'playerZ', 'atX', 'atZ', 'playerY', 'atY', 'floorY', 'taken']),
    channels: aliases(['index', 'score', 'x', 'z', 'r', 'create', 'keep', 'apply', 'hold', 'i', 'mode', 'elapsed', 'event', 'accept', 'leadAppear', 'leadDone']),
    signals: aliases(['shelterScore', 'shelterPlace', 'shelterStep', 'shelterGoal', 'lead', 'secret']),
  } },
  ambient: { sources: ['behaviour/ambient.as'], row: {
    id: 'pine.ambient', abi: '1.0', side: 'view', module: unset, source: 'behaviour/ambient.as', binding: { shard: true }, pages: 1, onFail: 'hold',
    on: ['signal'], tick: null, stateVersion: 1, state: [], params: {}, reads: ['field'], commands: ['channel'],
    fields: aliases(['now', 'minimum', 'maximum', 'draw', 'scale', 'kill', 'arrival', 'harvest', 'site', 'visit', 'distance', 'reach', 'giveUp', 'present', 'night', 'combat']),
    channels: aliases(['arrival', 'gather', 'remove', 'fade', 'dim', 'eligible']),
    signals: aliases(['arrival', 'carcass', 'guide']),
  } },
};

/** A guest's declared row and sources (a copy). */
export function returnGuest(name: ReturnGuestName): ReturnGuest { return structuredClone(GUESTS[name]); }

/** The registry ids the generated ABI header uses: each sorted alias numbered from 1. */
export function returnRegistries(row: ReturnScriptRow): { fields: Map<string, number>; channels: Map<string, number>; signals: Map<string, number> } {
  const ids = (values: Readonly<Record<string, string>>) => new Map(Object.values(values).sort().map((value, index): [string, number] => [value, index + 1]));
  return { fields: ids(row.fields), channels: ids(row.channels), signals: ids(row.signals) };
}
