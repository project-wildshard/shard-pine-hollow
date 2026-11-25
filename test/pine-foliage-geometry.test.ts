import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test } from 'vitest';
import { foliageTexelsFromRepo } from './fixtures/foliageTexelInputs';
import { bakePineUndergrowth } from '../src/generators/undergrowth';

// QA 2026-11-24 row 51 (J510: no flat image stands in for a 3D object). The fern, shrub, reed and stone quads are
// geometry: no triangle of them maps an area of a picture (each samples one solid texel or a line of them), so none can
// be an alpha-cut card again. J519 (QA 11-25 row 46) narrowed J510 to held items, props and creatures: the forest's
// branch cards, the needle litter and the moss mats are painted cards again.
const ROOT = resolve(import.meta.dirname, '..');
const TEXELS_FILE = resolve(ROOT, 'src/data/foliageTexels.json');

test('the foliage texel table is current with the tree atlas and the undergrowth paintings', async () => {
  const fresh = `${JSON.stringify(await foliageTexelsFromRepo(ROOT))}\n`;
  if (process.env['WRITE_FOLIAGE_TEXELS'] === '1') writeFileSync(TEXELS_FILE, fresh);
  expect(readFileSync(TEXELS_FILE, 'utf8')).toBe(fresh);
});

/** the largest uv-space area of any triangle (0 when every triangle samples one texel or a line of texels) */
function maxUvArea(uv: ArrayLike<number>, index: ArrayLike<number>): number {
  let max = 0;
  for (let i = 0; i + 2 < index.length; i += 3) {
    const a = (index[i] ?? 0) * 2, b = (index[i + 1] ?? 0) * 2, c = (index[i + 2] ?? 0) * 2;
    const area = Math.abs(((uv[b] ?? 0) - (uv[a] ?? 0)) * ((uv[c + 1] ?? 0) - (uv[a + 1] ?? 0)) - ((uv[c] ?? 0) - (uv[a] ?? 0)) * ((uv[b + 1] ?? 0) - (uv[a + 1] ?? 0))) / 2;
    max = Math.max(max, area);
  }
  return max;
}

test('the fern, shrub, reeds and stones are geometry, not picture quads', () => {
  const shapes = bakePineUndergrowth();
  for (const kind of ['ferns', 'shrubs', 'reeds', 'stones'] as const) {
    const shape = shapes[kind];
    expect(shape.index.length / 3, kind).toBeGreaterThan(40);
    expect(maxUvArea(shape.uv, shape.index), kind).toBeLessThan(2e-4);
  }
});
