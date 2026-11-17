// Pack the shipped gain-map pairs at build; no browser load-time pixel walk. GR8 G29: `pineKeyedSky` gives the keyed sky
// rows (with each key's packed file, size and horizon) and the packed key bytes by path in the shard file; output.ts names them in
// memory (no scheduler job, no stored files under assets/). D65: the key planes come from the program's sources and are
// decoded by the build context's image reader (no Sharp in the config bundle).
import { DataUtils } from 'three';
import { encodeGainKey, packGainKey } from '@wildshard/sharddev/bake/keyedSky';
import sky from '../data/sky.json' with { type: 'json' };
import { skyKeySource } from './pineSources.ts';

// The dome only filters this background. Pack a smaller key in linear light,
// while deriving the horizon lighting from the full-resolution source.
function halfSizeRgb(data, width, height) {
  if (width % 2 !== 0 || height % 2 !== 0) throw new Error('Pine sky keys need even dimensions');
  const stride = width * 3;
  const packed = new Uint16Array(data.length / 4);
  let output = 0;
  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < stride; x += 6) {
      const pixel = y * stride + x;
      for (let channel = 0; channel < 3; channel++) {
        const offset = pixel + channel;
        const mean = (DataUtils.fromHalfFloat(data[offset]) + DataUtils.fromHalfFloat(data[offset + 3])
          + DataUtils.fromHalfFloat(data[offset + stride]) + DataUtils.fromHalfFloat(data[offset + stride + 3])) * 0.25;
        packed[output++] = DataUtils.toHalfFloat(mean);
      }
    }
  }
  return packed;
}

/** The keyed sky rows and packed key bytes; `readImagePixels` is the build context's decoder and `encode` its memoised
 *  gain-key gzip when it has one. */
export async function pineKeyedSky(sources, readImagePixels, encode = encodeGainKey) {
  const packedKeys = {}, blobs = [];
  for (const [name, key] of Object.entries(sky.keys)) {
    const decode = template => readImagePixels(sources.bytes(skyKeySource(template, key.id)));
    const [color, gain] = await Promise.all([decode(sky.keyFiles.color), decode(sky.keyFiles.gain)]);
    const { width, height } = color;
    if (width !== gain.width || height !== gain.height) throw new Error(`Sky plane sizes differ: ${name}`);
    const { data, horizon } = packGainKey(color.pixels, gain.pixels, width, height), file = `look/sky/${name}.bin`;
    blobs.push([file, encode(halfSizeRgb(data, width, height))]);
    packedKeys[name] = { file, width: width / 2, height: height / 2, horizon };
  }
  return { rows: { ...sky, packedKeys }, blobs };
}
