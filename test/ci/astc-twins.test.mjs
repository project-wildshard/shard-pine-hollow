// After a real build, under a second (meta SHARD-REPOS SH-pine-2): a phone GPU without ASTC still draws Pine. The page
// (engine src/client/engine/boot/gpuFiles.ts) knows a raw ASTC 6x6 file only by its name (RAW_ASTC). On a phone-tier GPU
// without ASTC it then loads images instead of the KTX2 table, and draws the ground from the desktop tier's Basis layers.
// So: every KTX2 whose bytes are ASTC must carry such a name, every raw ASTC row must name a file the product carries,
// and every raw phone ground layer must have a desktop Basis layer for the same material and map. The real boot with
// ASTC hidden is the Mac mini's (engine scripts/goldens/capture.mjs --no-astc); this checks what that boot relies on.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

const directory = 'out/pine-hollow';
// engine src/client/engine/boot/gpuFiles.ts RAW_ASTC, the name the page's veto reads.
const RAW_ASTC = /\/astc6\/|\.t[0-9]+-[a-f0-9]{8}\.(?:ktx2|glb)$/u;
// Vulkan ASTC block formats (4x4 UNORM 157 to 12x12 SRGB 184); 0 is Basis Universal (UASTC, or ETC1S with BasisLZ).
const isAstc = vkFormat => vkFormat >= 157 && vkFormat <= 184;
const KTX2_ID = Buffer.from([0xab, 0x4b, 0x54, 0x58, 0x20, 0x32, 0x30, 0xbb, 0x0d, 0x0a, 0x1a, 0x0a]);

test('pine-hollow: every raw ASTC 6x6 row has a carried file and a twin a GPU without ASTC can draw', { timeout: 9500 }, () => {
  const cook = JSON.parse(readFileSync(join(directory, 'cook.json'), 'utf8'));
  const mounts = new Map(cook.mounts.map(row => [row.url, row]));
  const bytes = url => { const row = mounts.get(url); assert.ok(row, `the product carries ${url}`); return readFileSync(join(directory, row.path)); };
  const ktx2 = url => {
    const body = bytes(url);
    assert.ok(body.subarray(0, 12).equals(KTX2_ID), `${url} is a KTX2`);
    return { vkFormat: body.readUInt32LE(12), scheme: body.readUInt32LE(44) };
  };

  // The name is the page's only signal: an ASTC body under any other name would reach a GPU that can't sample it.
  // Meta SHARD-SOURCE S12f4: the hand-made `astc6/` files are gone; engine's cook writes every phone 6x6 file.
  assert.deepEqual([...mounts.keys()].filter(url => url.includes('/astc6/')), [], 'Pine mounts no hand-made astc6/ file');
  const astcBodies = [...mounts.keys()].filter(url => url.endsWith('.ktx2') && isAstc(ktx2(url).vkFormat));
  assert.deepEqual(astcBodies.filter(url => !RAW_ASTC.test(url)), [], 'Every ASTC KTX2 is named as raw ASTC');

  const discovery = JSON.parse(bytes('/shardfiles/pine-hollow/discovery.json').toString('utf8'));
  const [table] = discovery.native.ktx2.args, [bindings] = discovery.rows.bootBindings.args;
  let raw = 0, layers = 0, basis = 0;
  for (const binding of ['shard', 'grid']) {
    // The KTX2 table: a raw row's target is carried; its key is what the images path fetches instead.
    for (const [source, target] of Object.entries(table[binding].phone)) {
      if (!RAW_ASTC.test(target)) continue;
      raw++;
      if (target.endsWith('.ktx2')) assert.ok(isAstc(ktx2(target).vkFormat), `${target} is named raw ASTC and holds ASTC`);
      else bytes(target);
      const image = source.replace(/#layer$/u, '');
      assert.ok(image !== target && !RAW_ASTC.test(image), `${source} falls back to a file a GPU without ASTC reads`);
    }
    assert.deepEqual(Object.values(table[binding].desktop).filter(url => RAW_ASTC.test(url)), [], `${binding}: no desktop row names raw ASTC`);

    // The ground: a GPU without ASTC draws the desktop tier's KTX2 layers (splatTierOn), so each raw phone layer has a
    // Basis desktop layer for the same material and map, in the same place. Meta SHARD-SOURCE S12f2b3: the phone's ground
    // layers are the UASTC masters now (engine's cook writes their 6x6 files), and a Basis layer any GPU draws as it is.
    const { phone, desktop } = bindings[binding].modes;
    assert.equal(phone.ktx2.terrain.length, desktop.ktx2.terrain.length, `${binding}: one desktop layer per phone layer`);
    assert.equal(phone.img.terrain.length, phone.ktx2.terrain.length, `${binding}: one image per phone layer`);
    const material = url => /\/tex\/([^/]+)\/(diffuse|nor_gl|arm)/u.exec(url)?.slice(1).join(' ');
    phone.ktx2.terrain.forEach((url, at) => {
      if (!RAW_ASTC.test(url)) { basis++; assert.equal(ktx2(url).vkFormat, 0, `${binding} layer ${at}: ${url} is Basis Universal`); return; }
      layers++;
      const twin = desktop.ktx2.terrain[at];
      assert.ok(material(url) !== undefined && material(url) === material(twin), `${binding} layer ${at}: ${url} pairs with ${twin}`);
      assert.ok(!RAW_ASTC.test(twin), `${binding} layer ${at}: ${twin} is not raw ASTC`);
      assert.equal(ktx2(twin).vkFormat, 0, `${binding} layer ${at}: ${twin} is Basis Universal, transcoded for any GPU`);
    });
  }
  // S12f2b3: no hand-made raw row is left in Pine's own table (engine's cook writes the 6x6 files and names them raw)
  assert.ok(basis > 0 && layers === 0, 'The phone ground is the Basis masters the cook encodes, with no hand-made raw layer');
  console.log(`astc-twins: ${astcBodies.length} ASTC files all named raw, ${raw} raw table rows carried with image keys, ${layers} raw ground layers with Basis twins, ${basis} Basis ground layers`);
});
