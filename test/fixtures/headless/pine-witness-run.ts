import * as v from 'valibot';
import { nativeRapierFile } from '../native-rapier-file';
// Pine Hollow's real renderer-free gameplay witness. CI uses bounded slices of committed gameplay checkpoints.
// oxlint-disable-next-line import/no-nodejs-modules -- Refuse a browser/DOM proxy in this native witness.
import assert from 'node:assert/strict';
// oxlint-disable-next-line import/no-nodejs-modules -- Native mode and exit status.
import process from 'node:process';
// oxlint-disable-next-line import/no-nodejs-modules -- Fence every repository module actually loaded by the witness.
import { registerHooks } from 'node:module';
// oxlint-disable-next-line import/no-nodejs-modules -- Checkpoint inputs and the real-run compatibility receipt.
import { readFileSync, writeFileSync } from 'node:fs';
// oxlint-disable-next-line import/no-nodejs-modules -- Exact committed input bytes.
import { createHash } from 'node:crypto';

assert.equal(typeof document, 'undefined'); assert.equal(typeof window, 'undefined');
const ROOT = new URL('../../../', import.meta.url), loaded = new Set<string>();
writeFileSync(new URL('tmp/ci21-source/physics.json', ROOT), JSON.stringify({sha256:createHash('sha256').update(readFileSync(nativeRapierFile)).digest('hex')}));
registerHooks({ load(url, context, next) { if (url.startsWith(ROOT.href) && !url.includes('/node_modules/')) loaded.add(url); return next(url, context); } });
const { installPortableMath } = await import('@wildshard/engine/core/portableMath');
installPortableMath();
const { installAppIdentity } = await import('@wildshard/engine/app/identity');
const { WILDSHARD_IDENTITY } = await import('@wildshard/engine/game/identity');
const witness = await import('../../proof/pine-hollow/witness.ts');
installAppIdentity(WILDSHARD_IDENTITY);
function inputFiles(): string[] { return [...loaded, ...witness.witnessProductInputFiles(), ...['test/fixtures/headless/pine-witness-run.ts', 'scripts/sim-node-loader.mjs', 'pnpm-lock.yaml', 'tmp/ci21-source/physics.json', 'tmp/ci21-source/runtime.json', 'tmp/ci21-source/product.json', 'public/assets/baked/pine-hollow/terrain.bin', 'public/assets/baked/pine-hollow/navmesh.bin'].map(path => new URL(path, ROOT).href)]; }
function inputs(): string {
  const files = [...new Set(inputFiles())].sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
  const hash = createHash('sha256');
  for (const url of files) hash.update(url.slice(ROOT.href.length)).update('\0').update(readFileSync(new URL(url))).update('\0');
  return hash.digest('hex');
}
const { generateWitness } = await import('../witness-generation');
const mode = process.argv.at(2) ?? 'all';
let checkpointResult;
if (mode !== 'fresh') {
  const fingerprint = inputs();
  const generated = await generateWitness({ root: ROOT, slug: 'pine-hollow', inputs: fingerprint, files: inputFiles(),
    manifest: new URL('../../proof/pine-hollow/checkpoints/manifest.json', import.meta.url), select: witness.setCheckpointDirectory,
    generate: async () => witness.writeCheckpoints(await witness.pineRapier(), fingerprint),
    record: mode === 'checkpoints', forceCompare: mode === 'checkpoints' || mode === 'compare-checkpoints', compare: !['checkpoints', 'cache-record'].includes(mode) });
  if (['checkpoints', 'cache-record', 'compare-checkpoints', 'cache-verify', 'checkpoint-directory'].includes(mode)) checkpointResult = { status: 'generated', inputs: fingerprint, directory: generated.directory, key: generated.key, hit: generated.hit, manifest: generated.manifest };
}

if (checkpointResult !== undefined) console.info(JSON.stringify(checkpointResult));
else if (mode === 'fresh') {
  const result = witness.checkpointsFresh(inputs()); console.info(JSON.stringify(result)); process.exitCode = result.status === 'fresh' ? 0 : 1;

} else if (mode.startsWith('slice-')) {
  const name = v.parse(v.picklist([...witness.CHECKPOINT_NAMES, 'dawn']), mode.slice(6));
  const result = await witness.walkSlice(await witness.pineRapier(), name); console.info(JSON.stringify({ slug: 'pine-hollow', entry: witness.ENTRY, [mode]: result }));
} else if (mode === 'replay') {
  console.info(JSON.stringify({ slug: 'pine-hollow', entry: witness.ENTRY, replay: await witness.replayProof(await witness.pineRapier()) }));
} else {
  if (!['all', 'record', 'headless', 'ledger'].includes(mode)) throw new Error('Unknown Pine proof mode');
  const rapier = await witness.pineRapier(), gameplay = await witness.gameplayProof(rapier, mode === 'ledger' ? 'night' : undefined);
  const ledger = { status: gameplay.status, facts: gameplay.facts, achievements: gameplay.achievements, rules: gameplay.rules,
    gameplayEmissionProven: gameplay.gameplayEmissionProven, refusedWriteRetried: gameplay.refusedWriteRetried,
    durableReload: gameplay.durableReload, duplicateStable: gameplay.duplicateStable };
  const result = { slug: 'pine-hollow', entry: witness.ENTRY, compatible: false, scope: 'Warden Hollow gameplay tape, not every Pine system', inputs: inputs(),
    [mode === 'ledger' ? 'ledger' : 'headless']: gameplay,
    ...(['all', 'record'].includes(mode) ? { replay: await witness.replayProof(rapier), ledger } : {}),
    outcomeDifferences: witness.OUTCOME_DIFFERENCES, coverageGaps: witness.COVERAGE_GAPS, open: witness.OPEN };
  if (mode === 'record') writeFileSync(new URL('../../proof/pine-hollow/compatibility.json', import.meta.url), `${JSON.stringify(result, null, 2)}\n`);
  console.info(JSON.stringify(result));
  // Whole-shard admission remains refused; record and the named partial proofs are evidence-producing modes.
  if (mode === 'all') process.exitCode = 1;
}
