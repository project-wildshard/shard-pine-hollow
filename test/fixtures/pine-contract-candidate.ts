// oxlint-disable-next-line import/no-nodejs-modules -- Real compiler executes outside the importing test realm.
import { execFileSync } from 'node:child_process';
import * as v from 'valibot';
import { DecisionScriptsSchema } from '@wildshard/format/decisionScripts';
import { parseContractCatalogue } from '@wildshard/format/contracts';
import { contractCatalogue } from '../../src/generators/contractRows';

const raw = v.parse(v.strictObject({ script: v.unknown(), bytes: v.string() }), JSON.parse(execFileSync(process.execPath,
  ['--experimental-transform-types', '--import', import.meta.resolve('@wildshard/engine/scripts/bake-loader.mjs'),
    'test/fixtures/headless/pine-contract-compile.ts'], { encoding: 'utf8', maxBuffer: 1 << 26 })));
const script = v.parse(DecisionScriptsSchema, [raw.script])[0];
if (script === undefined) throw new Error('Missing compiled contract programme');
const bytes = Uint8Array.from(Buffer.from(raw.bytes, 'base64'));
/** Every source input, registry and inline native contract matches the original fixture. */
export const CONTRACTS = parseContractCatalogue({ ...contractCatalogue(), program: { script, bytes: btoa(String.fromCodePoint(...bytes)) } });
