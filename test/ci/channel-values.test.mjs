import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseClientChannels } from '@wildshard/format/clientChannels';
import { admittedClientChannels, planMergedChannels, publishMergedChannels } from '@wildshard/engine/game/plugin/channels';

test('pine-hollow actual pose programs publish exact independent lane values', { timeout: 9500 }, async () => {
  const started = performance.now();
  const { THRALL_CLIPS: clips } = await import('../../src/generators/thrallClips.ts');
  const programs = parseClientChannels(clips.programs.map(row => ({ ...row, numeric: { ...row.numeric, inputs: [] } })));
  assert.ok(programs.length > 0);
  for (const program of programs) assert.ok(program.channels.length > 0);
  const reads = [...new Set(programs.flatMap(row => row.reads))];
  const plan = planMergedChannels(programs, reads);
  assert.ok(plan !== null);
  const own = programs.map(row => admittedClientChannels(row));
  const lanes = programs.map(row => admittedClientChannels(row));
  for (const [index, lane] of own.entries()) assert.notEqual(lane, lanes[index]);
  const merged = admittedClientChannels(plan.program);
  let seed = 5, time = 0, values = reads.map(() => 0), samples = 0;
  const random = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
  for (let frame = 0; frame < 300; frame++) {
    const delta = 1 / 30; time += delta;
    if (frame % 3 !== 0) values = reads.map(() => random() * 4 - 2);
    for (const [index, lane] of own.entries()) {
      lane.evaluate({ time, delta, values: programs[index].reads.map(id => values[reads.indexOf(id)] ?? Number.NaN) });
    }
    const expectedFrames = own.map(lane => ({ ...lane.frame }));
    merged.evaluate({ time, delta, values }); publishMergedChannels(plan, merged, lanes);
    for (const [index, program] of programs.entries()) for (const channel of program.channels) {
      const actual = lanes[index].frame[channel.property], expected = expectedFrames[index][channel.property];
      assert.equal(typeof actual, 'number'); assert.ok(Number.isFinite(actual));
      assert.equal(typeof expected, 'number'); assert.ok(Number.isFinite(expected));
      assert.ok(Object.is(actual, expected)); samples++;
    }
  }
  assert.ok(samples > 0);
  assert.ok(performance.now() - started < 9500, 'Authored pose contract exceeded 9500 ms');
});
