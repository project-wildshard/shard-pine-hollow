import { beforeAll, expect, test } from 'vitest';
import { builtProduct } from '../fixtures/builtProduct';
import { scenario, type DiskScriptScenario } from '@wildshard/dev/test/scriptScenario';
import { loadHeadlessFolder } from '@wildshard/engine/host/headlessFolder';

const directories = new Map<string, string>();
beforeAll(() => { for (const slug of ['pine-hollow']) directories.set(slug, builtProduct(slug)); });

async function encounter(slug: string, actorName: string, at: readonly [number, number, number], player: readonly [number, number, number]) {
  const directory = directories.get(slug); if (directory === undefined) throw new Error('Missing selected scenario product');
  const product = await loadHeadlessFolder(directory);
  const made = await scenario(slug, `${slug === 'pine-hollow' ? 'pine.king' : 'driftwood.captain'}.decision`, {
    productDirectory: directory, seed: 6218, actors: [{ id: actorName, at }], players: [{ id: 101, at: player }],
  });
  const fields = new Map(product.shardfile.state.shared.map(row => [row.name, row.id]));
  const body = (owner: DiskScriptScenario) => {
    const actor = owner.world.snapshot().actors?.[0]; if (actor === undefined) throw new Error('Missing actual scenario actor'); return actor;
  };
  return { made, product, set: (owner: DiskScriptScenario, values: Readonly<Record<string, number>>, hpShare = 1): void => {
    const actor = body(owner), next = { ...actor.fields };
    for (const [name, value] of Object.entries(values)) { const id = fields.get(name); if (id === undefined) throw new Error(`Missing admitted field ${name}`); next[id] = value; }
    owner.world.setActor({ ...actor, fields: next, hpShare });
  }, get: (owner: DiskScriptScenario, name: string): number | undefined => {
    const id = fields.get(name); if (id === undefined) throw new Error(`Missing admitted field ${name}`); return body(owner).fields?.[id];
  } };
}

test('King published guest chooses sweep, ring recovery, summons and last-phase lanes without replay on restore', async () => {
  const fixture = await encounter('pine-hollow', 'king', [150, 0, -30], [155, 0, -30]);
  const { made: king, set, get } = fixture;
  king.send('start'); expect(king.commands(),JSON.stringify(king.trace())).toContainEqual(['move', 'king', 'reset', 101]);
  king.send('move.done', 'king', 'reset', true);
  king.advance(2.2); expect(get(king, 'king.mode')).toBe(4);
  king.advance(1); expect(king.commands()).toContainEqual(['field', 'king', 'request', 1]);
  king.advance(1.2);
  expect(get(king, 'king.mode')).toBe(5);
  king.advance(1); expect(king.commands()).toContainEqual(['field', 'king', 'request', 2]);
  set(king, { 'king.rings': 0 }); king.advance(.2); expect(get(king, 'king.mode')).toBe(7);
  const summoned=await encounter('pine-hollow','king',[150,0,-30],[155,0,-30]);
  summoned.set(summoned.made,{'king.mode':3,'king.phase':1,'king.burst-cd':8,'king.summon-cd':0});
  summoned.made.send('start');summoned.made.advance(.2);
  expect(summoned.get(summoned.made,'king.mode')).toBe(8);summoned.made.advance(1.7);
  expect(summoned.made.commands()).toContainEqual(['field','king','request',3]);
  summoned.set(summoned.made,{'king.phase':2});summoned.made.send('threshold','king',2);summoned.made.advance(1.4);
  expect(summoned.made.commands()).toContainEqual(['field','king','request',4]);
  const saved = king.save(), resumed = await encounter('pine-hollow', 'king', [150, 0, -30], [155, 0, -30]);
  resumed.made.restore(saved); expect(resumed.made.host.metrics()[0]?.calls).toBe(0);
  for (const owner of [king, resumed.made]) { owner.advance(.4); owner.send('death', 'king'); }
  expect(resumed.made.save()).toEqual(king.save()); expect(get(king, 'king.mode')).toBe(2);
  for (const owner of [king, resumed.made,summoned.made]) {expect(owner.host.metrics()[0]).toMatchObject({ refusals: 0, disabled: false });expect(owner.maxFuel()).toBeLessThan(400_000);}
}, 10_000);
