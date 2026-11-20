// ONE-FORMAT OF23d: the Antler King on his declared body, on the built product. Pine's shard declares his thralls in his
// fight's spawn group (`pine.king`) and his species row from his hull; this proof also moves his own body there (his
// declared spawn takes the runtime's boss row, which the format admits once a declared ground boss counts as a retained
// actor). The night raises the declared King, his skin's chest lock point is his weak point, his summons stand his group's
// thralls, he falls through three phases, a save mid-fight restores exactly, and he leaves the world when the player does.
import '@wildshard/engine/scripts/sim-node-loader.mjs';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, resolve } from 'node:path';
import { test } from 'node:test';
import { Vector3 } from 'three';

const { loadHeadlessFolder } = await import('@wildshard/engine/host/headlessFolder');
const { openWorld } = await import('@wildshard/engine/host/openWorld');
const { outputDescriptor } = await import('@wildshard/engine/game/shardfile/outputDescriptor');
const { serverInputFiles } = await import('@wildshard/engine/game/shardfile/serverSkinRigs');
const { loadRapier } = await import('@wildshard/engine/physics/rapier');
const { leadPlayer } = await import('@wildshard/engine/sim/leadPlayer');
const { nativeGroundBossObservation } = await import('@wildshard/engine/game/boss/native');
const { serializeSimSnapshot, snapshotSimHost, snapshotSimHostBytes } = await import('@wildshard/engine/sim/snapshot');
const { canonicalSimDigest } = await import('@wildshard/engine/test/simState');
const engineRequire = createRequire(import.meta.resolve('@wildshard/engine/package.json'));

const FIGHT = 'pine.king', KING = 'pine.antler-king', CLEARING = { x: 150, z: -30 };
let THRALLS = [];

async function product() {
  const directory = resolve('out/pine-hollow'), folder = await loadHeadlessFolder(directory), built = folder.shardfile;
  const descriptor = outputDescriptor(built); assert.ok(descriptor, 'The built shard must pass admission');
  // the King is a declared spawn in his group (his decision row's actor), the runtime stands no boss, and his `boss`
  // encounter row declares him (the native fight runs it)
  const crown = built.creatures.spawns.find(row => row.id === KING);
  assert.equal(crown?.group, FIGHT, 'The King stands in his fight group');
  assert.ok(built.rows.species.some(row => row.id === crown.species && row.kind === 'antler-king'), 'His species row');
  assert.equal(built.runtime.spawns.bosses.length, 0, 'The runtime stands no boss');
  assert.ok(built.encounters.some(row => row.entity === KING && row.kind === 'boss'), 'His boss encounter row');
  THRALLS = built.creatures.spawns.filter(row => row.group === FIGHT && row.id !== KING).map(row => row.id);
  assert.equal(THRALLS.length, 6, 'Three boar and three elk thralls in his group');
  const shard = built;
  // a room's reads: his skin rig too, now that a declared spawn names it
  const assets = new Map(serverInputFiles(descriptor.index.files, shard)
    .map(file => [file.commons === true ? `commons:${file.hash}` : file.hash, readFileSync(join(directory, file.path))]));
  const rapier = await loadRapier(readFileSync(engineRequire.resolve('@dimforge/rapier3d-simd/rapier_wasm3d_bg.wasm')));
  return { shard, assets, product: { ...folder, shardfile: shard }, rapier };
}
const open = async (input, snapshot) => (await openWorld(input, { room: true, ...(snapshot === undefined ? {} : { snapshot }) })).resident;
const body = (host, id) => { const actor = host.entities.get(id); assert.ok(actor, `Missing body ${id}`); return actor; };
const seen = host => { const row = nativeGroundBossObservation(host, FIGHT); assert.ok(row, 'No King fight'); return row; };
/** the lead player stands at the clearing's edge, healed */
function stand(host, away = 4) {
  const player = leadPlayer(host), x = CLEARING.x, z = CLEARING.z + away;
  player.position.set(x, host.groundHeightAt(x, z), z); player.velocity.set(0, 0, 0); player.impulse.set(0, 0, 0); player.motor.resetAt(player.position);
  player.health.attributes.health = player.health.attributes.maxHealth;
}

