// Ring 2: the complete forest, real rifle acquisition and 1,500 combat
// ticks before reaching the bear cave. The player fells the Grizzled Sow,
// then runs past the remaining bears to the lantern. This does not claim
// to clear the cave or defeat Old Blackpaw. No actor/flag/pose writes.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { boot } from './journey-rider.mjs';
import { combatRider, takeRifle } from './combat-rider.mjs';

const TO_DEN_TRAIL = [[-5.71, -31.7], [0, -10], [2, 10], [4, 40], [4, 70], [40, 94], [82, 116],
  [104, 124], [126, 128], [151, 143]];

test('pine-hollow: fight the den approach and relight its lantern on real inputs', { timeout: 30_000 }, async () => {
  const started = performance.now(), { resident, world } = await boot();
  try {
    const r = combatRider(resident, world), { player, host } = r;
    takeRifle(r);
    assert.ok(r.read('talk.ranger', 'talked:ranger') > 1, 'Hale explains the lanterns on his porch');
    r.walk(TO_DEN_TRAIL);
    const bears = [...host.entities.values()].filter(actor => actor.kind === 'bear');
    const sow = bears.find(actor => actor.label === 'Grizzled Sow');
    assert.ok(sow?.alive, 'The Grizzled Sow guards the approach');
    assert.equal(sow.hp, sow.maxHp);
    const head = player.position.clone(), full = player.health.attributes.maxHealth;
    let lowest = full, hurtFrames = 0, previous = sow.hp;
    // Run away between shots, turning to aim only on the shot tick. Raw
    // steering follows that heading; backpedalling while facing the bear
    // loses the sprint and lets the charge catch the player. Start firing
    // from the open trail so the rifle can cycle before the Sow closes.
    for (let tick = 0; tick < 1500; tick++) {
      const bear = bears.filter(actor => actor.alive).sort((a, b) => a.position.distanceTo(player.position) - b.position.distanceTo(player.position))[0];
      assert.ok(bear, 'The other bears remain on this approach');
      bear.headWorld(head);
      const dx = head.x - player.position.x, dz = head.z - player.position.z, distance = Math.hypot(dx, dz);
      const pitch = Math.atan2(head.y - player.position.y - 1.68, distance);
      const close = distance > 32 ? 1 : distance < 28 ? -1 : 0, side = tick % 600 < 300 ? 0.2 : -0.2;
      const mx = close * dx / distance - side * dz / distance, mz = close * dz / distance + side * dx / distance;
      // The installed engine cycles the rifle between these presses. Keep
      // moving on the other ticks so the Sow only lands one real blow.
      const scale = Math.max(1, Math.hypot(mx, mz)), shot = tick % 31 === 0;
      resident.step([{ kind: 'player', moveX: shot ? 0 : mx / scale, moveZ: shot ? 0 : mz / scale,
        yaw: shot ? Math.atan2(-dx, -dz) : Math.atan2(-mx, -mz), pitch, commandVersion: 1,
        steer: { keyX: 0, keyY: shot ? 0 : 1, stickX: 0, stickY: 0 }, sprint: true, ...(shot ? { swing: true } : {}) },
      { kind: 'script', actorId: 'pine.aim', value: 1 }]);
      if (sow.hp < previous) hurtFrames++;
      previous = sow.hp;
      lowest = Math.min(lowest, player.health.attributes.health);
      assert.equal(r.has('dead:actor.player'), false, 'The combat approach must not hide a death and respawn');
    }
    assert.ok(hurtFrames > 1, 'Several player shots hurt the Sow');
    assert.equal(sow.alive, false, 'The Grizzled Sow falls to the earned rifle');
    assert.ok(lowest > 0 && lowest < full, 'A real bear blow lands and the player survives it');
    r.walk([[182, 180], [189, 183], [193.4, 197.3]]);
    assert.equal(r.has('dead:actor.player'), false, 'The surviving player reaches the lantern');
    r.press('lantern.den');
    assert.equal(r.has('lit:den'), true, 'The lantern burns after its actual approach and prompt');
    assert.equal(r.has('dead:king'), false, 'Lighting the den does not grant the King fight');
    assert.equal(r.has('quest:warden-done'), false);
    console.log(`den journey: ${((performance.now() - started) / 1000).toFixed(1)} s, lowest health ${lowest}`);
  } finally { world.dispose(); }
});
