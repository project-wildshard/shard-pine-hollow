import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
/** Full authored life -> stag, shelter closure, shadow-compiled without changing the
 * shipped Pine producer. Host observations are identical numeric samples. */
const life=readFileSync('src/shards/pine-hollow/behaviour/life.as','utf8');
const shelter=readFileSync('src/shards/pine-hollow/behaviour/shelter.as','utf8');
const stag=readFileSync('src/shards/pine-hollow/behaviour/stag.as','utf8');
import lead from '../../../src/shards/pine-hollow/data/questLead.json' with { type: 'json' };
import { projectionPair } from '../guest-pair.ts';
import type { DualPortFixture } from '../port-types.ts';

const fields = ['candidates','distance','night','heightBias','height','coverBias','cover','radius','clear','homeX','homeZ','x','z',
  'present','spot','spotX','spotZ','hold','rain','wet','dry','homeHold','spotR','homeR',
  'i','mode','elapsed','begin','dt','leadStep','playerX','playerZ','atX','atZ','playerY','atY','floorY','taken'] as const;
const channels = ['index','score','x','z','r','create','keep','apply','hold','i','mode','elapsed','event','accept','leadAppear','leadDone'] as const;
const signals = ['shelterScore','shelterPlace','shelterStep','shelterGoal','lead','secret'] as const;
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
  authored: new Map([['life.ts',life],['stag.ts',stag],['shelter.ts',shelter]]),legacy: { source: legacy,sources },
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
  for (const [playerX,playerY,taken,accept] of [[2.19,0.79,0,1],[2.2,0,0,0],[0,0.8,0,0],[0,0,1,0]] as const) {
    assert.partialDeepStrictEqual(evaluate('secret',[{ playerX,playerY,taken }]),{ accept });
  }
  assert.partialDeepStrictEqual(evaluate('secret',[{ floorY: 2.2,playerY: 2.2 }]),{ accept: 0 });
  assert.partialDeepStrictEqual(evaluate('shelterScore',[{ candidates: 0 }]),{ index: -1,score: 0 });
  assert.partialDeepStrictEqual(evaluate('shelterScore',[{ candidates: 2,heightBias: 2,coverBias: 3 },
    { distance: 8,height: 3,cover: 2 },{ distance: 8,height: 3,cover: 2 }]),{ index: 0,score: 4 });
  assert.partialDeepStrictEqual(evaluate('shelterPlace',[{ distance: 5,radius: 2,clear: 1,x: 1,z: 2,homeX: 4,homeZ: 6 }]),{ x: 2.8,z: 4.4 });
  // SERVER-PARITY SS11: life.as hands the shelter's own step and goal to shelter.as, on pine.life's fields
  assert.partialDeepStrictEqual(evaluate('shelterStep',[{ wet: 0.7,dry: 0.3,homeHold: 4,hold: 1,dt: 0.5,present: 1,rain: 0.29 }]),{ create: 0,keep: 1,apply: 0,hold: 0.5 });
  assert.partialDeepStrictEqual(evaluate('shelterGoal',[{ present: 1,wet: 0.7,rain: 0.71,spot: 1,spotX: 4,spotZ: 5,spotR: 6 }]),{ accept: 1,x: 4,z: 5,r: 6 });
  assert.partialDeepStrictEqual(evaluate('lead',[{ leadStep: 1,night: 1,begin: 1,playerX: firstX,playerZ: firstZ }]),{ i: 0,mode: 1,elapsed: 0,event: 1,leadAppear: 1,leadDone: 0 });
  assert.partialDeepStrictEqual(evaluate('lead',[{ leadStep: 1,night: lead.nightAbove,mode: 1 }]),{ i: 0,mode: 0,event: 4,leadAppear: 0,leadDone: 0 });
  return Promise.resolve();
} } satisfies DualPortFixture;
