import { expect, test } from 'vitest';
import { PINE_TREE_ASSETS, TREE_SET } from '../src/generators/treeSet.ts';

// SDK 0.9.1's shard-sandbox lint wants the tree set's URL as a static string, so the literal in TREE_SET
// must keep naming PINE_TREE_ASSETS.set, the folder the tree bake writes.
test('the tree set URL names the baked set folder', () => {
  expect(JSON.stringify(TREE_SET)).toContain(`/assets/pine-hollow/models/${PINE_TREE_ASSETS.set}`);
});
