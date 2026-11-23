// oxlint-disable-next-line import/no-nodejs-modules -- Compile the same actual authored sources in Node's native compiler realm.
import { readFileSync } from 'node:fs';
import { compileDecisionScripts } from '@wildshard/sdk/buildDecisionScripts';
import { CONTRACT_PROGRAM_SCRIPT, contractProgramRegistries } from '../../../src/generators/contractProgram';

const sources = new Map(['contracts', 'contractsRandom', 'contractsRules'].map(name =>
  [`behaviour/${name}.as`, readFileSync(`src/behaviour/${name}.as`, 'utf8')]));
const built = await compileDecisionScripts([CONTRACT_PROGRAM_SCRIPT], contractProgramRegistries(), sources, { asLineCeiling: 256, singleSignal: true });
const script = built.rows[0], blob = built.blobs[0];
if (script === undefined || blob === undefined) throw new Error('Missing compiled contract programme');
process.stdout.write(JSON.stringify({ script, bytes: Buffer.from(blob.bytes).toString('base64') }));
