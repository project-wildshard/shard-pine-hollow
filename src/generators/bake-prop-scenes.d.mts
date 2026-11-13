import type { PropSceneRows } from './propSceneRows';
import type { PineSources } from './pineSources';

/** The prop scenes (src/shards/pine-hollow/generators/bake-prop-scenes.mjs): the scatter rows, the props library's geometry
 *  rows and each prop shape's GLB by path in the shard file, built once per sources. */
export function pinePropScenes(sources: PineSources): Promise<{ rows: PropSceneRows; geometry: { id: string; file: string; attributes: Record<string, never> }[]; models: [string, Uint8Array][] }>;
