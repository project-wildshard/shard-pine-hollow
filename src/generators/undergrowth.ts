/**
 * The forest floor's undergrowth shapes (G285: an offline bake). Build-time only: `src/shards/pine-hollow/generators/bake-pine-undergrowth.mjs`
 * runs `bakePineUndergrowth` and writes each kind's geometry (the fern rosette, the shrub, the litter and the moss,
 * the pebbles, the reed clump; QA 11-24 rows 51 and 54: every kind is geometry, not a picture quad) to `../data/undergrowth.json`; the page builds them from it
 * (../world/undergrowth.ts `UNDER_SHAPES`) and never runs this. test/shards/pine-hollow/undergrowth-bake.test.ts is the
 * stale gate. Each shape's stream is the level seed's (1337, the page's engine SEED while the floor builds) + 606 / 607 / 608.
 */
import * as THREE from 'three';
import { BakedPiece } from '@wildshard/sdk/bake';
import { PineSeedStream as Rng } from './seedStream';
import TEXELS from '../data/foliageTexels.json' with { type: 'json' };

/** Original Float32-exact shape channels, retained beside the standard GLB for the native field. */
export interface UnderShape { position: number[]; normal: number[]; uv: number[]; index: number[] }
/** The six authored forest-floor models, in the original field order. */
export type UnderShapes = Record<'ferns' | 'shrubs' | 'litter' | 'stones' | 'moss' | 'reeds', UnderShape>;

/** Pine Hollow's level seed (manifest.ts `seed`): the page's engine SEED while the undergrowth builds */
export const PINE_SEED = 1337;

/** a shape's arrays as the page's Float32 attributes will hold them (f32-exact numbers) */
function blocks(verts: number[], norms: number[], uvs: number[], idx: number[]): UnderShape {
  const f32 = (a: number[]): number[] => a.map((v) => Math.fround(v));
  return { position: f32(verts), normal: f32(norms), uv: f32(uvs), index: idx };
}

function upNormal(x: number, z: number, out: number[]): void {
  const rl = Math.hypot(x, z) || 1;
  const nx = (x / rl) * 0.45, nz = (z / rl) * 0.45;
  const nl = Math.hypot(nx, 1, nz);
  out.push(nx / nl, 1 / nl, nz / nl);
}

/**
 * QA 2026-11-24 row 51 (J510: no flat image stands in for a 3D object): the fern, the shrub, the reeds and the stones are
 * geometry, not alpha-cut picture quads. Each keeps its old size and stream, and every triangle samples solid texels of
 * its own painting (../data/foliageTexels.json), so the colours stay the painting's. A vertex's v stays its height up
 * the plant (0 at the ground), as the undergrowth graph's sway and base shade read it; its u is a solid texel on that row.
 */
type Under = (typeof TEXELS.under)[keyof typeof TEXELS.under];
const texels = (kind: keyof typeof TEXELS.under): Under => TEXELS.under[kind];
/** a solid texel's u on the row at height v (the nearest row that has one) */
function rowU(t: Under, v: number): number {
  const n = t.rows.length, k = Math.min(n - 1, Math.max(0, Math.floor(v * n)));
  for (let d = 0; d < n; d++) for (const j of [k - d, k + d]) { const u = t.rows[j]; if (u !== undefined && u !== null) return u; }
  return 0.5;
}
/** a solid texel near height v (for a leaf, a pinna or a stone: one texel, one flat painted colour) */
function pointNear(t: Under, v: number, pick: number): readonly [number, number] {
  const ranked = [...t.points].sort((a, b) => Math.abs((a[1] ?? 0) - v) - Math.abs((b[1] ?? 0) - v)).slice(0, 6);
  return (ranked[Math.floor(pick * ranked.length) % Math.max(1, ranked.length)] ?? [0.5, 0.5]) as readonly [number, number];
}

