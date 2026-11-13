import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const blackpaw=readFileSync('src/behaviour/elites/blackpaw.as','utf8');
import { elitePort } from '../script-v2-elite.ts';

export const port = elitePort('blackpaw',blackpaw,h => {
  const start = h.run('start');assert.partialDeepStrictEqual(start.state,{ mode: 2,roarCd: 0,swipeT: -1 });assert.equal(h.last(start,'field','hidden'),1);assert.equal(h.has(start,'move','relocate'),true);
  const roar = h.run('signal',{ value: 1,fields: { hidden: 1,phase2: 1 } });assert.equal(h.has(roar,'cue','burst'),true);assert.equal(h.has(roar,'cue','signature'),true);assert.equal(h.has(roar,'strike','roarPhase2'),true);assert.equal(roar.state['mode'],3);
  const signal = h.run('signal',{ value: 2,fields: { phase2: 1 } });assert.equal(h.has(signal,'strike','chargePhase2'),true);assert.equal(signal.state['mode'],4);
  for (const frame of [{ alive: false },{ target: 0 }]) assert.deepEqual(h.run('tick',frame).commands,[]);
  const home = h.run('tick',{ state: { mode: 0 },fields: { leashing: 1 },position: [(h.params['mouthX'] ?? 0)+5,h.params['mouthZ'] ?? 0] });assert.equal(h.last(home,'field','speed'),2.2);assert.equal(h.last(home,'field','lookWeight'),0);
  const lurked = h.run('tick',{ fields: { engaged: 0 },position: [h.params['mouthX'] ?? 0,h.params['mouthZ'] ?? 0],player: [(h.params['mouthX'] ?? 0)+40,h.params['mouthZ'] ?? 0] });assert.equal(lurked.state['mode'],2);assert.equal(h.last(lurked,'field','hidden'),1);
  const appeared = h.run('tick',{ state: { mode: 2 } });assert.equal(h.has(appeared,'strike','roar'),true);assert.equal(h.last(appeared,'field','hidden'),0);
  assert.equal(h.run('tick',{ state: { mode: 3 },movingStrike: 1 }).state['mode'],3);
  const charge = h.run('tick',{ state: { mode: 3 },fields: { phase2: 1 } });assert.partialDeepStrictEqual(charge.state,{ mode: 4,roarCd: 5.5 });assert.equal(h.has(charge,'strike','chargePhase2'),true);
  const close = h.run('tick',{ state: { mode: 3 },position: [0,0],player: [5,0] });assert.partialDeepStrictEqual(close.state,{ mode: 6,roarCd: 10 });
  const stalking = h.run('tick',{ state: { mode: 6,roarCd: 5 } });assert.equal(h.last(stalking,'field','speed'),3.2);
  const swipe = h.run('tick',{ state: { mode: 6,roarCd: 5 },position: [0,0],player: [3,0] });assert.equal(h.has(swipe,'strike','swipe'),true);assert.equal(swipe.state['mode'],5);
  const refreshed = h.run('tick',{ state: { mode: 6 },position: [0,0],player: [10,0],fields: { phase2: 1 } });assert.equal(h.has(refreshed,'strike','roarPhase2'),true);
  const finished = h.run('tick',{ state: swipe.state });assert.equal(finished.state['mode'],6);
});
