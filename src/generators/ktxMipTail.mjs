import { read, write } from 'three/examples/jsm/libs/ktx-parse.module.js';

/** Keep the existing UASTC levels down from the first one that fits the cap. */
export function capKtx2Edge(bytes, edge) {
  if (!Number.isInteger(edge) || edge < 1) throw new Error('KTX2 edge must be a positive integer');
  const texture = read(bytes);
  let { pixelWidth, pixelHeight } = texture;
  if (Math.max(pixelWidth, pixelHeight) <= edge) return bytes;
  // UASTC uses independently compressed levels. BasisLZ would need
  // its global image descriptors rewritten as well.
  if (texture.vkFormat !== 0 || texture.supercompressionScheme !== 2 || texture.globalData !== null
    || texture.faceCount !== 1 || texture.layerCount !== 0 || texture.pixelDepth !== 0) {
    throw new Error('Expected a mipmapped UASTC 2D texture');
  }
  let skipped = 0;
  while (Math.max(pixelWidth, pixelHeight) > edge) {
    pixelWidth = Math.max(1, Math.floor(pixelWidth / 2));
    pixelHeight = Math.max(1, Math.floor(pixelHeight / 2));
    skipped++;
  }
  const levels = texture.levels.slice(skipped);
  if (levels.length === 0) throw new Error('Pine texture is missing its smaller mip levels');
  return write({ ...texture, pixelWidth, pixelHeight, levelCount: levels.length, levels });
}
