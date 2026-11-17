// oxlint-disable-next-line import/no-nodejs-modules -- Bind the historical complete oracle beside the deliberate current-source golden.
import assert from 'node:assert/strict';
// oxlint-disable-next-line import/no-nodejs-modules -- Historical hashes are immutable provenance, never a filtered runtime comparison.
import { createHash } from 'node:crypto';
// oxlint-disable-next-line import/no-nodejs-modules -- Verify exact historical manifest bytes before admitting the named migration.
import { readFileSync } from 'node:fs';
import * as v from 'valibot';
import current from '../proof/pine-hollow/checkpoints/manifest.json' with { type: 'json' };
import migration from './pine-checkpoint-capture.json' with { type: 'json' };

const count = v.pipe(v.number(), v.safeInteger(), v.minValue(0));
const digest = v.pipe(v.string(), v.regex(/^[a-f0-9]{64}$/u));
const Schema = v.object({ inputs: digest, ticks: v.record(v.string(), count), hashes: v.record(v.string(), digest),
  cache: v.object({ version: v.literal(1), payloads: v.record(v.string(), digest) }) });
/** Preserve every historical checkpoint and fixed fence across one source-version change.
 * Fresh runtime regeneration still compares the entire current manifest and every payload hash exactly. */
export function verifyPineCheckpointProvenance(): void {
  const bytes = readFileSync('test/fixtures/pine-checkpoints-original.json');
  assert.equal(createHash('sha256').update(bytes).digest('hex'), migration.originalManifestSha256);
  const before = v.parse(Schema, JSON.parse(bytes.toString('utf8'))), after = v.parse(Schema, current);
  const currentBytes = readFileSync('test/proof/pine-hollow/checkpoints/manifest.json');
  assert.equal(createHash('sha256').update(currentBytes).digest('hex'), migration.currentManifestSha256);
  assert.deepEqual(before.ticks, migration.clockComparison.historical);
  assert.deepEqual(after.ticks, migration.clockComparison.current);
  assert.deepEqual(Object.keys(after.ticks), Object.keys(before.ticks));
  assert.deepEqual(Object.keys(after.hashes), Object.keys(before.hashes));
  assert.deepEqual(Object.keys(after.cache.payloads), Object.keys(before.cache.payloads));
  for (const name of ['dam', 'ridge', 'night']) assert.equal(after.ticks[name], before.ticks[name]);
  for (const manifest of [before, after]) {
    assert.equal(manifest.ticks.dam, 8_000); assert.equal(manifest.ticks.ridge, 16_000); assert.equal(manifest.ticks.night, 24_000);
    assert.equal(Object.keys(manifest.hashes).at(-1), 'dawn');
    const { night, king, fallen } = manifest.ticks;
    if (night === undefined || king === undefined || fallen === undefined) throw new Error('Incomplete original checkpoint topology');
    assert.ok(night < king && king < fallen && fallen <= 60_000);
  }
}