class ShapeBuilder {
  readonly verts: number[] = []; readonly norms: number[] = []; readonly uvs: number[] = []; readonly idx: number[] = [];
  /** a vertex with the soft up-and-out normal the undergrowth lights by */
  soft(x: number, y: number, z: number, u: number, v: number): number { this.verts.push(x, y, z); upNormal(x, z, this.norms); this.uvs.push(u, v); return this.verts.length / 3 - 1; }
  raw(x: number, y: number, z: number, n: readonly [number, number, number], u: number, v: number): number { this.verts.push(x, y, z); this.norms.push(...n); this.uvs.push(u, v); return this.verts.length / 3 - 1; }
  tri(a: number, b: number, c: number): void { this.idx.push(a, b, c); }
  shape(): UnderShape { return blocks(this.verts, this.norms, this.uvs, this.idx); }
}

/** Rosette of 9 arched fronds: each a stem (a keeled strip) with 8 pinna pairs splayed out of the frond's plane. Unit ≈ 0.9 m frond length. */
function buildFernGeometry(): UnderShape {
  const rng = new Rng(PINE_SEED + 606), t = texels('ferns'), out = new ShapeBuilder();
  const fronds = 9, rows = 5, pairs = 8;
  for (let f = 0; f < fronds; f++) {
    const inner = f >= 6;
    const yaw = (f / (inner ? 3 : 6)) * Math.PI * 2 + rng.range(-0.3, 0.3) + (inner ? 0.5 : 0);
    const len = (inner ? 0.62 : 0.9) * rng.range(0.85, 1.15);
    const width = len * 0.42;
    const tiltUp = inner ? rng.range(0.9, 1.2) : rng.range(0.35, 0.6);   // radians above horizontal at the base
    const droop = rng.range(0.9, 1.4);
    const cy = Math.cos(yaw), sy = Math.sin(yaw);
    // the frond's arch, as the old quads followed it: (along, up) at a fraction of its length
    const arch = (tt: number): [number, number] => {
      let px = 0, py = 0.05; const steps = 6;
      for (let s = 0; s < steps; s++) { const q = (tt * s) / steps, a = tiltUp - droop * q * q; px += Math.cos(a) * (len * tt) / steps; py += Math.sin(a) * (len * tt) / steps; }
      return [px, py];
    };
    const at = (tt: number, lx: number, lift: number): [number, number, number] => {
      const [px, py] = arch(tt); return [px * cy - lx * sy, py + lift, px * sy + lx * cy];
    };
    // the stem: a strip whose two edges stand up from its centre line (a V keel), 4 segments
    const stemW = 0.012, base = out.verts.length / 3;
    for (let r = 0; r < rows; r++) {
      const tt = r / (rows - 1), u = rowU(t, tt);
      for (const lx of [-stemW, stemW]) out.soft(...at(tt, lx, 0.006), u, tt);
      out.soft(...at(tt, 0, -0.004), u, tt);
    }
    for (let r = 0; r < rows - 1; r++) {
      const a = base + r * 3, b = a + 3;
      out.tri(a, b, a + 2); out.tri(a + 2, b, b + 2); out.tri(a + 2, b + 2, a + 1); out.tri(a + 1, b + 2, b + 1);
    }
    // the pinnae: narrow leaflets out to the frond's old half width, alternate ones tipped up out of its plane
    for (let k = 0; k < pairs; k++) {
      const tt = 0.08 + (k / (pairs - 1)) * 0.84, half = (width / 2) * Math.sin(Math.min(1, tt * 1.6 + 0.15) * Math.PI * 0.5 + 0.2), dt = 0.045;
      for (const side of [-1, 1]) {
        const [u, v] = pointNear(t, tt, rng.next()), lift = (k + (side > 0 ? 1 : 0)) % 2 === 0 ? half * 0.35 : -half * 0.1;
        out.tri(out.soft(...at(tt - dt, 0, 0.004), u, v), out.soft(...at(Math.min(1, tt + dt * 1.6), side * half, lift), u, v), out.soft(...at(tt + dt, 0, 0.004), u, v));
      }
    }
  }
  return out.shape();
}

