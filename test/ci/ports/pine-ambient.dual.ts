import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
/** The page's ambient guest (SERVER-PARITY SS11: the view row pine.ambient that page.life runs), shadow-compiled
 * without changing the shipped Pine producer. Host observations are identical numeric samples. */
const ambient=readFileSync('src/shards/pine-hollow/behaviour/ambient.as','utf8');
import { projectionPair } from '../guest-pair.ts';
import type { DualPortFixture } from '../port-types.ts';

const fields = ['now','minimum','maximum','draw','scale','kill','arrival','harvest','site','visit','distance','reach','giveUp','present','night','combat'] as const;
const channels = ['arrival','gather','remove','fade','dim','eligible'] as const;
const signals = ['arrival','carcass','guide'] as const;
const ids = (names: readonly string[]): string => names.map((name,i) => `export const ${name}:i32=${i};`).join('');
const boundary = `export namespace Signal{${ids(signals)}}export namespace Field{${ids(fields)}}
export namespace Channel{${ids(channels)}}
let io:usize=0;export function begin(base:usize):void{io=base;}
export namespace Read{export function field(actor:i32,field:i32):f64{return load<f64>(io+usize(actor*${fields.length}+field)*8);}}
export namespace Do{export function channel(channel:i32,value:f64):void{store<f64>(io+2048+usize(channel)*8,value);}}`;
const sources = { 'generated/pineAmbient.ts': boundary };
const legacy = `import {onSignal} from './ambient';import {begin} from './generated/pineAmbient';
export function ws_abi():i32{return 1;}export function ws_io():i32{return 16384;}
export function ws_init(lo:i32,hi:i32):void{}
export function ws_handle():i32{begin(16384);onSignal(load<i32>(16384+1700),0,0);return 0;}`;
const candidate = `import {onSignal} from './ambient';import {begin} from './generated/pineAmbient';
export function ws_abi():i32{return 2;}export function ws_io():i32{return 1024;}
export function ws_init(lo:i32,hi:i32,fuel:i32):i32{return 0;}
export function ws_project(fuel:i32):i32{begin(1024);onSignal(load<i32>(1024+1700),0,0);return 0;}`;
const input = {
  authored: new Map([['ambient.ts',ambient]]),legacy: { source: legacy,sources },
  candidate: { source: candidate,sources,lane: 'project',ioBytes: 4096 },pages: 1,
} satisfies DualPortFixture['input'];
type Fields = Partial<Record<typeof fields[number],number>>;

export const port = { input,verify: pair => {
  const compare = projectionPair(pair,{ ioBytes: 4096,output: [{ offset: 3072,count: channels.length,width: 8 }] });
  const evaluate = (signal: typeof signals[number],actors: readonly Fields[]): Record<string,number> => compare((view,base) => {
    new Uint8Array(view.buffer,base,4096).fill(0);
    actors.forEach((actor,i) => { fields.forEach((name,j) => { view.setFloat64(base+(i*fields.length+j)*8,actor[name] ?? 0,true); }); });
    view.setInt32(base+1700,signals.indexOf(signal),true);
    channels.forEach((_,i) => { view.setFloat64(base+2048+i*8,-99,true); });
  },(view,base) => Object.fromEntries(channels.map((name,i) => [name,view.getFloat64(base+2048+i*8,true)])));
  for (const [draw,arrival] of [[-0.5,16],[0,16],[0.5,22],[1.5,28]] as const) {
    assert.partialDeepStrictEqual(evaluate('arrival',[{ now: 10,minimum: 2,maximum: 6,scale: 3,draw }]),{ arrival });
  }
  for (const [night,combat,eligible] of [[0.49,0,1],[0.5,0,0],[0.49,1,0]] as const) {
    assert.partialDeepStrictEqual(evaluate('guide',[{ night,combat }]),{ eligible });
  }
  assert.partialDeepStrictEqual(evaluate('carcass',[{ present: 0 }]),{ remove: 1,gather: -99 });
  const carcass = { present: 1,site: -1,arrival: 10,now: 10,harvest: -1,reach: 5,distance: 5,giveUp: 5 };
  assert.partialDeepStrictEqual(evaluate('carcass',[{ ...carcass,now: 9 }]),{ gather: -99,remove: -99 });
  assert.partialDeepStrictEqual(evaluate('carcass',[carcass]),{ gather: 1,remove: -99 });
  assert.partialDeepStrictEqual(evaluate('carcass',[{ ...carcass,distance: 5.01 }]),{ gather: -2 });
  assert.partialDeepStrictEqual(evaluate('carcass',[{ ...carcass,site: 0,harvest: 5 }]),{ dim: 1,fade: -99,remove: -99 });
  assert.partialDeepStrictEqual(evaluate('carcass',[{ ...carcass,site: 0,harvest: 4.99 }]),{ dim: 1,fade: 1,remove: 1 });
  assert.partialDeepStrictEqual(evaluate('carcass',[{ ...carcass,site: -2,harvest: 10 }]),{ dim: 1,fade: 1,remove: 1 });
  assert.partialDeepStrictEqual(evaluate('carcass',[{ ...carcass,site: 0,visit: 3,harvest: 10 }]),{ dim: 1,fade: 1,remove: 1 });
  assert.partialDeepStrictEqual(evaluate('carcass',[{ ...carcass,site: -2,now: 900,kill: 0 }]),{ remove: -99 });
  assert.partialDeepStrictEqual(evaluate('carcass',[{ ...carcass,site: -2,now: 900.01,kill: 0 }]),{ remove: 1 });
  return Promise.resolve();
} } satisfies DualPortFixture;
