// J186 Ring 2, CI only, never a hook. The ridge lantern (meta TEST-COVERAGE SHARD-REPOS SH-ALL-8, SH-pine-1/4) on the
// built product: from spawn up the south road, the N road and the den trail, along the lookout trail to the fire
// lookout's foot, where the ridge lantern stands cold. Its press is refused there without the fire-watcher's flint, and
// so is the flint's own press from the ground. In at the stair door, up the five flights and out of the hatch; the
// flint is still out of reach from the hatch's mouth and taken from inside the cab. Back down the flights to the same
// spot at the lantern, where the same press now lights it (`lit:ridge`). Only what the page sends drives it: movement
// and the [E] press each prompt's net route names. No flag, quest or pose is written. About 4 s locally.
// The zipline (SH-ALL-8, SH-pine-5) is the second test: up the same flights, out of the cab's door onto the launch, the
// cable's press refused from inside the cab and taken at the launch, ridden down to the landing on the N road
// (`used:ph-zip`). About 6 s locally.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { boot, rider } from './journey-rider.mjs';

// The south road to the ranger's cabin (as the pond leg), the N road to the den trail's fork (walk-routes.json pond).
const TO_HOLLOW = [[0, -190], [-8, -150], [-30, -95], [-12, -52], [-1, -40], [-5.71, -31.7], [0, -10], [2, 10], [4, 40], [4, 70]];
// The den trail to the lookout trail's start, and the lookout trail to the tower's foot beside the ridge lantern
// (layout DEN_TRAIL, LOOKOUT_TRAIL; the lantern sits 6 m off the tower on its trail side, landmarkSites ridge).
const TO_TOWER_FOOT = [[40, 94], [82, 116], [104, 124], [126, 128], [150, 142], [146, 158], [110, 178], [76, 196], [50, 208], [43.5, 213.5]];
// In at the stair door (tower-local +X), up the five flights and out of the hatch onto the deck (walk-routes.json
// lookout-climb, to its hatch point).
const UP_THE_FLIGHTS = [[41.23, 211.92], [38.48, 213.08], [37.3, 213.28], [34.19, 213.79], [34.35, 214.78], [37.81, 214.21], [37.65, 213.22],
  [34.19, 213.79], [34.35, 214.78], [37.81, 214.21], [37.65, 213.22], [34.34, 213.77]];
// Into the cab, beside the fire finder the flint lies on.
const TO_FINDER = [[35.2, 214.4]];
// Back through the hatch (its stair drops a flight at once), down the flights, out of the door to the same spot at
// the lantern.
const DOWN_THE_FLIGHTS = [[34.34, 213.77], [37.65, 213.22], [37.81, 214.21], [34.35, 214.78], [34.19, 213.79], [37.65, 213.22], [38.48, 213.08],
  [41.23, 211.92], [43.5, 213.5]];
// Out of the cab's door (on its launch side) and onto the launch's planks under the cable's top anchor (fireLookout.ts
// the cab's door and LAUNCH; state/modes pine.zipline top 35.2, 209.4).
const TO_LAUNCH = [[34.75, 212.6], [34.6, 211.8], [34.5, 211.25], [35.3, 209.9]];
// The cable's foot on the N road (layout ZIPLINE.to; state/modes pine.zipline landing).
const LANDING = { x: 4, z: 20 };
// The ride is about 16 s at the cable's 16 m/s cap; the allowance is half again.
const RIDE_TICKS = 1500;
// The cab's deck is 11 m above the crag-top pad (layout ZIPLINE.from.deck); the walk keeps the player on it.
const DECK_RISE = 10;

test('pine-hollow: the ridge lantern relit on real inputs', { timeout: 30_000 }, async () => {
  const started = performance.now(), { shard, resident } = await boot();
  try {
    const { player, walk, press, has, head } = rider(resident);
    // One [E] where the player stands, then a beat for any toast or latch to settle.
    const tap = name => { press(name); for (let tick = 0; tick < 10; tick++) head(0, 0); };
    // On the stair, each point is walked and then stood on for a third of a second, so no run's momentum carries the
    // player off a landing's open side.
    const stair = points => { for (const point of points) { walk([point]); for (let tick = 0; tick < 20; tick++) head(0, 0); } };
    assert.ok(Math.hypot(player.position.x - shard.spawn.x, player.position.z - shard.spawn.z) < 0.5, 'The journey starts at the shard spawn');
    walk(TO_HOLLOW);
    walk(TO_TOWER_FOOT);
    const ground = player.position.y;
    tap('lantern.ridge');
    assert.equal(has('lit:ridge'), false, 'The ridge lantern must not light without the flint');
    tap('ridge-flint');
    assert.equal(has('taken:ridge-flint'), false, 'The flint is up in the cab, out of reach from the ground');
    stair(UP_THE_FLIGHTS);
    assert.ok(player.position.y > ground + DECK_RISE, `The stair climbs to the deck: ${player.position.y} from ${ground}`);
    tap('ridge-flint');
    assert.equal(has('taken:ridge-flint'), false, "The flint is still out of reach from the hatch's mouth");
    stair(TO_FINDER);
    tap('ridge-flint');
    assert.ok(has('taken:ridge-flint'), "The fire-watcher's flint is taken beside the finder");
    stair(DOWN_THE_FLIGHTS);
    assert.ok(Math.abs(player.position.y - ground) < 1, `The stair comes back down to the lantern: ${player.position.y} vs ${ground}`);
    tap('lantern.ridge');
    assert.ok(has('lit:ridge'), 'The same press at the same spot lights the ridge lantern once the flint is carried');
    console.log(`ridge journey: ${((performance.now() - started) / 1000).toFixed(1)} s`);
  } finally { await resident.dispose?.(); }
});

test('pine-hollow: the zipline ridden from the lookout on real inputs', { timeout: 30_000 }, async () => {
  const started = performance.now(), { resident } = await boot();
  try {
    const { player, walk, press, has, head } = rider(resident);
    const stair = points => { for (const point of points) { walk([point]); for (let tick = 0; tick < 20; tick++) head(0, 0); } };
    walk(TO_HOLLOW);
    walk(TO_TOWER_FOOT);
    const ground = player.position.y;
    stair(UP_THE_FLIGHTS);
    assert.ok(player.position.y > ground + DECK_RISE, `The stair climbs to the deck: ${player.position.y} from ${ground}`);
    const deck = player.position.y;
    press('pine.zipline');
    for (let tick = 0; tick < 60; tick++) head(0, 0);
    assert.ok(Math.abs(player.position.y - deck) < 0.5, "The cable can't be taken from inside the cab");
    stair(TO_LAUNCH);
    press('pine.zipline');
    let ticks = 0;
    for (; ticks < RIDE_TICKS && !has('used:ph-zip'); ticks++) head(0, 0);
    assert.ok(has('used:ph-zip'), `The ride must reach the landing: ${player.position.x}, ${player.position.y}, ${player.position.z}`);
    for (let tick = 0; tick < 30; tick++) head(0, 0);
    assert.ok(Math.hypot(player.position.x - LANDING.x, player.position.z - LANDING.z) < 2, `The rider steps off at the landing: ${player.position.x}, ${player.position.z}`);
    assert.ok(player.position.y < deck - 40, `The ride comes down off the ridge: ${player.position.y} from ${deck}`);
    console.log(`zipline journey: ride ${(ticks / 60).toFixed(1)} s, ${((performance.now() - started) / 1000).toFixed(1)} s`);
  } finally { await resident.dispose?.(); }
});
