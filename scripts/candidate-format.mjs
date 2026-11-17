// Candidate engines retain their own declared format dependency. The author
// project and SDK keep their existing pins while Ring 3 proves that graph.
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const root = new URL('../', import.meta.url);
const require = createRequire(new URL('package.json', root));
const engine = require('@wildshard/engine/package.json');
const format = engine.dependencies?.['@wildshard/format'];
if (typeof format !== 'string' || !/^npm:@wildshard\/shard-format@\^?\d+\.\d+\.\d+$/u.test(format)) {
  throw new Error('Candidate engine must declare its published format dependency');
}
// Qualify the declared minimum exactly so the candidate graph cannot drift.
const exact = format.replace('@^', '@');
const file = new URL('package.json', root), pkg = JSON.parse(readFileSync(file, 'utf8'));
pkg.pnpm ??= {}; pkg.pnpm.overrides ??= {};
pkg.pnpm.overrides['@wildshard/engine>@wildshard/format'] = exact;
if (process.argv.includes('--ci21')) {
  // The source reader needs the released full asset contract and the SDK
  // that implements the current cap policy. The normal producer stays pinned.
  pkg.dependencies['@wildshard/format'] = exact;
  pkg.pnpm.overrides['@wildshard/format'] = exact;
  pkg.dependencies['@wildshard/sharddev'] = 'npm:@wildshard/sdk@0.3.6';
  pkg.pnpm.overrides['@wildshard/sharddev'] = pkg.dependencies['@wildshard/sharddev'];
}
writeFileSync(file, `${JSON.stringify(pkg, null, 2)}\n`);
console.log(`Candidate engine uses its defining format dependency: ${exact}`);
