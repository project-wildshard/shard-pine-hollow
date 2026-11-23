/**
 * OF23e5 (opus-of-pine, 2026-11-21): engine v0.1.65's far herd refuses an interleaved attribute ("farHerd: attribute 'normal'
 * is interleaved", fixed in engine 500b4213c, which v0.1.65 does not carry). A declared skin's imported rig keeps its normals
 * as normalized int8 VEC3 on a 4-byte stride, which three reads as interleaved, so every skin here gets its normals as a
 * plain float32 channel instead, and every file that names a rewritten file by hash (skin files, variant tables, look rows)
 * is rewritten to name the new one. Drop this when Pine pins an engine that carries 500b4213c.
 */
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { hashImmutableBytes } from '@wildshard/sharddev/immutable';
import { parseGlb } from '@wildshard/format/shardfileAssets';

interface Accessor { bufferView?: number; byteOffset?: number; componentType: number; count: number; type: string; normalized?: boolean; min?: number[]; max?: number[] }
interface MeshoptView { buffer: number; byteOffset?: number; byteLength: number; byteStride: number; count: number; mode: 'ATTRIBUTES' | 'TRIANGLES' | 'INDICES'; filter?: 'NONE' | 'OCTAHEDRAL' | 'QUATERNION' | 'EXPONENTIAL' }
interface View { buffer: number; byteOffset?: number; byteLength: number; byteStride?: number; target?: number; extensions?: { EXT_meshopt_compression?: MeshoptView } }
interface Gltf { buffers: { byteLength: number }[]; bufferViews: View[]; accessors: Accessor[]; meshes?: { primitives: { attributes: Record<string, number> }[] }[] }

const GLB = 0x46546c67, JSON_CHUNK = 0x4e4f534a, BIN_CHUNK = 0x004e4942;
const pad4 = (n: number): number => (n + 3) & ~3;

function chunks(glb: Uint8Array): { json: Gltf; bin: Uint8Array } {
  const view = new DataView(glb.buffer, glb.byteOffset, glb.byteLength);
  if (view.getUint32(0, true) !== GLB) throw new Error('plainNormals: not a GLB');
  const jsonLength = view.getUint32(12, true);
  if (view.getUint32(16, true) !== JSON_CHUNK) throw new Error('plainNormals: GLB without its JSON chunk');
  const json = JSON.parse(new TextDecoder().decode(glb.subarray(20, 20 + jsonLength))) as Gltf;
  const at = 20 + jsonLength;
  if (at >= glb.byteLength || view.getUint32(at + 4, true) !== BIN_CHUNK) throw new Error('plainNormals: GLB without its BIN chunk');
  return { json, bin: glb.subarray(at + 8, at + 8 + view.getUint32(at, true)) };
}

function pack(json: Gltf, bin: Uint8Array): Uint8Array {
  const text = new TextEncoder().encode(JSON.stringify(json)), jsonLength = pad4(text.length), binLength = pad4(bin.length);
  const out = new Uint8Array(12 + 8 + jsonLength + 8 + binLength), view = new DataView(out.buffer);
  view.setUint32(0, GLB, true); view.setUint32(4, 2, true); view.setUint32(8, out.length, true);
  view.setUint32(12, jsonLength, true); view.setUint32(16, JSON_CHUNK, true);
  out.set(text, 20); out.fill(0x20, 20 + text.length, 20 + jsonLength);
  view.setUint32(20 + jsonLength, binLength, true); view.setUint32(24 + jsonLength, BIN_CHUNK, true);
  out.set(bin, 28 + jsonLength);
  return out;
}

/** The view's bytes, decoded when meshopt-compressed (its source lives in the GLB's one BIN buffer). */
function viewBytes(json: Gltf, bin: Uint8Array, view: View): Uint8Array {
  const meshopt = view.extensions?.EXT_meshopt_compression;
  if (meshopt === undefined) {
    if (view.buffer !== 0) throw new Error('plainNormals: a plain view outside the BIN buffer');
    return bin.subarray(view.byteOffset ?? 0, (view.byteOffset ?? 0) + view.byteLength);
  }
  if (meshopt.buffer !== 0) throw new Error('plainNormals: meshopt source outside the BIN buffer');
  const source = bin.subarray(meshopt.byteOffset ?? 0, (meshopt.byteOffset ?? 0) + meshopt.byteLength);
  const target = new Uint8Array(meshopt.count * meshopt.byteStride);
  MeshoptDecoder.decodeGltfBuffer(target, meshopt.count, meshopt.byteStride, source, meshopt.mode, meshopt.filter ?? 'NONE');
  return target;
}

const SCALE: Readonly<Record<number, { bytes: number; max: number; read: (view: DataView, at: number) => number }>> = {
  5120: { bytes: 1, max: 127, read: (view, at) => view.getInt8(at) },
  5121: { bytes: 1, max: 255, read: (view, at) => view.getUint8(at) },
  5122: { bytes: 2, max: 32767, read: (view, at) => view.getInt16(at, true) },
  5123: { bytes: 2, max: 65535, read: (view, at) => view.getUint16(at, true) },
};

