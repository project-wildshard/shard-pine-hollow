// Real movement, door and ranged inputs shared by Pine's Ring 2 journeys.
import assert from 'node:assert/strict';
import { rider } from './journey-rider.mjs';

const TO_PORCH = [[0, -190], [-8, -150], [-30, -95], [-12, -52], [-1, -40], [-5.71, -31.7],
  [-7.99, -35.02], [-9.56, -34.66], [-10.87, -34.18]];
const frame = (fields = {}) => ({ kind: 'player', moveX: 0, moveZ: 0, yaw: 0,
  commandVersion: 1, steer: { keyX: 0, keyY: 0, stickX: 0, stickY: 0 }, ...fields });

// Shared with the den/King journeys: these are the page's free-fire inputs,
// with no target id and no direct call to a weapon owner.
export function combatRider(resident, world) {
  const r = rider(resident), { host, player } = r;
  const saved = id => { const owner = host.adapters.get(id); assert.ok(owner, `Missing ${id}`); return owner.snapshot(); };
  let seq = 0;
  const interact = id => world.step([{ player: player.id, command: null, acts: [{ kind: 'interact', id, seq: ++seq }] }]);
  const settle = ticks => { for (let tick = 0; tick < ticks; tick++) r.head(0, 0); };
  const equip = slot => { resident.step([frame(), { kind: 'script', actorId: 'pine.weapon', value: slot }]); settle(40); };
  const fire = ({ slot, yaw = 0, pitch = 0, ...fields }) => resident.step([frame({ yaw, pitch, ...fields,
    ...(slot === 1 ? { swing: true } : {}) }), ...(slot === 0 ? [{ kind: 'launcher', slot, ads: 1, pitch, fire: true }] : [])]);
  return { ...r, saved, interact, settle, equip, fire };
}

export function takeRifle(r) {
  r.walk(TO_PORCH);
  r.press('quest.pickup');
  assert.equal(r.has('owned:lever-rifle'), false, 'The rifle cannot be taken from the porch');
  r.interact('cabin-1-door'); r.settle(40);
  assert.equal(r.has('door:cabin-1-door'), true, 'The nearby door press opens the cabin');
  r.walk([[-10.8, -33.7], [-12, -33.7], [-13.14, -36.02]]);
  r.press('quest.pickup');
  assert.equal(r.has('owned:lever-rifle'), true, 'The rifle is earned beside its pickup inside the cabin');
  r.equip(1);
  assert.equal(r.saved('pine.loadout').held, 1, 'The owned rifle can be held');
  // Shut the leaf while stepping out, as a player does; standing open,
  // its inward swing blocks the direct return from the rifle corner.
  r.interact('cabin-1-door');
  r.walk([[-12, -33.7], [-10.8, -33.7], [-9.56, -34.66], [-7.99, -35.02]]);
}
