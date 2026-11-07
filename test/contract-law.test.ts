import { beforeAll, expect, test } from 'vitest';
import mainSource from '../src/shards/pine-hollow/behaviour/contracts.as?raw';
import randomSource from '../src/shards/pine-hollow/behaviour/contractsRandom.as?raw';
import rulesSource from '../src/shards/pine-hollow/behaviour/contractsRules.as?raw';
import { compileDecisionScripts } from '@wildshard/sharddev/buildDecisionScripts';
import { CONTRACT_PROGRAM_SCRIPT, contractProgramRegistries } from '../src/shards/pine-hollow/generators/contractProgram';
import { contractCatalogue } from '../src/shards/pine-hollow/generators/contractRows';
import { contractKill } from '@wildshard/engine/game/quest/contracts';
import { ContractBoard } from '@wildshard/engine/game/quest/contractBoard';
import { parseContractCatalogue, type ContractCatalogue } from '@wildshard/format/contracts';

let contracts: ContractCatalogue;
beforeAll(async () => {
  const sources = new Map([['behaviour/contracts.as', mainSource], ['behaviour/contractsRandom.as', randomSource], ['behaviour/contractsRules.as', rulesSource]]);
  const built = await compileDecisionScripts([CONTRACT_PROGRAM_SCRIPT], contractProgramRegistries(), sources, { asLineCeiling: 256, singleSignal: true });
  const script = built.rows[0], blob = built.blobs[0];
  if (script === undefined || blob === undefined) throw new Error('Missing authored contract guest');
  contracts = parseContractCatalogue({ ...contractCatalogue(), program: { script, bytes: Buffer.from(blob.bytes).toString('base64') } });
});
const prompt = { x: 4, y: 2, z: 9 };
function board(): ContractBoard { return new ContractBoard({ contracts, prompt, radius: 3 }); }

test('a Pine hunt resumes its progress and claims a completed offer once', () => {
  const hunt = board(), offer = hunt.current.slots[0];
  if (offer === undefined) throw new Error('Missing authored opening hunt');
  expect(offer).toMatchObject({ kind: 'species', target: 'deer' });
  const kill = contractKill(contracts, { kind: 'deer', variant: 'ordinary', rarity: 'common' });
  hunt.killed(kill);
  const saved = hunt.snapshot(), resumed = board(); resumed.restore(saved);
  expect(resumed.snapshot()).toEqual(saved);
  for (let count = 1; count < offer.need; count++) resumed.killed(kill);
  expect(resumed.use(10, prompt)).toBeNull();
  resumed.use(0, prompt);
  expect(resumed.use(10, prompt)?.reward).toEqual(offer.reward);
  expect(resumed.current.claimed).toBe(1);
  expect(resumed.use(10, prompt)).toBeNull();
  const finished = resumed.snapshot(), reloaded = board(); reloaded.restore(finished);
  expect(reloaded.snapshot()).toEqual(finished);
  expect(reloaded.use(10, prompt)).toBeNull();
});

test('the real board enforces prompt range and rejects corrupt continuation atomically', () => {
  const hunt = board(); hunt.use(0, { ...prompt, x: prompt.x + 3 });
  expect(hunt.active).toBe(false);
  hunt.use(0, { ...prompt, x: prompt.x + 2.9 }); expect(hunt.active).toBe(true);
  const saved = hunt.snapshot();
  expect(() => hunt.restore({ ...saved, board: { ...saved.board, slots: [...saved.board.slots, saved.board.slots[0]] } })).toThrow();
  expect(hunt.snapshot()).toEqual(saved);
});
