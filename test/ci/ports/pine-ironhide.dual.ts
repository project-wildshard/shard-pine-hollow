import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const ironhide=readFileSync('src/shards/pine-hollow/behaviour/elites/ironhide.as','utf8');
import { elitePort } from '../script-v2-elite.ts';

export const port = elitePort('ironhide',ironhide,h => {
  const start = h.run('start');assert.partialDeepStrictEqual(start.state,{ mode: 0,modeT: 0,wanderT: 0,again: 0 });
  const signal = h.run('signal',{ value: 1 });assert.equal(h.has(signal,'strike','charge'),true);assert.equal(signal.state['mode'],3);
  assert.deepEqual(h.run('signal',{ value: 2 }).commands,[]);
  for (const frame of [{ alive: false },{ target: 0 }]) assert.deepEqual(h.run('tick',frame).commands,[]);
  const home = h.run('tick',{ fields: { leashing: 1 },position: [(h.params['lairX'] ?? 0)+5,h.params['lairZ'] ?? 0],state: { again: 1 } });
  assert.partialDeepStrictEqual(home.state,{ mode: 1,again: 0 });assert.equal(h.last(home,'field','speed'),4);assert.equal(h.last(home,'field','lookWeight'),0);
  const wander = h.run('tick',{ fields: { engaged: 0 } });assert.equal(wander.draws,3);assert.equal(wander.state['wanderT'],9);assert.equal(h.last(wander,'field','speed'),0);
  const charge = h.run('tick',{ state: { mode: 2,modeT: 1.4 },fields: { phase2: 1 } });
  assert.equal(h.has(charge,'strike','chargePhase2'),true);assert.equal(h.has(charge,'cue','signature'),true);assert.partialDeepStrictEqual(charge.state,{ mode: 3,again: 1 });assert.equal(charge.draws,1);
  const edge = h.run('tick',{ state: { mode: 2,modeT: 1.4 },fields: { phase2: 1 },dt: 0 });assert.equal(h.has(edge,'strike','chargePhase2'),false);
  const active = h.run('tick',{ state: charge.state,movingStrike: 2,fields: { strikeTime: 0 } });assert.equal(h.has(active,'cue','squeal'),true);
  const again = h.run('tick',{ state: active.state });assert.equal(h.has(again,'strike','again'),true);assert.partialDeepStrictEqual(again.state,{ mode: 3,again: 0 });
  assert.equal(h.run('tick',{ state: again.state }).state['mode'],2);
  const single = h.run('tick',{ state: { mode: 2,modeT: 3 },fields: { phase2: 1 },random: [0.55] });assert.equal(single.state['again'],0);
  assert.equal(h.run('tick',{ state: { mode: 2,modeT: 3 },player: [(h.params['lairX'] ?? 0)+30,h.params['lairZ'] ?? 0] }).state['mode'],2);
});
