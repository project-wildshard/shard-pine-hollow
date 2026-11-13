// Real authored closures and retained outcome laws, through installed APIs.
// Shipping v0/v1 artifacts and the current gameplay wire remain unchanged.
import '@wildshard/engine/scripts/sim-node-loader.mjs';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

const { compileDualScriptV2 } = await import('@wildshard/sharddev/test/compileDualScriptV2');
const { compileScript } = await import('@wildshard/sharddev/compileScript');
const names = readdirSync(new URL('./ports/', import.meta.url)).filter(name => name.endsWith('.dual.ts')).sort();
assert.equal(names.length, 13, 'Every preserved non-director owner port must execute');
test('every non-director authored AS body is enrolled without stale copied source', { timeout: 9500 }, async () => {
  const sources = new Map();
  for (const name of names) {
    const { port } = await import(new URL(`./ports/${name}`, import.meta.url));
    for (const [file, source] of port.input.authored) sources.set(file, source);
  }
  const root = 'src/behaviour';
  // The existing mandatory director-shadow case owns both director bodies.
  const actual = readdirSync(root, { recursive: true }).filter(name => name.endsWith('.as') && !['director.as', 'directorV2.as'].includes(name)).sort();
  const actualSources = new Set(actual.map(name => readFileSync(`${root}/${name}`, 'utf8')));
  for (const name of actual) assert.equal(sources.get(name.replace(/\.as$/u, '.ts')), readFileSync(`${root}/${name}`, 'utf8'), `Missing or stale authored enrollment: ${name}`);
  for (const source of sources.values()) assert.ok(actualSources.has(source), 'Every captured body must be actual owner AS, including virtual aliases');
});
for (const name of names) {
  test(`real authored dual admission and execution: ${name}`, { timeout: 9500 }, async () => {
    const { port } = await import(new URL(`./ports/${name}`, import.meta.url));
    const input = port.input, pair = await compileDualScriptV2(input);
    assert.deepEqual(await compileScript(input.legacy.source, { abi: 1, maximumPages: input.pages, sources: { ...Object.fromEntries(input.authored), ...input.legacy.sources } }), pair.legacy.bytes);
    assert.deepEqual(pair.authors.map(row => row.path), [...input.authored.keys()].sort());
    await port.verify(pair);
  });
}
