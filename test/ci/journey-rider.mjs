// The headless rider Pine's CI journeys share (J186 Ring 2): the built pine-hollow product booted on the pinned
// engine, and a player driven only by what the page sends: movement frames toward points, and the [E] press each
// prompt's net route names. No flag, quest or pose is written. Shaped like shard-driftwood's test/ci/journey-rider.mjs.
import '@wildshard/engine/scripts/sim-node-loader.mjs';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, resolve } from 'node:path';

const { loadHeadlessProduct } = await import('@wildshard/engine/host/headlessProduct');
const { createTrustedHeadlessResident } = await import('@wildshard/engine/host/headlessRuntime');
const { outputDescriptor, serverReadsFile } = await import('@wildshard/engine/game/shardfile/outputDescriptor');
const { loadRapier } = await import('@wildshard/engine/physics/rapier');
const { actRoutes } = await import('@wildshard/engine/sim/actRoutes');
const engineRequire = createRequire(import.meta.resolve('@wildshard/engine/package.json'));

export async function boot() {
  const directory = resolve('out/pine-hollow'), product = await loadHeadlessProduct(directory), shard = product.shardfile;
  const descriptor = outputDescriptor(shard); assert.ok(descriptor, 'The built shard must pass admission');
  const assets = new Map(descriptor.index.files.filter(file => serverReadsFile(file, shard.terrain?.collider) && (file.name === undefined || file.kind === 'wasm' || file.kind === 'tile'))
    .map(file => [file.commons === true ? `commons:${file.hash}` : file.hash, readFileSync(join(directory, file.path))]));
  const rapier = await loadRapier(readFileSync(engineRequire.resolve('@dimforge/rapier3d-simd/rapier_wasm3d_bg.wasm')));
  return { shard, resident: await createTrustedHeadlessResident({ shard, assets, product, rapier }) };
}

// How long a player waits between [E] presses while a reading types out: half a second.
const READ_GAP = 30;

export function rider(resident) {
  const { host } = resident, player = [...host.players.values()][0]; assert.ok(player);
  const routes = actRoutes(host).interactions;
  // One movement frame toward (dx, dz), run (the page's sprint); a still frame when there is no heading.
  const head = (dx, dz) => {
    const distance = Math.hypot(dx, dz), still = distance === 0;
    resident.step([{ kind: 'player', moveX: still ? 0 : dx / distance, moveZ: still ? 0 : dz / distance, yaw: still ? 0 : Math.atan2(-dx, -dz), commandVersion: 1,
      ...(still ? {} : { sprint: true }), steer: { keyX: 0, keyY: still ? 0 : 1, stickX: 0, stickY: 0 } }]);
  };
  // Run to each point in turn; a point not reached in its allowance fails the route there.
  const walk = points => {
    for (const [x, z] of points) {
      const allowance = Math.max(300, Math.ceil(Math.hypot(x - player.position.x, z - player.position.z) * 60));
      let reached = false;
      for (let tick = 0; tick < allowance && !reached; tick++) {
        const dx = x - player.position.x, dz = z - player.position.z;
        if (Math.hypot(dx, dz) < 0.25) { reached = true; break; }
        head(dx, dz);
      }
      assert.ok(reached, `The walk is blocked at ${x}, ${z}: ${player.position.x}, ${player.position.y}, ${player.position.z}`);
    }
  };
  // [E] where the player stands: the act the prompt's net route names, beside a standing player frame.
  const press = name => {
    const route = routes.get(name); assert.ok(route, `The product must route the ${name} prompt`);
    resident.step([{ kind: 'player', moveX: 0, moveZ: 0, yaw: 0, commandVersion: 1, steer: { keyX: 0, keyY: 0, stickX: 0, stickY: 0 } },
      { kind: 'script', actorId: route.actorId, value: route.value }]);
  };
  const has = flag => host.flags.all.has?.(flag) ?? [...host.flags.all].includes(flag);
  // Read a talk through: [E] opens it, then each press finishes the typing line or turns to the next, half a second
  // apart, until the talk's flag is raised or the presses run out. Returns how many presses it took.
  const read = (name, flag, most = 24) => {
    for (let presses = 1; presses <= most; presses++) {
      press(name);
      for (let tick = 0; tick < READ_GAP; tick++) head(0, 0);
      if (has(flag)) return presses;
    }
    return 0;
  };
  return { host, player, head, walk, press, read, has };
}
