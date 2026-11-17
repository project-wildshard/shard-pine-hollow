import { prepareProductPlan } from '@wildshard/engine/test/headless-native';
import type { PrepareHeadlessRuntime } from '@wildshard/engine/host/headlessRuntime';
export const prepareHeadlessRuntime: PrepareHeadlessRuntime = prepareProductPlan;