/** A shrub 0.95 m wide, 0.75 m tall: five twigs (thin three-sided stems) and leaves folded along their midribs. */
function buildShrubGeometry(): UnderShape {
  const rng = new Rng(PINE_SEED + 607), t = texels('shrubs'), out = new ShapeBuilder();
  const twigs = 5, h = 0.75 * rng.range(0.85, 1.15), w = 0.95 * rng.range(0.85, 1.15);
  const ends: [number, number, number][] = [];
  for (let k = 0; k < twigs; k++) {
    const yaw = (k / twigs) * Math.PI * 2 + rng.range(-0.3, 0.3), lean = rng.range(0.35, 0.75);
    const tipH = h * rng.range(0.7, 1), reach = (w / 2) * lean;
    const point = (q: number): [number, number, number] => [Math.cos(yaw) * reach * q, tipH * q, Math.sin(yaw) * reach * q];
    // a three-sided stem, 2 segments, tapering
    const base = out.verts.length / 3;
    for (let s = 0; s <= 2; s++) {
      const q = s / 2, [x, y, z] = point(q), r = 0.014 * (1 - q * 0.7), u = rowU(t, y / h);
      for (let side = 0; side < 3; side++) { const a = (side / 3) * Math.PI * 2; out.soft(x + Math.cos(a) * r, y, z + Math.sin(a) * r, u, y / h); }
    }
    for (let s = 0; s < 2; s++) for (let side = 0; side < 3; side++) {
      const a = base + s * 3 + side, b = base + s * 3 + (side + 1) % 3;
      out.tri(a, b, a + 3); out.tri(b, b + 3, a + 3);
    }
    for (let q = 0.45; q <= 1.0001; q += 0.11) ends.push(point(q));
  }
  // leaves round the upper twigs: each a blade from a stalk point out and up, folded along its midrib
  for (const [x, y, z] of ends) for (let l = 0; l < 2; l++) {
    const a = rng.range(0, Math.PI * 2), len = rng.range(0.07, 0.12), up = rng.range(-0.2, 0.6);
    const dx = Math.cos(a) * len, dz = Math.sin(a) * len, dy = up * len, wid = len * 0.32, fx = -Math.sin(a) * wid, fz = Math.cos(a) * wid;
    const [u, v] = pointNear(t, y / h, rng.next()), fold = wid * 0.4;
    const s0 = out.soft(x, y, z, u, v), tip = out.soft(x + dx, y + dy, z + dz, u, v);
    const left = out.soft(x + dx * 0.45 + fx, y + dy * 0.45 + fold, z + dz * 0.45 + fz, u, v), right = out.soft(x + dx * 0.45 - fx, y + dy * 0.45 + fold, z + dz * 0.45 - fz, u, v);
    out.tri(s0, left, tip); out.tri(s0, tip, right);
  }
  return out.shape();
}

/** A stone patch 0.9 m across: a few low pebbles (squashed, chipped bipyramids seated in the ground), each one painted grey. */
function buildStoneGeometry(size: number): UnderShape {
  const rng = new Rng(PINE_SEED + 609), t = texels('stones'), out = new ShapeBuilder();
  const count = 6;
  for (let k = 0; k < count; k++) {
    const r = size * rng.range(0.05, 0.11), x = rng.range(-0.4, 0.4) * size, z = rng.range(-0.4, 0.4) * size;
    const height = r * rng.range(0.45, 0.7), yaw = rng.range(0, Math.PI), [u, v] = pointNear(t, 0.75, rng.next());
    // a ring of 6 points round the pebble's widest girth, a crown above, a seat below the ground
    const ring: number[] = [];
    for (let i = 0; i < 6; i++) {
      const a = yaw + (i / 6) * Math.PI * 2, rr = r * rng.range(0.8, 1.15), px = Math.cos(a) * rr, pz = Math.sin(a) * rr * 0.8;
      const n = Math.hypot(px, pz) || 1;
      ring.push(out.raw(x + px, height * 0.35, z + pz, [px / n, 0.35, pz / n], u, v));
    }
    const top = out.raw(x + rng.range(-0.2, 0.2) * r, height, z + rng.range(-0.2, 0.2) * r, [0, 1, 0], u, v);
    const seat = out.raw(x, -height * 0.25, z, [0, -1, 0], u, v);
    for (let i = 0; i < 6; i++) { const a = ring[i] ?? 0, b = ring[(i + 1) % 6] ?? 0; out.tri(top, b, a); out.tri(seat, a, b); }
  }
  return out.shape();
}

