// J186 Ring 2, CI only, never a hook. The Warden's Hollow pond lantern (meta TEST-COVERAGE SHARD-REPOS SH-pine-1/4)
// on the built product: from spawn up the south road to Hale's porch, his talk read through, the N road and the pond
// spur to the cold pond waystone, then west to the beaver dam: the east bank's log heaved off the sluice, the pool
// waded above the dam to the west bank, the west log heaved, the sluice lifts and washes the glass onto the gravel
// below the dam, the glass taken and carried back to the waystone, which burns again. Only what the page sends
// drives it: movement and the [E] press each prompt's net route names. No flag, quest or pose is written. Each
// refusal is pressed where the same press later works, or just out of its reach, or across the creek from it. Not
// covered: the logs' own need of Hale's talk (every log press here comes after it). About 6,700 ticks.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { boot, rider } from './journey-rider.mjs';

// The south road to the ranger's cabin, to the porch rail gap (about 3.8 m from Hale's talk, out of its reach), then
// in onto the porch beside him (walk-routes.json cabin-porch).
const TO_RAIL_GAP = [[0, -190], [-8, -150], [-30, -95], [-12, -52], [-1, -40], [-5.71, -31.7]];
const ONTO_PORCH = [[-7.99, -35.02]];
// Off the porch, up the N road and along the pond spur to the waystone on the pond's shore (walk-routes.json pond).
const TO_LANTERN = [[-5.71, -31.7], [0, -10], [2, 10], [4, 40], [4, 70], [-30, 86], [-62, 100], [-62.5, 101.5]];
// West over the meadow to the east bank's log at the dam (dam-log-b).
const TO_EAST_LOG = [[-90, 80], [-120, 68], [-132.6, 63.3]];
// Up the east bank and through the beaver pool above the dam to the west bank's gravel below it (pond-glass).
const OVER_THE_POOL = [[-125, 62], [-125, 75], [-135, 78], [-145, 72], [-146, 64], [-143.7, 60.4]];
// Up the west bank to its log (dam-log-a), and back down to the gravel.
const TO_WEST_LOG = [[-146, 64], [-142.3, 67.1]];
const TO_GRAVEL = [[-146, 64], [-143.7, 60.4]];
// Back east over the creek below the dam and the meadow to the waystone.
const BACK_TO_LANTERN = [[-130, 60], [-120, 68], [-90, 80], [-80, 86], [-70, 93], [-62.5, 101.5]];

test('pine-hollow: the pond lantern relit on real inputs', { timeout: 30_000 }, async () => {
  const started = performance.now(), { shard, resident } = await boot();
  try {
    const { host, player, walk, press, read, has } = rider(resident);
    assert.ok(Math.hypot(player.position.x - shard.spawn.x, player.position.z - shard.spawn.z) < 0.5, 'The journey starts at the shard spawn');
    walk(TO_RAIL_GAP);
    assert.equal(read('talk.ranger', 'talked:ranger'), 0, "Hale's talk cannot be read through from the rail gap");
    walk(ONTO_PORCH);
    const presses = read('talk.ranger', 'talked:ranger');
    assert.ok(presses > 0, "Hale's talk never finished on the porch");
    assert.ok(presses > 1, `Hale's talk is read through on the porch, not raised by one press: ${presses}`);
    walk(TO_LANTERN);
    press('lantern.pond'); assert.ok(!has('lit:pond'), 'The pond lantern stays cold without its glass');
    walk(TO_EAST_LOG);
    press('dam-log-a'); assert.ok(!has('lever:dam-log-a'), 'The west log cannot be heaved from the east bank');
    press('dam-log-b'); assert.ok(has('lever:dam-log-b'), 'The east log rolls off the sluice');
    assert.ok(!has('open:dam-sluice'), 'One log off leaves the sluice shut');
    walk(OVER_THE_POOL);
    press('pond-glass'); assert.ok(!has('taken:pond-glass'), 'The glass is not on the gravel while the sluice is shut');
    walk(TO_WEST_LOG);
    press('dam-log-a'); assert.ok(has('lever:dam-log-a'), 'The west log rolls off the sluice');
    assert.ok(has('open:dam-sluice'), 'Both logs off, the sluice lifts');
    const sluiceTick = host.state.tick;
    walk(TO_GRAVEL);
    press('pond-glass'); assert.ok(has('taken:pond-glass'), "The pond lantern's glass is taken off the gravel below the dam");
    walk(BACK_TO_LANTERN);
    press('lantern.pond'); assert.ok(has('lit:pond'), 'The glass relights the pond lantern');
    assert.equal(player.motor.snapshot().result.grounded, true, 'The player stands on the shore by the waystone');
    for (const flag of ['lit:ridge', 'lit:den', 'used:ph-zip', 'taken:ridge-flint', 'quest:warden-done']) assert.ok(!has(flag), `The pond alone never grants ${flag}`);
    console.log(`pond-journey ${JSON.stringify({ presses, sluiceTick, litTick: host.state.tick, elapsedMs: Math.round(performance.now() - started) })}`);
  } finally { resident.dispose(); }
});