/** This GLB with every interleaved NORMAL as a plain float32 channel; the same bytes when it has none. */
export async function plainNormalsGlb(glb: Uint8Array): Promise<Uint8Array> {
  const { json, bin } = chunks(glb);
  const normals = new Set((json.meshes ?? []).flatMap(mesh => mesh.primitives.flatMap(primitive => primitive.attributes['NORMAL'] ?? [])));
  const parts: Uint8Array[] = [bin];
  let end = bin.length, changed = false;
  for (const index of normals) {
    const accessor = json.accessors[index];
    if (accessor?.bufferView === undefined || accessor.type !== 'VEC3') continue;
    const view = json.bufferViews[accessor.bufferView], scale = SCALE[accessor.componentType];
    if (view === undefined || scale === undefined) continue;
    const stride = view.byteStride ?? view.extensions?.EXT_meshopt_compression?.byteStride ?? scale.bytes * 3;
    if (stride === scale.bytes * 3) continue;
    await MeshoptDecoder.ready;
    const bytes = viewBytes(json, bin, view), data = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const floats = new Float32Array(accessor.count * 3), offset = accessor.byteOffset ?? 0;
    for (let i = 0; i < accessor.count; i += 1) for (let k = 0; k < 3; k += 1) {
      const raw = scale.read(data, offset + i * stride + k * scale.bytes);
      floats[i * 3 + k] = accessor.normalized === true ? Math.max(raw / scale.max, -1) : raw;
    }
    const start = pad4(end), gap = start - end;
    if (gap > 0) parts.push(new Uint8Array(gap));
    parts.push(new Uint8Array(floats.buffer));
    json.bufferViews.push({ buffer: 0, byteOffset: start, byteLength: floats.byteLength, target: 34962 });
    json.accessors[index] = { bufferView: json.bufferViews.length - 1, byteOffset: 0, componentType: 5126, count: accessor.count, type: 'VEC3' };
    end = start + floats.byteLength; changed = true;
  }
  if (!changed) return glb;
  const merged = new Uint8Array(end);
  let at = 0;
  for (const part of parts) { merged.set(part, at); at += part.length; }
  const first = json.buffers[0];
  if (first === undefined) throw new Error('plainNormals: GLB without a buffer');
  first.byteLength = end;
  return pack(json, merged);
}

const HEX = /[0-9a-f]{64}/gu;
const isGlb = (bytes: Uint8Array): boolean => bytes.length > 12 && new DataView(bytes.buffer, bytes.byteOffset).getUint32(0, true) === GLB;
const isJson = (bytes: Uint8Array): boolean => bytes.length > 0 && (bytes[0] === 0x7b || bytes[0] === 0x5b);

/** `value` with every GLB's normals made plain and every hash that named a rewritten file renamed, to a fixed point (a skin
 *  file names its GLB, a variant table its skins, a look row its skin and tables). */
export async function withPlainNormals<T>(value: T): Promise<T> {
  const renames = new Map<string, string>(), grown = new Map<string, { decoded: number; gpu: number }>();
  const rename = (text: string): string => text.replaceAll(HEX, hash => renames.get(hash) ?? hash);
  // a skin file declares its GLB's cost: the float channel costs more to decode and upload, so its row's cost grows by as much
  const regrow = (text: string): string => {
    const file = /"file":"([0-9a-f]{64})"/u.exec(text)?.[1], growth = file === undefined ? undefined : grown.get(file);
    if (growth === undefined) return text;
    return text.replace(/"cost":\{"decoded":(\d+),"draws":(\d+),"gpu":(\d+),/u, (_all, decoded: string, draws: string, gpu: string) =>
      `"cost":{"decoded":${String(Number(decoded) + growth.decoded)},"draws":${draws},"gpu":${String(Number(gpu) + growth.gpu)},`);
  };
  const glbs = async (node: unknown): Promise<unknown> => {
    if (node instanceof Uint8Array) {
      if (!isGlb(node)) return node;
      const plain = await plainNormalsGlb(node);
      if (plain !== node) {
        const before = parseGlb(node), after = parseGlb(plain), old = hashImmutableBytes(node);
        renames.set(old, hashImmutableBytes(plain));
        grown.set(old, { decoded: Math.max(0, after.decoded - before.decoded), gpu: Math.max(0, after.gpu - before.gpu) });
      }
      return plain;
    }
    if (ArrayBuffer.isView(node)) return node;
    if (Array.isArray(node)) return Promise.all(node.map(glbs));
    if (node !== null && typeof node === 'object') return Object.fromEntries(await Promise.all(Object.entries(node).map(async ([key, entry]) => [key, await glbs(entry)] as const)));
    return node;
  };
  const names = (node: unknown): unknown => {
    if (node instanceof Uint8Array) {
      if (!isJson(node)) return node;
      const text = new TextDecoder().decode(node), next = rename(regrow(text));
      if (next === text) return node;
      const bytes = new TextEncoder().encode(next);
      renames.set(hashImmutableBytes(node), hashImmutableBytes(bytes));
      return bytes;
    }
    if (ArrayBuffer.isView(node)) return node;
    if (typeof node === 'string') return rename(node);
    if (Array.isArray(node)) return node.map(names);
    if (node !== null && typeof node === 'object') return Object.fromEntries(Object.entries(node).map(([key, entry]) => [key, names(entry)]));
    return node;
  };
  let current = await glbs(value);
  for (let pass = 0; pass < 6; pass += 1) {
    const before = renames.size;
    current = names(current);
    if (renames.size === before) return current as T;
  }
  throw new Error('plainNormals: renames did not settle');
}
