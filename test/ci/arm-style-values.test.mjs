import assert from 'node:assert/strict';
import { test } from 'node:test';
import { armPalette, gloveFist, riderArm, riderArmSteps } from '@wildshard/engine/player/firstPersonArms';
import base from '../../src/data/armsStyle.json' with { type: 'json' };
import { HUNTER_HANDS } from '../../src/generators/handsLook.ts';

const hunter = { ...base, ...HUNTER_HANDS.palette };
const limit = 9500;
function values(geometry, name) {
  const attribute = geometry.getAttribute(name);
  assert.ok(attribute !== undefined, `Missing ${name}`);
  assert.ok(attribute.array.length > 0, `Empty ${name}`);
  assert.ok(attribute.array.every(Number.isFinite), `Non-finite ${name}`);
  return Float32Array.from(attribute.array);
}

test('actual base and hunter styles keep complete fist values independent', { timeout: limit }, () => {
  const started = performance.now(), owned = [];
  try {
    const first = gloveFist(base, { R: .017 }).geometry; owned.push(first);
    const before = { position: values(first, 'position'), color: values(first, 'color') };
    const other = gloveFist(hunter, { R: .017 }).geometry; owned.push(other);
    const again = gloveFist(base, { R: .017 }).geometry; owned.push(again);
    assert.notEqual(first, other); assert.notEqual(first, again);
    assert.deepEqual(values(first, 'color'), before.color);
    assert.deepEqual(values(first, 'position'), before.position);
    assert.deepEqual(values(again, 'color'), before.color);
    assert.deepEqual(values(again, 'position'), before.position);
    assert.notDeepEqual(values(other, 'color'), before.color);
    assert.deepEqual(values(other, 'position'), before.position);
  } finally { for (const geometry of owned) geometry.dispose(); }
  assert.ok(performance.now() - started < limit, 'Complete fist contract exceeded 9500 ms');
});

test('a yielded sleeve retains its actual style across another palette and bake', { timeout: limit }, () => {
  const started = performance.now(), owned = [];
  const steps = riderArmSteps(base, .2, 1);
  try {
    assert.equal(steps.next().done, false);
    const otherPalette = armPalette(hunter); otherPalette.leather.setRGB(0, 0, 0);
    const other = gloveFist(hunter, { R: .017 }).geometry; owned.push(other);
    values(other, 'position'); values(other, 'color');
    let step = steps.next();
    while (!step.done) {
      assert.ok(performance.now() - started < limit, 'Yielded sleeve did not finish in 9500 ms');
      step = steps.next();
    }
    const built = step.value; owned.push(built);
    const before = { position: values(built, 'position'), color: values(built, 'color') };
    const direct = riderArm(base, .2, 1); owned.push(direct);
    assert.notEqual(built, direct);
    assert.deepEqual(values(built, 'position'), before.position);
    assert.deepEqual(values(built, 'color'), before.color);
    assert.deepEqual(values(direct, 'position'), before.position);
    assert.deepEqual(values(direct, 'color'), before.color);
  } finally { steps.return(); for (const geometry of owned) geometry.dispose(); }
  assert.ok(performance.now() - started < limit, 'Complete sleeve contract exceeded 9500 ms');
});
