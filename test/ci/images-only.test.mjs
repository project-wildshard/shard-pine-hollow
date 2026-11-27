// After a real build (meta standalone shardfiles SF5b, J525): Pine carries images only, and engine's cook makes every
// KTX2. So the product mounts no KTX2 file and nothing under /assets/gpu/, its KTX2 table names no row, and every URL
// its boot bindings name (both tiers, both texture modes, shard and grid) is a file the product carries: the engine's
// built-in KTX2 table names /assets/gpu/ twins Pine no longer has. This replaces the SH-pine-2 ASTC twin check.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

const directory = 'out/pine-hollow';
const KTX2_ID = Buffer.from([0xab, 0x4b, 0x54, 0x58, 0x20, 0x32, 0x30, 0xbb, 0x0d, 0x0a, 0x1a, 0x0a]);

test('pine-hollow: images only, and every boot binding names a carried file', { timeout: 9500 }, () => {
  const cook = JSON.parse(readFileSync(join(directory, 'cook.json'), 'utf8'));
  const mounts = new Map(cook.mounts.map(row => [row.url, row]));
  const urls = [...mounts.keys()];
  assert.deepEqual(urls.filter(url => url.endsWith('.ktx2')), [], 'Pine mounts no KTX2 file');
  assert.deepEqual(urls.filter(url => url.startsWith('/assets/gpu/')), [], 'Pine mounts nothing under /assets/gpu/');
  for (const [url, row] of mounts) {
    if (!/\.(png|jpe?g|webp)$/u.test(url)) continue;
    const head = readFileSync(join(directory, row.path)).subarray(0, 12);
    assert.ok(!head.equals(KTX2_ID), `${url} is an image, not a KTX2 body`);
  }

  const discovery = JSON.parse(readFileSync(join(directory, mounts.get('/shardfiles/pine-hollow/discovery.json').path), 'utf8'));
  const [table] = discovery.native.ktx2.args, [bindings] = discovery.rows.bootBindings.args;
  let named = 0;
  for (const binding of ['shard', 'grid']) {
    for (const tier of ['phone', 'desktop']) assert.deepEqual(table[binding][tier], {}, `${binding} ${tier}: the KTX2 table holds no row`);
    for (const [tier, modes] of Object.entries(bindings[binding].modes)) {
      for (const [mode, lists] of Object.entries(modes)) {
        for (const [list, rows] of Object.entries(lists)) {
          for (const url of rows) {
            named++;
            const path = url.replace(/[?#].*$/u, '');
            assert.ok(!path.endsWith('.ktx2') && !path.startsWith('/assets/gpu/'), `${binding} ${tier} ${mode} ${list}: ${url} names no KTX2`);
            // the engine serves its own front-end files (physics); every zone file is the product's
            if (list !== 'physics') assert.ok(mounts.has(path), `${binding} ${tier} ${mode} ${list}: the product carries ${path}`);
          }
        }
      }
    }
  }
  assert.ok(named > 0, 'the boot bindings name files');
});
