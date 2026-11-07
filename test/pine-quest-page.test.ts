import { expect, it } from 'vitest';
import * as v from 'valibot';
import { QuestPageSchema } from '@wildshard/format/questPageComposition';
import { questPage } from '../src/shards/pine-hollow/generators/pageComposition';
import { PINE_SOURCES } from './fixtures/pine-sources';

it('published Pine quest-page bytes cross the format admission boundary', () => {
  const { PINE_QUEST_PAGE_BLOB } = questPage(PINE_SOURCES);
  const wire: unknown = JSON.parse(new TextDecoder().decode(PINE_QUEST_PAGE_BLOB.bytes));
  const page = v.parse(QuestPageSchema, wire);
  expect(page.id).toBe('pine.quest-page');
  expect(page.pages.length).toBeGreaterThan(0);
  expect(() => v.parse(QuestPageSchema, { ...page, id: 42 })).toThrow();
});
