import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const ghost=readFileSync('src/shards/pine-hollow/behaviour/elites/ghost.as','utf8');
import { elitePort } from '../script-v2-elite.ts';

export const port = elitePort('ghost-stag',ghost,h => {
  assert.partialDeepStrictEqual(h.run('start').state,{ mode: 0,wanderT: 0,cd: 3,lastHit: -1000000,fadeT: 0,autoT: 5 });
  const fade = h.run('signal');assert.partialDeepStrictEqual(fade.state,{ mode: 2,fadeT: 2,cd: 4.5 });assert.equal(h.last(fade,'field','hidden'),1);assert.equal(h.has(fade,'cue','signature'),true);
  assert.equal(h.run('signal',{ fields: { phase2: 1 } }).state['cd'],2.4);
  for (const frame of [{ alive: false },{ target: 0 }]) assert.deepEqual(h.run('tick',frame).commands,[]);
  const home = h.run('tick',{ fields: { leashing: 1 } });assert.equal(home.state['mode'],1);assert.equal(h.last(home,'field','hidden'),0);assert.equal(h.last(home,'field','speed'),0);
  const wander = h.run('tick',{ fields: { engaged: 0 } });assert.equal(wander.draws,3);assert.equal(wander.state['wanderT'],9);
  const comeback = { state: { mode: 2,fadeT: 0,cd: 5 },dt: 0 };
  const appeared = h.run('tick',comeback);assert.equal(appeared.state['mode'],3);assert.equal(appeared.draws,1);assert.equal(appeared.floors,2);assert.equal(h.has(appeared,'cue','reappear'),true);assert.equal(h.last(appeared,'field','hidden'),0);
  const steep = h.run('tick',{ ...comeback,ground: Array.from({ length: 16 },(_,i) => i%2 === 0 ? 7 : 0) });assert.equal(steep.draws,8);assert.equal(steep.floors,16);assert.equal(h.last(steep,'field','x'),h.params['lairX']);assert.equal(h.last(steep,'field','z'),h.params['lairZ']);
  const outside = h.run('tick',{ ...comeback,player: [1000,1000] });assert.equal(outside.draws,8);assert.equal(outside.floors,0);assert.equal(outside.state['mode'],3);
  assert.equal(h.run('tick',{ state: { mode: 3,modeT: 1.1,cd: 5 },fields: { phase2: 1 },dt: 0 }).state['mode'],3);
  assert.equal(h.run('tick',{ state: { mode: 3,modeT: 1.1,cd: 5 },fields: { phase2: 1 },dt: 0.01 }).state['mode'],4);
  const hit = h.run('tick',{ state: { mode: 4,cd: 0 },fields: { lastHit: 1 } });assert.partialDeepStrictEqual(hit.state,{ mode: 2,lastHit: 1 });
  const flee = h.run('tick',{ state: { mode: 4,modeT: 1,cd: 5,lastHit: -1000000 } });assert.equal(h.last(flee,'field','speed'),7);assert.equal(h.last(flee,'field','lookWeight'),0);
  assert.equal(h.run('tick',{ state: { mode: 4,modeT: 3,cd: 5,lastHit: -1000000 } }).state['mode'],3);
  const auto = h.run('tick',{ state: { mode: 4,cd: 0,autoT: 0.1,lastHit: -1000000 },fields: { phase2: 1 } });assert.partialDeepStrictEqual(auto.state,{ mode: 2,autoT: 3.875,cd: 2.4 });assert.equal(auto.draws,1);
});
