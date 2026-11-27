/**
 * SF5 (J525, meta standalone shardfiles): a shardfile carries images only, and the cook makes every KTX2 (SF15 to SF17). A
 * creature's skin maps and the birds' atlases were the KTX2 the hand-made bake embedded in each rig's GPU twin; they are now
 * the rig's own embedded image (WebP), decoded and written as a lossless PNG, which the cook encodes for both tiers.
 */
import type { ImagePixels } from '@wildshard/sdk/bake/image';

/** The image codecs the caller hands in (the build context's or the SDK's readers), so no codec enters a program bundle. */
export interface RigImageCodecs { readonly read: (bytes: Uint8Array) => Promise<ImagePixels>; readonly write: (image: ImagePixels) => Promise<Uint8Array> }

const layout = (why: string): Error => new Error(`Rig image: ${why}`);
interface GlbView { readonly buffer?: number; readonly byteOffset?: number; readonly byteLength: number }
interface GlbImage { readonly bufferView?: number; readonly mimeType?: string }
interface GlbTexture { readonly source?: number; readonly extensions?: Readonly<Record<string, { readonly source?: number } | undefined>> }
interface GlbMaterial { readonly pbrMetallicRoughness?: { readonly baseColorTexture?: { readonly index: number } }; readonly normalTexture?: { readonly index: number } }
interface GlbJson { readonly materials?: readonly GlbMaterial[]; readonly textures?: readonly GlbTexture[]; readonly images?: readonly GlbImage[]; readonly bufferViews?: readonly GlbView[] }

/** The embedded image bytes (PNG, JPEG or WebP) a GLB's first material samples for its base colour or normal map. */
export function rigMapImage(glb: Uint8Array, slot: 'base' | 'normal'): Uint8Array {
  const view = new DataView(glb.buffer, glb.byteOffset, glb.byteLength), length = view.getUint32(12, true);
  if (view.getUint32(0, true) !== 0x46546c67 || view.getUint32(16, true) !== 0x4e4f534a || view.getUint32(24 + length, true) !== 0x004e4942) throw layout('not a GLB');
  const doc = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(glb.subarray(20, 20 + length))) as GlbJson;
  const bin = glb.subarray(28 + length);
  const material = doc.materials?.[0];
  const index = slot === 'base' ? material?.pbrMetallicRoughness?.baseColorTexture?.index : material?.normalTexture?.index;
  const texture = index === undefined ? undefined : doc.textures?.[index];
  const source = texture?.extensions?.['EXT_texture_webp']?.source ?? texture?.source;
  const image = source === undefined ? undefined : doc.images?.[source];
  if (image?.bufferView === undefined || !/^image\/(?:png|jpeg|webp)$/u.test(image.mimeType ?? '')) throw layout(`no embedded ${slot} image`);
  const range = doc.bufferViews?.[image.bufferView];
  const offset = range?.byteOffset ?? 0;
  if (range === undefined || (range.buffer ?? 0) !== 0 || offset + range.byteLength > bin.byteLength) throw layout(`${slot} image outside the BIN chunk`);
  return bin.slice(offset, offset + range.byteLength);
}

/** Halve an RGBA raster (2x2 box) until its longer edge fits `edge`, as the KTX2 bake's box mips did. */
export function capPixels(image: ImagePixels, edge: number): ImagePixels {
  let { width, height, pixels } = image;
  while (Math.max(width, height) > edge && width > 1 && height > 1) {
    const w = Math.floor(width / 2), h = Math.floor(height / 2), out = new Uint8ClampedArray(w * h * 4);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) for (let c = 0; c < 4; c++) {
      const at = (yy: number, xx: number): number => pixels[(yy * width + xx) * 4 + c] ?? 0;
      out[(y * w + x) * 4 + c] = (at(2 * y, 2 * x) + at(2 * y, 2 * x + 1) + at(2 * y + 1, 2 * x) + at(2 * y + 1, 2 * x + 1) + 2) >> 2;
    }
    width = w; height = h; pixels = out;
  }
  return { width, height, pixels };
}

/** A rig's map as a lossless PNG whose longer edge is at most `edge`. */
export async function rigMapPng(glb: Uint8Array, slot: 'base' | 'normal', edge: number, codecs: RigImageCodecs): Promise<Uint8Array> {
  return codecs.write(capPixels(await codecs.read(rigMapImage(glb, slot)), edge));
}
