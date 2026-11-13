// oxlint-disable-next-line import/no-nodejs-modules -- Bind the CLI's declared author and public roots.
import { resolve } from 'node:path';
import { readProjectAssets } from '@wildshard/sharddev/project';
import { decisionLegacyLines } from '../../scripts/decision-legacy-lines.mjs';
import { runSnapshot } from './runSnapshot';

/** Pine's project read as scripts/wildshard.mjs declares it (b8a8db5fd4: public inputs need declared roots): the manifest,
 *  the author folder and public/assets, and the folder's decision line allowance. Generation runs once, as fixture
 *  preparation (CI7: once per CI run, else per importing file); a case only reads the emitted output. */
export function readPineProject(): ReturnType<typeof readProjectAssets> {
  return runSnapshot('pine-project', () => {
    const lines = decisionLegacyLines(resolve('.'), 'pine-hollow');
    return readProjectAssets('src', undefined, { folder: 'pine-hollow', file: resolve('src/manifest.json'),
      imageRoots: [{ prefix: '/src/shards/pine-hollow/', directory: resolve('src') }, { prefix: '/assets/', directory: resolve('public/assets') }] },
    lines === undefined ? {} : { decisionLegacyLines: lines });
  });
}