test("the Antler King's declared body: raised by night, his group's thralls, three phases, saved, retired", { timeout: 600_000 }, async () => {
  const input = await product(), live = await open(input);
  let restored;
  try {
    const { host } = live, crowned = body(host, KING), pool = THRALLS.map(id => body(host, id));
    assert.equal(host.adapters.has('encounter.pine.king.boss'), false, 'The native fight runs his encounter');
    assert.equal(crowned.kind, 'antler-king');
    // his weak point is his skin's chest lock point (no ribs volume of a roster body)
    assert.deepEqual([...crowned.lockPoints?.names ?? []], ['chest']);
    assert.equal(crowned.ribsWorld, undefined);
    for (let tick = 0; tick < 30; tick++) { stand(host); live.step([]); }
    assert.equal(crowned.alive, false, 'No King by day');
    assert.ok(pool.every(actor => !actor.alive), 'No thrall by day');
    const clock = host.dayClock; assert.ok(clock, 'No day');
    clock.phase = 0.95;
    for (let tick = 0; tick < 1200 && seen(host).fight.body === null; tick++) { stand(host); live.step([]); }
    assert.equal(seen(host).fight.body, KING, 'The night raises the declared King');
    assert.equal(crowned.alive, true);
    for (let tick = 0; tick < 3600 && seen(host).boss.state !== 'fight'; tick++) { stand(host); live.step([]); }
    assert.equal(seen(host).boss.state, 'fight');
    const player = leadPlayer(host), phases = new Set([seen(host).boss.phase]), chest = new Vector3();
    const blow = share => {
      crowned.lockPoints.point(0, chest);
      host.combat.hit({ source: player.health, sourceTags: ['actor.player'], target: crowned.combatActor(), amount: crowned.maxHp * share, point: chest.clone(), dir: new Vector3(0, 0, 1) });
    };
    blow(0.7); // a closed weak point takes 0.6 of a blow: under 0.6 of his health, his second phase
    const adds = new Set();
    for (let tick = 0; tick < 7200 && adds.size === 0; tick++) {
      stand(host); crowned.hp = Math.max(crowned.hp, crowned.maxHp * 0.5); live.step([]);
      for (const add of seen(host).fight.adds) adds.add(add.a);
    }
    assert.ok(adds.size > 0, 'His second phase summons');
    assert.ok([...adds].every(id => THRALLS.includes(id)), `His summons are his group's thralls: ${[...adds].join(', ')}`);
    // a save mid-fight restores the King, his thralls and the fight exactly, and both go on the same
    restored = await open(input, serializeSimSnapshot(snapshotSimHostBytes(host)));
    assert.equal(canonicalSimDigest(snapshotSimHost(restored.host)), canonicalSimDigest(snapshotSimHost(host)));
    for (let tick = 0; tick < 120; tick++) { stand(host); stand(restored.host); live.step([]); restored.step([]); }
    assert.equal(canonicalSimDigest(snapshotSimHost(restored.host)), canonicalSimDigest(snapshotSimHost(host)));
    for (let blows = 0; blows < 60 && seen(host).boss.state !== 'victory'; blows++) {
      for (let wait = 0; wait < 120 && seen(host).boss.state === 'beat'; wait++) { stand(host); live.step([]); }
      blow(0.3);
      for (let tick = 0; tick < 3; tick++) { stand(host); live.step([]); }
      phases.add(seen(host).boss.phase);
    }
    assert.equal(seen(host).boss.state, 'victory');
    assert.deepEqual(phases, new Set([0, 1, 2]));
    // his body lies in the clearing while the player stands there (the reward's), then leaves the world once he walks out
    for (let tick = 0; tick < 600; tick++) { stand(host); live.step([]); }
    assert.notEqual(crowned.hidden, true, 'He lies in the clearing while the player is there');
    process.stderr.write(`KING corpse y ${crowned.position.y.toFixed(2)}, ground ${host.groundHeightAt(crowned.position.x, crowned.position.z).toFixed(2)}\n`);
    for (let tick = 0; tick < 1800 && crowned.hidden !== true; tick++) { stand(host, 140); live.step([]); }
    assert.equal(crowned.hidden, true, 'He leaves the world when the player walks out');
  } finally { restored?.dispose?.(); live.dispose?.(); }
});