/** Reed / sedge clump, 1 m tall (scaled 0.8–1.2 per instance): seven blades (tapering keeled strips, bending out) and two seed heads. */
function buildReedGeometry(): UnderShape {
  const rng = new Rng(PINE_SEED + 608), t = texels('reeds'), out = new ShapeBuilder();
  const runs: readonly (readonly number[])[] = t.runs.length > 0 ? t.runs : [[0.5, 0, 1]];
  for (let q = 0; q < 7; q++) {
    const yaw = (q / 7) * Math.PI * 2 + rng.range(-0.3, 0.3), cy = Math.cos(yaw), sy = Math.sin(yaw);
    const tall = rng.range(0.7, 1.0), bend = rng.range(0.08, 0.22), w = 0.022 * rng.range(0.8, 1.2), run = runs[q % runs.length] ?? [0.5, 0, 1];
    const u = run[0] ?? 0.5, v0 = run[1] ?? 0, v1 = run[2] ?? 1, rows = 4, base = out.verts.length / 3;
    for (let r = 0; r < rows; r++) {
      const tt = r / (rows - 1), y = tt * tall, lean = bend * tt * tt, half = w * (1 - tt * 0.85);
      // the blade's v is its height up the clump, kept inside the stalk's own solid run of the painting
      const v = Math.min(v1, Math.max(v0, y)), cx = lean * cy, cz = lean * sy;
      out.soft(cx - sy * half, y, cz + cy * half, u, v); out.soft(cx + sy * half, y, cz - cy * half, u, v); out.soft(cx + cy * half * 0.6, y, cz + sy * half * 0.6, u, v);
    }
    for (let r = 0; r < rows - 1; r++) { const a = base + r * 3, b = a + 3; out.tri(a, a + 2, b); out.tri(b, a + 2, b + 2); out.tri(a + 2, a + 1, b + 2); out.tri(b + 2, a + 1, b + 1); }
    if (q < 2) {
      // a seed head: a short spindle on the blade's top
      const y0 = tall * 0.98, cx = bend * cy, cz = bend * sy, [pu, pv] = pointNear(t, 1, rng.next()), ring: number[] = [];
      for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2; ring.push(out.soft(cx + Math.cos(a) * 0.018, y0 + 0.07, cz + Math.sin(a) * 0.018, pu, pv)); }
      const lo = out.soft(cx, y0, cz, pu, pv), hi = out.soft(cx, y0 + 0.16, cz, pu, pv);
      for (let i = 0; i < 5; i++) { const a = ring[i] ?? 0, b = ring[(i + 1) % 5] ?? 0; out.tri(lo, b, a); out.tri(hi, a, b); }
    }
  }
  return out.shape();
}

/**
 * The litter (QA 11-24 row 54, J510): the painted mat's fallen twig sprays as real geometry, branching sticks lying on the
 * ground with a few dead leaves at their tips, among loose needles, over a `size`-metre patch; every piece samples one
 * solid texel of the litter painting.
 */
