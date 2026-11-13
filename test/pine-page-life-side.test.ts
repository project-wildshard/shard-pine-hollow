import { expect, test } from 'vitest';
import { SCRIPT_V1_VIEW_COMMANDS, scriptSideRefusals } from '@wildshard/format/scriptSides';
import plan from '../src/data/clientPlan.json' with { type: 'json' };
import { LIFE_PROGRAM, PAGE_LIFE } from '../src/generators/pageLife';
import { PINE_QUEST_RUNTIME } from '../src/generators/questRuntime';

// SERVER-PARITY SS11: page.life runs a view row, so sharddev's build and format's admission refuse nothing; the quest's
// lead and hollow-log secret keep the sim row pine.life, which the server runs too (SS5).
test('page.life runs a view row and Pine has no script side refusal', () => {
  const page = plan.features.find(feature => feature.kind === 'page.life');
  if (page === undefined) throw new Error('Pine plans its page.life');
  const returns = [LIFE_PROGRAM.script, PAGE_LIFE.program.script].filter((row, i, rows) => rows.findIndex(other => other.id === row.id) === i);
  const named = (name: string): unknown => name === page.file ? PAGE_LIFE : undefined;
  expect(scriptSideRefusals(new Map<string, unknown>([['client/plan', plan], ['actors/return-scripts', returns]]), named)).toEqual([]);
  expect(PAGE_LIFE.program.script.side).toBe('view');
  expect(PAGE_LIFE.program.script.commands.every(command => SCRIPT_V1_VIEW_COMMANDS.has(command as never))).toBe(true);
  expect(PINE_QUEST_RUNTIME.lead.program.script).toMatchObject({ id: 'pine.life', side: 'sim' });
});
