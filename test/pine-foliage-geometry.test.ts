import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test } from 'vitest';
import { readSourceModel } from '@wildshard/sdk/bake/skinned';
import type * as THREE from 'three';
import { foliageTexelsFromRepo } from './fixtures/foliageTexelInputs';
import { cardClusters } from '../src/generators/cardClusters';
import { bakePineUndergrowth } from '../src/generators/undergrowth';

// QA 2026-11-24 row 51 (J510: no flat image stands in for a 3D object). The forest's branch cards and the fern, shrub,
// reed and stone quads are geometry now: no triangle of them maps an area of a picture (each samples one solid texel or a
// line of them), so none can be an alpha-cut card again.
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

test('the fern, shrub, reeds, stones, litter and moss are geometry, not picture quads', () => {
  const shapes = bakePineUndergrowth();
  for (const kind of ['ferns', 'shrubs', 'reeds', 'stones', 'litter', 'moss'] as const) {
    const shape = shapes[kind];
    expect(shape.index.length / 3, kind).toBeGreaterThan(40);
    expect(maxUvArea(shape.uv, shape.index), kind).toBeLessThan(2e-4);
  }
});

test('every tree branch card becomes a cluster with no picture on it', async () => {
  const source = await readSourceModel(new Uint8Array(readFileSync(resolve(ROOT, 'public/assets/models/pine-hollow-trees/trees.glb'))));
  const meshes: THREE.Mesh[] = [];
  source.gltf.scene.traverse(node => { if ((node as THREE.Mesh).isMesh && /__(?:hi|lo)$/u.test(node.name)) meshes.push(node as THREE.Mesh); });
  expect(meshes.length).toBe(28);
  for (const mesh of meshes) {
    const g = cardClusters(mesh.geometry, mesh.name.endsWith('__hi') ? 'hi' : 'lo'), index = g.getIndex();
    expect(index, mesh.name).not.toBeNull();
    expect((index?.count ?? 0) / 3, mesh.name).toBeGreaterThan((mesh.geometry.getIndex()?.count ?? 0) / 3);
    expect(maxUvArea(g.getAttribute('uv').array, index?.array ?? []), mesh.name).toBe(0);
  }
});
