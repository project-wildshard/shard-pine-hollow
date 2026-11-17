// Run the original typed constructor in a fresh source-fenced Node realm.
import { pineNativeOracleInputs } from '../pine-native-oracle-inputs.ts';
import { encodeCanonicalJson } from '@wildshard/engine/host/immutable';

process.stdout.write(encodeCanonicalJson(pineNativeOracleInputs()));
