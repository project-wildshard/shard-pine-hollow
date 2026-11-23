import type { NativeProgramSpec } from './native-program';

/** One source/tool/host-fenced constructor for the parent loan and worker's
 * independent typed comparison. Neither caller may narrow its input inventory. */
const PINE_NATIVE_ORACLE: NativeProgramSpec = {
  id: 'pine-native-oracle', script: 'test/fixtures/headless/pine-native-oracle.ts',
  inputs: ['src', 'test/fixtures', 'package.json', 'pnpm-lock.yaml',
    'node_modules/@wildshard/engine/src', 'node_modules/@wildshard/engine/scripts',
    'node_modules/@wildshard/sdk/src', 'node_modules/@wildshard/sdk/scripts',
    'node_modules/@wildshard/format/src'],
  transformTypes: true, loader: 'simulation',
};

/** Only this exact Pine construction may borrow the required CI input bundle. */
export function pineNativeOracleSpec(): NativeProgramSpec {
  const cacheDir = process.env.WS_PINE_NATIVE_CACHE;
  return {...PINE_NATIVE_ORACLE, ...(cacheDir === undefined || cacheDir === '' ? {} : {cacheDir})};
}
