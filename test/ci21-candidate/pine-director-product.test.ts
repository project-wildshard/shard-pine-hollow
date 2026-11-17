import {expect,test} from 'vitest';
import {Scope} from '@wildshard/engine/app/scope';
import {readDirectorProduct} from '@wildshard/engine/game/plugin/director';
import {loadHeadlessProduct} from '@wildshard/engine/host/headlessProduct';
import {builtProduct} from '../fixtures/builtProduct';
import {pineDirector} from '../fixtures/pine-director-module';

const slug='pine-hollow',module=pineDirector;
test('pine-hollow ships one raw director and admits its original native factory',async()=>{
    const product=await loadHeadlessProduct(builtProduct(slug)),scope=new Scope('shipping.director');
    try{
      expect(await product.json<unknown>('directors/main.json')).toMatchObject({module:{module:module.module,bytes:'',file:'behaviour/director.wasm'}});
      const director=await readDirectorProduct(product,scope);
      expect(director.bytes).toEqual(module.bytes);
      expect(()=>director.create()).not.toThrow();
    }finally{scope.dispose();}
  });
