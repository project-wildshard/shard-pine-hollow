import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {assertClose} from '../guest-pair.ts';
const imperial=readFileSync('src/shards/pine-hollow/behaviour/elites/imperial.as','utf8');
import { elitePort } from '../script-v2-elite.ts';

export const port = elitePort('imperial-bull',imperial,h => {
  assert.partialDeepStrictEqual(h.run('start').state,{ mode: 0,wanderT: 0,bugledPhase: -1,call: 0 });
  assert.equal(h.run('signal',{ value: 1 }).state['mode'],2);
  const signal = h.run('signal',{ value: 2,fields: { phase2: 1 } });assert.equal(signal.state['mode'],3);assert.equal(h.has(signal,'strike','chargePhase2'),true);
  for (const frame of [{ alive: false },{ target: 0 }]) assert.deepEqual(h.run('tick',frame).commands,[]);
  const home = h.run('tick',{ fields: { leashing: 1 } });assert.partialDeepStrictEqual(home.state,{ mode: 1,bugledPhase: -1 });assert.equal(h.last(home,'field','speed'),0);
  const wander = h.run('tick',{ fields: { engaged: 0 } });assert.equal(wander.draws,3);assert.equal(wander.state['wanderT'],9);
  const begin = h.run('tick',{ state: { mode: 4,bugledPhase: -1 },fields: { dusk: 0.46 } });assert.partialDeepStrictEqual(begin.state,{ mode: 2,bugledPhase: 0 });assert.equal(h.has(begin,'cue','signature'),true);
  assert.equal(h.run('tick',{ state: { mode: 4,bugledPhase: -1 },fields: { dusk: 0.45 } }).state['mode'],4);
  const cue = h.run('tick',{ state: { mode: 2,modeT: 0.1 },dt: 0.2 });assert.equal(h.has(cue,'cue','bugle'),true);
  const called = h.run('tick',{ state: { mode: 2,modeT: 1.8 },dt: 0 });assert.partialDeepStrictEqual(called.state,{ mode: 4,call: 1 });assert.equal(h.last(called,'channel','call'),1);assertClose(h.last(called,'channel','callYaw'),Math.PI/2,12);
  const charge = h.run('tick',{ state: { mode: 4,modeT: 3.21,bugledPhase: 1 },dt: 0 });assert.equal(h.has(charge,'strike','charge'),true);assert.equal(charge.state['mode'],3);
  assert.equal(h.run('tick',{ state: { mode: 4,modeT: 3.2,bugledPhase: 1 },dt: 0 }).state['mode'],4);
  const inactive = h.run('tick',{ self: 2,fields: { engaged: 0,call: 3 } });assert.equal(inactive.state['call'],3);assert.equal(h.last(inactive,'field','scripted'),0);
  const rival0 = h.run('tick',{ self: 2,alive: false,fields: { call: 1 } });assert.equal(h.has(rival0,'spawn','rival0'),true);assert.equal(h.has(rival0,'cue','bugle'),true);assert.equal(rival0.state['call'],1);
  const rival1 = h.run('tick',{ self: 3,alive: false,fields: { call: 1 } });assert.equal(h.has(rival1,'spawn','rival1'),true);
  assert.deepEqual(h.run('tick',{ self: 2,alive: false,state: { call: 1 },fields: { call: 1 } }).commands,[]);
  const strike = h.run('tick',{ self: 2,position: [0,0],player: [10,0],random: [0.01] });assert.equal(h.has(strike,'strike','rival'),true);assert.equal(strike.state['mode'],3);assert.equal(strike.draws,1);
  assert.deepEqual(h.run('tick',{ self: 2,state: strike.state,movingStrike: 1 }).commands,[]);
  assert.equal(h.run('tick',{ self: 2,state: strike.state }).state['mode'],0);
});
