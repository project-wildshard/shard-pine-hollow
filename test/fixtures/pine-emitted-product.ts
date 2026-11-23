// oxlint-disable-next-line import/no-nodejs-modules -- Read only the sealed ordinary producer's verified emitted files.
import { readFileSync } from 'node:fs';
import { loadHeadlessFolder } from '@wildshard/sdk/headless/host/headlessFolder';
import { outputDescriptor } from '@wildshard/sdk/headless/game/shardfile/outputDescriptor';
import { builtProduct } from './builtProduct';
import { JournalRowSchema } from '@wildshard/format/compendiumRows';
import * as v from 'valibot';

const directory = builtProduct('pine-hollow');
const product = await loadHeadlessFolder(directory);
const descriptor = outputDescriptor(product.shardfile);
if (descriptor === undefined) throw new Error('Missing ordinary Pine output');
const assets = new Map(descriptor.index.files.map(file => [file.hash, new Uint8Array(readFileSync(`${directory}/${file.path}`))]));
const output = {
  assets,
  namedFiles: descriptor.index.files,
  platform: { sections: descriptor.index.sections,
    files: new Map(descriptor.index.sections.map(section => [section.path, new Uint8Array(readFileSync(`${directory}/${section.path}`))])) },
};
/** Read every original content assertion against the actual complete normal output. */
export function pineEmittedProduct(): Promise<{ shard: typeof product.shardfile; assets: typeof assets; output: typeof output }> {
  return Promise.resolve({ shard: product.shardfile, assets, output });
}
export const PINE = product.shardfile;
export const PINE_PREPARED_OUTPUT = output;
export const PINE_JOURNAL = { row: v.parse(JournalRowSchema, PINE.rows.compendiums.find(row => row.id === 'pine.journal')) };
