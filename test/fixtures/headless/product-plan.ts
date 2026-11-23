// Explicit native child admitted by the candidate compiler and boundary inventory.
import { prepareFolderPlan } from '@wildshard/sdk/internal/engine/test/headless-native';
import type { PrepareHeadlessRuntime } from '@wildshard/sdk/headless/host/headlessRuntime';

export const prepareHeadlessRuntime: PrepareHeadlessRuntime = prepareFolderPlan;