function buildLitterGeometry(size: number): UnderShape {
  const rng = new Rng(PINE_SEED + 610), t = texels('litter'), out = new ShapeBuilder(), h = size / 2;
  const at = (): [number, number] => { for (;;) { const x = rng.range(-1, 1), z = rng.range(-1, 1); if (x * x + z * z <= 1) return [x * h, z * h]; } };
  // a three-sided stick lying on the ground from (x0, z0) to (x1, z1)
  const stick = (x0: number, z0: number, x1: number, z1: number, r0: number, r1: number): void => {
    const len = Math.hypot(x1 - x0, z1 - z0) || 1, sx = -(z1 - z0) / len, sz = (x1 - x0) / len, [u, v] = pointNear(t, rng.next(), rng.next()), base = out.verts.length / 3;
    for (const [x, z, r] of [[x0, z0, r0], [x1, z1, r1]] as const) for (let q = 0; q < 3; q++) {
      const ang = (q / 3) * Math.PI * 2 + 0.5, c = Math.cos(ang), sn = Math.sin(ang);
      out.raw(x + sx * c * r, r + sn * r, z + sz * c * r, [sx * c, sn, sz * c], u, v);
    }
    for (let q = 0; q < 3; q++) { const a0 = base + q, a1 = base + (q + 1) % 3; out.tri(a0, a1, a1 + 3); out.tri(a0, a1 + 3, a0 + 3); }
  };
  // a dead leaf: a small folded blade lying at (x, z), pointing along a
  const leaf = (x: number, z: number, a: number): void => {
    const len = rng.range(0.03, 0.05), w = len * 0.45, ca = Math.cos(a), sa = Math.sin(a), [u, v] = pointNear(t, rng.next(), rng.next());
    const p0 = out.raw(x, 0.004, z, [0, 1, 0], u, v), tip = out.raw(x + ca * len, 0.004, z + sa * len, [0, 1, 0], u, v);
    const l = out.raw(x + ca * len * 0.45 - sa * w, 0.012, z + sa * len * 0.45 + ca * w, [-sa * 0.4, 0.9, ca * 0.4], u, v);
    const r = out.raw(x + ca * len * 0.45 + sa * w, 0.012, z + sa * len * 0.45 - ca * w, [sa * 0.4, 0.9, -ca * 0.4], u, v);
    out.tri(p0, l, tip); out.tri(p0, tip, r);
  };
  // the sprays: a bent main stick with side twigs, leaves at their ends
  for (let k = 0; k < 4; k++) {
    let [x, z] = at(), a = rng.range(0, Math.PI * 2);
    const segs = 4, seg = rng.range(0.1, 0.16), r0 = rng.range(0.007, 0.011);
    for (let i = 0; i < segs; i++) {
      a += rng.range(-0.35, 0.35);
      const nx = x + Math.cos(a) * seg, nz = z + Math.sin(a) * seg, r = r0 * (1 - i / segs * 0.6);
      stick(x, z, nx, nz, r, r * 0.85);
      // one or two side twigs off each joint, a leaf or two at each tip
      for (const side of rng.next() < 0.5 ? [1] : [1, -1]) {
        const b = a + side * rng.range(0.5, 1.0), l = rng.range(0.06, 0.14), tx = nx + Math.cos(b) * l, tz = nz + Math.sin(b) * l;
        stick(nx, nz, tx, tz, r * 0.6, r * 0.35);
        leaf(tx, tz, b + rng.range(-0.6, 0.6));
        if (rng.next() < 0.5) leaf(tx, tz, b + rng.range(-1.5, 1.5));
      }
      x = nx; z = nz;
    }
    leaf(x, z, a);
  }
  // loose needles: thin keeled slivers a few millimetres up
  for (let k = 0; k < 70; k++) {
    const [x, z] = at(), a = rng.range(0, Math.PI), len = rng.range(0.035, 0.065), w = 0.0025, [u, v] = pointNear(t, rng.next(), rng.next());
    const dx = (Math.cos(a) * len) / 2, dz = (Math.sin(a) * len) / 2, sx = -Math.sin(a) * w, sz = Math.cos(a) * w, y = rng.range(0.002, 0.012);
    const p0 = out.raw(x - dx, y, z - dz, [0, 1, 0], u, v), p1 = out.raw(x + dx, y, z + dz, [0, 1, 0], u, v);
    const l = out.raw(x + sx, y + 0.002, z + sz, [sx / w * 0.4, 0.9, sz / w * 0.4], u, v), r = out.raw(x - sx, y + 0.002, z - sz, [-sx / w * 0.4, 0.9, -sz / w * 0.4], u, v);
    out.tri(p0, l, p1); out.tri(p0, p1, r);
  }
  return out.shape();
}

