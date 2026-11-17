import nativeStoryFixture from '../fixtures/pine-native-story.json' with { type: 'json' };
import { registeredJsonSchema } from '@wildshard/engine/host/formatJsonSchema';
import { hashImmutableBytes, encodeCanonicalJson } from '@wildshard/engine/host/immutable';
import { expect, test } from 'vitest';
import { PINE_PREPARED_OUTPUT as output } from '../fixtures/pine-emitted-product';
import { validateNamedJsonSchema } from '@wildshard/engine/game/shardfile/customSchema';

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
const encode = (value: unknown): Uint8Array => new TextEncoder().encode(JSON.stringify(value));

function admission(name: string): void {
    const file = output.namedFiles.find(row => row.name === name);
    const fixtureOnly = name === 'quests/native-story.json';
    if (fixtureOnly) expect(file).toBeUndefined();
    const bytes = fixtureOnly ? new TextEncoder().encode(encodeCanonicalJson(nativeStoryFixture)) : file === undefined ? undefined : output.assets.get(file.hash);
    const schema = fixtureOnly ? registeredJsonSchema('quests/native-story.json') : file?.jsonSchema;
    if (schema === undefined || bytes === undefined) throw new Error(`Missing defining native story schema: ${name}`);
    if (fixtureOnly) expect(hashImmutableBytes(bytes)).toBe('6ec75c8f3b81778eda9ab75356978ad7cb3f3793053780374ed00bd3ce982f14');
    const original: unknown = JSON.parse(new TextDecoder().decode(bytes));
    if (!record(original)) throw new Error('Native story document must be an object');
    expect(validateNamedJsonSchema(schema, bytes)).toEqual(original);
    expect(() => validateNamedJsonSchema(schema, encode({ ...original, runtimeHook: 'unbound' }))).toThrow('refuses its schema');
    if (name === 'quests/native-story.json') {
      expect(() => validateNamedJsonSchema(schema, encode({ ...original, eye: null }))).toThrow('refuses its schema');
    } else {
      const cable = original.cable;
      if (!record(cable)) throw new Error('Native cable must keep its admitted geometry');
      expect(() => validateNamedJsonSchema(schema, encode({ ...original, cable: { ...cable, top: [0, 0] } }))).toThrow('refuses its schema');
    }
}
test('quests/native-story.json: native rows retain their original admission before owner installation', () => { admission('quests/native-story.json'); });
test('quests/native-spots.json: native rows retain their original admission before owner installation', () => { admission('quests/native-spots.json'); });
