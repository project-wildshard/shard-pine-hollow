import { bootRecipeSources as resolveBootSources, type BootModes, type BootSources, type BootGpuFiles } from '@wildshard/dev/bootInventory';
import { GPU_FILES } from '../ktx2.generated';
import policy from '../data/pagePolicy.json' with { type: 'json' };
import { PINE_BOOT_FILES, PINE_BOOT_SOURCES } from './bootFiles';

/** Resolve both existing page modes offline, preserving ordered URLs and duplicates. */
export function pineBootInventory(inventory: Readonly<Record<string, number | true>>, astc: Readonly<Record<string, string>>): {
  shard: BootModes<BootSources>; grid: BootModes<BootSources>; bakedUnreadPrefixes: readonly string[];
} {
  // GR8 G37: the prop and cabin material payloads are files in the shard file now (their aliases name them), so the boot pack keeps
  // the original prop payloads, as it already did for the heroes
  const inputs = { inventory, aliases: { props: {} } };
  // SF5b (J525): a KTX2 mode names the zone's own PNG and JPEG files, never a KTX2 (the engine's built-in table names
  // /assets/gpu/ twins Pine no longer carries); the cook encodes each and the page reads the cooked table. The phone's
  // .phone.webp stand-ins are left out of the KTX2 modes (the cook sizes each tier itself), and so are the _1k.jpg ones (not
  // mounted): the phone names the full-size image the desktop names, and the cook sizes each tier's KTX2.
  const standIn = (url: string): boolean => url.endsWith('.phone.webp') || url.endsWith('_1k.jpg');
  const cookInputs = { inventory: Object.fromEntries(Object.entries(inventory).filter(([url]) => !standIn(url))), aliases: inputs.aliases };
  const resolve = (table: typeof GPU_FILES): BootModes<BootSources> => ({ modes: {
    phone: { img: resolveBootSources(PINE_BOOT_FILES, PINE_BOOT_SOURCES, 'phone', 'img', table, inputs),
      ktx2: resolveBootSources(PINE_BOOT_FILES, PINE_BOOT_SOURCES, 'phone', 'img', table, cookInputs) },
    desktop: { img: resolveBootSources(PINE_BOOT_FILES, PINE_BOOT_SOURCES, 'desktop', 'img', table, inputs),
      ktx2: resolveBootSources(PINE_BOOT_FILES, PINE_BOOT_SOURCES, 'desktop', 'img', table, cookInputs) },
  } });
  const tables = pineKtx2Tables(astc);
  return { shard: resolve(tables.shard), grid: resolve(tables.grid), bakedUnreadPrefixes: ['fur-'] };
}

/** The loader reads horizon images at their packed manifest URLs. Boot inventory still uses the authored URLs. */
export function pineKtx2Tables(
  astc: Readonly<Record<string, string>>,
  horizonAliases?: ReadonlyMap<string, string>,
): { readonly shard: BootGpuFiles; readonly grid: BootGpuFiles } {
  const withAliases = (files: Readonly<Record<string, string>>): Readonly<Record<string, string>> => {
    if (horizonAliases === undefined) return files;
    const result = { ...files };
    for (const [source, packed] of horizonAliases) {
      const texture = files[source];
      if (texture !== undefined) result[packed] = texture;
    }
    return result;
  };
  const standard = { phone: withAliases(GPU_FILES.phone), desktop: withAliases(GPU_FILES.desktop) };
  const trimmed = { phone: withAliases({ ...GPU_FILES.phone, ...astc }), desktop: standard.desktop };
  return { shard: policy.phoneAstc6.shard ? trimmed : standard, grid: policy.phoneAstc6.grid ? trimmed : standard };
}
