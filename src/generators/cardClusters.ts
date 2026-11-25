import * as THREE from 'three';
import TEXELS from '../data/foliageTexels.json' with { type: 'json' };
import { TREE_CELLS, type TreeCell } from './foliageTexels';

/**
 * QA 2026-11-24 row 51 (J510): the Blender tree set's branch cards (each a strip of alpha-cut quads painted with a
 * needle spray, a birch spray or hanging moss) become geometry clusters. Each card segment keeps its place, size and
 * shading normal, and grows the spray its picture showed as real shapes round the twig's line:
 *
 * - pine and fir: tufts of needle spikes splayed round the twig (a bottlebrush, not a plane);
 * - birch: leaves, each a blade folded along its midrib;
 * - moss: strands hanging from the twig.
 *
 * Every triangle samples one solid texel of the same atlas (../data/foliageTexels.json), so the needles keep the
 * painting's own greens and no triangle shows a picture or an alpha cut. `hi` is the near band, `lo` the far band.
 */
export type CardBand = 'hi' | 'lo';

interface Corner { readonly p: THREE.Vector3; readonly n: THREE.Vector3; readonly c: THREE.Color; readonly s: number; readonly t: number }
interface Spray { readonly tufts: number; readonly arms: number }
const SPRAY: Readonly<Record<TreeCell, Readonly<Record<CardBand, Spray>>>> = {
  pine: { hi: { tufts: 2, arms: 4 }, lo: { tufts: 1, arms: 4 } },
  fir: { hi: { tufts: 2, arms: 4 }, lo: { tufts: 1, arms: 4 } },
  birch: { hi: { tufts: 2, arms: 3 }, lo: { tufts: 1, arms: 2 } },
  moss: { hi: { tufts: 4, arms: 1 }, lo: { tufts: 3, arms: 1 } },
};
/** where the twig runs across a card (t: 0 one long edge, 1 the other): the middle, but the moss hangs from its top */
const TWIG: Readonly<Record<TreeCell, number>> = { pine: 0.5, fir: 0.5, birch: 0.5, moss: 0.94 };

function cellOf(u: number, v: number): TreeCell {
  const cu = u < 0.5 ? 0 : 0.5, cv = v < 0.5 ? 0 : 0.5;
  for (const [cell, [a, b]] of Object.entries(TREE_CELLS) as [TreeCell, readonly [number, number]][]) if (a === cu && b === cv) return cell;
  throw new Error('[trees] card uv outside the atlas');
}

/** a stable small hash, so a card's tufts pick the same texels and splay the same way every bake */
const hash = (a: number, b: number): number => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };

