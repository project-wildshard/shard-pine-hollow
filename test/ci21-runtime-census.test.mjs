// C10 moves the former monorepo owner census beside the source it counts.
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { test } from 'node:test';
const require = createRequire(import.meta.url);
const owner = JSON.parse(readFileSync('test/ci21-grid-owner.json', 'utf8')).products[0].slug;
const source = existsSync('src/shard.config.ts') ? 'src' : `src/shards/${owner}`;
const sdk = dirname(require.resolve('@wildshard/sharddev/package.json'));
const policy = JSON.parse(readFileSync(resolve(sdk, 'lint/runtime-files.json'), 'utf8'));
function census(directory) {
  if (!existsSync(directory)) return 0;
  return readdirSync(directory, { withFileTypes: true }).reduce((count, row) => {
    assert.equal(row.isSymbolicLink(), false, 'Runtime source cannot escape through a symlink');
    return count + (row.isDirectory() ? census(resolve(directory, row.name)) : /\.[cm]?[jt]sx?$/u.test(row.name) && !row.name.endsWith('.d.ts') ? 1 : 0);
  }, 0);
}
test(`${owner}: every owned runtime source file fits its admitted first-party ceiling`, () => {
  assert.ok(existsSync(`${source}/shard.config.ts`));
  assert.ok(JSON.parse(readFileSync('package.json', 'utf8')).name.startsWith('@wildshard/shard-'));
  const count = census(resolve(source, 'runtime')), cap = policy.ceilings[owner] ?? policy.default;
  assert.equal(policy.default, 128); assert.ok(Number.isSafeInteger(cap) && cap >= 0);
  assert.ok(count <= cap, `${owner}: runtime census ${count} exceeds ${cap}`);
});
