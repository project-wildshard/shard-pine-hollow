import assert from 'node:assert/strict';
import test from 'node:test';
import {createHash} from 'node:crypto';
import {mkdirSync,mkdtempSync,readFileSync,rmSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {builtProduct} from '../fixtures/builtProduct.ts';

test('source-runtime product loans refuse changed source, changed bytes and foreign paths',()=>{
 const previous=process.cwd();mkdirSync('tmp/ci21-source-product-controls',{recursive:true});
 const root=mkdtempSync(resolve('tmp/ci21-source-product-controls','case-'));
 try{
  process.chdir(root);mkdirSync('src',{recursive:true});mkdirSync('out/pine-hollow',{recursive:true});mkdirSync('tmp/ci21-source',{recursive:true});
  writeFileSync('src/index.ts','actual producer input');writeFileSync('out/pine-hollow/shard.json','actual immutable product');
  const hash=path=>createHash('sha256').update(readFileSync(path)).digest('hex');
  const receipt={schema:1,sourceRevision:process.env.GITHUB_SHA??'a'.repeat(40),package:'a'.repeat(64),lock:'b'.repeat(64),
   inputs:[{path:'src/index.ts',sha256:hash('src/index.ts')}],product:'pine-hollow',files:[{path:'shard.json',sha256:hash('out/pine-hollow/shard.json')}]};
  const save=()=>writeFileSync('tmp/ci21-source/product.json',JSON.stringify(receipt));save();
  assert.equal(builtProduct('pine-hollow'),'out/pine-hollow');assert.throws(()=>builtProduct('foreign'));
  writeFileSync('src/index.ts','changed producer input');assert.throws(()=>builtProduct('pine-hollow'),/source input differs/u);writeFileSync('src/index.ts','actual producer input');
  writeFileSync('out/pine-hollow/shard.json','changed bytes');assert.throws(()=>builtProduct('pine-hollow'),/product bytes differ/u);writeFileSync('out/pine-hollow/shard.json','actual immutable product');
  writeFileSync('src/untracked.ts','untracked producer input');assert.throws(()=>builtProduct('pine-hollow'),/source inventory differs/u);rmSync('src/untracked.ts');
  writeFileSync('out/pine-hollow/unlisted.bin','unlisted output');assert.throws(()=>builtProduct('pine-hollow'),/product inventory differs/u);rmSync('out/pine-hollow/unlisted.bin');
  mkdirSync('src/assets/public',{recursive:true});mkdirSync('src/static/assets/pine-hollow',{recursive:true});
  writeFileSync('src/assets/public/alias.bin','tracked alias source');writeFileSync('src/static/assets/pine-hollow/alias.bin','tracked alias source');
  receipt.inputs.push({path:'src/assets/public/alias.bin',sha256:hash('src/assets/public/alias.bin')});save();
  assert.equal(builtProduct('pine-hollow'),'out/pine-hollow');
  writeFileSync('src/static/assets/pine-hollow/alias.bin','changed alias');assert.throws(()=>builtProduct('pine-hollow'),/Generated public alias differs/u);
  rmSync('src/static/assets/pine-hollow/alias.bin');
  mkdirSync('src/static/assets/pine-hollow/map',{recursive:true});writeFileSync('src/static/assets/pine-hollow/map/top.webp','actual immutable product');
  assert.equal(builtProduct('pine-hollow'),'out/pine-hollow');
  writeFileSync('src/static/assets/pine-hollow/map/top.webp','unsealed generated map');assert.throws(()=>builtProduct('pine-hollow'),/Generated map alias differs/u);
  rmSync('src/static/assets/pine-hollow/map/top.webp');
  receipt.files.push({path:'../foreign.json',sha256:'a'.repeat(64)});save();assert.throws(()=>builtProduct('pine-hollow'),/Foreign producer output/u);
 }finally{process.chdir(previous);rmSync(root,{recursive:true,force:true});}
});
