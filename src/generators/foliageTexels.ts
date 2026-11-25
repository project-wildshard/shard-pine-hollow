/**
 * QA 2026-11-24 row 51 (J510: no flat image stands in for a 3D object): the forest's foliage is geometry, not cut-out
 * cards, but it keeps the zone's own painted colour by sampling its existing textures at texels that are solid all round.
 * A triangle whose corners share one such texel paints one flat colour from the painting and is never cut by alpha.
 *
 * This file finds those texels; ../data/foliageTexels.json holds the result (test/pine-foliage-geometry.test.ts
 * recomputes it from the images and fails when it is stale). UVs follow the textures' flipY convention: v = 0 is the
 * image's bottom row.
 */

/** Decoded RGBA, rows top to bottom (as the image file stores them). */
export interface Raster { readonly width: number; readonly height: number; readonly pixels: Uint8ClampedArray }
type UV = readonly [number, number];

/** the four cells of the tree card atlas (cards-albedo.png), by the uv quarter the Blender cards map to */
export const TREE_CELLS = { pine: [0, 0], fir: [0.5, 0], birch: [0, 0.5], moss: [0.5, 0.5] } as const;
export type TreeCell = keyof typeof TREE_CELLS;
export const TREE_CELL_NAMES: readonly TreeCell[] = ['pine', 'fir', 'birch', 'moss'];
/** the undergrowth kinds that are geometry now (the litter and the moss since QA 11-24 row 54) */
export const UNDER_KINDS = ['ferns', 'shrubs', 'reeds', 'stones', 'litter', 'moss'] as const;
export type UnderKind = (typeof UNDER_KINDS)[number];

/** the share of a cell's solid texels a pick list keeps, and how many rows the undergrowth row table has */
const PICKS = 32, ROWS = 64;

/** Solid where the whole (2r+1)² block round a texel is opaque (so its mips stay opaque several levels down). */
function eroded(r: Raster, radius: number, min = 250): Uint8Array {
  const { width: w, height: h, pixels } = r, solid = new Uint8Array(w * h), row = new Uint8Array(w * h), out = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) solid[i] = (pixels[i * 4 + 3] ?? 0) >= min ? 1 : 0;
  // separable minimum: across rows, then down columns
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let ok = 1; for (let d = -radius; d <= radius && ok; d++) { const xx = x + d; ok = xx >= 0 && xx < w ? (solid[y * w + xx] ?? 0) : 0; }
    row[y * w + x] = ok;
  }
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let ok = 1; for (let d = -radius; d <= radius && ok; d++) { const yy = y + d; ok = yy >= 0 && yy < h ? (row[yy * w + x] ?? 0) : 0; }
    out[y * w + x] = ok;
  }
  return out;
}

const round = (n: number): number => Math.round(n * 1e5) / 1e5;
const uvOf = (r: Raster, x: number, y: number): UV => [round((x + 0.5) / r.width), round(1 - (y + 0.5) / r.height)];

/** Up to PICKS solid texels spread evenly through a uv box, preferring the leafiest (greenest) ones; the widest erosion that keeps 24 wins. */
function picks(r: Raster, box: readonly [number, number, number, number]): UV[] {
  const [u0, v0, u1, v1] = box, x0 = Math.floor(u0 * r.width), x1 = Math.floor(u1 * r.width), y0 = Math.floor((1 - v1) * r.height), y1 = Math.floor((1 - v0) * r.height);
  for (const radius of [8, 6, 4, 3, 2, 1, 0]) {
    const mask = eroded(r, radius), found: [number, number][] = [];
    for (let y = y0; y < y1; y += 2) for (let x = x0; x < x1; x += 2) {
      const i = y * r.width + x, g = r.pixels[i * 4 + 1] ?? 0, red = r.pixels[i * 4] ?? 0;
      if (mask[i] === 1 && g >= red) found.push([x, y]);
    }
    // a painting with no leafy texel at all (the needle litter): its solid texels of any colour
    if (radius === 0 && found.length === 0) for (let y = y0; y < y1; y += 2) for (let x = x0; x < x1; x += 2) if (mask[y * r.width + x] === 1) found.push([x, y]);
    if (found.length >= 24 || radius === 0) {
      const step = Math.max(1, found.length / PICKS), out: UV[] = [];
      for (let k = 0; k < Math.min(PICKS, found.length); k++) { const [x, y] = found[Math.floor(k * step)] ?? [0, 0]; out.push(uvOf(r, x, y)); }
      return out;
    }
  }
  return [];
}

/** For each of ROWS bands up the image (v), the solid texel's u nearest the image's middle column, or null when the row is empty. */
function rows(r: Raster): (number | null)[] {
  const mask = eroded(r, 1), out: (number | null)[] = [];
  for (let k = 0; k < ROWS; k++) {
    const y = Math.min(r.height - 1, Math.floor((1 - (k + 0.5) / ROWS) * r.height));
    let best: number | null = null;
    for (let x = 0; x < r.width; x++) if (mask[y * r.width + x] === 1 && (best === null || Math.abs(x - r.width / 2) < Math.abs(best - r.width / 2))) best = x;
    out.push(best === null ? null : round((best + 0.5) / r.width));
  }
  return out;
}

/** The longest vertical solid runs (u, from v, to v), longest first: a reed stalk's own column. */
function runs(r: Raster): [number, number, number][] {
  const mask = eroded(r, 1), found: [number, number, number][] = [];
  for (let x = 0; x < r.width; x++) {
    let start = -1;
    for (let y = 0; y <= r.height; y++) {
      const on = y < r.height && mask[y * r.width + x] === 1;
      if (on && start < 0) start = y;
      if (!on && start >= 0) { if (y - start > r.height / 4) found.push([round((x + 0.5) / r.width), round(1 - y / r.height), round(1 - start / r.height)]); start = -1; }
    }
  }
  return found.sort((a, b) => (b[2] - b[1]) - (a[2] - a[1]) || a[0] - b[0]).slice(0, 8);
}

/** The solid texels every foliage builder samples. */
export interface FoliageTexels {
  readonly trees: Readonly<Record<TreeCell, readonly UV[]>>;
  readonly under: Readonly<Record<UnderKind, { readonly points: readonly UV[]; readonly rows: readonly (number | null)[]; readonly runs: readonly (readonly [number, number, number])[] }>>;
}

export function foliageTexels(atlas: Raster, under: Readonly<Record<UnderKind, Raster>>): FoliageTexels {
  const trees = Object.fromEntries(TREE_CELL_NAMES.map(cell => {
    const [u, v] = TREE_CELLS[cell];
    return [cell, picks(atlas, [u + 0.01, v + 0.01, u + 0.49, v + 0.49])];
  })) as Record<TreeCell, UV[]>;
  const kinds = Object.fromEntries(UNDER_KINDS.map(kind => {
    const r = under[kind];
    return [kind, { points: picks(r, [0, 0, 1, 1]), rows: rows(r), runs: runs(r) }];
  })) as FoliageTexels['under'];
  return { trees, under: kinds };
}
