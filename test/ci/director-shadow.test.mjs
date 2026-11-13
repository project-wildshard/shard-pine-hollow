// J186: real authored AS -> public compilers -> admitted v0/v2 execution.
// Shadow ABI2 is never published as gameplay; today's wire stays unchanged.
import '@wildshard/engine/scripts/sim-node-loader.mjs';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import * as v from 'valibot';

const { simulationPair } = await import('./guest-pair.ts');
const { compileBehaviourModule } = await import('@wildshard/sharddev/buildBehaviour');
const { compileDualScriptV2 } = await import('@wildshard/sharddev/test/compileDualScriptV2');
const { compileScript } = await import('@wildshard/sharddev/compileScript');
const { generateDirectorAbi } = await import('@wildshard/sharddev/directorAbi');
const { scriptV1Identifier } = await import('@wildshard/format/decisionScripts');
const { parseDirector } = await import('@wildshard/format/director');
const { prepareEmbeddedDirector } = await import('@wildshard/engine/game/plugin/director');
const root = 'src';
const original = readFileSync(`${root}/behaviour/director.as`, 'utf8');
const authored = readFileSync(`${root}/behaviour/directorV2.as`, 'utf8');
const data = parseDirector(JSON.parse(readFileSync(`${root}/data/director.json`, 'utf8')));
const parameterNames = ['sunriseAt', 'lanternsAt', 'captionAt', 'finishAt', 'nightValue', 'sunriseValue'];
const bindings = `let io:usize=0;let tick:i32=0;
export function begin(base:usize,now:i32):void{io=base;tick=now;}
export class Clock{static get tick():i32{return tick;}static get dt():f64{return load<f64>(io+16);}}
export class Inputs{${data.inputs.map((row, i) => `static get ${scriptV1Identifier(row.key)}():f64{return load<f64>(io+${1024+i*8});}`).join('')}}
export class Params{${parameterNames.map((name, i) => `static get ${name}():f64{return load<f64>(io+${768+i*8});}`).join('')}}
export class Incoming{static get count():i32{return i32(load<f64>(io+32));}static type(i:i32):i32{if(i<0||i>=Incoming.count)unreachable();return i32(load<f64>(io+64+usize(i)*8));}}
export class State{static get dawn():f64{return load<f64>(io+512);}static set dawn(value:f64){store<f64>(io+512,value);}}
export namespace Do{export function event(type:i32,value:f64=0):void{const n=i32(load<f64>(io+2048));if(n>=8)unreachable();const at=io+2056+usize(n)*24;store<f64>(at,f64(type));store<f64>(at+8,${data.entity}.0);store<f64>(at+16,value);store<f64>(io+2048,f64(n+1));}}
`;
const entry = `import {onTick} from './directorV2';import {begin} from './generated/pineDirector';
export function ws_abi():i32{return 2;}export function ws_io():i32{return 1024;}
export function ws_init(lo:i32,hi:i32,fuel:i32):i32{return 0;}
export function ws_step(tick:i32,fuel:i32):i32{begin(1024,tick);onTick();return 0;}`;
const legacy = `import {onTick} from './directorV2';import {begin} from './generated/pineDirector';
export function ws_abi():i32{return 1;}export function ws_io():i32{return 16384;}
export function ws_init(lo:i32,hi:i32):void{}
export function ws_handle():i32{begin(16384,i32(load<f64>(16392)));onTick();return 0;}`;

function readAnswer(view, base, tick) {
  const count = view.getFloat64(base + 2048, true);
  assert.ok(Number.isInteger(count) && count >= 0 && count <= 8);
  return { state: { dawn: view.getFloat64(base + 512, true) }, events: Array.from({ length: count }, (_, i) => {
    const at = base + 2056 + i * 24, event = data.events.find(row => row.id === view.getFloat64(at, true) && row.direction === 'output');
    assert.ok(event); assert.equal(view.getFloat64(at + 8, true), data.entity);
    return { director: data.id, tick, key: event.key, type: event.type, value: view.getFloat64(at + 16, true) };
  }) };
}

