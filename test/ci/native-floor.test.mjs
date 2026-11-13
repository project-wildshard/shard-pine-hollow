// Independent pre-B6 inline control versus the public raw-floor intake.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import * as v from 'valibot';
import { nativeGroundRecordSchema } from '@wildshard/format/nativePhysics';
import { nativeBakeGround } from '@wildshard/engine/game/population/nativeBake';

function originalInline(row) {
  const binary = atob(row.heights), bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index++) bytes[index] = binary.codePointAt(index) ?? 0;
  const heights = new Float32Array(bytes.buffer);
  if (heights.length !== 256 ** 2 || row.scale.x !== 500 || row.scale.z !== 500 || row.scale.y !== 1) {
    throw new Error('Original floor is not its 256-square lattice');
  }
  return { heights, friction: row.friction, groups: row.groups, scale: row.scale, at: row.at };
}
function hash(bytes) { return createHash('sha256').update(bytes).digest('hex'); }

test('pine-hollow retains every native floor byte through inline and raw intake', { timeout: 9500 }, async () => {
  const started = performance.now();
  const module = await import('../../src/generators/physics.ts');
  const row = v.parse(v.object({ ground: nativeGroundRecordSchema(256, true) }), module.pinePhysics()).ground;
  const bytes = typeof row.heights === 'string'
    ? Uint8Array.from(Buffer.from(row.heights, 'base64'))
    : Uint8Array.from(readFileSync(new URL('../../src/' + row.heights.file, import.meta.url)));
  const original = new Float32Array(Uint8Array.from(bytes).buffer);
  const inline = originalInline({ ...row, heights: Buffer.from(bytes).toString('base64') });
  const file = 'data/floor.bin';
  const raw = nativeBakeGround({ ...row, heights: { file } }, 256, 500, 'pine-hollow', { file, bytes });
  assert.equal(original.length, 65536);
  assert.equal(bytes.byteLength, 262144);
  for (const current of [inline, raw]) {
    assert.equal(hash(new Uint8Array(current.heights.buffer)), hash(bytes));
    assert.ok(original.every((value, index) => Object.is(value, current.heights[index])));
    assert.deepEqual(current.scale, { x: 500, y: 1, z: 500 });
    assert.deepEqual(current.at, { x: 0, y: 0, z: 0 });
    assert.equal(current.friction, row.friction);
    assert.equal(current.groups, row.groups);
  }
  const expectedHash = hash(bytes);
  assert.notEqual(raw.heights.buffer, bytes.buffer);
  bytes.fill(0);
  assert.equal(hash(new Uint8Array(raw.heights.buffer)), expectedHash);
  assert.ok(original.every((value, index) => Object.is(value, raw.heights[index])));
  const elapsed = performance.now() - started;
  assert.ok(elapsed < 9500, `Native floor proof used ${elapsed} ms; cap is 9500 ms`);
});
