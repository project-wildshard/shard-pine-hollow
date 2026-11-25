// oxlint-disable-next-line import/no-nodejs-modules -- Each oracle reconstructs its actual typed source in a fresh Node owner.
import { execFile } from 'node:child_process';
// oxlint-disable-next-line import/no-nodejs-modules -- Fence the complete local and installed source inventory before and after construction.
import { lstatSync, readFileSync, readdirSync, realpathSync } from 'node:fs';
// oxlint-disable-next-line import/no-nodejs-modules -- Bind every defining source byte, without a stale oracle cache.
import { createHash } from 'node:crypto';
// oxlint-disable-next-line import/no-nodejs-modules -- Specs name explicit source roots under the consumer graph.
import { resolve as resolvePath, join } from 'node:path';

export interface NativeProgramSpec {
  readonly id: string; readonly script: string; readonly inputs: readonly string[];
  readonly root?: string; readonly cacheDir?: string; readonly transformTypes?: boolean;
  readonly loader?: 'bake' | 'simulation';
}
/** Cold independent reconstruction keeps the full original oracle; no cached result can survive a changed dependency. */
export async function nativeProgramFixture(spec: NativeProgramSpec): Promise<string> {
  const root = resolvePath(spec.root ?? '.');
  function inventory(): readonly (readonly [string, string])[] {
    const files = new Set<string>();
    function walk(path: string): void {
      const actual = realpathSync(path), stat = lstatSync(actual);
      if (stat.isDirectory()) for (const name of readdirSync(actual).sort()) walk(join(actual, name));
      else if (stat.isFile()) files.add(actual);
      else throw new Error('Foreign native oracle input');
    }
    for (const path of [...spec.inputs, spec.script, 'src/scripts/bake-loader.mjs', 'src/scripts/sim-node-loader.mjs']) walk(resolvePath(root, path));
    return [...files].sort().map(path => [path, createHash('sha256').update(readFileSync(path)).digest('hex')] as const);
  }
  const before = JSON.stringify(inventory());
  const loader = spec.loader === 'simulation' ? 'src/scripts/sim-node-loader.mjs' : 'src/scripts/bake-loader.mjs';
  const args = [...(spec.transformTypes === true ? ['--experimental-transform-types'] : []), '--import', `./${loader}`, spec.script];
  const text = await new Promise<string>((resolve, reject) => {
    execFile(process.execPath, args, { cwd: root, encoding: 'utf8', maxBuffer: 1 << 26 }, (error: Error | null, stdout) => {
      if (error !== null) reject(error); else resolve(stdout);
    });
  });
  if (JSON.stringify(inventory()) !== before) throw new Error('Native oracle defining inputs changed during reconstruction');
  const value: unknown = JSON.parse(text);
  if (value === null || typeof value !== 'object') throw new Error('Missing native compiler envelope');
  return text;
}