/** Turn one card mesh's quads into clusters (indexed, with position, normal, uv and color, in the mesh's own space). */
export function cardClusters(src: THREE.BufferGeometry, band: CardBand): THREE.BufferGeometry {
  const pos = src.getAttribute('position'), nor = src.getAttribute('normal'), uv = src.getAttribute('uv'), col = src.getAttribute('color') as THREE.BufferAttribute | undefined;
  const index = src.getIndex();
  if (index === null) throw new Error('[trees] card mesh not indexed');
  const out = { p: [] as number[], n: [] as number[], uv: [] as number[], c: [] as number[], i: [] as number[] };
  const vert = (p: THREE.Vector3, n: THREE.Vector3, c: THREE.Color, t: readonly [number, number]): number => {
    out.p.push(p.x, p.y, p.z); out.n.push(n.x, n.y, n.z); out.uv.push(t[0], t[1]); out.c.push(c.r, c.g, c.b); return out.p.length / 3 - 1;
  };
  const tri = (a: number, b: number, c: number): void => { out.i.push(a, b, c); };
  for (let q = 0; q + 6 <= index.count; q += 6) {
    const ids = [...new Set(Array.from({ length: 6 }, (_, k) => index.getX(q + k)))];
    if (ids.length !== 4) throw new Error(`[trees] card segment ${String(q / 6)} is not a quad`);
    const us = ids.map(i => uv.getX(i)), vs = ids.map(i => uv.getY(i));
    const u0 = Math.min(...us), u1 = Math.max(...us), v0 = Math.min(...vs), v1 = Math.max(...vs);
    const cell = cellOf((u0 + u1) / 2, (v0 + v1) / 2), picks = (TEXELS.trees as Record<TreeCell, [number, number][]>)[cell];
    const corners: Corner[] = ids.map(i => ({
      p: new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i)), n: new THREE.Vector3(nor.getX(i), nor.getY(i), nor.getZ(i)),
      c: col === undefined ? new THREE.Color(1, 1, 1) : new THREE.Color(col.getX(i), col.getY(i), col.getZ(i)),
      s: u1 > u0 ? (uv.getX(i) - u0) / (u1 - u0) : 0, t: v1 > v0 ? (uv.getY(i) - v0) / (v1 - v0) : 0,
    }));
    const at = (s: number, t: number): Corner => {
      // bilinear over the quad's four corners by their (s, t)
      const w = corners.map(k => (k.s > 0.5 ? s : 1 - s) * (k.t > 0.5 ? t : 1 - t));
      const p = new THREE.Vector3(), n = new THREE.Vector3(), c = new THREE.Color(0, 0, 0);
      corners.forEach((k, j) => { const x = w[j] ?? 0; p.addScaledVector(k.p, x); n.addScaledVector(k.n, x); c.r += k.c.r * x; c.g += k.c.g * x; c.b += k.c.b * x; });
      return { p, n: n.normalize(), c, s, t };
    };
    const spray = SPRAY[cell][band], twig = TWIG[cell], seed = q / 6;
    const base = at(0, twig).p, tip = at(1, twig).p, along = tip.clone().sub(base), length = along.length();
    if (length < 1e-6) continue;
    const dir = along.clone().divideScalar(length);
    const texel = (k: number): readonly [number, number] => picks[Math.floor(hash(seed, k) * picks.length) % picks.length] ?? [0.25, 0.25];
    for (let k = 0; k < spray.tufts; k++) {
      const s = (k + 0.5) / spray.tufts, mid = at(s, twig), across = at(s, 1).p.sub(at(s, 0).p), half = across.length() / 2;
      if (half < 1e-6) continue;
      const side = across.normalize(), out3 = new THREE.Vector3().crossVectors(dir, side).normalize();
      const reach = length / spray.tufts / 2, turn = (hash(seed, k + 40) - 0.5) * 0.6;
      // a needle tuft's spikes share its two twig vertices and one texel (half the vertices of loose spikes)
      const tuftUv = texel(k * 8), twigA = cell === 'pine' || cell === 'fir' ? vert(mid.p.clone().addScaledVector(dir, -reach * 0.8), mid.n, mid.c, tuftUv) : -1;
      const twigB = twigA < 0 ? -1 : vert(mid.p.clone().addScaledVector(dir, reach * 0.8), mid.n, mid.c, tuftUv);
      for (let a = 0; a < spray.arms; a++) {
        const uvk = texel(k * 8 + a), n = mid.n, c = mid.c;
        if (cell === 'moss') {
          // a strand from the twig down the card's own fall, a little twisted out of its plane
          const fall = at(s, 0).p.sub(mid.p), sway = out3.clone().multiplyScalar(fall.length() * 0.25 * (hash(seed, k + 9) - 0.5));
          const root = mid.p, end = root.clone().add(fall.multiplyScalar(0.92)).add(sway), w = reach * 0.35;
          tri(vert(root.clone().addScaledVector(dir, -w), n, c, uvk), vert(root.clone().addScaledVector(dir, w), n, c, uvk), vert(end, n, c, uvk));
          continue;
        }
        // the arm's heading round the twig: the spray's own plane, tipped out of it either way (an X through the twig)
        const angle = cell === 'birch' ? [0.35, Math.PI - 0.35, Math.PI / 2][a] ?? 0 : [0.6, -0.6, Math.PI - 0.6, Math.PI + 0.6][a] ?? 0;
        const heading = side.clone().multiplyScalar(Math.cos(angle + turn)).addScaledVector(out3, Math.sin(angle + turn));
        const root = mid.p.clone().addScaledVector(dir, (a % 2 === 0 ? -0.25 : 0.25) * reach);
        const tipAt = root.clone().addScaledVector(heading, half * (cell === 'birch' ? 0.85 : 0.95)).addScaledVector(dir, reach * (cell === 'birch' ? 0.6 : 0.9));
        if (cell === 'birch') {
          // a leaf: two halves folded up along the midrib from the stalk to the tip
          const midrib = tipAt.clone().sub(root), width = midrib.length() * 0.3, fold = new THREE.Vector3().crossVectors(midrib, heading).normalize();
          const centre = root.clone().addScaledVector(midrib, 0.45), lift = out3.clone().multiplyScalar(width * 0.35);
          const l = vert(centre.clone().addScaledVector(fold, width).add(lift), n, c, uvk), r = vert(centre.clone().addScaledVector(fold, -width).add(lift), n, c, uvk);
          const s0 = vert(root, n, c, uvk), s1 = vert(tipAt, n, c, uvk);
          tri(s0, l, s1); tri(s0, s1, r);
          continue;
        }
        // a needle tuft: a narrow spike from the twig out to the spray's edge, leaning toward the twig's tip
        tri(twigA, twigB, vert(tipAt, n, c, tuftUv));
      }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(out.p, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(out.n, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(out.uv, 2));
  g.setAttribute('color', new THREE.Float32BufferAttribute(out.c, 3));
  g.setIndex(out.i);
  return g;
}
