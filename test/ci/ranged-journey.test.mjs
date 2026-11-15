// Ring 2: Pine's complete forest and physical cabin approach, on the
// installed engine. Movement, door presses, equipment selection and free
// fire are player inputs. No ownership, ammunition or pose is written.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { boot } from './journey-rider.mjs';

import { combatRider, takeRifle } from './combat-rider.mjs';

test('pine-hollow: ranged ownership, cabin door and free fire on real inputs', { timeout: 30_000 }, async () => {
  const started = performance.now(), { shard, resident, world } = await boot();
  try {
    const r = combatRider(resident, world);
    assert.ok(Math.hypot(r.player.position.x - shard.spawn.x, r.player.position.z - shard.spawn.z) < 0.5);
    for (const slot of [1, 2]) {
      r.equip(slot);
      assert.equal(r.saved('pine.loadout').held, 0, 'An unowned rifle or reward bow cannot replace the crossbow');
    }
    r.interact('cabin-1-door');
    assert.equal(r.has('door:cabin-1-door'), false, 'A door press from spawn is out of reach');
    const bolts = r.saved('pine.crossbow').quiver;
    r.fire({ slot: 0, pitch: 1.2 });
    assert.equal(r.saved('pine.crossbow').quiver, bolts - 1, 'A free shot spends one real bolt');
    assert.ok(r.saved('pine.crossbow').bolts.some(bolt => bolt.active), 'The shot launches a physical projectile');
    takeRifle(r);
    const rounds = () => { const s = r.saved('pine.lever'); return s.tube + Number(s.chambered) + s.reserve; };
    const before = rounds();
    r.fire({ slot: 1, pitch: 1.2 });
    assert.equal(rounds(), before - 1, 'The earned rifle fires along the player look and spends a round');
    r.equip(2);
    assert.equal(r.saved('pine.loadout').held, 1, 'Acquiring the rifle does not grant the Warden reward bow');
    assert.equal(r.has('paid:king'), false);
    assert.equal(r.player.health.attributes.health, r.player.health.attributes.maxHealth, 'The cabin journey leaves the player unharmed');
    console.log(`ranged journey: ${((performance.now() - started) / 1000).toFixed(1)} s`);
  } finally { world.dispose(); }
});