/**
 * The moss (QA 11-24 row 54, J510): a cushion of low domed lumps over a `size`-metre patch, thickest in the middle, instead of
 * the painted mat; each lump samples one solid texel of the moss painting.
 */
function buildMossGeometry(size: number): UnderShape {
  const rng = new Rng(PINE_SEED + 611), t = texels('moss'), out = new ShapeBuilder(), h = size / 2;
  for (let k = 0; k < 16; k++) {
    const ang = rng.range(0, Math.PI * 2), d = Math.sqrt(rng.next()) * h * 0.8, x = Math.cos(ang) * d, z = Math.sin(ang) * d;
    const r = rng.range(0.08, 0.16) * size * (1 - (0.4 * d) / h), top = r * rng.range(0.35, 0.55), [u, v] = pointNear(t, rng.next(), rng.next());
    // a dome: a rim ring on the ground, a shoulder ring, a crown
    const rim: number[] = [], shoulder: number[] = [];
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + k, ca = Math.cos(a), sa = Math.sin(a), rr = r * rng.range(0.85, 1.1);
      rim.push(out.raw(x + ca * rr, 0.002, z + sa * rr, [ca * 0.7, 0.7, sa * 0.7], u, v));
      shoulder.push(out.raw(x + ca * rr * 0.6, top * 0.75, z + sa * rr * 0.6, [ca * 0.45, 0.9, sa * 0.45], u, v));
    }
    const crown = out.raw(x, top, z, [0, 1, 0], u, v);
    for (let i = 0; i < 6; i++) {
      const j = (i + 1) % 6, a0 = rim[i] ?? 0, a1 = rim[j] ?? 0, b0 = shoulder[i] ?? 0, b1 = shoulder[j] ?? 0;
      out.tri(a0, b1, a1); out.tri(a0, b0, b1); out.tri(b0, crown, b1);
    }
  }
  return out.shape();
}

/** every kind's shape, as the page's Undergrowth built them */
export function bakePineUndergrowth(): UnderShapes {
  return {
    ferns: buildFernGeometry(), shrubs: buildShrubGeometry(), litter: buildLitterGeometry(1.4), stones: buildStoneGeometry(0.9),
    moss: buildMossGeometry(1.0), reeds: buildReedGeometry(),
  };
}

/** Local-space plant models; the native forest field continues to own their real world placements. */
export function pineUndergrowthScene(): THREE.Scene {
  const scene = new THREE.Scene(); scene.name = 'pine-hollow.undergrowth';
  const material = new THREE.MeshStandardMaterial({ roughness: 1, side: THREE.DoubleSide });
  const kinds = Object.entries(bakePineUndergrowth()).map(([name, shape]) => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(shape.position, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(shape.normal, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(shape.uv, 2));
    geometry.setIndex(new THREE.Uint16BufferAttribute(shape.index, 1));
    const mesh = new THREE.InstancedMesh(geometry, material, 1);
    mesh.setMatrixAt(0, new THREE.Matrix4());
    return [name, mesh] as const;
  });
  scene.add(new BakedPiece('pine.undergrowth', kinds, [], { nativeAttributes: true, compactIndex: true, nodeExtras: (kind, mesh) => {
    const vertexCount = mesh.geometry.getAttribute('position').count, indexCount = mesh.geometry.getIndex()?.count ?? 0;
    return { wholePartition: { id: `pine-undergrowth-${kind}`, vertexCount, indexCount, index: 'u16',
      vertices: Array.from({ length: vertexCount }, (_, i) => i), triangles: Array.from({ length: indexCount / 3 }, (_, i) => i) } };
  } }));
  return scene;
}
