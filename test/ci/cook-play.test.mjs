// Ring 2, J186: actual cold cooking takes 68.82 s locally. The complete
// served forest and real ranger approach exceed the quick-case budget.
// Smaller Driftwood took 220.69 s on Linux; allow this full forest 600 s.
// Use the shipped cooker/encoder, then only extracted server-pack bytes.
// This complete publish/serve/play journey never joins hooks or Ring 3.
// WS_COOK_CACHE (BUILD-MAX EV10): a folder CI restores with actions/cache,
// keyed on the lockfile (engine and sharddev pins), the built product and
// this file. A hit plays the cold cook it holds; a miss cooks into it.
import '@wildshard/engine/scripts/sim-node-loader.mjs';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {existsSync,mkdirSync,mkdtempSync,readFileSync,readdirSync,rmSync,writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {availableParallelism,tmpdir} from 'node:os';
import {dirname,join,resolve} from 'node:path';
import {brotliCompressSync,brotliDecompressSync,constants} from 'node:zlib';
import {test} from 'node:test';

const {readServerPackBook,serverPackFile}=await import('@wildshard/engine/game/shardfile/serverPack');
const {loadHeadlessFolder}=await import('@wildshard/engine/host/headlessFolder');
const {openWorldAdapter}=await import('@wildshard/engine/host/openWorld');
const {outputDescriptor,serverReadsFile}=await import('@wildshard/engine/game/shardfile/outputDescriptor');
const {loadRapier}=await import('@wildshard/engine/physics/rapier');
const require=createRequire(import.meta.url);
// Every file under the cook and its sha256, so a restore proves its bytes.
const fileHashes=dir=>Object.fromEntries(readdirSync(dir,{recursive:true,withFileTypes:true}).filter(entry=>entry.isFile())
 .map(entry=>join(entry.parentPath,entry.name)).sort().map(path=>[path.slice(dir.length+1),createHash('sha256').update(readFileSync(path)).digest('hex')]));

// SH-pine-3 (meta SHARD-SIZE S4): the phone's manifests carry the raw ASTC 6x6 files, so their saving reaches a phone,
// and never the desktop Basis twin of a ground layer the phone already has. Meta SHARD-SOURCE S12f4: Pine carries no
// hand-made 6x6 file any more; the box's cook writes them (its phone tier, engine cook-tier-textures.test.ts), so this
// cook, with the tiers off, lists none, and the product's own raw set is empty. Files are matched by hash: a ground layer
// rides as a product blob under /shardfiles/, an overlay file under its own URL. Raw is engine gpuFiles.ts's RAW_ASTC.
const RAW_ASTC=/\/astc6\/|\.t[0-9]+-[a-f0-9]{8}\.(?:ktx2|glb)$/u;
const astcManifests=(report,cooked)=>{
 const product=resolve('out/pine-hollow'),mounts=JSON.parse(readFileSync(join(product,'cook.json'),'utf8')).mounts,hashOf=new Map(mounts.map(row=>[row.url,row.hash]));
 const raw=new Set(mounts.filter(row=>RAW_ASTC.test(row.url)).map(row=>row.hash));
 const listed=Object.fromEntries(report.manifests.map(row=>[`${row.tier}-${row.set}`,new Set(JSON.parse(readFileSync(join(cooked,row.url),'utf8')).files.map(file=>file.hash))]));
 const count=key=>[...raw].filter(hash=>listed[key].has(hash)).length;
 assert.equal(raw.size,0,'Pine carries no hand-made raw ASTC 6x6 file: the cook writes them (S12f4)');
 assert.equal(count('phone-whole'),count('phone-entry'),'The phone whole set carries the entry\'s raw ASTC files');
 const discovery=JSON.parse(readFileSync(join(product,mounts.find(row=>row.url==='/shardfiles/pine-hollow/discovery.json').path),'utf8'));
 const {phone,desktop}=discovery.rows.bootBindings.args[0].grid.modes;
 const both=phone.ktx2.terrain.flatMap((url,at)=>RAW_ASTC.test(url)&&listed['phone-entry'].has(hashOf.get(url))&&listed['phone-entry'].has(hashOf.get(desktop.ktx2.terrain[at]))?[url]:[]);
 assert.deepEqual(both,[],'A phone never downloads both a ground layer\'s 6x6 and its desktop twin');
 // Findings (mini-shardgfx, 2026-11-15), reported, not gated: engine shardCook.ts mountRows lists a fence shard's entry
 // set from fence.mounts without onTier, so desktop entry carries the phone's raw ASTC; some phone ground layers sit
 // past the fence, in no phone manifest, and load loose.
 const unlisted=phone.ktx2.terrain.filter(url=>RAW_ASTC.test(url)&&!listed['phone-whole'].has(hashOf.get(url)));
 console.log(`cook ASTC: phone entry ${count('phone-entry')} raw ASTC files; desktop entry ${count('desktop-entry')}, desktop whole ${count('desktop-whole')} (finding: should be 0); ${unlisted.length} raw phone ground layers in no phone manifest`);
};

test('the real cooked Pine earns ranger talk and resumes using only served server files',{timeout:600_000},async()=>{
 const parent=process.env.WS_PROOF_SCRATCH??tmpdir();mkdirSync(parent,{recursive:true});
 const root=mkdtempSync(join(parent,'pine-cook-')),worlds=[];
 const previous=process.env.WILDSHARD_SPAWN_PART_CACHE, previousCookSlots=process.env.COOK_CPU_SLOTS;
 process.env.WILDSHARD_SPAWN_PART_CACHE=join(root,'cold-parts');
 // A hosted job owns the runner. Reserve one slot for the cooker and use at
 // most three concurrent texture encoders. Respect an explicit grant.
 if(process.env.GITHUB_ACTIONS==='true'&&previousCookSlots===undefined)
  process.env.COOK_CPU_SLOTS=String(Math.min(4,availableParallelism()));
 try{
  const cache=process.env.WS_COOK_CACHE?resolve(process.env.WS_COOK_CACHE):undefined;
  const cooked=cache?join(cache,'cooked'):join(root,'cooked'),unpacked=join(root,'server-files');
  const saved=cache&&join(cache,'report.json'),restored=saved!==undefined&&existsSync(saved);
  let report;
  if(restored){
   ({report}=JSON.parse(readFileSync(saved,'utf8')));
   assert.deepEqual(fileHashes(cooked),JSON.parse(readFileSync(saved,'utf8')).files,'A restored cook must hold the cold cook\'s bytes');
  }else{
   if(cache)rmSync(cooked,{recursive:true,force:true});
   const {cookShard,servedAsIs}=await import('@wildshard/engine/game/shardCook');
   const bin=join(dirname(require.resolve('@wildshard/cli/package.json')),'bin/wildshard.mjs'),tar=join(root,'pine-hollow.tar');
   const done=spawnSync(process.execPath,[bin,'pack',resolve('out/pine-hollow'),'--out',tar],{encoding:'utf8',timeout:30_000});
   assert.ifError(done.error);assert.equal(done.status,0,done.stderr);
   // Loose HTTP encoding is an explicit host policy, not a fake part encoder.
   console.log(`real Pine cold cook: ${process.env.COOK_CPU_SLOTS??'default'} CPU slots`);
   report=await cookShard(readFileSync(tar),cooked,{now:()=>performance.now(),wireBytes:(url,bytes)=>servedAsIs(url,bytes)?bytes.length:
    brotliCompressSync(bytes,{params:{[constants.BROTLI_PARAM_QUALITY]:4}}).length});
   // Written last, so a cook that throws leaves no report and no cache hit.
   if(saved)writeFileSync(saved,JSON.stringify({report,files:fileHashes(cooked)}));
  }
  assert.equal(report.slug,'pine-hollow');assert.ok(report.parts.count>0);
  astcManifests(report,cooked);
  const raw=JSON.parse(readFileSync(join(cooked,report.server.index),'utf8'));
  const pack=readServerPackBook({book:'server',build:'pine-proof',shards:{[report.slug]:raw}}).shards[report.slug];
  for(const part of [pack,...pack.more??[]]){
   const body=brotliDecompressSync(readFileSync(join(cooked,part.url)));
   assert.equal(body.length,part.bytes);assert.equal(createHash('sha256').update(body).digest('hex'),part.hash);
   for(const [name] of part.files){const target=join(unpacked,name);mkdirSync(dirname(target),{recursive:true});writeFileSync(target,serverPackFile(part,body,name));}
  }
  // No uncooked product, shard source or client part enters either runtime.
  const product=await loadHeadlessFolder(unpacked),shard=product.shardfile,descriptor=outputDescriptor(shard);
  const assets=new Map(descriptor.index.files.filter(file=>serverReadsFile(file,shard.terrain?.collider)&&
   (file.name===undefined||file.kind==='wasm'||file.kind==='tile')).map(file=>
   [file.commons===true?`commons:${file.hash}`:file.hash,readFileSync(join(unpacked,file.path))]));
  const engineRequire=createRequire(require.resolve('@wildshard/engine/package.json'));
  const rapier=await loadRapier(readFileSync(engineRequire.resolve('@dimforge/rapier3d-simd/rapier_wasm3d_bg.wasm')));
  const create=async snapshot=>{const world=await openWorldAdapter({shard,assets,product,rapier},snapshot);worlds.push(world);return world;};
  const world=await create(),tape=JSON.parse(readFileSync('test/ci/content-tapes.json','utf8'))[report.slug];
  const played=await world.verbTape(tape.plan);
  for(const expected of tape.expect){const at=played.observations.find(row=>row.id===expected.at);assert.ok(at);
   for(const flag of expected.flags??[])assert.ok(at.flags.includes(flag),`Cooked play must earn ${flag}`);
   for(const flag of expected.absent??[])assert.ok(!at.flags.includes(flag),`Distant input must not earn ${flag}`);}
  const resumed=await create(world.commit().snapshot);
  for(let tick=0;tick<5;tick++){
   const commands=[{kind:'player',moveX:0,moveZ:-1,yaw:0}];world.step(commands);resumed.step(commands);
   assert.deepEqual(resumed.commit(),world.commit(),'The cooked world must continue identically');
  }
  console.log(`real Pine cook: ${restored?'restored from WS_COOK_CACHE, cold cook took':'cold'} ${report.seconds.toFixed(2)} s, ${report.server.files} server files, ${report.parts.count} client parts; ranger talk earned, five restored ticks`);
 }finally{
  for(const world of worlds)await world.dispose();
  if(previous===undefined)delete process.env.WILDSHARD_SPAWN_PART_CACHE;else process.env.WILDSHARD_SPAWN_PART_CACHE=previous;
  if(previousCookSlots===undefined)delete process.env.COOK_CPU_SLOTS;else process.env.COOK_CPU_SLOTS=previousCookSlots;
  rmSync(root,{recursive:true,force:true});
 }
});