function session(factory, pair) {
  let old = factory(), state = { dawn: -1 };
  const options = { ioBytes: 4096, output: [{ offset: 1536, count: 1, width: 8 }, { offset: 3072, count: 25, width: 8 }] };
  let compare = simulationPair(pair, options);
  return (observations, { dt = 1 / 60, events = [], dispatch = false, restore = false } = {}) => {
    const tick = dispatch ? old.tick : old.tick + 1;
    const incoming = events.map(key => {
      const event = data.events.find(row => row.key === key && row.direction === 'input'); assert.ok(event);
      old.enqueue(key); return event.id;
    });
    const expected = dispatch ? old.dispatch(observations) : old.step(tick, observations, dt);
    const answer = compare(tick, (view, base) => {
      new Uint8Array(view.buffer, base, 4096).fill(0);
      view.setFloat64(base + 8, tick, true);
      view.setFloat64(base + 16, dispatch ? 0 : dt, true); view.setFloat64(base + 32, incoming.length, true);
      incoming.forEach((id, i) => view.setFloat64(base + 64 + i * 8, id, true));
      view.setFloat64(base + 512, state.dawn, true);
      data.parameters.forEach((value, i) => view.setFloat64(base + 768 + i * 8, value, true));
      data.inputs.forEach((row, i) => { assert.ok(Object.hasOwn(observations, row.key)); view.setFloat64(base + 1024 + i * 8, observations[row.key], true); });
    }, (view, base) => readAnswer(view, base, tick));
    assert.deepEqual(answer.events, expected, `Shipping/shadow event mismatch at tick ${tick}`); state = answer.state;
    if (restore) {
      const saved = old.snapshot(); old = factory(); old.restore(saved); assert.equal(old.snapshot(), saved);
      const wire = JSON.stringify(state);
      state = v.parse(v.record(v.string(), v.number()), JSON.parse(wire));
      assert.equal(JSON.stringify(state), wire);
      compare = simulationPair(pair, options);
    }
    return { ...answer, dawn: answer.state.dawn };
  };
}

test('Pine actual shipping director and shadow port keep event and saved-continuation parity', { timeout: 9500 }, async () => {
  const sources = { 'wildshard-director.ts': generateDirectorAbi(data) };
  const shipping = await compileBehaviourModule(original, 1, sources);
  assert.equal(shipping.module, data.module, 'The shipping module must retain its immutable identity');
  const boundary = { 'generated/pineDirector.ts': bindings };
  const input = { authored: new Map([['directorV2.ts', authored]]), legacy: { source: legacy, sources: boundary },
    candidate: { source: entry, sources: boundary, lane: 'sim', ioBytes: 4096 }, pages: 1 };
  const pair = await compileDualScriptV2(input);
  assert.deepEqual(pair.authors.map(row => row.path), ['directorV2.ts']);
  assert.deepEqual(await compileScript(legacy, { abi: 1, maximumPages: 1, sources: { 'directorV2.ts': authored, ...boundary } }), pair.legacy.bytes);
  assert.deepEqual(await compileBehaviourModule(original, 1, sources), shipping, 'Shadow compilation must not change shipping compiler output');
  const factory = await prepareEmbeddedDirector(data, shipping, 357);
  for (const hasClock of [0, 1]) {
    const run = session(factory, pair), observation = { 'night-request': 0, 'dawn-request': 0, seen: 0, 'has-clock': hasClock, night: 0 };
    const first = run(observation, { dt: 1, events: ['night.request', 'dawn.request'], restore: true });
    assert.equal(first.dawn, 0);
    assert.deepEqual(first.events.map(row => row.key), hasClock ? ['night.consume', 'night.start', 'dawn.start'] : ['night.consume', 'dawn.start']);
    assert.deepEqual(run(observation, { dispatch: true, events: ['dawn.request'] }).events, []);
    const emitted = [];
    for (const dt of [.1, .9, 1, .49, .01, .5, 1, 1, .1, .9, 1, 1, 1, 1, 1, 1]) emitted.push(...run(observation, { dt, restore: true }).events.map(row => row.key));
    assert.deepEqual(emitted, hasClock ? ['dawn.sunrise', 'dawn.lanterns', 'dawn.caption', 'dawn.finish'] : ['dawn.lanterns', 'dawn.caption', 'dawn.finish']);
    assert.equal(run({ ...observation, seen: 1 }, { events: ['dawn.request'] }).dawn, -1);
    assert.deepEqual(run({ ...observation, night: .5 }, { events: ['night.request'] }).events.map(row => row.key), ['night.consume']);
    assert.deepEqual(run({ ...observation, night: 1, 'night-request': 1 }).events.map(row => row.key), ['night.consume']);
  }
  const run = session(factory, pair), observation = { 'night-request': 0, 'dawn-request': 1, seen: 0, 'has-clock': 1, night: 0 };
  run(observation, { dt: 0 });
  for (let i = 0; i < 800; i++) {
    const answer = run({ ...observation, 'dawn-request': 0, 'night-request': Number(i % 89 === 0) }, { dt: i % 7 === 0 ? 0 : 1 / 60, restore: i % 31 === 0 });
    if (i < 100) assert.ok(answer.state.dawn >= 0);
  }
});
