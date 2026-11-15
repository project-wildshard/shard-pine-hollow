// SH-pine-5/6 diagnostic, pending an engine fix. Run after build:shards:
// node scripts/probe-population.mjs [ticks]
// This uses the admitted product and ordinary idle player inputs. It is
// deliberately not a passing regression test for the engine's fuel error.
import { boot, rider } from '../test/ci/journey-rider.mjs';
const ticks = Number(process.argv[2] ?? 60_000);
if (!Number.isSafeInteger(ticks) || ticks < 1 || ticks > 1_000_000) throw new RangeError('Expected 1..1000000 ticks');
const { resident, world } = await boot(), r = rider(resident);
try {
  for (let tick = 0; tick < ticks; tick++) {
    try { r.head(0, 0); }
    catch (error) { console.error(`Population failed on input ${tick + 1}, world tick ${r.host.state.tick}`); throw error; }
  }
  console.log(`Population survived ${ticks} input ticks`);
} finally { world.dispose(); }
