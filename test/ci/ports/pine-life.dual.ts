import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
/** Full authored life -> stag closure, shadow-compiled without changing the
 * shipped Pine producer. Host observations are identical numeric samples. */
const life=readFileSync('src/shards/pine-hollow/behaviour/life.as','utf8');
const stag=readFileSync('src/shards/pine-hollow/behaviour/stag.as','utf8');
import lead from '../../../src/shards/pine-hollow/data/questLead.json' with { type: 'json' };
import { projectionPair } from '../guest-pair.ts';
import type { DualPortFixture } from '../port-types.ts';

const fields = ['candidates','now','minimum','maximum','draw','scale','kill','arrival','harvest','site','visit','distance','reach','giveUp','present','night','combat',
  'heightBias','height','coverBias','cover','radius','clear','homeX','homeZ','x','z',
  'i','mode','elapsed','begin','dt','leadStep','playerX','playerZ','atX','atZ','playerY','atY','floorY','taken'] as const;
const channels = ['arrival','gather','remove','fade','dim','eligible','index','score','x','z','i','mode','elapsed','event','accept','leadAppear','leadDone'] as const;
const signals = ['arrival','carcass','guide','shelterScore','shelterPlace','lead','secret'] as const;
const firstX = lead.path.at(0)?.[0], firstZ = lead.path.at(0)?.[1], lastX = lead.path.at(-1)?.[0], lastZ = lead.path.at(-1)?.[1];
if (firstX === undefined || firstZ === undefined || lastX === undefined || lastZ === undefined) throw new Error('Missing authored lead endpoints');
const params = { firstX,firstZ,lastX,lastZ,length: lead.path.length,first: lead.first,near: lead.near,past: lead.past,trot: lead.trot,gone: lead.gone,nightAbove: lead.nightAbove };
const ids = (names: readonly string[]): string => names.map((name,i) => `export const ${name}:i32=${i};`).join('');
const boundary = `export namespace Signal{${ids(signals)}}export namespace Field{${ids(fields)}}
export namespace Channel{${ids(channels)}}
export namespace Params{${Object.entries(params).map(([name,value]) => `export const ${name}:f64=${String(value)};`).join('')}}
let io:usize=0;export function begin(base:usize):void{io=base;}
export namespace Read{export function field(actor:i32,field:i32):f64{return load<f64>(io+usize(actor*${fields.length}+field)*8);}}
export namespace Do{export function channel(channel:i32,value:f64):void{store<f64>(io+2048+usize(channel)*8,value);}}`;
const sources = { 'generated/pineLife.ts': boundary };
const legacy = `import {onSignal} from './life';import {begin} from './generated/pineLife';
export function ws_abi():i32{return 1;}export function ws_io():i32{return 16384;}
export function ws_init(lo:i32,hi:i32):void{}
export function ws_handle():i32{begin(16384);onSignal(load<i32>(16384+1700),0,0);return 0;}`;
const candidate = `import {onSignal} from './life';import {begin} from './generated/pineLife';
export function ws_abi():i32{return 2;}export function ws_io():i32{return 1024;}
export function ws_init(lo:i32,hi:i32,fuel:i32):i32{return 0;}
export function ws_project(fuel:i32):i32{begin(1024);onSignal(load<i32>(1024+1700),0,0);return 0;}`;
const input = {
  authored: new Map([['life.ts',life],['stag.ts',stag]]),legacy: { source: legacy,sources },
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
  for (const [playerX,playerY,taken,accept] of [[2.19,0.79,0,1],[2.2,0,0,0],[0,0.8,0,0],[0,0,1,0]] as const) {
    assert.partialDeepStrictEqual(evaluate('secret',[{ playerX,playerY,taken }]),{ accept });
  }
  assert.partialDeepStrictEqual(evaluate('secret',[{ floorY: 2.2,playerY: 2.2 }]),{ accept: 0 });
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
  assert.partialDeepStrictEqual(evaluate('shelterScore',[{ candidates: 0 }]),{ index: -1,score: 0 });
  assert.partialDeepStrictEqual(evaluate('shelterScore',[{ candidates: 2,heightBias: 2,coverBias: 3 },
    { distance: 8,height: 3,cover: 2 },{ distance: 8,height: 3,cover: 2 }]),{ index: 0,score: 4 });
  assert.partialDeepStrictEqual(evaluate('shelterPlace',[{ distance: 5,radius: 2,clear: 1,x: 1,z: 2,homeX: 4,homeZ: 6 }]),{ x: 2.8,z: 4.4 });
  assert.partialDeepStrictEqual(evaluate('lead',[{ leadStep: 1,night: 1,begin: 1,playerX: firstX,playerZ: firstZ }]),{ i: 0,mode: 1,elapsed: 0,event: 1,leadAppear: 1,leadDone: 0 });
  assert.partialDeepStrictEqual(evaluate('lead',[{ leadStep: 1,night: lead.nightAbove,mode: 1 }]),{ i: 0,mode: 0,event: 4,leadAppear: 0,leadDone: 0 });
  return Promise.resolve();
} } satisfies DualPortFixture;
